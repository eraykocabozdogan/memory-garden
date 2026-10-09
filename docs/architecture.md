# Memory Garden: Mimari

Bu doküman `docs/decisions.md`'deki kararların teknik karşılığıdır. Bir karar değişirse önce
karar kaydı, sonra bu doküman güncellenir.

## 1. Genel bakış

Memory Garden iki kişilik özel bir anı ve günlük uygulaması, bir de herkese açık bir çiçek
dili rehberidir. Tamamen Cloudflare üzerinde çalışır.

| Ortam | Adres | Amaç |
|---|---|---|
| Gerçek | `https://memory-garden.erayai.workers.dev` | İki üyenin kullandığı uygulama + herkese açık rehber |
| Demo | `https://memory-garden-demo.erayai.workers.dev` | İK ve mülakatçılar için; her ziyaretçiye ayrı, temiz bir kopya |
| Yerel | `localhost` | Geliştirme ve testler |

## 2. Sistem şeması

```
                         ┌──────────────────────────────────────────────┐
 Tarayıcı / PWA ────────►│ Worker: memory-garden (web)                   │
  • rehber (statik HTML) │  • statik dosyalar: rehber, uygulama, görseller│
  • uygulama (SPA)       │  • Hono API  /api/*                           │
  • service worker       │  • Better Auth  /api/auth/*                   │
                         │  • cron: süpürücü, çöp kutusu, yetim dosyalar │
                         └──────┬──────────────┬──────────────┬─────────┘
                                │              │              │
                     D1: memory-garden   R2: memory-garden-media   Queue: media-jobs
                                ▲              ▲              │
                                │              │              ▼
                         ┌──────┴──────────────┴──────────────────────────┐
                         │ Worker: memory-garden-media                     │
                         │  • kuyruk tüketicisi                            │
                         │  • foto: Cloudflare Images binding → R2         │
                         │  • video: Container (ffmpeg) başlatır           │
                         │  • /internal/*: container'ın geri çağrıları     │
                         └───────────────────────┬────────────────────────┘
                                                 │ job token + URL'ler
                                                 ▼
                                   Container: ffmpeg (H.264 1080p + kapak)
                                   R2'ye yalnızca imzalı URL'lerle erişir

 Tarayıcı ──(imzalı PUT, 16 MB parçalar)──► R2 incoming/        (yüklemeler doğrudan R2'ye)
 Tarayıcı ◄──(5 dk'lık imzalı GET'e yönlendirme)── /api/media/:id   (görüntüleme)

 Demo:  Tarayıcı ──► Worker: memory-garden-demo ──► Durable Object (ziyaretçi başına SQLite)
                                                └──► R2: memory-garden-demo-media (salt okunur örnek görseller)
```

## 3. Bileşenler ve bağlantılar

### Worker: `memory-garden` (web, gerçek ortam)

| Binding | Tür | Kullanım |
|---|---|---|
| `ASSETS` | Static Assets | Prerender edilmiş rehber, SPA, görseller |
| `DB` | D1 | Uygulama veritabanı |
| `MEDIA` | R2 (EU) | Yüklenen ve işlenmiş medya |
| `MEDIA_JOBS` | Queue (üretici) | Medya işleme işleri |
| `LOGIN_LIMIT` | Rate Limiting | Giriş denemesi sınırı |
| Secret'lar | | `BETTER_AUTH_SECRET`, `UPLOAD_TOKEN_SECRET`, R2 S3 anahtarları (imzalı URL için), VAPID anahtarları (bildirim) |

Statik dosyalar Worker'dan önce sunulur. `/api/*` her zaman Worker'a gider. `/app/*` ve
`/login` için Worker SPA giriş dosyasını döner; prerender edilmiş rehber sayfaları ise dosya
olarak sunulur.

### Worker: `memory-garden-demo` (web, demo ortamı)

Aynı kod, demo ayarıyla ayrı bir build ve ayrı bir Worker.

| Binding | Tür | Kullanım |
|---|---|---|
| `ASSETS` | Static Assets | Demo build'i (demo şeridi, "hakkında" bağlantısı, `noindex`) |
| `DEMO_SESSIONS` | Durable Object (SQLite) | Ziyaretçi başına bir kopya |
| `DEMO_MEDIA` | R2 | Paylaşılan, salt okunur örnek görseller ve videolar |
| `DEMO_LIMIT` | Rate Limiting | IP başına yeni kopya sınırı |

Demo Worker'ının gerçek D1'e, gerçek R2'ye ve kuyruğa hiçbir bağlantısı yoktur; gerçek veriye
erişimi teknik olarak imkânsızdır.

### Worker: `memory-garden-media`

| Binding | Tür | Kullanım |
|---|---|---|
| `DB` | D1 | Medya durumunu güncellemek |
| `MEDIA` | R2 | Okuma/yazma, orijinali silme |
| `IMAGES` | Images | Fotoğraf dönüştürme (HEIC dahil) |
| `MEDIA_JOBS` | Queue (tüketici) | İşleri almak |
| `VIDEO` | Container (Durable Object) | ffmpeg container'ı, iş başına bir örnek |
| Secret'lar | | `JOB_TOKEN_SECRET`, R2 S3 anahtarları |

Container'ın örnek tipi: `standard-3` (2 vCPU, 8 GiB). Otomatik yeniden deneme yok;
yeniden deneme uygulama tarafından yeni bir run ID ile yapılır.

## 4. Repo yapısı

```
memory-garden/
├─ apps/
│  ├─ web/                    # React Router (SPA + prerender) + Hono API Worker
│  │  ├─ app/                 # frontend: route'lar, özellikler, bileşenler
│  │  ├─ worker/              # Hono API, auth, cron, demo Durable Object
│  │  ├─ public/flowers/      # Curtis görselleri (mevcut)
│  │  └─ wrangler.jsonc       # ortamlar: production, demo
│  └─ media/
│     ├─ src/                 # kuyruk tüketicisi, Images, Container sınıfı, /internal
│     ├─ container/           # Dockerfile + ffmpeg betiği (eski media-worker'dan)
│     └─ wrangler.jsonc
├─ packages/
│  └─ shared/                 # Drizzle şeması + migration'lar, Zod şemaları,
│                             # çiçek kataloğu (TR/EN), Türkiye konumları, tarih kuralları
├─ research/                  # olduğu gibi
├─ scripts/                   # hesap oluşturma/şifre sıfırlama, demo seed, veri üretimi
├─ docs/                      # decisions.md, architecture.md
└─ .github/workflows/         # ci, deploy, backup
```

## 5. Frontend

**Teknoloji:** React, React Router v7 (`ssr: false` + `prerender`), Vite, Tailwind 4,
shadcn tabanlı bileşenler, TanStack Query, Hono RPC istemcisi, Zod.

### Sayfalar

**Herkese açık (deploy sırasında HTML olarak üretilir):**

| Türkçe | İngilizce | İçerik |
|---|---|---|
| `/` | `/en` | Rehber ana sayfası, giriş ve demo bağlantıları |
| `/cicekler/:slug` | `/en/flowers/:slug` | 61 çiçek: Curtis çizimi, anlam, tarihsel anlatı, kaynak |
| `/kaynaklar` | `/en/sources` | Ingram, Phillips, Tyas ve görsel karşılaştırma çalışması |
| `/hakkinda` | `/en/about` | Proje hakkında (yalnızca demo'da bağlantılı) |

Anlama göre arama (N7) tarayıcıda, katalog verisi üzerinde çalışır; sunucu gerektirmez.

**Uygulama (SPA, giriş gerekli):**

| Yol | İçerik |
|---|---|
| `/login` | Giriş: kullanıcı adı + şifre, passkey; demo'da "Demo olarak gez" |
| `/app` | Anılar: Gün / Ay / Yıl görünümleri, filtreler, "geçen yıl bugün" |
| `/app/day/:date` | Gün ayrıntısı ve konum rotası |
| `/app/map` | Harita |
| `/app/diary` | Günlükler |
| `/app/garden` | Ortak bahçe |
| `/app/tags`, `/app/tags/:id` | Etiketler |
| `/app/special-days` | Özel günler, geri sayım, o tarihteki geçmiş anılar |
| `/app/trash` | Çöp kutusu |
| `/app/settings` | Dil, bildirimler, passkey, şifre değiştirme |

### Dil

Rehberin her sayfası iki dilde ayrı HTML olarak üretilir. Uygulamanın dili kullanıcı
tercihinden gelir (varsayılan Türkçe). Kullanıcı içeriği (notlar, günlükler) çevrilmez.

### PWA

- Manifest + service worker. Uygulama kabuğu telefonda önbelleğe alınır.
- TanStack Query önbelleği tarayıcıda kalıcı tutulur; çevrimdışı açılışta son veriler görünür.
- Service worker bildirimleri (push) karşılar.
- iPhone için "Ana Ekrana Ekle" yönergesi ayarlar sayfasında gösterilir.

### Harita

MapLibre GL, OpenFreeMap tile'larıyla (ücretsiz, anahtar gerektirmez). Yalnızca harita
ekranında yüklenir.

## 6. API

Hono, `/api` altında. Tüm uç noktalar (auth ve herkese açık olanlar hariç) oturum ve üyelik
kontrolünden geçer; tüm girdiler Zod ile doğrulanır. Frontend, Hono RPC ile tip güvenli çağırır.

| Grup | Uç noktalar |
|---|---|
| Auth | `/api/auth/*` (Better Auth: kullanıcı adıyla giriş, çıkış, oturum, passkey, şifre değiştirme) |
| Ben | `GET /api/me`, `PATCH /api/me/settings` (dil, bildirim ayarları) |
| Anılar | `GET /api/memories` (görünüm + filtreler: etiket, yıl, il, tür; sayfalama), `GET /api/days/:date`, `GET /api/map`, `GET /api/on-this-day` |
| | `POST /api/memories` (paket), `PATCH /api/memories/:id`, `DELETE /api/memories/:id` (çöp kutusuna) |
| | `PUT /api/days/:date/locations` |
| Çöp kutusu | `GET /api/trash`, `POST /api/trash/:id/restore`, `DELETE /api/trash/:id` (kalıcı sil) |
| Yükleme | `POST /api/uploads`, `POST /api/uploads/part`, `POST /api/uploads/complete`, `POST /api/uploads/abort` |
| Medya | `GET /api/media/:id?variant=preview\|display` (imzalı URL'e yönlendirir), `POST /api/media/:id/retry` |
| Günlük | `GET /api/diary`, `POST /api/diary`, `PATCH /api/diary/:id`, `DELETE /api/diary/:id`, `PUT /api/diary/:id/flower` |
| Bahçe | `GET /api/garden` |
| Etiketler | `GET/POST /api/tags`, `GET/PATCH/DELETE /api/tags/:id`, `PUT /api/tags/:id/overrides` |
| Özel günler | `GET/POST /api/special-days`, `PATCH/DELETE /api/special-days/:id` |
| Bildirim | `POST /api/push/subscriptions`, `DELETE /api/push/subscriptions/:id` |
| Hata kaydı | `POST /api/client-errors` |
| Demo | `POST /api/demo/start` (yalnızca demo Worker'ında) |

`memory-garden-media` Worker'ında, yalnızca job token ile erişilebilen:
`POST /internal/config`, `POST /internal/multipart`, `POST /internal/heartbeat`,
`POST /internal/callback`.

## 7. Veri modeli

D1 (SQLite), Drizzle şeması `packages/shared`'de. Kimlikler UUID; zamanlar UTC milisaniye;
gün hesapları `Europe/Istanbul`. D1 interaktif transaction desteklemediği için çok adımlı
yazmalar atomik `batch()` ile yapılır; sıralama gibi hesaplar aynı batch içinde alt
sorgularla çözülür.

| Tablo | Sütunlar (özet) | Kurallar / indeksler |
|---|---|---|
| `user` (+ Better Auth: `session`, `account`, `passkey`, `verification`) | ad, `username`, `locale`, `notify_diary`, `notify_flower` | `username` tekil |
| `memory_day` | `date` (YYYY-MM-DD), `created_by`, `created_at` | `date` tekil |
| `day_location` | `day_id`, `province_code/name`, `district_code/name`, `lat`, `lng`, `sort_order` | (`day_id`, `sort_order`); ilçe kodu ve adı birlikte |
| `memory_item` | `kind`, `date_precision`, `day_id` \| `year`/`month`, `text`, `caption` (≤280), `sort_order`, `created_by`, zamanlar, `deleted_at`, `deleted_by` | tarih şekli CHECK'i; not yalnızca `text` türünde; (`day_id`, `sort_order`), (`date_precision`, `year`, `month`), `deleted_at` |
| `media_asset` | `item_id`, `status`, `source_key`, `display_key`, `preview_key`, `original_name`, türler, boyutlar, `width`, `height`, `duration_s`, `run_id`, `attempts`, `progress`, `heartbeat_at`, `error_code`, `processed_at` | `ready` ise çıktılar dolu; (`status`, `updated_at`) |
| `pending_upload` | `object_key`, `upload_id` (multipart ise), `user_id`, `created_at` | Pakete bağlanınca silinir; 6 saatten eskiler temizlenir |
| `tag` | `name`, `start_date`, `end_date`, `created_by` | `start_date ≤ end_date` |
| `tag_override` | `tag_id`, `date`, `mode` (`exclude` \| `include`) | birincil anahtar (`tag_id`, `date`) |
| `special_day` | `name`, `month`, `day`, `start_year`, `created_by` | 29 Şubat → artık olmayan yıllarda 28 Şubat |
| `diary_entry` | `author_id`, `content` (≤2.000), `published_at`, `expires_at`, `updated_at`, `deleted_at` | `expires_at = published_at + 24 sa`; silinince metin temizlenir, satır bahçe için kalır |
| `diary_flower` | `entry_id`, `responder_id`, `flower_id`, zamanlar | günlük başına bir çiçek; yazan kendine bırakamaz; yalnızca günlük açıkken |
| `push_subscription` | `user_id`, `endpoint`, `p256dh`, `auth`, `device_label`, `last_used_at` | `endpoint` tekil |

Çiçek kataloğu (TR/EN) ve Türkiye il/ilçe listesi kodda (`packages/shared`) durur.

## 8. Temel akışlar

### Giriş

1. Kullanıcı adı + şifre ya da passkey ile `/api/auth/*`.
2. Better Auth, httpOnly ve secure bir oturum çerezi verir; oturum kayan 90 gün.
3. Giriş denemeleri IP başına sınırlıdır.
4. Hesaplar ve şifre sıfırlama `scripts/` altındaki komut satırı script'iyle yönetilir.

### Anı ekleme ve medya işleme

1. Tarayıcı dosyaların çekim tarihini okur ve tarih alanına önerir.
2. `POST /api/uploads`: 100 MB'a kadar tek imzalı PUT; üstünde 16 MB'lık parçalarla multipart.
   Her dosya için HMAC imzalı, 6 saat geçerli bir yükleme token'ı döner ve yükleme
   `pending_upload` tablosuna kaydedilir.
3. Tarayıcı aynı anda en fazla iki dosyayı doğrudan R2'ye (`incoming/`) yükler. Bağlantı
   koparsa parçalar yeniden denenir. Kullanıcı vazgeçerse `POST /api/uploads/abort` dosyayı
   hemen siler; uygulama kapanır ya da çökerse saatlik temizlik 6 saat sonra siler.
4. `POST /api/memories`: Worker token'ları ve R2'deki dosyaları doğrular, tek bir D1 batch'i ile
   gün, konumlar, öğeler ve `queued` durumundaki medya satırlarını yazar, `pending_upload`
   kayıtlarını siler, sonra her medya için kuyruğa bir iş bırakır.
5. `memory-garden-media`:
   - **Foto:** Images binding ile 2560 px WebP ve 720 px WebP önizleme üretilir, R2'ye yazılır.
   - **Video:** İş başına bir container başlatılır; container yalnızca kısa ömürlü bir job token
     ve API adresi alır. Kaynağı imzalı URL'den okur, en fazla 1080p H.264/AAC MP4 (HDR→SDR) ve
     720 px WebP kapak üretir, çıktıyı parça parça imzalı URL'lerle yükler, sonra
     `/internal/callback`'i çağırır.
   - **Nabız:** Container çalışırken her dakika `/internal/heartbeat`'e ilerleme yüzdesini
     gönderir. Uygulama bu yüzdeyi "İşleniyor %40" olarak gösterir.
6. Çıktılar doğrulanınca medya `ready` olur ve orijinal silinir. Hata olursa `failed` olur ve
   orijinal yeniden deneme için kalır.
7. Uygulama işleme durumunu TanStack Query ile periyodik olarak yeniler.

### Görüntüleme

`GET /api/media/:id` oturumu doğrular ve 5 dakikalık imzalı bir R2 URL'ine yönlendirir.
Video oynatma için tarayıcı aralık (range) istekleriyle doğrudan R2'den okur.

### Silme ve çöp kutusu

Silme `deleted_at` alanını doldurur. Çöp kutusundan geri alınabilir. 30 gün dolunca cron
satırları ve R2 dosyalarını kalıcı olarak siler; aktif anısı kalmayan günler de silinir.

### Günlük, çiçek ve bildirim

1. Günlük yazılınca partnerin bildirim ayarı açıksa, kayıtlı cihazlarına web push gönderilir.
2. Çiçek bırakılınca yazana aynı şekilde bildirim gider.
3. Bildirimler istek yanıtını bekletmeden arka planda (`waitUntil`) gönderilir.
4. Geçersizleşen abonelikler otomatik silinir.

### Demo kopyası

1. `POST /api/demo/start`: IP sınırı kontrol edilir, yeni bir Durable Object kimliği üretilir.
2. Kopya, şema migration'larını ve Türkçe örnek veriyi kendi SQLite veritabanına yazar.
   Partnerin "açık" günlükleri o anki zamana göre oluşturulur.
3. İmzalı bir demo çerezi kopyayı tanımlar. Sonraki tüm `/api/*` istekleri o kopyaya
   yönlendirilir ve aynı Hono uygulaması orada, kopyanın kendi veritabanıyla çalışır.
4. Kopya, son kullanımdan 24 saat sonra alarmla kendini siler.
5. Medya yükleme, bildirim ve hesap işlemleri demo'da kapalıdır; demo görselleri salt okunurdur.

### Zamanlanmış işler (`memory-garden`)

| Sıklık | İş |
|---|---|
| 5 dakikada bir | Videoda 10 dakikadır nabız gelmeyen, fotoğrafta 15 dakikadır bitmeyen `processing` medyayı `failed` (`worker_lost`) yap |
| Saatte bir | 6 saatten eski, pakete bağlanmamış `pending_upload` kayıtlarının dosyalarını sil ve multipart yüklemelerini iptal et |
| Her gece 03:00 | 30 günü dolan çöp kutusu öğelerini kalıcı sil |
| Haftalık (GitHub Actions) | D1'in tam yedeğini R2'ye yaz, 12 haftadan eskileri sil |

Ek güvenlik ağı olarak R2 yaşam döngüsü kuralı, tamamlanmamış multipart yüklemeleri 1 gün
sonra iptal eder.

## 9. Güvenlik

- **Oturum:** Better Auth, httpOnly + secure çerez. workers.dev Public Suffix List'te olduğu için
  gerçek uygulama ve demo birbirinin çerezlerine erişemez.
- **Yetki:** Her API isteği oturum ve üyelik kontrolünden geçer.
- **Doğrulama:** Tüm girdiler Zod şemalarıyla doğrulanır; aynı şemalar formlarda da kullanılır.
- **Yükleme:** HMAC imzalı yükleme token'ları; kısa ömürlü imzalı R2 URL'leri; dosya boyutu ve
  türü sunucuda doğrulanır.
- **Container:** Veritabanı ya da kalıcı R2 anahtarı almaz; yalnızca kısa ömürlü job token'ı ve
  her parça için ayrı imzalı URL alır.
- **Demo izolasyonu:** Demo Worker'ının gerçek kaynaklara binding'i yoktur.
- **Sınırlar:** Giriş denemeleri ve demo kopyası oluşturma IP başına sınırlıdır.
- **Başlıklar:** Katı Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`.
  Demo ve uygulama sayfaları `noindex`.
- **Gizlilik:** İşlenmiş medya dosyalarından konum ve diğer EXIF bilgileri silinir.

## 10. Test ve CI/CD

| Katman | Araç | Kapsam |
|---|---|---|
| Birim | Vitest | Tarih kuralları, 24 saat kuralı, etiket aralıkları, 29 Şubat, bahçe yerleşimi, doğrulama şemaları |
| API | Vitest + Workers test ortamı | Yerel D1 ile gerçek API: yetki, doğrulama, çöp kutusu, çiçek kuralları, yükleme token'ları |
| Uçtan uca | Playwright (mobil + masaüstü) | Giriş, anı ekleme, günlük + çiçek, rehber, demo |
| Performans | Lighthouse CI | Rehber sayfaları; belirlenen puanın altına düşerse kırılır |

**GitHub Actions:**

- `ci.yml` (her push ve PR): Biome, TypeScript kontrolü, birim + API testleri, build, uçtan uca
  testler, Lighthouse.
- `deploy.yml` (`main`): D1 migration'ları → demo deploy → gerçek deploy → `media` değiştiyse
  media deploy.
- `backup.yml` (haftalık): D1 yedeği.

Gereken GitHub secret'ları: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## 11. Gözlemlenebilirlik

Cloudflare Workers Logs. Sunucu hataları otomatik kaydedilir; tarayıcı hataları
`/api/client-errors` üzerinden aynı yere yazılır. Medya işleme hataları `media_asset.error_code`
alanında da tutulur.

## 12. Tahmini maliyet

| Kalem | Aylık |
|---|---|
| Workers Paid (Workers, D1, Durable Objects, Queues, Containers kotaları dahil) | $5 |
| R2 (ilk 10 GB ücretsiz, sonrası GB başına $0.015) | İlk yıl ~$0–1, 5. yılda ~$2–3 |
| Cloudflare Images (ayda 5.000 dönüşüm ücretsiz) | $0 |
| Container (kota üstü kullanım) | Büyük olasılıkla $0–1 |
| **Toplam** | **~$5–9** |

## 13. Uygulama sırası

Her aşama ayrı bir branch'te geliştirilir; testlerle birlikte teslim edilir ve proje sahibinin
onayından sonra birleştirilir.

| # | Aşama | İçerik |
|---|---|---|
| 0 | Hazırlık | Eski hale `v0-nextjs` etiketi; eski kodun temizlenmesi; pnpm monorepo, Biome, TypeScript; CI iskeleti; Cloudflare kaynakları ve wrangler ayarları |
| 1 | Temel + giriş | D1 şeması ve migration'lar, Better Auth (kullanıcı adı, şifre), hesap script'i, uygulama iskeleti, ilk deploy |
| 2 | Tasarım sistemi | UI seçimlerinin kurulumu (Karar 8), tema, bileşenler, kitchen-sink sayfası |
| 3 | Herkese açık rehber | TR/EN prerender, çiçek sayfaları, anlam araması, kaynaklar, Lighthouse |
| 4 | Anılar | Not ekleme, görünümler, konumlar ve harita, düzenleme, filtreler, çöp kutusu, "geçen yıl bugün" |
| 5 | Medya | Yükleme, foto işleme, video container'ı, görüntüleyici, yeniden deneme, süpürücü |
| 6 | Günlük ve bahçe | Günlükler, çiçek kataloğu, çiçek bırakma, bahçe |
| 7 | Etiketler ve özel günler | |
| 8 | PWA, bildirim, passkey | Manifest, service worker, web push, ayarlar |
| 9 | Demo | Durable Object kopyaları, Türkçe örnek veri, demo şeridi, "hakkında" sayfası |
| 10 | Tamamlama | Eksik testler, yedekleme işi, README, son performans ayarları |

Aşama 2, UI seçimleri hazır olduğunda yapılır. Seçimler gecikirse aşama 3–7'nin işlevsel kısmı
geçici bir temayla ilerler ve tasarım sistemi gelince giydirilir.

## 14. Proje sahibinin yapacakları

| Ne zaman | Adım |
|---|---|
| ~~Aşama 0~~ | ~~Cloudflare'de Workers Paid planına geçmek ($5/ay)~~ **Yapıldı** (proje sahibi bildirdi; API token eklenince doğrulanacak) |
| Aşama 0 | Bir Cloudflare API token'ı oluşturup GitHub repo secret'larına eklemek (adım adım yönerge verilecek) |
| Aşama 1 | İki hesabın kullanıcı adı ve görünen adını belirlemek; script'i çalıştırıp şifreleri belirlemek |
| Aşama 2 | UI seçimlerini göndermek |
| Aşama 3 | Çiçek içeriklerinin İngilizce çevirilerini kontrol etmek |

## 15. Kodlama sırasında yapılacak küçük teknik seçimler

Ürünü etkilemeyen, varsayılanları aşağıdaki gibi olan seçimler. Değişirse karar kaydına eklenir.

| Konu | Varsayılan |
|---|---|
| Çok dillilik | i18next (react-i18next) |
| PWA | vite-plugin-pwa (Workbox) |
| İmzalı R2 URL'leri | aws4fetch |
| Tarih/saat dilimi | date-fns + @date-fns/tz |
| Formlar | React Hook Form + Zod |
| Animasyon | Motion |
| İkonlar | lucide-react |
| Fontlar | Kendi sunucumuzdan (@fontsource), Türkçe karakter alt kümesiyle |
| Web push | Workers uyumlu, WebCrypto tabanlı bir kütüphane; uygun olan yoksa kendi uygulamamız |
