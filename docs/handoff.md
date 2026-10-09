# Devir notu: nerede kaldık

Son güncelleme: 2026-10-09 (Aşama 0 sonrası). Yeni bir sohbet buradan devam eder.

## Durum

| Adım | Durum |
|---|---|
| Karar 1–7, 9 ve mimari düzeltmeleri | **Kararlaştırıldı** (`docs/decisions.md`) |
| Mimari dokümanı | **Onaylandı** (`docs/architecture.md`) |
| Karar 8: UI | **Bekliyor.** Proje sahibi seçimlerini hazırlıyor (aşağıdaki rehber). |
| Aşama 0: Hazırlık | **Kod tarafı tamamlandı**, proje sahibinin onayını bekliyor (ayrıntılar aşağıda) |
| Aşama 1: Temel + giriş | Sıradaki |

Çalışma branch'i: `claude/wonderful-dijkstra-c10sbz`.

## Sıradaki adımlar

### Proje sahibinin yapacakları

1. **UI seçimlerini hazırlamak** (Karar 8, aşağıdaki rehber). Aşama 1 bunu beklemeden ilerleyebilir.
2. İsteğe bağlı: `v0-nextjs` etiketi (proje sahibi için önemli değil). Oluşturulmak istenirse:
   GitHub → Releases → Draft a new release → tag `v0-nextjs`, target commit `1357af6`.

Tamamlananlar: Aşama 0 onaylandı. GitHub secret'ları (`CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`) repoya eklendi. Hesap Workers Paid planında (proje sahibi panelden
doğruladı). Token env1 ortamında da var ve doğrulandı.

### Claude'un yapacakları (Aşama 1)

1. Ortamda `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` var mı kontrol et (değerleri asla
   yazdırma).
2. Cloudflare kaynaklarını oluştur: D1 `memory-garden`; R2 `memory-garden-media` (EU) ve
   `memory-garden-demo-media`; Queue `media-jobs`; R2 CORS (uygulama adresinden PUT); R2 yaşam
   döngüsü kuralı (tamamlanmamış multipart 1 gün). Kaynak oluşturmak dışarıya dönük bir işlem;
   önce proje sahibine ne oluşturulacağını söyle.
3. `deploy.yml` (ve sonra `backup.yml`) GitHub Actions iş akışları.
4. Aşama 1'in içeriği: `docs/architecture.md` §13.
5. Her aşamadan sonra proje sahibine ne yapıldığını özetle ve onay al.

## Aşama 0: Yapılanlar

- Eski Next.js uygulaması silindi. Korunanlar taşındı:
  - `research/` olduğu gibi kaldı.
  - Curtis görselleri → `apps/web/public/flowers/art/`.
  - Çiçek kataloğu, Türkiye konumları, tarih/günlük/bahçe mantığı → `packages/shared/src/`.
  - ffmpeg container'ı → `apps/media/container/` (Aşama 5'te güncellenecek: fotoğraf yolu
    kaldırılacak, 1080p sınırı ve nabız eklenecek).
  - Veri script'leri `scripts/` altında, yolları güncellendi.
- Saf mantık testleri Vitest'e çevrildi. Eski prototip arayüz testleri silindi.
- İmzalı token'lar tek ortak modülde (`packages/shared/src/tokens`), WebCrypto ile, testli. Upload
  ve job token'larının içerikleri Aşama 1 ve 5'te bu modülle yazılacak.
- Bahçenin sabit başlangıç tarihi kaldırıldı (D4).
- pnpm monorepo: `apps/web` (React Router v8 + Hono Worker), `apps/media` (Worker iskeleti),
  `packages/shared`. TypeScript 7 (strict), Biome, Vitest 4, Playwright.
- `apps/web`: `/` prerender ediliyor; `/app` SPA olarak açılıyor; `/api/health` çalışıyor; demo
  ortamı `wrangler.jsonc` içinde tanımlı.
- GitHub Actions `ci.yml`: Biome, typecheck, birim testleri, build, uçtan uca testler.
- Teknik değişiklikler ve gerekçeleri: `docs/decisions.md` → "Aşama 0 sırasında yapılan teknik
  değişiklikler".

## Aşama 3'te proje sahibine sorulacaklar (çiçek görselleri)

1. **Çizimsiz kayıtlar:** Katalogda 61 kayıt var; 6'sının Curtis çizimi yok (Aynısefa,
   Horozibiği, Erguvan, Portakal çiçeği, Müge, Unutma beni). Rehberde gösterilsinler mi?
2. **Paylaşılan görseller:** Çizimli 55 kaydın 13'ü, tür ya da çeşide özel bir çizim bulunamadığı
   için genel türün çizimini paylaşıyor (55 kayıt, 47 farklı görsel):
   - Papatya → Katmerli papatya
   - Haşhaş → Beyaz haşhaş
   - Gül → Beyaz gül, Beyaz gül tomurcuğu, Gül tomurcuğu
   - Leylak → Beyaz leylak
   - Menekşe → Kokulu menekşe, Hercai menekşe

   Seçenekler: (a) olduğu gibi kalsın ama "temsilî görsel" diye belirtilsin; (b) bu kayıtlar
   için başka kamu malı kaynaklardan özel görsel bulunsun. `research/` içindeki Ingram, Phillips
   ve Tyas kırpımlarında aday var: hercai menekşe (p-015 pansy), papatya (p-019 daisy),
   menekşe (t-011 purple violet), gül çeşitleri, haşhaş (i-009 poppy). Ama üslup Curtis'ten
   farklı; (c) görselsiz gösterilsin.

## Karar 8: UI — proje sahibi için rehber

Proje sahibi bu araçları ilk kez kullanıyor. Seçimlerini gönderdiğinde Claude parçaları kurar,
hepsini temaya bağlar ve bir kitchen-sink sayfasında yan yana gösterir (Aşama 2).

**Temel kavramlar:** shadcn/ui bir kütüphane değil; bileşenlerin kaynak kodunu projeye kopyalayan
bir sistem (`npx shadcn add ...`). "Registry", bu formatta bileşen yayınlayan katalog demek
(21st.dev ve React Bits da öyle). Tema değişkenleri (`--primary`, `--background`, `--radius`…)
tüm bileşenleri birbirine bağlar.

**Adım 0 (10 dk):** Uygulamanın hissini anlatan üç kelime seç. `public/flowers/art/`
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
- `@cloudflare/vite-plugin`, React Router'ın `ssr: false` + `prerender` build'iyle çalışmıyor
  (prerender adımı Vite preview sunucusu açarken eklenti henüz yazılmamış deploy ayarını arıyor).
  Bu yüzden Worker'ı Wrangler paketliyor.
- Bu bulut ortamında git tag push'u reddediliyor; yalnızca çalışma branch'ine push yapılabiliyor.
- Cloudflare token'ı env1 ortamında; değişkenler yalnızca ortama eklendikten sonra açılan
  oturumlarda görünür.
