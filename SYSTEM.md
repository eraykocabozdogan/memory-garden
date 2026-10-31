# Memory Garden — SYSTEM

> Kodda şu an ne var. Ne istediğimiz `SPEC.md`'de.
>
> Son güncelleme: 2026-10-31

## 1. Durum

| Aşama | İçerik | Durum |
|---|---|---|
| 0 | Hazırlık: monorepo, Biome, TypeScript, CI iskeleti, korunan verilerin taşınması | ✅ Onaylandı |
| 2 | Tasarım sistemi (SPEC 6) | ⏳ 10/11; #11 özel bileşenler açık |
| 1 | Temel + giriş: D1 şeması, Better Auth, hesap betiği, iskelet, ilk gerçek deploy | ⬜ Aşama 2'den sonra ya da paralel |
| 3 | Herkese açık rehber: TR/EN prerender, çiçek sayfaları, anlam araması, kaynaklar, Lighthouse | ⬜ Katalog doğrulandı, hazır |
| 4 | Anılar: not, görünümler, konumlar ve harita, düzenleme, filtreler, çöp kutusu, "geçen yıl bugün" | ⬜ |
| 5 | Medya: yükleme, foto işleme, video container'ı, görüntüleyici, yeniden deneme, süpürücü | ⬜ |
| 6 | Günlük ve bahçe | ⬜ Saf mantık hazır ve testli |
| 7 | Etiketler ve özel günler | ⬜ |
| 8 | PWA, bildirim, passkey | ⬜ |
| 9 | Demo | ⬜ |
| 10 | Tamamlama: eksik testler, yedekleme işi, README, performans | ⬜ |

Aşama 2 gecikirse 3–7'nin işlevsel kısmı geçici temayla ilerler, tasarım sistemi gelince giydirilir.

### Sıradaki: tasarım #11 ve açık süreç sorusu

- **Önce cevaplanacak (30 Ekim'de kullanıcı: "componentler, layout nasıl seçebiliriz, kötü böyle"; "sadece geri sayım değil, genel içerikler").** Teşhis: şimdiye kadar bağlamsız bileşenler ve uydurma içerik gösterildi, her adımda tek taslak sunulup onay istendi; en iyi sonuç (giriş ekranı) gerçek içerikli bütün bir ekrandı.
  - Yollar: **Y1** vitrini bırakıp gerçek ekranları gerçekçi Türkçe içerikle kurmak · **Y2** her ekranın 2–3 yerleşim varyantı yan yana · **Y3** önce kullanıcıdan referans ekran görüntüleri, sonra Parchment'e uyarlamak · **Y4** önce ucuz statik maket, sonra yalnızca kazananın kodu. Öneri: Y3 + Y1, kritik ekranlarda Y2.
  - "Genel içerikler kötü" ne demek: (a) örnek metinler, (b) yerleşim ve boşluklar, (c) dil ve ton, ya da hepsi?
- **#11 taslakları** `/ui/bilesenler`'de çalışır hâlde, hepsi elde yazıldı: yükleme (sürükle-bırak, kuyruk, 2 eşzamanlı, 100 MB üstü parça sayısı, iptal; transfer taklit), galeri (en kısa sütuna yerleşen masonry, ay çizgisi sütunlar arasında basamaklı; oranlar şimdilik görsel yüklenince ölçülüyor, gerçekte `media_asset` boyutlarından gelecek), görüntüleyici (ok tuşu, kaydırma, Esc, yakınlaştırma), geri sayım (herbaryum etiketi seçildi; a ve c silindi). Önizleme sayfaları ekranın tamamını kullanır (SPEC §6 Yerleşim). Motion'a sonra tekrar bakılacak; görüntüleyici zorlanırsa `yet-another-react-lightbox`.
- Seçim yapılınca: reddedilenler silinir, kazananlar `components/` altına taşınır, SPEC 6'ya yazılır. Tasarım bitince `/ui*` sayfalarının akıbeti.

### Kullanıcının yapacakları

| Ne zaman | Adım |
|---|---|
| Aşama 1 | Cloudflare API token'ını GitHub repo secret'larına eklemek (yönerge verilecek) |
| Aşama 1 | İki hesabın kullanıcı adı ve görünen adı; betiği çalıştırıp şifre belirlemek |
| Aşama 3 | Çiçek içeriklerinin İngilizce çevirilerini kontrol etmek |

## 2. Garanti ↔ test tablosu

Garantilerin metni SPEC 4'te. Testler `packages/shared/src/**/*.test.ts` ve `apps/web`'de.

| # | Durum | Koruyan test |
|---|---|---|
| G1 | ⬜ Aşama 1 | — |
| G2 | ⬜ Aşama 1 | — |
| G3 | ⬜ Aşama 1 | — |
| G4 | ⬜ Aşama 9 | — |
| G5 | ⬜ Aşama 9 | — |
| G6 | ✅ Kural testli; uç Aşama 6 | `diary-policy` › exact rolling 24-hour lifetime; author keeps expired entries but cannot edit them |
| G7 | 🟡 Kısmen | `diary-policy` › only the partner can respond and only before expiry. "Günlük başına bir çiçek" Aşama 6 |
| G8 | ⬜ Aşama 6 | — |
| G9 | ✅ | `garden-layout` › starts on the day of the first diary entry; no garden before the first entry; days follow the Istanbul calendar |
| G10 | ⬜ Aşama 4 | — |
| G11 | ⬜ Aşama 5 | — |
| G12 | 🟡 Token modülü testli; yükleme ucu Aşama 5 | `signed-token` › round-trips; expired, tampered, foreign and malformed rejected; shape check |
| G13 | ⬜ Aşama 5 | — |
| G14 | ⬜ Aşama 5 | — |
| G15 | ⬜ Aşama 5 | — |
| G16 | ⬜ Aşama 5 | — |
| G17 | ⬜ Aşama 7 | — |
| G18 | ⬜ Aşama 7 | — |
| G19 | ✅ Kural testli; uç Aşama 4 | `date-value` › each supported precision; rejects incomplete and impossible dates. `memory-update-input` › every precision; rejects invalid input |
| G20 | ✅ Kural testli; uç Aşama 4 | `turkey-locations` › all provinces and districts; rejects unknown and mismatched codes; keeps route order; route only for exact-day memories |
| G21 | ⬜ Aşama 8 | — |
| G22 | ✅ | `catalog` › every record has its own local image; no two records share an image region; only dried rose and white lilac representative |
| G23 | ✅ | `catalog` › associations kept apart from emblem meanings; meanings and narratives attached to their paths |
| G24 | ⬜ `/ui*` sayfalarında `noindex` var ama testi yok; uygulama ve demo sayfaları Aşama 1 / 9 | — |

**Testsiz garanti: 16** (G1–G5, G8, G10, G11, G13–G18, G21, G24), kısmen testli 2 (G7, G12). Hepsi henüz yazılmamış aşamalara ait; aşamayla birlikte testi gelir.

**Diğer testler:** `login-identity` (kullanıcı adı kırpılır, büyük/küçük harf korunur; boş ve uzun reddedilir), `scientificName` (Latince ad), `login-flower` (günün çiçeği gün boyu aynı, yalnızca seçili listeden), `app.test.ts` (sağlık ucu, bilinmeyen API JSON 404, uygulama yolları SPA kabuğu), `e2e/ui*.spec.ts` (tasarım token'ları, bileşenler, kontrast, Türkçe font).

**Mutasyon kontrolü:** yok.

## 3. Endpoint listesi

| Yöntem | Yol | Kim | Ne yapar |
|---|---|---|---|
| `GET` | `/api/health` | Herkes | Ayakta mı |
| `*` | `/api/*` | — | Bilinmeyen uç: JSON 404 |

Planlanan uçlar §8 "Onaylı mimari"de.

## 4. Veritabanı diyagramı

Henüz şema yok (Aşama 1). Planlanan tablolar §8'de.

## 5. Ekranlar ve önizleme linki

**Önizleme:** https://memory-garden.erayai.workers.dev (yalnızca tasarım önizlemesi; `/ui*` sayfaları `noindex`)

| Adres | Ne var |
|---|---|
| `/` | Geçici rehber ana sayfası (prerender) |
| `/app` | Geçici uygulama kabuğu |
| `/ui` | Tasarım vitrini: token'lar, yazı, butonlar, form, menü/diyalog/sekmeler, Türkçe tarih seçici, bildirim, anı kartı; kâğıt dokusu ve tema düğmeleri |
| `/ui/login` | Herbaryum giriş ekranı + arka plan seçici + "Sayfayı gizle" (`?bg=`, `?sayfa=gizli`) |
| `/ui/shell` | İçe gömülü yan menü / mobil alt menü |
| `/ui/icons` | Phosphor hafif ve normal |
| `/ui/yazi` | #9'un üç efekti, "Tekrar oynat" |
| `/ui/gecis` | #10: anı kartından tam ekrana, listeye ekleme/silme |
| `/ui/bilesenler` | #11'in taslakları: yükleme, galeri + görüntüleyici, geri sayım (herbaryum etiketi) |

## 6. Eksik ve geçici

| Ne | Etkisi | Ne zaman kapanacak |
|---|---|---|
| `/ui*` önizleme sayfaları üründe | Ürün değil, yalnızca tasarım için | Tasarım listesi bitince kaldır ya da gizle |
| `apps/media/container` eski projeden; fotoğraf yolu duruyor, 1080p sınırı ve nabız yok | Video işleme henüz SPEC'e uymuyor | Aşama 5 |
| Cloudflare kaynakları (D1, R2, Queue, CORS, R2 yaşam döngüsü) oluşturulmadı | Gerçek uygulama çalışmaz | Aşama 1 (oluşturmadan önce kullanıcıya söylenir) |
| `deploy.yml` ve `backup.yml` yok; deploy elle | Testsiz deploy riski | Aşama 1 / 10 |
| Endpoint ve veritabanı bölümleri koddan üretilmiyor | SYSTEM elle güncelleniyor | Şema ve API gelince (Aşama 1) |
| `pnpm check` yalnızca Biome; typecheck ve test ayrı komutlar | "Bitti" tanımıyla uyumsuz | Temizliğin ayrı adımı |
| Cloudflare'e özgü servis kodu `src/platform/` kuralına göre düzenlenmedi | Kural uyumsuzluğu | Temizliğin ayrı adımı |
| Kâğıt dokusu geçici olarak açık | — | Tasarım sonunda |
| `v0-nextjs` etiketi yok | Eski sürüme etiketle dönülemiyor (commit `1357af6` git'te duruyor) | İsteğe bağlı: GitHub → Releases |

## 7. Servisler ve maliyet

| Kalem | Aylık |
|---|---|
| Workers Paid (Workers, D1, Durable Objects, Queues, Containers kotaları dahil) | 5 $ (aktif) |
| R2 (ilk 10 GB ücretsiz, sonra GB başına 0,015 $) | İlk yıl ~0–1 $, 5. yılda ~2–3 $ |
| Cloudflare Images (ayda 5.000 dönüşüm ücretsiz) | 0 $ |
| Container (kota üstü) | Büyük olasılıkla 0–1 $ |
| **Toplam** | **~5–9 $** |

Şu an kullanılan: yalnızca Workers (`memory-garden` önizleme). Gizli değerler henüz yok.

## 8. Teknik notlar

### Yığın ve repo
- Workers (Paid), React Router v8 (`ssr: false` + `prerender`), Vite, Tailwind 4, shadcn/ui (Base UI, Vega), TanStack Query, Hono + Hono RPC, Zod, D1 + Drizzle, Better Auth, R2, Queues, Cloudflare Images, Containers (ffmpeg), Durable Objects (demo). TypeScript 7 strict, Biome, Vitest 4, Playwright, pnpm monorepo, Node 22.22+.
- `apps/web`: React Router uygulaması + Hono API Worker (`memory-garden`, `memory-garden-demo`). `apps/media`: medya Worker'ı + ffmpeg container'ı (`memory-garden-media`). `packages/shared`: alan mantığı, çiçek kataloğu, Türkiye konumları, imzalı token'lar. `research/`: çiçek dili kaynak çalışması. `scripts/`: veri üretimi.
- Komutlar: `pnpm dev` (Vite :5173 + `wrangler dev` :8787), `pnpm check` (Biome), `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`, `pnpm flowers:assets`, `pnpm flowers:cutout`, `pnpm flowers:bouquet`, `pnpm locations:generate`.
- Veri kaynakları: çiçek görsellerinin listesi `packages/shared/src/flowers/flower-artwork.json`; il/ilçe verisinin kaynağı ve lisansı (biri CC BY 4.0) `scripts/generate-turkey-locations.mjs` başında.

### Onaylı mimari (henüz büyük kısmı kodda yok)

**Worker'lar ve bağlantılar**

| Worker | Bağlantılar |
|---|---|
| `memory-garden` | `ASSETS`, `DB` (D1), `MEDIA` (R2, EU), `MEDIA_JOBS` (Queue üretici), `LOGIN_LIMIT` (Rate Limiting). Gizli: `BETTER_AUTH_SECRET`, `UPLOAD_TOKEN_SECRET`, R2 S3 anahtarları, VAPID |
| `memory-garden-demo` | `ASSETS` (demo build, `noindex`), `DEMO_SESSIONS` (SQLite Durable Object), `DEMO_MEDIA` (R2, salt okunur), `DEMO_LIMIT`. Gerçek D1/R2/kuyruğa bağlantı yok |
| `memory-garden-media` | `DB`, `MEDIA`, `IMAGES`, `MEDIA_JOBS` (tüketici), `VIDEO` (Container, `standard-3`: 2 vCPU 8 GiB, otomatik yeniden deneme yok). Gizli: `JOB_TOKEN_SECRET`, R2 S3 anahtarları |

Statik dosyalar Worker'dan önce sunulur; `/api/*` her zaman Worker'a; dosyası olmayan yollar `__spa-fallback.html` döner.

**Planlanan tablolar**

| Tablo | Sütunlar (özet) | Kurallar |
|---|---|---|
| `user` (+ Better Auth `session`, `account`, `passkey`, `verification`) | ad, `username`, `locale`, `notify_diary`, `notify_flower`; e-posta iç adres, gönderim yok | `username` tekil |
| `memory_day` | `date`, `created_by` | `date` tekil |
| `day_location` | `day_id`, il/ilçe kodu ve adı, `lat`, `lng`, `sort_order` | ad ve koordinat satıra kopyalanır |
| `memory_item` | `kind`, `date_precision`, `day_id` \| `year`/`month`, `text`, `caption` (≤280), `sort_order`, `created_by`, `deleted_at`, `deleted_by` | tarih şekli CHECK; not yalnızca `text` türünde |
| `media_asset` | `item_id`, `status`, `source/display/preview_key`, boyutlar, `duration_s`, `run_id`, `attempts`, `progress`, `heartbeat_at`, `error_code` | `ready` ise çıktılar dolu |
| `pending_upload` | `object_key`, `upload_id`, `user_id` | pakete bağlanınca silinir |
| `tag`, `tag_override` | ad, `start_date`, `end_date`; override: `date`, `mode` (`exclude`\|`include`) | `start ≤ end`; PK (`tag_id`, `date`) |
| `special_day` | ad, `month`, `day`, `start_year` | |
| `diary_entry` | `author_id`, `content` (≤2.000), `published_at`, `expires_at`, `deleted_at` | silinince metin temizlenir, satır kalır |
| `diary_flower` | `entry_id`, `responder_id`, `flower_id` | günlük başına bir |
| `push_subscription` | `user_id`, `endpoint`, `p256dh`, `auth`, `device_label`, `last_used_at` | `endpoint` tekil |

Kimlikler UUID, zamanlar UTC ms, gün hesabı `Europe/Istanbul`.

**Planlanan uçlar:** `/api/auth/*` (Better Auth); `me`, `me/settings`; `memories` (liste+filtre, ekle, düzenle, sil), `days/:date`, `days/:date/locations`, `map`, `on-this-day`; `trash` (liste, geri al, kalıcı sil); `uploads` (başlat, parça, tamamla, iptal); `media/:id` (5 dk imzalı URL'e yönlendirme), `media/:id/retry`; `diary` (+ `:id/flower`); `garden`; `tags` (+ `:id/overrides`); `special-days`; `push/subscriptions`; `client-errors`; `demo/start` (yalnızca demo). Medya Worker'ında job token'la: `/internal/config`, `/internal/multipart`, `/internal/heartbeat`, `/internal/callback`.

**Yükleme ve işleme:** 100 MB'a kadar tek imzalı PUT, üstü 16 MB parçalarla multipart, doğrudan R2 `incoming/`'a. Her dosyaya HMAC imzalı, 6 saat geçerli yükleme token'ı ve `pending_upload` kaydı. `POST /api/memories` token'ları ve R2'deki dosyaları doğrular, tek D1 `batch()` ile yazar, kuyruğa iş bırakır. Foto: Images binding → 2560 px + 720 px WebP. Video: iş başına container, yalnızca kısa ömürlü job token ve parça başına imzalı URL alır; her dakika nabız gönderir. Başarıda orijinal silinir.

**Zamanlanmış işler:** 5 dk'da bir takılan medya → `failed` (`worker_lost`); saatte bir 6 saatlik `pending_upload` temizliği; her gece 03:00 30 günlük çöp kutusu; haftalık (GitHub Actions) D1 yedeği R2'ye, 12 hafta. R2 yaşam döngüsü kuralı tamamlanmamış multipart'ı 1 gün sonra iptal eder.

**Güvenlik:** httpOnly + secure çerez; her istek oturum ve üyelikten geçer; tüm girdiler Zod (aynı şemalar formlarda); katı CSP, `X-Content-Type-Options`, `Referrer-Policy`.

**Demo kopyası:** `POST /api/demo/start` → IP sınırı → yeni Durable Object → migration'lar + örnek veri → imzalı demo çerezi; sonraki `/api/*` o kopyaya, aynı Hono uygulamasıyla. 24 saat sonra alarmla silinir.

**CI/CD:** `ci.yml` (var): Biome, typecheck, birim testleri, build, uçtan uca. Planlanan: Lighthouse; `deploy.yml` (`main`: migration → demo → gerçek → `media` değiştiyse media); `backup.yml`. Secret'lar: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

**Küçük teknik varsayılanlar:** i18next, vite-plugin-pwa (Workbox), aws4fetch (imzalı R2 URL), date-fns + @date-fns/tz, React Hook Form + Zod, Motion, concurrently, Fontsource (Türkçe alt kümeyle), WebCrypto tabanlı web push. Harita: MapLibre GL + OpenFreeMap, yalnızca harita ekranında yüklenir.

### Tasarım uygulaması
- Tema `apps/web/app/theme.css` (`:root` açık, `.dark` koyu; shadcn token adları, `app.css`'te `@theme inline`), yazı `typography.css`, şekil `shape.css` (tek `--radius` tüm köşeleri sürer; gölgeler siyah yerine ön plan tonuyla).
- Kontrast: `node scripts/contrast-check.mjs <theme.css>`; eşikler 7:1 gövde, 4.5:1 diğer yazı, 3:1 alan kenarı ve odak halkası. Giriş alanı kenarı kart kenarından bilerek koyu.
- Türkçe font kontrolü font dosyalarında yapılır (`latin` + `latin-ext` cmap'inde ç ğ ı İ ö ş ü â î û ₺); tarayıcı testi `document.fonts.check` ile.
- Giriş arka planı iki adımda üretilir, çıktı commit'lenir: `pnpm flowers:cutout` (61 levhayı kâğıttan keser → `.cache/flowers/cutout/`, gitignore'da, 11 MB) → `pnpm flowers:bouquet` (`apps/web/public/flowers/bouquet.webp`, 2200×1600, 63 çiçek, %93, 1,1 MB). Kesimi temiz çıkmayan 18 levha (beyaz çiçekler, çerçeveli taramalar) `scripts/flower-bouquet.mjs` → `SKIP`'te, gerekçesiyle.
- Kesim yöntemi: kâğıt rengi levha kenarının medyanı; ona Chebyshev 34 içindeki pikseller atılır, kenardan 52 ile sararmış lekeler; en büyük parçanın %2'sinden küçük adacıklar (yazılar) atılır; maske ~1 px yumuşatılır. Yerleşim: 1/8 ölçekli kaplama ızgarası, azalan boy turları (%50, %36, %26, %18), en çok boş alanı kaplayan konum. Shader'da `smoothstep(0.2, 0.7, alpha)` kesik kenarındaki soluk haleyi alır.
- Yazı animasyonu `app/text-anim.css` (`.anim-beliris`, `.anim-elyazisi`) ve `components/count-up.tsx`; geçişler `app/view-transition.css` (320 ms, yazıyla aynı eğri), `root.tsx`'te `<Outlet>` sarmalı.
- Giriş ekranı `app/components/herbarium-login.tsx`; günün çiçeği `app/lib/login-flower.ts`. Arka plan `app/components/art/silk-plate.tsx` + `gl.ts` (ekran dışında, gizli sekmede ve "hareketi azalt"ta durur; piksel oranı telefonda 1, diğerlerinde 1.5).

### Tuzaklar
- D1'de etkileşimli transaction yok; Drizzle `.transaction()` hata verir. Çok adımlı yazma `batch()` ile.
- `@cloudflare/vite-plugin` React Router'ın `ssr: false` + `prerender` build'iyle çalışmıyor; Worker'ı Wrangler paketliyor.
- **shadcn `init` CSS'i ezer:** gri renkler ve Inter ekler; sonra `app.css`'i yeniden yaz. `add` mevcut dosyanın üzerine yazmak isterse `yes n | pnpm dlx shadcn@latest add <ad>` ile reddet. `components.json` → `iconLibrary: "phosphor"`. Yol takma adı `tsconfig.json`'da da olmalı, yoksa `~/` adlı klasör açar. Kurulum: `pnpm dlx shadcn@latest init -b base -p vega -y --no-monorepo --no-rtl`.
- shadcn Card `rounded-xl shadow-xs` ve 24 px boşlukla gelir; token'lara bağla. `cn` artık `cn` npm paketinden (doğrulandı).
- Renkli varyantlar token kontrolünden kaçar: koyu modda yıkıcı buton 4.18:1 çıktı; `--destructive` açıldı ve piksel ölçen tarayıcı testi eklendi.
- Biome, `gl.useProgram`'ı React hook'u sanıyor (`art/gl.ts`'de gerekçeli ignore); `a11y/noLabelWithoutControl` yalnızca `components/ui/**` için kapalı.
- Betikle çok adımlı JSX düzenlemesi süslü parantezleri bozabiliyor (canlıya stilsiz buton gitti). Dosyayı bütün yaz; her görünür parça için stil testi ekle.
- Tam ekran shader her kareyi her pikselde öder; GPU'suz test tarayıcısında 4–5 fps. E2E'de `page.emulateMedia({ reducedMotion: "reduce" })`. Görsel tabanlı arka planlar çok daha ucuz. Arka plan katmanı `inert` + `aria-hidden` içinde.
- React Bits Aurora "hareketi azalt"ta donmuş kareyi çizmeye devam ediyor: `paused`'ı kendin ver. Prop adlarına güvenme (Drift Wall `dim` = opaklık).
- Arkada kalan `wrangler dev`/`workerd`, `pnpm build`'in prerender adımını zaman aşımına düşürür; önce kapat. `pkill -f "wrangler dev..."` kullanma: kalıp kabuğun kendi satırına uyup kabuğu öldürür; PID'i `ps` ile bul.
- Katalogda olumsuz anlamlı çiçekler var; `path` Latince ile Türkçe çeşit adını karıştırır ("Rosa › kırmızı"), ekranda `scientificName()` kullan.
- iPhone'da ana ekrana eklenen uygulama Safari'den ayrı çalışır: kurulumdan sonra bir kez yeniden giriş gerekir. iPhone'da web push yalnızca ana ekrana eklenmiş PWA'da.
- View Transitions: React yalnızca Transition içindeki güncellemede geçiş çalıştırır (router gezinmeleri zaten öyle; kendi `setState`'in `startTransition` ister). Geçiş adı sayfada benzersiz ve geçerli tanımlayıcı olmalı: Türkçe harfler geçersiz, sadeleştir. React Router'ın kendi `viewTransition` prop'u ve `useViewTransitionState` eskidi; ikisini birlikte açmak animasyonu keser. Destek: Safari/iOS 18+, Chrome/Edge 111+, Firefox 144+.
- GLSL şablon dizesindeki yorumda ters tırnak dizeyi bitirir; TypeScript sonraki satırda sözdizimi hatası verir.
- `sharp`: bulanıklaştırılmış tek kanallı ham tampon üç kanal döner (`info.channels`'ı adım olarak oku); birleştirmeden önce boyutlandırır, bu yüzden boyutlandırmayı ayrı geçişte yap; birleştirme ofsetleri negatif olamaz, taşanı kendin kırp.
- Elle yazılış efekti denenirse: opentype.js değişken fontun hatlarını `.notdef` kutusu okur (statik yüzü kullan); Fontsource Türkçe harfleri ayrı alt kümede tutar; kesik çizgi deseni her `M`'de baştan başlar (her kontur ayrı yol); yuvarlak uç sıfır uzunlukta leke bırakır (düz uç).
- Paket kurmadan önce yayıncıyı kontrol et: `pnpm view <paket> maintainers repository.url`.
