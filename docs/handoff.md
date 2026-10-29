# Devir notu: nerede kaldık

Son güncelleme: 2026-10-29 (Karar 8 / Aşama 2 tasarım seçimleri sürerken). Yeni bir sohbet buradan
devam eder. Önce bu dosyayı, sonra `docs/frontend-playbook.md`'yi oku.

## Durum

| Adım | Durum |
|---|---|
| Karar 1–7, 9 ve mimari | **Kararlaştırıldı** (`docs/decisions.md`, `docs/architecture.md`) |
| Aşama 0: Hazırlık | **Onaylandı** |
| Karar 8: UI = Aşama 2 (tasarım sistemi) | **Sürüyor: 7/11 seçim bitti, 8. (arka plan) üzerinde çalışılıyor** |
| Aşama 1: Temel + giriş | Bekliyor (Karar 8 bitince ya da paralel) |

Ana branch: `main`. Çalışma branch'i: **`claude/blissful-wright-yju0fk`** (her şey push'lu;
main'e **merge edilmedi**, PR açılmadı). Yeni sohbet ya bu branch'ten devam
eder ya da önce bunu main'e mergeleyip yeni branch açar; proje sahibine sor.

## Karar 8 / Aşama 2: nerede kaldık

### Çalışma şekli (proje sahibinin isteği, böyle devam et)

- Ön yüz seçimleri **sırayla, tek tek** yapılıyor. Her adımda: kısa özet ve seçenekler →
  seçenekleri **canlı önizleme sayfasına** koy → yayınla (`wrangler deploy`) → proje sahibi
  tarayıcıda/tabletinde görüp seçer → seçileni sabitle, reddedilenleri **sil** → kaydet.
- Her seçim **iki yere** yazılır: `docs/decisions.md` (Karar 8 tablosu, Türkçe) ve
  `docs/frontend-playbook.md` (İngilizce, başka projelere taşınabilir yöntem + dersler).
- Her adım testlerle teslim edilir (`pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm build`,
  `pnpm test:e2e`); yayından önce ekran görüntülerine bakılır (masaüstü, mobil, koyu tema, tablet).
- İlk yayın onayı alındı (1a): `memory-garden.erayai.workers.dev`'e önizleme için doğrudan
  deploy edilebilir. D1/R2 gibi **yeni kaynak** oluşturmak hâlâ onay ister.
- **Dil:** proje sahibi bu sohbetin ortasında "Türkçe devam edeceğiz" dedi; sohbet Türkçe.
  (Kişisel tercihleri varsayılan olarak İngilizce; yeni sohbette emin değilsen sor.)
  `CLAUDE.md`'deki "Türkçe" satırını proje sahibinin isteğiyle sildik.
- Proje sahibi cevaplarda başlık/alt başlık/madde düzeni, kısa cümle, önerinin açıkça
  işaretlenmesi ([O]), kaynak/tahmin etiketleri ([1], [I], [M]) ve kısa cevap verilebilen
  numaralı sorular istiyor.

### Canlı önizleme sayfaları (noindex, sadece tasarım için)

- `/ui`: token'lar, yazı, butonlar, form, menü/diyalog/sekmeler, Türkçe tarih seçici, bildirim,
  anı kartı. Üstte kâğıt dokusu ve açık/koyu tema düğmeleri.
- `/ui/login`: herbaryum giriş ekranı + arka plan seçici + "Sayfayı gizle".
- `/ui/shell`: içe gömülü yan menü (masaüstü) / alt menü (mobil).
- `/ui/icons`: Phosphor hafif ve normal.
- Kod: `apps/web/app/routes/ui*.tsx`. Ürün değil; tasarım bitince kaldırılacak ya da gizlenecek.

### Bitmiş seçimler (ayrıntı: `docs/decisions.md` 8-1…8-7, playbook §1–7)

1. His: intimate · paper-like · gentle
2. Renk: Parchment (`app/theme.css`), koyu mod "gece kâğıdı"; `scripts/contrast-check.mjs`
3. Yazı: Lora + Source Sans 3 + Caveat (`app/typography.css`)
4. Şekil: Paper (`app/shape.css`); **kâğıt dokusu şimdilik açık, sonda tekrar bakılacak**
5. Bileşenler: shadcn/ui, Base UI, Vega stili, next-themes (`app/components/ui/`)
6. İskelet: içe gömülü yan menü (sidebar-08) + mobil alt menü; giriş: herbaryum yaprağı
   (`app/components/herbarium-login.tsx`: günün çiçeği yalnız sıcak anlamlı 10 çiçekten,
   `app/lib/login-flower.ts`; Latince ad `scientificName()` ile; levha numarası kaldırıldı)
7. İkonlar: Phosphor, varsayılan hafif, gezinmede normal (`root.tsx` IconContext)

### Şu an açık: #8 hareketli arka plan (giriş ekranı)

- **Yön kararı:** "Silk + Curtis": Curtis çizimleri dalgalanan ipek kumaşa basılmış gibi.
  Bileşen: `app/components/art/silk-plate.tsx` (kendi yazdığımız WebGL2 shader, harici
  kütüphane yok) + `app/components/art/gl.ts` (döngü: ekran dışında/gizli sekmede/"hareketi
  azalt"ta durur, çözünürlük telefonda 1, diğerlerinde 1.5 ile sınırlı).
- Reddedilenler (kodları silindi): React Bits Particles, Aurora, Iridescence, Grid Motion,
  Drift Wall, Logo Loop (kayan sıralar), duran duvar, düz Silk, 3D çiçek (görünmez çiçek
  üzerinde akan çizimler).
- Şu an canlıda iki görünüm var: "Silk + tek Curtis" (rastgele bir çizim ekranı kaplar) ve
  "Silk + kolaj" (`public/flowers/collage.webp`, 5×3 büyük çizim, `pnpm flowers:collage`).
- **Proje sahibinin son geri bildirimi (tablette baktı):**
  1. Çok boşluk var: Curtis levhalarının **sarı kâğıt zemini** fazla yer kaplıyor.
  2. Düz Silk'te **yansımalar ve dalgalanmalar** daha belirgindi; bunda belli olmuyor.
  3. İstek: **olabildiğince çok çiçek, olabildiğince az sarı kâğıt zemini.**
- **Planlanan çözüm (başlanmadı, proje sahibi onaylamıştı):**
  - Build adımında bir script ile çiçekleri kâğıttan **kesip çıkarmak**: her levhanın kenar
    piksellerinden kâğıt rengini bul (medyan), ona yakın pikselleri yumuşak kenarla saydam
    yap; küçük ayrık lekeleri (yazılar, "No. 841", "Pub. by W. Curtis") alan eşiğiyle at;
    sonuç `public/flowers/cutout/<id>.webp` (alfa kanallı). Sharp ile ham piksel + JS'de
    bağlı bileşen taraması yeterli (Python gerekmez).
  - Kesilmiş çiçekleri **yoğun bir buket/kolaj** olarak yerleştir: her parçayı en çok boş
    alanı kapatacağı yere koyan açgözlü (greedy) yerleşim, örtüşmeye izin ver, hedef ~%90
    kaplama. Çıktı alfa kanallı tek doku.
  - Shader: alfa olmayan yerde ipek kumaş, alfa olan yerde çiçek. **İpek etkisini
    güçlendir:** kıvrım kontrastı, gölge ve parlaklık düz Silk kadar belirgin olsun
    (şu anki değerler: kıvrım çarpanı 0.82–1.06, parlaklık 0.32, kaydırma 0.012; artır).
  - İki görünüm sun: yoğun kesik çiçek kolajı + tek büyük kesik çiçek (etrafı ipek).
  - Tablet boyutlarında (1180×820 ve 820×1180) ekran görüntüsüyle kontrol et.
- Belirsizlik: "çok boşluk var sayfada" herbaryum sayfasındaki boşluğu da kastediyor olabilir;
  yeni sohbette kısaca teyit et.

### Kalan seçimler

- #9 Yazı animasyonu, #10 Hareket (Motion), #11 Özel bileşenler (dosya yükleme, galeri/tam
  ekran görüntüleyici, tarih seçici/zaman çizelgesi, geri sayım kartı; 21st.dev, Kibo UI,
  ayrıca React Bits'in galerileri: Dome Gallery, Circular Gallery, Masonry, bahçe/rehber için)
- Ertelenenler: kâğıt dokusu (sonda), **uygulama içinde arka plan** (S3: donmuş ipek karesi,
  hareketli ipek ya da sadece seçili sayfalar; "sonra karar verelim" dendi).
- Sonunda: playbook'u tamamla, `/ui*` önizleme sayfalarının akıbetine karar ver, branch'i
  main'e mergele (PR proje sahibi isterse).

## Aşama 1: Temel + giriş (Karar 8'den sonra)

1. Ortamda `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` var mı kontrol et (değerleri asla
   yazdırma). Bu oturumda ikisi de vardı.
2. Cloudflare kaynaklarını oluştur: D1 `memory-garden`; R2 `memory-garden-media` (EU) ve
   `memory-garden-demo-media`; Queue `media-jobs`; R2 CORS (uygulama adresinden PUT); R2 yaşam
   döngüsü kuralı (tamamlanmamış multipart 1 gün). Kaynak oluşturmak dışarıya dönük bir işlem;
   önce proje sahibine ne oluşturulacağını söyle.
3. `deploy.yml` (ve sonra `backup.yml`) GitHub Actions iş akışları.
4. İçerik: `docs/architecture.md` §13. Giriş sayfası hazır bileşeni kullanır
   (`HerbariumLogin`, formu Better Auth'a bağla).
5. Her aşamadan sonra proje sahibine özetle ve onay al.

İsteğe bağlı (proje sahibi için önemli değil): `v0-nextjs` etiketi. GitHub → Releases → Draft a
new release → tag `v0-nextjs`, target commit `1357af6` (bu ortamda tag push'u reddediliyor).

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

## Çiçek kataloğu (Aşama 3'e hazırlık)

Ekim 2026'da katalog kaynaklara karşı baştan sona doğrulandı ve düzeltildi: 146 anlatı
paragrafı, atıflar, anlamlar ve görseller. Yöntem: `research/flowers/catalog-methodology.md`;
sonuçlar: `research/flowers/catalog-verification-2026-10.md`. 61 kaydın hepsinin kendi görseli
var (beyaz leylak ve kurumuş gül "temsilî"); görseller `apps/web/public/flowers/art/`, kaynak
listesi `packages/shared/src/flowers/flower-artwork.json` (`pnpm flowers:assets` yeniden üretir).

Aşama 3 için notlar:

- Çiçek kaydında anlam (`meaning`) ile çağrışımlar (`associations`) ayrı satırlarda gösterilir
  (Y4). Çağrışım alanı boş olabilir.
- `artwork.representative` doğruysa görselin yanında "temsilî" notu gösterilir (Y5).
- Görsel kaynağı `artwork.sourceUrl` ile Commons sayfasına bağlanır.

## Karar 8: UI — eski rehber

Proje sahibi için hazırlanan site site rehber (tweakcn, shadcn blokları, React Bits, 21st.dev)
yerini yukarıdaki canlı önizleme yöntemine bıraktı. Yöntem ve seçimler
`docs/frontend-playbook.md`'de.

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
- **Bu bulut ortamında önizleme ve ekran görüntüsü:** `cd apps/web && npx wrangler dev --port
  4173 &` sonra Playwright (`executablePath: "/opt/pw-browsers/chromium"`, script
  scratchpad'de `import { chromium } from "<apps/web/node_modules/@playwright/test yolu>/index.mjs"`).
  Durdururken **`pkill -f "wrangler dev..."` kullanma**: kalıp, komutu çalıştıran kabuğun
  kendi satırına da uyuyor ve kabuğu öldürüyor (iki kez oldu). Bunun yerine
  `ps -eo pid,comm,args | awk '$2=="node" && /wrangler/'` ile PID bul, sonra
  `pgrep -x workerd` ile kalan workerd'leri kapat.
- Arkada unutulan bir `wrangler dev`/`workerd`, `pnpm build`'deki prerender adımını zaman
  aşımına düşürüyor ("Prerender: Request failed for /"); önce onları kapat.
- Bu tarayıcıda ekran kartı yok; WebGL yazılımla çiziliyor. Tam ekran shader sayfayı kilitler
  (saniyede 4–5 kare). E2E testlerinde `page.emulateMedia({ reducedMotion: "reduce" })` kullan;
  arka planlar o zaman tek kare çizip durur.
- shadcn: `init` CSS'imize gri tema ve Inter ekliyor (geri al); `add` mevcut dosyanın üzerine
  yazmak isterse `yes n | pnpm dlx shadcn@latest add ...` ile reddet; `components.json`
  `iconLibrary: "phosphor"`.
- Biome, WebGL'in `gl.useProgram` çağrısını React hook'u sanıyor; `art/gl.ts`'deki
  `bindProgram` yardımcısında tek satırlık gerekçeli ignore var.
- Script ile çok adımlı JSX düzenlemeleri süslü parantezleri bozabiliyor (bir kez canlıya
  stilsiz buton gitti). Dosyayı bütün olarak yaz ya da satır aralığıyla değiştir; her görünür
  parça için bir stil testi ekle.
- Katalogda olumsuz anlamlı çiçekler var (anemon "terk edilmişlik" vb.) ve `path` alanı
  Latince ile Türkçe çeşit adlarını karıştırıyor ("Rosa › kırmızı"); ekranda Latince için
  `scientificName()` kullan.
