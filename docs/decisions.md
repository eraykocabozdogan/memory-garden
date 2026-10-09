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
| N2 | Bildirim: partner günlük yazınca, çiçek bırakınca, özel gün gelince | Evet, **PWA web push** ile |
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
| Ö3 | Bildirim gitsin mi? | Evet, gün geldiğinde (N2 ile) |
