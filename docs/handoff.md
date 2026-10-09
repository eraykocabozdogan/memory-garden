# Devir notu: nerede kaldık

Son güncelleme: 2026-10-09. Yeni bir sohbet buradan devam eder.

## Durum

| Adım | Durum |
|---|---|
| Karar 1–7, 9 ve mimari düzeltmeleri | **Kararlaştırıldı** (`docs/decisions.md`) |
| Mimari dokümanı | **Onaylandı** (`docs/architecture.md`) |
| Karar 8: UI | **Bekliyor.** Proje sahibi seçimlerini hazırlıyor (aşağıdaki rehber). |
| Kodlama | **Başlamadı.** Sıradaki iş Aşama 0. |

Bütün planlama çalışması `claude/wonderful-dijkstra-c10sbz` branch'inde yapıldı.

## Sıradaki adımlar

### Proje sahibinin yapacakları

1. **`v0-nextjs` etiketini oluşturmak.** Etiket, önceki oturumda GitHub'a gönderilemedi
   (oturumun git bağlantısı yalnızca çalışma branch'ine push'a izin verdi). GitHub'da:
   repo → **Releases** → **Draft a new release** → **Choose a tag** kutusuna `v0-nextjs` yaz →
   **Target** olarak commit `1357af6`'yı seç (son Next.js commit'i:
   "feat(auth): load usernames and member names from the database") → yayınla.
   İstersen sürüm notu: "Cloudflare'e geçişten önceki son Next.js + Supabase + Vercel sürümü".
2. **Cloudflare API token'ı oluşturmak** (deploy ve doğrulama için):
   - Cloudflare paneli → sağ üstte profil → **My Profile** → **API Tokens** → **Create Token**.
   - **Edit Cloudflare Workers** şablonuyla başla. İzinlere D1, Workers R2 Storage, Queues ve
     listede varsa Containers ile Cloudflare Images için **Edit** ekle. Hesap olarak kendi
     hesabını seç.
   - Token'ı iki yere ekle:
     - GitHub repo → **Settings** → **Secrets and variables** → **Actions** → yeni secret'lar:
       `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` (Account ID, Cloudflare panelinde
       Workers sayfasının sağ tarafında yazar).
     - Claude'un oturumda `wrangler` çalıştırabilmesi için: Claude Code bulut ortamı ayarları
       (oturum başlığındaki ortam menüsü → **Edit**) → **Network secrets** (eski uygulamada
       **API credentials**) ya da ortam değişkeni olarak aynı iki isimle. Yeni oturumlar bunu
       otomatik görür.
   - Token'ı sohbete yapıştırma.
3. **UI seçimlerini hazırlamak** (Karar 8, aşağıdaki rehber). Aşama 0 ve 1 bunu beklemeden
   ilerleyebilir.

### Claude'un yapacakları

1. Token ortamda varsa `wrangler whoami` ile hesabın **Workers Paid** planında olduğunu doğrula.
   Önceki oturumda doğrulanamadı; proje sahibi Paid plana geçtiğini bildirdi.
2. **Aşama 0**'a başla. Ayrıntılı görev listesi aşağıda.
3. Her aşamadan sonra proje sahibine ne yapıldığını özetle ve onay al.

## Aşama 0: Hazırlık

### 1. Korunacak dosyalar ve yeni yerleri

| Eski konum | Yeni konum | Not |
|---|---|---|
| `research/` | `research/` | Olduğu gibi. Proje sahibi için çok değerli; dokunma. |
| `public/flowers/curtis/` | `apps/web/public/flowers/curtis/` | 61 Curtis görseli |
| `features/flowers/catalog-data.json`, `curtis-artwork.json`, `catalog.ts` | `packages/shared/src/flowers/` | İngilizce içerik Aşama 3'te eklenecek |
| `features/locations/turkey-locations.json`, `turkey-locations.ts`, `memory-location-selection.ts`, `DATA_SOURCE.md` | `packages/shared/src/locations/` | |
| `features/memories/date-value.ts`, `batch-limits.ts`, `memory-update-input.ts` | `packages/shared/src/memories/` | |
| `features/diary/diary-policy.ts`, `garden-layout.ts` | `packages/shared/src/diary/` | `garden-layout.ts`'teki sabit başlangıç tarihi kaldırılacak (D4) |
| `features/auth/login-identity.ts` | `packages/shared/src/auth/` | |
| `lib/r2/upload-token.ts`, `lib/media-processing/token.ts`, `object-keys.ts` | `apps/web/worker/` ve `apps/media/src/` | Token ömrü 6 saat olacak |
| `media-worker/` (src, Dockerfile, tests/smoke.mjs) | `apps/media/container/` | Fotoğraf yolu kaldırılacak (fotoğraflar Images ile işleniyor); 1080p sınırı ve nabız eklenecek |
| `scripts/import-flower-catalog.mjs`, `generate-turkey-locations.mjs`, `download-curtis-flower-assets.mjs` | `scripts/` | Dosya yolları güncellenecek |
| `tests/e2e/` içindeki saf mantık testleri (date-value, diary-policy, diary, flower-catalog, turkey-locations, memory-update-input, login-identity) | İlgili paketlerde Vitest testleri | Playwright'tan Vitest'e çevrilecek |

### 2. Silinecekler

`app/`, `components/`, `features/` (korunanlar dışında, `mock-data.ts` dahil), `lib/` (korunanlar
dışında), `db/`, `drizzle/` (Postgres migration'ları), `next.config.ts`, `proxy.ts`,
`drizzle.config.ts`, `components.json`, `eslint.config.mjs`, `postcss.config.mjs`,
`playwright.config.ts`, `package.json`, `package-lock.json`, `.env.example`,
`scripts/configure-database-env.mjs`, `public/` içindeki varsayılan Next.js SVG'leri,
`AGENTS.md`'deki Next.js notu. `README.md` yeniden yazılacak.

### 3. Kurulacaklar

- pnpm workspace: `apps/web`, `apps/media`, `packages/shared`. TypeScript (strict), Biome.
- `apps/web`: React Router v7 (`ssr: false` + prerender), Vite, Cloudflare Vite eklentisi,
  Hono; `wrangler.jsonc` içinde `production` ve `demo` ortamları.
- `apps/media`: kuyruk tüketicisi + Container sınıfı iskeleti, `wrangler.jsonc`.
- `packages/shared`: Drizzle şeması için yer, Zod şemaları, taşınan saf mantık.
- Vitest (birim + Workers test ortamı), Playwright iskeleti.
- GitHub Actions: `ci.yml` (Biome, typecheck, test, build). `deploy.yml` ve `backup.yml`
  token eklendikten sonra.
- Cloudflare kaynakları (token gelince): D1 `memory-garden`; R2 `memory-garden-media` (EU) ve
  `memory-garden-demo-media`; Queue `media-jobs`; R2 CORS (uygulama adresinden PUT); R2 yaşam
  döngüsü kuralı (tamamlanmamış multipart 1 gün).

## Karar 8: UI — proje sahibi için rehber

Proje sahibi bu araçları ilk kez kullanıyor. Seçimlerini gönderdiğinde Claude parçaları kurar,
hepsini temaya bağlar ve bir kitchen-sink sayfasında yan yana gösterir (Aşama 2).

**Temel kavramlar:** shadcn/ui bir kütüphane değil; bileşenlerin kaynak kodunu projeye kopyalayan
bir sistem (`npx shadcn add ...`). "Registry", bu formatta bileşen yayınlayan katalog demek
(21st.dev ve React Bits da öyle). Tema değişkenleri (`--primary`, `--background`, `--radius`…)
tüm bileşenleri birbirine bağlar.

**Adım 0 (10 dk):** Uygulamanın hissini anlatan üç kelime seç. `public/flowers/curtis/`
çizimlerine bak; renkler bu eski botanik çizimlerle uyumlu olmalı.

**Adım 1: tweakcn.com/editor/theme (45 dk, zorunlu)**
- Üstteki tema seçiciden hazır temaları gez, en yakınından başla.
- Önizlemede "Application" ve "Cards" sekmeleri bu uygulamaya en yakın olanlar.
- **Colors:** Base, Primary, Accent, Muted, Card, Border & Input, Sidebar önemli; Chart'ı atla.
- **Typography:** sans ve serif. Türkçe karakter kontrolü: fontu Google Fonts'ta aç, "Ğüzel şiir
  ışığında İstanbul" yaz. El yazısı bir başlık fontu istiyorsan adını ayrıca not et.
- **Other:** köşe ve gölge.
- Açık ve koyu modu ayrı ayarla.
- Alttaki **Code** → Tailwind v4, oklch → kopyala. Ya da **Save** + **Share** ile link.

**Adım 2: ui.shadcn.com/blocks (15 dk):** "Login" ve "Sidebar" bloklarından beğendiğini not et.

**Adım 3: reactbits.dev (30 dk):** Backgrounds, Text Animations, Animations, Components, Micro.
1 arka plan (giriş ekranı / rehber girişi), 1–2 yazı animasyonu, isteğe bağlı 1 bileşen.
Ayar kontrolleriyle oyna, değerleri not al. Varyant: TS-TW. Gösterişli efekt en fazla 1–2 yerde.

**Adım 4: 21st.dev (isteğe bağlı, 30 dk):** Sadece eksik parçalar için: dosya yükleme, galeri /
tam ekran görüntüleyici, tarih seçici / zaman çizelgesi, geri sayım kartı. Sayfa linki + not.

**Gönderilecek not:**

```
ÜÇ KELİME: ...
TEMA (tweakcn): <Code çıktısı ya da Share linki>
EL YAZISI FONT (varsa): ...
BLOKLAR (shadcn): giriş → ..., uygulama iskeleti → ...
ARKA PLAN (React Bits): <link> — nerede — ayarlar
YAZI ANİMASYONU (React Bits): <link> — nerede — ayarlar
BİLEŞEN (React Bits, varsa): <link> — nerede
21st.dev (varsa): <link> — ne için — not
BEĞENMEDİĞİM ŞEYLER (isteğe bağlı): ...
```

Claude seçilenlerin ağırlığını (WebGL/3D arka planlar pil tüketir) ve kontrastı kontrol eder,
sorun varsa söyler.

## Önceki oturumda öğrenilenler

- OpenNext'in Next.js 16 `proxy.ts` desteği deneysel; bu yüzden Next.js bırakıldı.
- D1 interaktif transaction desteklemiyor; Drizzle'ın `.transaction()` çağrısı hata veriyor.
- workers.dev'de iç içe alt alan adı yok; demo ayrı bir Worker adıyla yayınlanıyor.
- Cloudflare Stream Workers Paid'e dahil değil (ayrı ücret); bu yüzden video için Container.
- Containers yalnızca Paid planda. Queues ve SQLite Durable Objects Free planda da var.
- Cloudflare Images HEIC girdiyi destekliyor; Images binding özel alan adı gerektirmiyor.
- iPhone'da web push yalnızca ana ekrana eklenmiş PWA'da çalışıyor.
- Proje sahibi Android, partneri iPhone kullanıyor.
