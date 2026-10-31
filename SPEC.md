# Memory Garden — SPEC

> Ne istiyorum. Kodda şu an ne olduğu `SYSTEM.md`'de. Karar değişirse önce burası, sonra kod.
> Son güncelleme: 2026-10-31
>
> ⏳ **Gözden geçirme bekliyor.** 2026-10-31'de `docs/decisions.md` ve `docs/architecture.md`'den ortak
> şablona taşındı; kullanıcı baştan kontrol edecek. Bu not kalkmadan yeni aşamaya başlanmaz.

## 1. Ürün

İki parçalı bir uygulama:

- **Özel anı ve günlük uygulaması** (giriş gerekir): iki kişi; ortak anı arşivi (foto, video, not),
  24 saat açık kalan günlükler ve bunlara bırakılan çiçeklerden büyüyen ortak bir bahçe.
- **Herkese açık çiçek dili rehberi** (giriş gerekmez): 61 çiçek; tarihsel kaynaklar (Ingram 1869,
  Phillips 1825, Tyas 1869) ve Curtis's Botanical Magazine çizimleri. Araştırma emeğini görünür kılar,
  projenin giriş yapmadan incelenebilen vitrinidir.

**Kimler için:**

| Kim | Ne yapar |
|---|---|
| İki üye | Uygulamanın tamamı. İkisi de her anıyı düzenleyip silebilir (ortak arşiv). Biri Android, biri iPhone kullanıyor. |
| Ziyaretçi | Rehberi gezer. |
| İK / mülakatçı | Demo ortamında uygulamayı örnek veriyle dener; gerçek veriye erişemez. |

- Uygulama Türkçe ve İngilizce (arayüz + rehber içeriği). Varsayılan Türkçe. Kullanıcı içeriği çevrilmez.
- Saat dilimi Europe/Istanbul: gün hesapları ve gösterim İstanbul'a göre.
- Telefona PWA olarak kurulur (iPhone'da bildirim için ana ekrana ekleme şart).
- Öncelikler: uzun vadede düşük maliyet, yalnızca Cloudflare, CV'de gösterilebilir olması.

## 2. Ekranlar ve akışlar

### Herkese açık (statik HTML, Google'da görünür)

| Ekran | Türkçe / İngilizce | Ne var |
|---|---|---|
| Rehber ana sayfası | `/` · `/en` | Çiçek listesi, anlama göre arama, giriş ve demo bağlantıları |
| Çiçek sayfası | `/cicekler/:slug` · `/en/flowers/:slug` | Çizim, anlam, çağrışımlar, tarihsel anlatı, kaynak |
| Kaynaklar | `/kaynaklar` · `/en/sources` | Üç kaynak kitap ve görsel karşılaştırma çalışması |
| Hakkında | `/hakkinda` · `/en/about` | Teknolojiler, mimari, önemli kararlar (yalnızca demo'dan bağlantılı) |

### Uygulama (giriş gerekir)

| Ekran | Ne var |
|---|---|
| Giriş | Kullanıcı adı + şifre ya da passkey; demo'da "Demo olarak gez" |
| Anılar | Gün / Ay / Yıl görünümleri, filtreler, "geçen yıl bugün" |
| Gün ayrıntısı | O günün öğeleri ve konum rotası |
| Harita | Anıların konumları |
| Günlükler | Yazma, açık günlükler, çiçek bırakma |
| Bahçe | Bırakılan çiçeklerin biriktiği ortak bahçe |
| Etiketler | Liste ve etiket ayrıntısı |
| Özel günler | Kaçıncı yıl, geri sayım, o tarihteki geçmiş anılar |
| Çöp kutusu | Silinen anılar, geri alma, kalıcı silme |
| Ayarlar | Dil, bildirimler, passkey, şifre değiştirme, iPhone için "Ana Ekrana Ekle" yönergesi |

Masaüstünde yan menü, telefonda alt menü. Açık / koyu / sistem teması.

### Akışlar

- **Giriş:** kullanıcı adı + şifre ya da passkey → oturum kayan 90 gün.
- **Anı ekleme:** dosyaları seç → çekim tarihi önerilir (değiştirilebilir) → gün, konumlar, not → kaydet →
  medya arka planda işlenir, ilerleme yüzdesiyle görünür ("İşleniyor %40").
- **Günlük:** yaz → partnere 24 saat açık → partner bir çiçek bırakır → çiçek bahçeye eklenir.
- **Silme:** anı çöp kutusuna gider → 30 gün içinde geri alınabilir → sonra kalıcı silinir.
- **Demo:** "Demo olarak gez" → ziyaretçiye özel, temiz bir kopya açılır.

## 3. İş kuralları

### 3.1 Hesaplar ve giriş
- Yalnızca iki tanımlı hesap. Kayıt yok, Google ile giriş yok, e-posta gönderimi yok.
- Giriş kullanıcı adı + şifreyle; passkey (Face ID, parmak izi) ek yöntem, şifre her zaman yedek.
- Oturum kayan 90 gün: her kullanımda yeniden 90 güne uzar.
- Giriş denemeleri IP başına sınırlı.
- Hesap oluşturma ve şifre sıfırlama komut satırı betiğiyle; uygulamada yalnızca "şifremi değiştir".
- Profil fotoğrafı yok, baş harf gösterilir.

### 3.2 Anılar
- **Anı paketi:** en fazla 20 öğe (foto, video, not), toplam en fazla 5 GB, sıralanabilir; aynı anda 2 yükleme.
- **Tarih hassasiyeti:** gün, ay, yıl ya da tarihsiz.
- **Konum:** bir güne birden fazla il/ilçe, rota sırasıyla. İlk sürümde yalnızca Türkiye. Rota yalnızca tam günü olan anılarda.
- Foto/videoya isteğe bağlı kısa açıklama (en fazla 280 karakter).
- Fotoğrafın çekim tarihi tarih alanına önerilir. Konum önerilmez.
- Not, tarih, konum düzenlenebilir; öğe başka güne taşınabilir.
- "Kim ekledi" küçük ve sade gösterilir.
- **Filtreler:** etiket, yıl, il, tür (foto/video/not). Metin araması yok.
- **"Geçen yıl bugün":** geçmiş yıllarda aynı güne ait anılar hatırlatılır.
- **Silme:** çöp kutusu; 30 gün geri alınabilir, sonra dosyalarıyla birlikte kalıcı silinir. Aktif anısı kalmayan gün görünmez.

### 3.3 Medya
- Videolar her cihazda sorunsuz oynatılmalı.
- **Fotoğraf:** uzun kenar en fazla 2560 px WebP. **Video:** en fazla 1080p H.264 MP4, HDR normal renk aralığına çevrilir. **Önizleme:** uzun kenar 720 px WebP; videonun önizlemesi tek kare görsel.
- İşlenmiş dosyalardan konum ve diğer fotoğraf bilgileri (EXIF) silinir.
- Orijinal dosya, işlem başarıyla bitince silinir; "orijinali indir" yok, indirme işlenmiş versiyonu verir. HDR ve üst çözünürlük kalıcı olarak kaybolur.
- İşlem başarısız olursa orijinal yerinde kalır, yeniden denenebilir.
- Takılan iş: video 10 dakika ilerleme bildirmezse, fotoğraf 15 dakikada bitmezse başarısız sayılır.
- Vazgeçilen yükleme hemen silinir; uygulama kapanır ya da çökerse kaydedilmemiş yükleme 6 saat sonra silinir.

### 3.4 Etiketler
- Etiket tekrar etmez; belirli bir güne ya da gün aralığına aittir (ör. "Çanakkale tatili"). Yalnızca isim.
- Tarih aralığı verilir, aralıktaki günler otomatik dahil olur; sonradan aralığa eklenen günler de (elle çıkarılmadıysa). Tek tek gün çıkarılıp eklenebilir.
- Etiket bütün günü (tüm öğeleriyle) kapsar. Bir gün birden fazla etikette olabilir.
- Yalnızca ay/yıl tarihli anılar etiketlenemez.

### 3.5 Özel günler
- Her yıl tekrar eder (ör. ilişkinin başladığı 14 Mart 2023). İsim, tarih; emoji yok.
- Ekranda kaçıncı yıl olduğu, sıradaki yıldönümüne geri sayım ve o tarihteki geçmiş anılar.
- 29 Şubat, artık olmayan yıllarda 28 Şubat'ta gösterilir.
- Özel gün bildirimi yok.

### 3.6 Günlük ve bahçe
- Günlük en fazla 2.000 karakter. Partnere 24 saat görünür; yazan her zaman görür.
- Yazan 24 saat içinde düzenleyip silebilir.
- Partner açık günlüğe katalogdan bir çiçek bırakır ve değiştirebilir. Günlük başına bir çiçek; yazan kendi günlüğüne bırakamaz. Çiçekle not yok: çiçeğin anlamı mesajın kendisi.
- Bırakılan çiçekler kalıcı ortak bahçede birikir. Bahçe ilk günlükten başlar.
- Günlük silinirse metni silinir, bırakılmış çiçek bahçede kalır.
- Çiçek kataloğu kitap gibi bir pencerede açılır.

### 3.7 Bildirimler
- Web push (PWA). Tetikleyiciler: partner günlük yazınca, partner çiçek bırakınca.
- Her üye ayarlarda kendisi için açıp kapatır (günlük, çiçek).
- Geçersizleşen cihaz abonelikleri otomatik silinir.

### 3.8 Çiçek rehberi ve katalog
- 61 kayıt, Türkçe ve İngilizce. Her kaydın kendi görseli var.
- Anlam (kaynakta simge olarak geçen) ile çağrışımlar (anlatıdan çıkan) ayrı satırlarda; çağrışım boş olabilir.
- Kaynağında görseli bulunamayan kayıtlarda (beyaz leylak, kurumuş gül) yakın bir görsel "temsilî" notuyla gösterilir.
- Görsel kaynağı Commons sayfasına bağlanır. Latince ad ekranda `scientificName()` ile yazılır.
- Anlama göre arama ("özlem", "teşekkür") anlamlar ve çağrışımlar üzerinde.
- **Görsel seçim kuralları:** önce Curtis (Botanical Magazine, Flora Londinensis), yoksa aynı dönemin el boyaması baskıları; büyük plakalar bitki ortalanarak kırpılır; tomurcuk kayıtları gül plakalarının tomurcuk detayından.
- Yeni çiçek, `research/flowers/catalog-methodology.md`'deki yöntemle eklenir; kaynakta olmayan cümle girmez.
- İngilizce çeviriler AI ile hazırlanır, kullanıcı kontrol eder.

### 3.9 Demo
- Ayrı ortam, ayrı adres; gerçek veriye teknik olarak erişemez. Sayfaları Google'a kapalı.
- "Demo olarak gez" her basışta ziyaretçiye özel, temiz bir kopya açar; ziyaretçiler birbirini görmez. Kopya son kullanımdan 24 saat sonra silinir. IP başına yeni kopya sınırı.
- **Açık:** gezinme, görünümler, harita, filtreler, rehber, not ekleme, anı düzenleme, silme/çöp kutusu, etiket ve özel gün, günlük, çiçek bırakma, dil ve tema.
- **Kapalı:** foto/video yükleme ("demoda kapalı" uyarısı), bildirimler, şifre değiştirme, passkey.
- **İçerik:** kurgusal bir çift, Türkçe; Türkiye'den yerlerin Unsplash/Pexels görselleri; iki yıla yayılmış ~40 anı, 2–3 kısa video, etiketler, özel günler, günlükler, ~30 çiçeklik bahçe. Partnerin açık günlükleri her kopyada güncel tarihlerle oluşur.
- **Tanıtım:** üstte "Bu bir demo" + GitHub şeridi ve "Bu proje hakkında" sayfası. Ana sitenin girişinde "Demo olarak gez" bağlantısı ve CV'deki doğrudan link.

### 3.10 İşletme
- Yedek: D1 Time Travel (30 gün) + haftalık tam yedek R2'ye, 12 hafta saklanır.
- Testler geçmeden deploy yok; `main`'den önce demo, sonra gerçek ortam.
- Hata takibi Cloudflare Workers Logs'ta; tarayıcı hataları da aynı yere.

## 4. Garantiler

Kodun verdiği sözler. Her birinin testi `SYSTEM.md`'deki tabloda.

| # | Garanti |
|---|---|
| G1 | Giriş yapmamış biri hiçbir anıya, günlüğe, medyaya ya da ayara erişemez |
| G2 | Hesap yalnızca betikle açılır; uygulamada kayıt yolu yok |
| G3 | Art arda hatalı giriş IP başına sınıra takılır |
| G4 | Demo, gerçek veritabanına ve gerçek dosyalara hiçbir yoldan erişemez |
| G5 | Demo kopyaları birbirini göremez; kopya 24 saat kullanılmazsa silinir |
| G6 | Günlük yayından tam 24 saat sonra partnere kapanır; yazan her zaman görür ama 24 saat sonra düzenleyemez |
| G7 | Çiçeği yalnızca partner, yalnızca günlük açıkken bırakır; günlük başına bir çiçek |
| G8 | Silinen günlüğün metni kalmaz, çiçeği bahçede kalır |
| G9 | Bahçe ilk günlüğün gününden başlar; günler İstanbul takvimine göre |
| G10 | Silinen anı 30 gün geri alınabilir; sonra satırları ve dosyaları kalıcı silinir |
| G11 | Medya dosyasına yalnızca giriş yapmış üye, kısa ömürlü bağlantıyla ulaşır |
| G12 | Yükleme token'ı imzasız, süresi dolmuş, başkasına ait ya da kurcalanmışsa reddedilir |
| G13 | İşlenmiş dosyada konum ve EXIF bilgisi kalmaz |
| G14 | Orijinal yalnızca işlem başarıyla bitince silinir; başarısızlıkta yerinde kalır |
| G15 | Takılan medya işi (video 10 dk sessiz, foto 15 dk) başarısız sayılır, yeniden denenebilir |
| G16 | Kaydedilmemiş yükleme 6 saat sonra silinir |
| G17 | Etiket, aralığa sonradan eklenen günleri de kapsar; elle çıkarılan gün kapsamaz |
| G18 | 29 Şubat'taki özel gün artık olmayan yıllarda 28 Şubat'ta görünür |
| G19 | Anı tarihi yalnızca desteklenen hassasiyetlerde ve geçerli tarihle kaydedilir |
| G20 | Konum yalnızca katalogdaki il/ilçeyle ve doğru eşleşmeyle kaydedilir; rota sırası korunur |
| G21 | Bildirim yalnızca ayarı açık üyeye gider |
| G22 | Katalogdaki her kaydın kendi görseli var; iki kayıt aynı görsel bölgesini paylaşmaz; temsilî görsel yalnızca iki kayıtta |
| G23 | Anlam ve çağrışım ayrı tutulur; ikisi de doğru kayda bağlı kalır |
| G24 | Herkese açık olmayan sayfalar `noindex` |

## 5. Kapsam dışı

- Yeni kayıt, Google ile giriş, e-posta ile şifre sıfırlama.
- `/prototype` sahte veri sayfaları (yerini demo aldı).
- Tüm anıları zip olarak dışa aktarma.
- Anılarda metin araması.
- Türkiye dışı konumlar (ilk sürüm; dünya geneli sonra, şema buna hazır).
- Özel gün bildirimi.
- "Orijinali indir".
- Ayrı staging ortamı.
- Kendi alan adı (şimdilik; ileride kod değişmeden bağlanabilir).
- Eski verinin taşınması (eski sistemde yalnızca test verisi vardı).

## 6. Tasarım seçimleri

Seçimler canlı önizleme sayfalarında (`/ui*`) yan yana görülerek sırayla yapıldı. 11/11 bitti.

| # | Adım | Seçim | Neden |
|---|---|---|---|
| 1 | His | **intimate · paper-like · gentle** | İki kişilik anı defteri; çiçekler vurgu, merkez değil |
| 2 | Renkler | **Parchment** (krem kâğıt, orman yeşili mürekkep); koyu: "gece kâğıdı" (sıcak koyu kahve, krem yazı) | Curtis çizimleriyle en uyumlu. Reddedilen Rosewood'da kaydet ve sil ikisi de kırmızıydı |
| 3 | Yazı tipleri | **Lora** (başlık) + **Source Sans 3** (gövde) + **Caveat** (el yazısı) | En sakin ve okunaklı. ⚠️ *Onay bekliyor:* Caveat yalnızca küçük vurgularda (tarih, kısa not, tek satır alıntı), gövdede asla |
| 4 | Şekil ve derinlik | **Paper**: 8 px köşe, hafif sıcak gölge, ferah boşluk. Kâğıt dokusu şimdilik açık, sonda tekrar bakılacak | Dengeli; Soft telefonda fazla yer kaplıyordu |
| 5 | Temel bileşenler | **shadcn/ui**, motor **Base UI**, stil **Vega**; tema geçişi **next-themes** | Token'larla doğrudan uyumlu; Vega, Paper şekliyle örtüşüyor |
| 6a | Uygulama iskeleti | **İçe gömülü yan menü** (sidebar-08), ikonlara daralır; telefonda alt menü | İçerik menünün üstünde kâğıt gibi duruyor |
| 6b | Giriş ekranı | **Herbaryum yaprağı:** solda bantla tutturulmuş günün çiçeği ve el yazısı not, sağda müze etiketi ve içinde alt çizgili form, köşede mürekkep damgası (telefonda gizli). Günün çiçeği yalnızca sıcak anlamlı 10 çiçekten | Şablon hissi vermiyor; Curtis, kâğıt ve arşiv havası tek ekranda |
| 6c | Herbaryum yaprağının iç boşluğu | **Değişiklik yok**, olduğu gibi kalıyor | Ölçüler görüldü, "böyle kalsın"; boşluk 6b'de kilitlenen düzenin parçası |
| 7 | İkonlar | **Phosphor**: varsayılan hafif, yan ve alt menüde normal | Hafif çizgi kâğıt havasına en yakın; küçük gezinme ikonları silik kalmasın |
| 8 | Arka plan (giriş) | **Yoğun buket:** kâğıttan kesilmiş Curtis çiçekleri (63 çiçek, %93 kaplama) dalgalanan ipeğe basılmış gibi; kendi WebGL2 shader'ımız | Sarı kâğıt zemini yok, çiçek çok. Seyrek buket ve tek büyük çiçek de denendi |
| 9 | Yazı animasyonu | **Üçlü:** başlık ve metinlerde yumuşak beliriş (kelimeler sırayla, 380 ms); el yazısı notlarda yazılma (soldan sağa süpürme); öne çıkan sayılarda sayaç. Paket yok. "Hareketi azalt" açıkken hepsi kapanır | "Gentle" hissine en yakın. Harf harf, bulanıktan netleşme, daktilo, parlama, dönen kelime ve kalemle çizme reddedildi |
| 10 | Geçişler | **Tarayıcının kendi View Transitions'ı** (React `<ViewTransition>`): sayfa geçişleri ve anı kartından ayrıntıya geçiş. Animasyon kütüphanesi yok | Sıfır paket; desteklemeyen tarayıcıda geçiş olmaz ama sayfa çalışır ("her cihazda çalışsın"). Motion az farkla daha iyiydi; şimdilik View Transitions, Motion'a sonra tekrar bakılacak |
| 11 | Özel bileşenler | **Elde yazıldı, paket yok:** yükleme; galeri (masonry, her fotoğraf en kısa sütuna yerleşir; ay çizgisi sütunlar arasından basamak basamak geçer, boşluk kalmaz; ayrı zaman çizelgesi kaldırıldı); tam ekran görüntüleyici (yakınlaştırmalı); geri sayım: **herbaryum etiketi** (çiçek görseli üstte, gün sayısı etiket çerçevesinde) | Sade sayı ve ince şerit reddedildi |
| — | Yerleşim | **Ekranın tamamını kullan:** sayfa her ekranda tüm genişliği kullanır, kenarda yalnızca nefes payı; galeri ve kart ızgaraları genişledikçe sütun ekler; uzun metin okunur genişlikte (~65 karakter) kalır | Tablet yatayda iki yan boş kalıyordu; düz metin çok uzarsa okunmaz |

Ertelenenler: kâğıt dokusunun son hali; uygulama içi arka plan (donmuş ipek karesi, hareketli ipek ya da yalnızca seçili sayfalar).

**Yöntemden kalanlar:** "çok seçenek" adımlarında galeri yerine histen üç aday çıkarmak daha hızlı; bloklar iskelet için iyi, kimlik ekranları (giriş, açılış) için zayıf, onları histen tasarla; seçenekleri kullanıcının gerçek cihazında göster ve seçimi onun yerine akıl yürüterek yapma; yerleşim seçeneği sunmadan önce ölç; kullanıcının tarif ettiği efekti yap, kolay olanı değil; her efekt düz, okunur metinde bitsin; animasyon kütüphanesini gerçek etkileşimler üzerinde karşılaştır.

## 7. Kararlar

En yenisi üstte. Seçeneklerin ayrıntılı karşılaştırması git geçmişinde (`docs/decisions.md`, 2026-10-31 öncesi).

- **2026-10-31 (ekran tasarımı):** Görsel dil oturdu; ekranların içeriği, yerleşimi ve özellikleri henüz oturmadı. Yöntem: her ekran için 2–3 statik maket yan yana (yapıda ayrışan: içerik, gezinme, filtreler); seçilenin kodu yazılır, reddedilen maketler silinir. `/ui*` sayfaları gerçek ekranlar bileşenleri kullanana kadar kalır. Maketler gri kutulu taslak; önce bütün ekranların kaba haritası.
- **2026-10-31 (tasarım):** #11 kilitlendi, tasarım listesi bitti; galeri en kısa sütuna yerleşir, ay çizgisi basamaklı; geri sayım herbaryum etiketi; Motion'a sonra tekrar bakılacak; yerleşim ekranın tamamını kullanır.
- **2026-10-31:** Dokümanlar ortak şablona taşındı; `docs/`, proje içi CLAUDE.md ve `frontend-playbook.md` kaldırıldı (playbook'un özü §6'ya, teknik tuzakları SYSTEM'e). **`research/` istisna:** içindeki .md dosyalarıyla birlikte olduğu gibi kalır, araştırma emeği bilerek görünür tutuluyor. Yalnızca `_tmp_*` betikleri silindi.
- **2026-10-30:** Tasarım seçimleri: 6c iç boşluk değişmiyor; 8 yoğun buket; 9 yumuşak beliriş + yazılma + sayaç; 10 View Transitions, kütüphane yok.
- **2026-10 (Karar 8):** Tasarım seçimleri §6'daki gibi; ikonlar Lucide yerine Phosphor.
- **2026-10 (katalog):** Katalog kaynaklara karşı baştan sona doğrulandı (146 anlatı paragrafı, atıflar, anlamlar, görseller). Yöntem belgesi yazıldı; 61 kaydın uzun metinlerinin hepsi doğrulandı. Kaynakta simge olarak geçmeyen anlamlar ayrı "çağrışımlar" alanına taşındı. Görseli bulunamayan iki kayıt temsilî görsel aldı. Eksik anlamlar eklendi (lavanta, ayçiçeği, sarı nergis, aynısefa, beyaz leylak, beyaz gül, manolya); yanlış türü gösteren görseller değiştirildi.
- **Mimari onayı:** Takılan video işi sabit süre yerine nabızla tespit edilir (her dakika ilerleme, 10 dk sessizlik = başarısız; yan fayda: ilerleme yüzdesi). Kaydedilmemiş yükleme temizliği 6 saat, saatlik. Workers Paid plana geçildi (Container yalnızca Paid'de; Free'deki 10 ms işlemci sınırı şifre kontrolünü bile zorluyor; plan hesap başına).
- **Karar 9 (altyapı):** Ad "Memory Garden". Adresler `memory-garden.erayai.workers.dev` ve demo `memory-garden-demo.erayai.workers.dev` (workers.dev'de iç içe alt alan adı olmadığı için demo ayrı Worker; Public Suffix List sayesinde ikisi birbirinin çerezini göremez). GitHub Actions ile deploy. Ortamlar: yerel + demo + gerçek. Testler: birim + API + uçtan uca (Playwright, mobil + masaüstü) + Lighthouse CI. Yedek §3.10. Hata takibi Workers Logs (Sentry yerine). Tek repo üç paket, pnpm, Biome.
- **Karar 7 (demo):** Ziyaretçi başına ayrı kopya; her kopya ayrı bir Durable Object içinde kendi SQLite veritabanıyla, aynı şema ve aynı API koduyla. Ziyaretçi başına D1 (yavaş, dinamik bağlanamıyor) ve tek veritabanında "ziyaretçi" sütunu (gerçek şemayı karmaşıklaştırır) elendi.
- **Karar 6 (medya):** Fotoğraf Cloudflare Images ile (HEIC destekli, ayda 5.000 dönüşüm ücretsiz). Video Container + ffmpeg ile; Cloudflare Stream Paid plana dahil değil (1.000 dakikalık blok başına ayda 5 $). Kural: Stream plana dahilse Stream, ayrı abonelikse Container. Orijinaller depolama maliyeti için silinir.
- **Karar 5 (veri):** Drizzle. Etiket aralığına sonradan eklenen günler otomatik dahil. Çöp kutusu 30 gün. "Kim ekledi" gösterilir. Bildirim tercihleri ayarlarda. Özel gün bildirimi yok (önce "evet" denmişti). 29 Şubat → 28 Şubat. Çiçek kataloğu ve il/ilçe listesi kodda; zamanlar UTC; kimlikler UUID.
- **Karar 4 (giriş):** Better Auth (D1 üzerinde; Cloudflare Access'te kendi giriş ekranı olmuyor). Kayan 90 gün (PWA'da sık giriş uygulama hissini bozar). Passkey ek yöntem. Demo için tek tıkla giriş. Hesap ve şifre sıfırlama betikle (e-posta sıfırlama iki kişilik uygulamada gereksiz saldırı yüzeyi).
- **Karar 3 (API):** Hono, Hono RPC (tip güvenli REST), Zod, TanStack Query (önbellek, telefonda kalıcı önbellek). İki Worker: `app` ve `media`; sık değişen uygulama, yavaş derlenen ffmpeg container'ından ayrı, aralarında Queues.
- **Karar 2 (ön yüz):** SPA + statik rehber: React Router, sunucu render'ı kapalı; rehber sayfaları deploy sırasında HTML üretilir. Tam SSR, Next.js + OpenNext ve Astro + SPA elendi. Gerekçe: PWA, bildirim ve çevrimdışı açılış SPA'da daha kolay; rehber statik olduğu için hızlı ve Google'da görünür.
- **Karar 1 (kapsam):** §3'teki özellikler ilk sürümde. Yeni: "geçen yıl bugün", web push (SMS/WhatsApp ücretli ve Cloudflare dışı, e-posta anlık değil, Telegram ek uygulama ister), PWA, filtreler, etiketler, özel günler, anlama göre arama, İngilizce (rehber İK'ların göreceği vitrin). Zip dışa aktarma yok.
- **Ön kararlar:** Yalnızca Cloudflare (Vercel, Supabase, Google Cloud yok), D1. Eski Next.js uygulaması taşınmadı, aynı repoda sıfırdan yazıldı (eski hali git geçmişinde). Korunanlar: `research/`, Curtis görselleri, çiçek kataloğu, Türkiye konum verisi, bunları üreten betikler, ffmpeg tarifleri, saf mantık ve testleri. Platformun Cloudflare'e özgü servisleri (Queues, Containers, Durable Objects, Images) bu kararlarla onaylandı.
