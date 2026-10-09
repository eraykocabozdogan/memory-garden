# Karar kaydı

Memory Garden'ın Cloudflare üzerinde yeniden yazımı için alınan kararlar. Her karar
konuşulan seçenekleri, seçimi ve gerekçesini içerir. Kararları proje sahibi verir;
bu dosya yalnızca kaydı tutar.

## Ön kararlar

Karar sürecinden önce netleşenler:

- **Platform:** Yalnızca Cloudflare. Vercel, Supabase ve Google Cloud kullanılmayacak.
- **Veritabanı:** D1.
- **Yaklaşım:** Mevcut uygulama taşınmayacak, aynı repoda sıfırdan yazılacak. Eski hali
  git geçmişinde ve bir etiket (tag) olarak korunacak.
- **Korunacaklar:** `research/`, Curtis çiçek görselleri, çiçek kataloğu ve Türkiye konum
  verisi, bu verileri üreten script'ler, `media-worker/` içindeki ffmpeg tarifleri, saf
  mantık dosyaları ve testleri.
- **Hesaplar:** Yeni kayıt yok, Google ile giriş yok. Yalnızca iki tanımlı kullanıcı.
- **Demo:** İK incelemesi için ayrı bir demo ortamı. Kendi D1 veritabanı ve R2 bucket'ı
  olacak, gerçek veriye erişimi olmayacak.
- **Veri taşıma:** Gerek yok; eski sistemde yalnızca test verisi vardı.

## Karar 1: Kapsam

Durum: **Kararlaştırıldı.** Aşağıdaki tüm maddeler ilk sürümde yer alacak.

### Genel (G)

| # | Özellik | Karar |
|---|---|---|
| G1 | Kullanıcı adı + şifreyle giriş, kayıt yok | Kalsın |
| G2 | Açık / koyu / sistem teması | Kalsın |
| G3 | Türkçe arayüz | Kalsın (İngilizce için N8) |
| G4 | Masaüstünde yan menü, mobilde alt menü | Kalsın |
| G5 | `/prototype` sahte veri sayfaları | Çıksın; yerini demo ortamı alıyor |

### Anılar (A)

| # | Özellik | Karar |
|---|---|---|
| A1 | Anı paketi: en fazla 20 öğe (foto/video/not), toplam 5 GB, sıralama, aynı anda 2 yükleme | Kalsın |
| A2 | Tarih hassasiyeti: gün / ay / yıl / tarihsiz | Kalsın |
| A3 | Bir güne birden fazla il/ilçe, rota sırasıyla | Kalsın; ilk sürümde yalnızca Türkiye, dünya geneli sonra |
| A4 | Gün / Ay / Yıl / Harita görünümleri | Kalsın |
| A5 | Medya işleme (WebP, MP4, önizleme, HDR→SDR, yeniden deneme) | Kalsın; **videolar her cihazda sorunsuz oynatılmalı** |
| A6 | Tam ekran medya görüntüleyici | Kalsın |
| A7 | Not/tarih düzenleme, başka güne taşıma, konum düzenleme | Kalsın |
| A8 | Silme (R2 dosyalarıyla birlikte) | Kalsın |
| A9 | Yetki: iki üye de her anıyı düzenleyip silebilir (ortak arşiv) | Kalsın |

### Günlük ve bahçe (D)

| # | Özellik | Karar |
|---|---|---|
| D1 | Günlük partnere 24 saat görünür, yazan her zaman görür | Kalsın |
| D2 | Yazan 24 saat içinde düzenleyip silebilir | Kalsın |
| D3 | Partner, açık günlüğe katalogdan bir çiçek bırakır ve değiştirebilir | Kalsın |
| D4 | Bırakılan çiçekler kalıcı ortak bahçede birikir | Kalsın; sabit başlangıç tarihi kaldırılsın, bahçe ilk günlükten başlasın |
| D5 | Kitap gibi çiçek kataloğu penceresi | Kalsın |

### Herkese açık çiçek rehberi (F)

| # | Karar |
|---|---|
| F1 | **Tam rehber (F1-a):** 61 çiçeğin listesi, her çiçek için ayrı sayfa (Curtis çizimi, anlam, tarihsel anlatı) ve kaynaklar sayfası. Giriş gerektirmez. |

Gerekçe: Araştırma emeğini görünür kılar ve projenin giriş yapmadan incelenebilen vitrini olur.

### Yeni özellikler (N)

| # | Özellik | Karar |
|---|---|---|
| N1 | "Geçen yıl bugün" anı hatırlatması | Evet |
| N2 | Bildirim: partner günlük yazınca, çiçek bırakınca | Evet, **PWA web push** ile (özel gün bildirimi yok, bkz. Karar 5f) |
| N3 | PWA (telefona uygulama gibi kurulum) | Evet; iPhone'da web push için zorunlu |
| N4 | Anılarda filtreleme: etiket, yıl, il, tür (foto/video/not) | Evet; metin araması yok |
| N5 | Etiketler | Evet (ayrıntılar aşağıda) |
| N6 | Özel günler | Evet (ayrıntılar aşağıda) |
| N7 | Rehberde anlama göre arama ("özlem", "teşekkür") | Evet |
| N8 | İngilizce dil desteği: arayüz + çiçek rehberi içerikleri | Evet |
| N9 | Tüm anıları zip olarak dışa aktarma | Hayır |

**N2 gerekçesi:** Ücretsiz, tamamen Cloudflare içinde, ek hesap gerektirmiyor. Telegram,
e-posta, SMS ve WhatsApp değerlendirildi; SMS ve WhatsApp ücretli ve Cloudflare dışı,
e-posta anlık değil, Telegram ek uygulama gerektiriyor. Bilinen sınır: iPhone'da bildirim
için uygulamanın ana ekrana eklenmesi gerekiyor.

**N8 gerekçesi:** Herkese açık rehber İK'ların göreceği vitrin. Kaynak kitaplar zaten
İngilizce; çeviriler AI ile hazırlanıp proje sahibi tarafından kontrol edilecek.

**N5 ve N6 arasındaki ayrım:**

- **Özel gün (N6):** Her yıl tekrar eder. Örnek: ilişkinin başladığı 14 Mart 2023, her yıl
  14 Mart'ta yıldönümüdür. Özel günler için ayrı bir ekran olacak.
- **Etiket (N5):** Tekrar etmez; belirli bir güne ya da birkaç günlük bir aralığa aittir.
  Örnek: 17 Temmuz 2025 Çanakkale tatili. Etiketler, o günlere ait medyaları gruplamak için
  gün öğelerinin içinden oluşturulur.

**Etiket ayrıntıları:**

| # | Soru | Karar |
|---|---|---|
| E1 | Etiket nasıl kapsar? | Tarih aralığı verilir, aralıktaki günler otomatik dahil olur; sonra tek tek gün çıkarılıp eklenebilir |
| E2 | Neyi gruplar? | Bütün günü (o günün tüm öğeleri) |
| E3 | Bir gün birden fazla etikette olabilir mi? | Evet |
| E4 | Yalnızca ay/yıl tarihli anılar etiketlenebilir mi? | Hayır; etiketler günlere bağlı |

**Özel gün ayrıntıları:**

| # | Soru | Karar |
|---|---|---|
| Ö1 | Ekranda neler olacak? | İsim, tarih, kaçıncı yıl olduğu, sıradaki yıldönümüne geri sayım |
| Ö2 | O tarihteki geçmiş anılar gösterilsin mi? | Evet (N1 ile aynı altyapı) |
| Ö3 | Bildirim gitsin mi? | **Hayır** (Karar 5f ile değişti; önce "evet" kararlaştırılmıştı) |

## Karar 2: Frontend yaklaşımı

Durum: **Kararlaştırıldı.**

**Seçim: A. SPA + statik rehber.** React Router v7, sunucu render'ı kapalı (`ssr: false`).
Herkese açık rehber sayfaları (TR + EN) deploy sırasında HTML olarak üretilir (prerender).
Giriş arkasındaki uygulama SPA olarak tarayıcıda çalışır ve verileri API'den alır.

| Seçenek | Sonuç |
|---|---|
| A. SPA + statik rehber | **Seçildi** |
| B. Tam SSR (React Router v7) | Geçerli alternatif. Sayfalar verilerle dolu gelir, ama sunucu/tarayıcı kod ayrımı ve PWA daha karmaşık. |
| C. Next.js + OpenNext | Elendi: adapter katmanı, Next 16 desteğinin bir kısmı deneysel |
| D. Astro (rehber) + React SPA (uygulama) | Elendi: iki ayrı framework; rehber hızında A'ya göre kazancı küçük |

**Gerekçe:** Uygulamanın öncelikleri telefonda uygulama hissi, PWA, bildirim ve çevrimdışı
açılış; bunlar A'da daha kolay ve sağlam. Harita ve büyük dosya yüklemeleri tarayıcıya özgü
parçalar ve SPA'da sunucu/tarayıcı ayrımı sorunu çıkarmıyor. Rehber, statik üretimle hızlı
açılıyor ve Google'da görünür oluyor.

**Bilinen ödünler:** Giriş arkasındaki sayfalarda ilk açılışta kısa bir yükleniyor görünümü
olabilir (PWA önbelleği ve iskelet ekranlarla azaltılacak).

**Geri dönülebilirlik:** A ve B aynı framework'ü kullanıyor; B'ye geçmek bir ayar değişikliği
ve veri yükleme kodunun taşınması demek.

**Sabit kabul edilen:** React. Seçilen UI araçları (shadcn, React Bits, 21st.dev) React
bileşenleri sunuyor.

## Karar 3: Backend / API yapısı

Durum: **Kararlaştırıldı.**

| # | Konu | Seçim | Değerlendirilen diğer seçenekler |
|---|---|---|---|
| 3a | API framework'ü | **Hono** | itty-router, framework'süz Worker |
| 3b | Frontend–backend iletişimi | **Hono RPC** (tip güvenli REST) | Klasik REST + fetch, tRPC |
| 3c | Veri doğrulama | **Zod** | Valibot |
| 3d | Frontend veri yönetimi | **TanStack Query** | React Router'ın kendi veri yükleme sistemi |
| 3e | Worker yapısı | **İki Worker:** `app` (arayüz, API, cron) + `media` (kuyruk + ffmpeg container) | Tek Worker |

**Gerekçeler:**

- **Hono:** Workers için yazılmış, küçük ve yaygın; Better Auth ve Zod ile doğrudan çalışıyor,
  Hono RPC'yi mümkün kılıyor.
- **Hono RPC:** Backend ve frontend arasındaki uyumsuzluklar kod yazarken TypeScript
  tarafından yakalanıyor; ek kütüphane gerektirmiyor.
- **Zod:** Aynı doğrulama kuralları backend'de ve frontend formlarında kullanılabiliyor.
- **TanStack Query:** Önbellek, otomatik tekrar deneme, iyimser güncelleme ve telefonda
  kalıcı önbellek; PWA ve çevrimdışı açılış hedeflerine hizmet ediyor.
- **İki Worker:** Sık değişen uygulama kodu, nadiren değişen ve derlenmesi yavaş olan ffmpeg
  container'ından ayrılıyor; uygulama deploy'ları hızlı kalıyor. İki Worker arasındaki
  bağlantı Cloudflare Queues ile.

## Karar 4: Giriş sistemi

Durum: **Kararlaştırıldı.**

| # | Konu | Seçim | Değerlendirilen diğer seçenekler |
|---|---|---|---|
| 4a | Giriş altyapısı | **Better Auth** (D1 üzerinde) | Kendi yazdığımız sistem, Cloudflare Access |
| 4b | Oturum süresi | **Kayan 90 gün:** her kullanımda yeniden 90 güne uzar | Sabit 30 gün, süresiz |
| 4c | Face ID / parmak izi (passkey) | **Evet**, şifreye ek yöntem olarak | Yalnızca şifre |
| 4d | Demo girişi | **Tek tıkla "Demo olarak gez", tek demo hesabı.** Partner tarafı hazır örnek verilerle doldurulur. | Sayfada yazan demo şifresi; demo'da partner değiştirme |
| 4e | Hesap oluşturma ve şifre sıfırlama | **Komut satırı script'i** + uygulama içinde "şifremi değiştir" ekranı | Partnerin sıfırlaması, e-posta ile sıfırlama |

**Gerekçeler:**

- **Better Auth:** Güvenlik kodu sıfırdan yazılmıyor; şifre saklama, oturum, deneme sınırı ve
  passkey hazır. Kendi giriş ekranı tasarlanabiliyor (Cloudflare Access'te bu mümkün değil).
- **Kayan 90 gün:** PWA'da sık giriş istemek uygulama hissini bozar; kullanılmayan oturum yine
  de kendiliğinden kapanır.
- **Passkey:** Telefonda şifre yazmadan giriş; şifre her zaman yedek olarak kalır.
- **Script ile hesap yönetimi:** E-posta ile sıfırlama akışı iki kişilik uygulamada gereksiz
  bir saldırı yüzeyi.

**Bilinen sınır:** iPhone'da ana ekrana eklenen uygulama Safari'den ayrı çalışır; kurulumdan
sonra uygulamanın içinden bir kez giriş yapmak gerekir.

## Karar 5: Veri modeli

Durum: **Kısmen kararlaştırıldı.** Tablo yapısı ayrıca, tablo tablo ele alınacak.

| # | Konu | Seçim | Değerlendirilen diğer seçenekler |
|---|---|---|---|
| 5a | Veritabanı kütüphanesi | **Drizzle** | Kysely, düz SQL |
| 5b | Etiket aralığına sonradan eklenen günler | **Otomatik dahil** (elle çıkarılmadıysa) | Yalnızca oluşturma anındaki günler |
| 5c | Silinen anılar | **Çöp kutusu:** 30 gün geri alınabilir, sonra R2 dosyalarıyla birlikte kalıcı silinir | Onaylı kalıcı silme |
| 5d | "Kim ekledi" bilgisi | **Gösterilsin**, küçük ve sade | Gösterilmesin |
| 5e | Bildirim tercihleri | **Ayarlarda aç/kapa**, her üye kendisi için: günlük, çiçek | Hepsi her zaman açık |
| 5f | Özel gün bildirimi | **Olmayacak** | Sabah 09:00 bildirimi |
| 5g | 29 Şubat'taki özel gün, artık yıl olmayan yıllarda | **28 Şubat'ta** gösterilir | 1 Mart |

**Gerekçeler:**

- **Drizzle:** Şema TypeScript'te, migration'lar otomatik; Better Auth ve Zod ile doğrudan
  çalışıyor. D1 interaktif transaction desteklemediği için çok adımlı yazmalar `batch()` ile
  yapılacak.
- **Etiketler otomatik kapsar:** Etiket bir tarih aralığı olarak düşünülüyor; istisnalar ayrı
  tutuluyor.
- **Çöp kutusu:** Anılar geri getirilemeyecek türden veri ve iki üye de silebiliyor.

### Tablolar

Durum: **Kararlaştırıldı.** Karar 5 tamamlandı.

| Tablo | İçerik |
|---|---|
| Kullanıcı, oturum, hesap, passkey | Better Auth tabloları. Kullanıcıda görünen ad, giriş adı, dil tercihi (TR/EN) ve bildirim ayarları (günlük, çiçek). E-posta alanı teknik zorunluluk; iç adres yazılır, gönderim yapılmaz. Tema cihazda tutulur. |
| Anı günleri | Tarih (tekil), oluşturan. Aktif anısı kalmayan gün görünmez; çöp kutusu boşalınca silinir. |
| Gün konumları | Gün, il, ilçe, koordinat, rota sırası. İsim ve koordinat satıra kopyalanır (ileride dünya geneline geçişte şema değişmez). |
| Anı öğeleri | Tür, tarih hassasiyeti, gün ya da yıl/ay, not metni, **foto/video açıklaması**, sıra, ekleyen, silinme zamanı ve silen (çöp kutusu). |
| Medya | İşleme durumu, R2 dosya yolları, orijinal ad, tür, boyutlar, en/boy, süre, deneme sayısı, hata kodu. |
| Etiketler | İsim, başlangıç ve bitiş tarihi, oluşturan. |
| Etiket istisnaları | Etiket, tarih, tür (aralıktan çıkar / aralık dışından ekle). Gün kaydına değil tarihe bağlı. |
| Özel günler | İsim, ay-gün, başlangıç yılı, oluşturan. Kaçıncı yıl ve geri sayım hesaplanır. |
| Günlükler | Yazan, metin (en fazla 2.000 karakter), yayın zamanı, kapanış zamanı (+24 saat), güncelleme zamanı. |
| Çiçekler | Günlük, bırakan, çiçek kimliği, zaman. Günlük başına en fazla bir çiçek. |
| Bildirim abonelikleri | Üye, telefonun bildirim adresi ve anahtarları, cihaz adı, son kullanım. |

| # | Ürün sorusu | Karar |
|---|---|---|
| T1 | Profil fotoğrafı | **Hayır**, baş harf |
| T2 | Foto/videoya açıklama | **Evet**, isteğe bağlı, kısa (~280 karakter) |
| T3 | Fotoğraf içindeki bilgilerin kullanımı | **Çekim tarihi önerilsin** (tarayıcıda okunur, değiştirilebilir). Konum önerilmez. İşlenmiş dosyalardan bu bilgiler silinir. |
| T4 | Etiket görünümü | **Sadece isim** |
| T5 | Özel güne emoji | **Hayır** |
| T6 | Günlük uzunluk sınırı | **2.000 karakter** |
| T7 | Çiçekle birlikte not | **Hayır**; çiçeğin anlamı mesajın kendisi |
| T8 | Günlük silinirse bırakılmış çiçek | **Bahçede kalır**, günlük metni silinir |

**Teknik tercihler:**

- Çiçek kataloğu (TR + EN) ve Türkiye il/ilçe listesi veritabanında değil kodda durur.
- Zamanlar UTC saklanır; gün hesapları ve gösterim İstanbul saatine göredir.
- Demo ortamı aynı şemayı ayrı bir D1 veritabanında kullanır.
- Kimlikler rastgele UUID'dir.

## Karar 6: Medya

Durum: **Kararlaştırıldı.**

| # | Konu | Seçim | Değerlendirilen diğer seçenekler |
|---|---|---|---|
| 6a | Fotoğraf işleme | **Cloudflare Images** (Worker dönüştürür, sonucu R2'ye kaydeder) | ffmpeg container, telefonda küçültme |
| 6b | Video işleme | **Container + ffmpeg** (eski projedeki tarif) | Cloudflare Stream |
| 6c | Orijinal dosyalar | **İşlem başarıyla bitince silinir** | Saklanması ve "orijinali indir" |
| 6d | Görüntüleme kalitesi | Video en fazla 1080p H.264 MP4; fotoğraf uzun kenar en fazla 2560 px WebP; önizleme uzun kenar 720 px WebP | — |

**Gerekçeler:**

- **Cloudflare Images:** HEIC destekliyor, container gerektirmiyor; ayda 5.000 ücretsiz dönüşüm
  iki kişinin kullanımını karşılıyor.
- **Container:** Cloudflare Stream, Workers Paid planına dahil değil; 1.000 dakikalık bloklar
  halinde ayrıca ücretlendiriliyor (blok başına ayda $5). Proje sahibinin kuralı: Stream
  plana dahilse Stream, ayrı bir abonelikse container.
- **Orijinallerin silinmesi:** Depolama maliyetini düşürür.

**Sonuçları:** "Orijinali indir" özelliği yok. İndirme, işlenmiş versiyonu verir. HDR ve
1080p/2560 px üstü çözünürlük kalıcı olarak kaybolur. İşleme başarısız olursa orijinal,
yeniden deneme için yerinde kalır.

**Önizlemeler:** Ayrı, küçük dosyalar olarak işleme sırasında bir kere üretilir ve R2'de
saklanır. Videoların önizlemesi bir kare görseldir (video değil).

## Karar 7: Demo ortamı

Durum: **Kararlaştırıldı.**

| # | Konu | Karar |
|---|---|---|
| 7a | Demo'da açık olanlar | Gezinme, görünümler, harita, filtreler, rehber, not ekleme, anı düzenleme, silme/çöp kutusu, etiket ve özel gün oluşturma, günlük yazma/düzenleme/silme, çiçek bırakma, dil ve tema. **Kapalı:** foto/video yükleme ("demoda kapalı" uyarısı), bildirimler, şifre değiştirme, passkey. Partnerin açık günlükleri her yeni kopyada güncel tarihlerle oluşturulur. |
| 7b | Sıfırlama | **Her ziyaretçiye ayrı kopya.** "Demo olarak gez"e her basışta sıfırdan, temiz bir demo açılır; ziyaretçiler birbirinin değişikliklerini görmez. |
| 7c | Örnek içerik | Kurgusal bir çift; Unsplash/Pexels görselleri (Türkiye'den yerler); iki yıla yayılmış ~40 anı, 2–3 kısa video, etiketler, özel günler, günlükler, ~30 çiçeklik bahçe |
| 7c-1 | İçerik dili | **Türkçe** |
| 7d | Tanıtım | Üst bilgi şeridi ("Bu bir demo" + GitHub) ve "Bu proje hakkında" sayfası (teknolojiler, mimari, önemli kararlar) |
| 7e | Erişim | Ana sitenin giriş ekranında "Demo olarak gez" bağlantısı + CV'deki doğrudan link. Demo sayfaları Google'a kapalı. |

**7b uygulama yöntemi (onaylandı):** Her demo kopyası ayrı bir Durable Object içinde kendi
SQLite veritabanıyla çalışır. Aynı şema ve aynı API kodu kullanılır; yalnızca veritabanı
bağlantısı değişir. Kopya, son kullanımdan 24 saat sonra kendini siler. Demo görselleri tüm
kopyalar arasında paylaşılan, salt okunur dosyalardır; demo'da silme işlemi R2'deki dosyalara
dokunmaz. Kötüye kullanıma karşı IP başına yeni kopya oluşturma sınırı uygulanır.
Değerlendirilen alternatifler: ziyaretçi başına ayrı D1 veritabanı (oluşturması yavaş, Worker'a
dinamik bağlanamıyor); tek demo veritabanında tüm tablolara "ziyaretçi" sütunu (gerçek
uygulamanın şemasını ve tüm sorgularını demo için karmaşıklaştırır).

## Karar 8: UI

Durum: **Bekliyor.** Proje sahibi tweakcn, shadcn blokları, React Bits ve (isteğe bağlı)
21st.dev üzerinden seçimlerini hazırlıyor. Seçimler kodlamanın tasarım sistemi aşamasında
kurulacak; backend aşamaları bunu beklemeden ilerleyebilir.

## Karar 9: Altyapı ve süreç

Durum: **Kararlaştırıldı.**

| # | Konu | Seçim | Değerlendirilen diğer seçenekler |
|---|---|---|---|
| 9a-1 | Uygulamanın adı | **Memory Garden** | İkimize |
| 9a-2 | Alan adı | **Ücretsiz workers.dev:** `memory-garden.erayai.workers.dev`, demo `memory-garden-demo.erayai.workers.dev` | Cloudflare Registrar'dan .com/.app, .com.tr |
| 9b | Deploy | **GitHub Actions:** testler geçmeden deploy yok; `main`'e merge sonrası önce demo, sonra gerçek uygulama | Workers Builds, elle deploy |
| 9c | Ortamlar | **Yerel + demo + gerçek**; ayrı staging yok | Ayrı staging ortamı |
| 9d | Testler | **Birim (Vitest) + API (Vitest, Workers test ortamı) + uçtan uca (Playwright, 5–6 kritik akış, mobil + masaüstü) + performans (Lighthouse CI, rehber sayfaları)** | Yalnızca birim + API, yalnızca birim |
| 9e | Yedekleme | **D1 Time Travel (30 gün) + haftalık tam veritabanı yedeği R2'ye, 12 hafta saklanır** | Yalnızca Time Travel |
| 9f | Hata takibi | **Cloudflare Workers Logs**; tarayıcı hataları kendi API'miz üzerinden aynı yere | Sentry |
| 9g | Kod araçları | **Tek repo, üç paket** (`web`, `media`, `shared`), **pnpm**, **Biome** | Tek paket; npm/bun; ESLint + Prettier |

**Notlar:**

- workers.dev'de alt alan adı iç içe olamadığı için demo, `demo.` alt adresi yerine ayrı bir
  Worker adıyla yayınlanır. workers.dev Public Suffix List'te olduğu için gerçek uygulama ve
  demo birbirinin çerezlerine erişemez.
- İleride özel bir alan adı alınırsa kod değişmeden Worker'lara bağlanabilir.

## Mimari dokümanı sonrası düzeltmeler

Durum: **Kararlaştırıldı.** Mimari dokümanı (`docs/architecture.md`) bu düzeltmelerle onaylandı.

| Konu | İlk öneri | Karar |
|---|---|---|
| Takılan video işinin tespiti | 6 saat sabit süre | **Nabız:** container her dakika ilerleme bildirir; 10 dakika haber gelmezse iş başarısız sayılır. Fotoğraf işleri 15 dakika. Yan fayda: arayüzde ilerleme yüzdesi. |
| Kaydedilmemiş yüklemelerin temizliği | 2 gün, gecelik | **6 saat, saatlik temizlik.** Vazgeçilen yüklemeler zaten anında silinir; 6 saat yalnızca uygulamanın kapandığı ya da çöktüğü durumlar için. Yükleme token'ları da 6 saat geçerli. |
| Workers Paid planı | — | Proje sahibi Paid plana geçti. Gerekçe: Container'lar yalnızca Paid planda; Free plandaki 10 ms işlemci sınırı şifre kontrolünü bile zorluyor; Paid plan hesap başına olduğu için ileride eklenecek projeler de aynı $5 içinde. |
| Eski sürüm etiketi | — | Son Next.js commit'i (`1357af6`) `v0-nextjs` olarak etiketlenecek. |

## Aşama 0 sırasında yapılan teknik değişiklikler

Ürünü etkilemeyen, uygulama sırasında ortaya çıkan değişiklikler.

| Konu | Plan | Uygulama | Neden |
|---|---|---|---|
| React Router sürümü | v7 | **v8** | v8 güncel ana sürüm. `ssr: false` + `prerender` aynen destekleniyor; v7'ye göre kırıcı değişiklikler küçük. |
| Worker'ın paketlenmesi | Cloudflare Vite eklentisi | **Wrangler** paketliyor; React Router yalnızca statik dosyaları üretiyor | Cloudflare Vite eklentisi, React Router'ın build sırasındaki prerender adımıyla birlikte çalışmıyor (build hatası). Production çıktısı aynı; geliştirmede iki süreç çalışıyor (Vite + `wrangler dev`). |
| Test aracı sürümü | — | **Vitest 4** | Cloudflare'in Workers test ortamı Vitest 4 istiyor. |
| TypeScript | — | **TypeScript 7** | Güncel sürüm; kullanılan araçların hepsi destekliyor. |
| İmzalı token'lar | Upload ve job token için iki ayrı kopya | **Tek ortak modül** (`packages/shared/src/tokens`), WebCrypto ile | Aynı kod hem Worker'larda hem testlerde çalışıyor; iki kopya bakımı yok. |
| Bahçe başlangıcı (D4) | — | `buildGardenDays` artık başlangıç gününü parametre olarak alıyor | Sabit 30 Ağustos 2026 tarihi kaldırıldı; bahçe ilk günlükten başlıyor. |

## Çiçek görselleri (Aşama 3'e hazırlık)

Durum: **Kararlaştırıldı.** Doğrulama raporu:
`research/flowers/catalog-verification-2026-10.md`.

| # | Konu | Karar |
|---|---|---|
| — | Genel türün çizimini paylaşan kayıtlar | **Her kayda özel görsel bulunacak** |
| G1 | Kaynak önceliği | **Önce Curtis** (Botanical Magazine ve Flora Londinensis); yoksa aynı dönemin el boyaması baskıları (Edwards's Botanical Register, Redouté, Sowerby vb.) |
| G2 | Büyük sayfalı plakalar | **Kırpılacak**: bitki ortalanır, boş kâğıt ve parça çizimleri atılır |
| G3 | Tomurcuk kayıtları | **Gül plakalarındaki tomurcuk detayından kırpılacak** |
| G4 | Yanlış türü gösteren görseller | **Düzeltilecek** (papatya/katmerli papatya yer değiştirir, haşhaş, menekşe, gül vb.) |
| G5 | Görseli olmayan 6 kayıt | **Aynı kurallarla görsel aranacak** |

Doğrulamadan sonra (proje sahibi "önerilerini onaylıyorum"):

| # | Konu | Karar |
|---|---|---|
| M1–M5 | Eksik anlamlar (lavanta "gayret", ayçiçeği "sahte zenginlik / kibir / hayranlık", sarı nergis "karşılıksız aşk", aynısefa "keder", beyaz leylak "masumiyet") | **Eklenecek** |
| M6–M7 | İsteğe bağlı anlamlar (beyaz gül "sana layığım", manolya "doğa sevgisi") | **Eklenecek** (öneriye uyuldu) |
| — | Kaydın gösterdiği bitkiyle uyuşmayan görseller (raporda liste) | **Değiştirilecek** (G4) |
| T1–T4 | Aynı cins, farklı tür: yüksükotu, kına çiçeği, büyük çiçekli manolya, ayçiçeği | **Değiştirilecek** |
| T5–T6 | Sarı nergis (*N. minor*), tek katlı gül (*R. ecae*) | **Kalacak** (fark küçük) |

## Çiçek kataloğunun yöntemi ve doğrulaması

Durum: **Kararlaştırıldı.**

Konu: Kaynak araştırması (`research/flowers/stage-1/`) belgeli ve doğrulamadan geçti; ama
uygulamaya giren 61 kaydın nasıl seçildiği, Türkçe metinlerin nasıl yazıldığı ve görsellerin
nasıl eşlendiği hiçbir yerde yazılı değildi. Bu kısım GPT ile üretilmişti ve hatalar orada
çıktı.

| # | Soru | Seçenekler | Seçim | Gerekçe |
|---|---|---|---|---|
| Y1 | Katalog için yöntem belgesi | a) yazılsın · b) mevcut raporlar yeter | **a** | Yeni çiçekler aynı kuralla eklenir; "veri nasıl seçildi" sorusunun yazılı cevabı olur. |
| Y2 | Uzun anlatı metinlerinin doğrulanması | a) 61 kaydın hepsi · b) 10–15 kayıtlık örneklem · c) yok | **a** | En riskli kısım bu metinler; 61 kayıt yapılabilir boyutta. Kaynakta olmayan cümle düzeltilir ya da çıkarılır. |
| Y3 | Sıralama | Onaylı düzeltmeler + Y1 + Y2 tek iş olarak Aşama 3'ten önce | **Evet** | Aşama 3 doğrulanmış veriyle başlar. |

Baştan araştırma yapılmadı: kaynak atıflarının hepsi kitapların tam metinlerinde bulundu.

Bekleyen kararlar:

| # | Konu | Durum |
|---|---|---|
| Y4 | Kaynakta simge anlamı olarak verilmeyen, anlatıdan çıkan anlamlar (21 kayıt; liste doğrulama raporunda) anlam alanında kalsın mı? | **Proje sahibinin kararını bekliyor** |
| Y5 | Görseli bulunamayan iki kayıt: beyaz leylak, kurumuş gül | **Proje sahibinin kararını bekliyor** |

Uygulama sırasındaki teknik değişiklik: görseller artık birden fazla kaynaktan geldiği için
`curtis-artwork.json` → `flower-artwork.json`, `public/flowers/curtis/` → `public/flowers/art/`;
görsel üretme script'i kırpma oranlarını uyguluyor.
