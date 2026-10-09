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
