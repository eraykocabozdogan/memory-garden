# Çiçek kataloğunun yöntemi

Uygulamadaki çiçek kataloğunun (`packages/shared/src/flowers/`) nasıl kurulduğu ve yeni bir
kaydın hangi kurallarla ekleneceği. Karar kaydı: `docs/decisions.md` → "Çiçek kataloğunun
yöntemi ve doğrulaması".

## İki katman

| Katman | Nerede | Ne içerir |
|---|---|---|
| Araştırma | `research/flowers/stage-1/` | Üç kitabın girdileri, dahil etme kapıları, birleştirme kuralları, sayfa atıfları. 331 birleşik kayıt. |
| Katalog | `packages/shared/src/flowers/catalog-data.json` ve `flower-artwork.json` | Uygulamada gösterilen 61 kayıt: Türkçe ad, anlam, atıf, anlatılar, görsel. |

Araştırma katmanı en baştan belgeliydi (`stage-1/*.md`). Katalog katmanı ilk kez GPT ile
yazıldı ve yöntemi kayıtlı değildi. Ekim 2026'da tüm katalog kaynaklara karşı doğrulandı
(aşağıda) ve bu belge yazıldı.

## 1. Kaynaklar

Katalog yalnız şu iki kitaba atıf yapar (archive.org kimlikleriyle):

- Henry Phillips, *Floral Emblems*, Londra 1825: `floralemblems00philrich`
- John H. Ingram, *Flora Symbolica*, Londra 1869: `florasymbolica00ingr`

Robert Tyas, *The Sentiment of Flowers* (1869, `sentimentofflowe00tyas`) araştırma
katmanında var, katalogda kullanılmıyor.

## 2. Hangi çiçekler

İlk 61 kaydın seçim gerekçesi yazılı değildi; aşağıdaki kurallar bu kayıtların ortak
özelliklerinden çıkarıldı ve yeni kayıtlar için geçerlidir:

1. Kayıt araştırma katmanındaki birleşik listede (`stage-1-merged.csv`) bulunur; yani iki
   kapıyı geçmiştir: gündelik anlamda çiçek olması ve kaynağın anlamı açıklayan bir anlatı
   vermesi (`stage-1/ingram-1869.md` → "Approved inclusion rules").
2. Phillips ya da Ingram'da bu çiçeğe verilmiş bir anlam vardır.
3. Türkiye'de bilinen bir çiçektir ve yaygın bir Türkçe adı vardır.
4. Renk ya da biçim (beyaz gül, gül tomurcuğu, kurumuş gül, katmerli papatya) ancak kaynak ona
   ayrı bir anlam veriyorsa ayrı kayıttır (araştırma katmanının kimlik kuralı).
5. Kayıt için 3. bölümdeki kurallara uyan bir görsel bulunur.

## 3. Alanlar ve yazım kuralları

### `meaning` (anlam)

- Kaynağın bu çiçeğe verdiği simge anlamlarıdır: Phillips'te madde başlığı, Ingram'da bölüm
  başlığındaki parantez ya da çiçek sözlüğü (s. 355–362), ya da atıf yapılan sayfalarda açıkça
  "şunun simgesidir" denen anlam.
- İki kaynak farklı anlam veriyorsa ikisi de yazılır (örnek: lavanta, Türk çiçek dilinde gayret,
  kıta Avrupasında güvensizlik).
- İngilizce anlam Türkçeye anlamıyla çevrilir, sözcük sözcük değil.
- Kaynakta hiç geçmeyen anlam yazılmaz. Kaynağın simge anlamı olarak vermediği, yalnız anlatıdan
  çıkan anlamlar bu alana değil `associations` alanına yazılır.

### `associations` (çağrışımlar)

- Atıf yapılan sayfalardaki anlatının açıkça kurduğu ama kaynağın simge anlamı olarak vermediği
  bağlar (örneğin haşhaşta Roma cenaze âdetinden "yas", sümbülde mitteki "kıskançlık").
- Her çağrışımın dayandığı anlatı, kaydın `narratives` alanında bulunur.
- Arayüzde anlamdan ayrı bir satırda, "çağrışımlar" başlığıyla gösterilir. Çağrışım yoksa alan
  boş kalır.

### `context` (atıf)

- Biçim: `Kitap, “madde ya da bölüm başlığı”, s. X–Y; kısa konu özeti.`
- Sayfa aralığı, anlatılardaki her iddiayı kapsar; fazlasını kapsamaz.
- Kaynakta geçen özel adlar (şiir, kişi, eser) kaynaktaki yazımıyla verilir.

### `narratives` (anlatılar)

- Yalnız kaynakta yazanı söyler. Kısaltılabilir, ama ekleme yapılmaz; doğru olsa bile kaynakta
  olmayan bilgi (bir tanrının unvanı, bir kralın numarası, bir yer adı) eklenmez.
- Kimin söylediği bellidir: "Phillips … söyler", "Ingram'ın aktardığı …". Kaynak bir şiir ya da
  başka bir yazar aktarıyorsa o şair ya da yazar adıyla anılır.
- Kaynağın ihtiyat ifadeleri korunur ("söylenir", "belki", "ileri sürülür"). Bir efsane olgu
  gibi anlatılmaz.
- Özel adlar kaynaktaki yazımıyla kalır (Clytie, Fulke, Pedma); Latince adlar çevrilmez.
- Sade, doğal Türkçe; birebir çeviri kokan cümle yazılmaz.

## 4. Görseller

Karar kaydı: `docs/decisions.md` → "Çiçek görselleri" (G1–G5).

1. **Tür düzeyinde eşleşme.** Görsel, kaydın gösterdiği bitkinin kendisidir. Cins tutması
   yetmez: haşhaş *Papaver somniferum* olmalı, Doğu gelinciği değil. Bitkinin adı zamanla
   değişmişse (eski *Antirrhinum linaria* bugün *Linaria*) bugünkü adına bakılır.
2. **Kaynak önceliği (G1).** Önce William Curtis: *The Botanical Magazine* ve *Flora
   Londinensis*. Yoksa aynı dönemin el boyaması baskıları: Redouté, *Edwards's Botanical
   Register*, Sowerby, Woodville'in *Medical Botany*'si vb. Bunlar da yoksa daha geç bir
   botanik baskı (örneğin *Flora Batava*, Köhler).
3. **Her kayda kendi görseli.** İki kayıt aynı görseli paylaşmaz. Renk ya da biçim kaydının
   görseli o rengi ya da biçimi gösterir.
4. **Kırpma (G2, G3).** Büyük plakalarda bitki ortalanır; boş kâğıt, yazılar ve parça çizimleri
   atılır. Tomurcuk kayıtları gül plakalarındaki tomurcuk detayından kırpılır. Kırpma oranları
   `flower-artwork.json` içinde `crop` alanında durur, böylece görsel yeniden üretilebilir.
5. **Lisans.** Yalnız kamu malı (public domain) baskılar. Kaynak dosya Wikimedia Commons'taki
   adıyla `fileName` alanına yazılır; uygulama bu adla kaynak sayfasına bağlantı verir.
6. **İşleme.** `pnpm flowers:assets` görseli indirir, kırpar, en fazla 1280×1900 piksel WebP'ye
   çevirir (`apps/web/public/flowers/art/<id>.webp`).

## 5. Yeni kayıt eklerken kontrol listesi

- [ ] Kayıt `stage-1-merged.csv`'de var; Phillips ya da Ingram'da anlamı var.
- [ ] Her anlam, atıf yapılan sayfalarda simge anlamı olarak geçiyor.
- [ ] Her anlatı cümlesi atıf yapılan sayfalarda var; aktarılan şair ya da yazar adıyla anılıyor.
- [ ] Sayfa aralığı doğru; özel adlar kaynaktaki gibi.
- [ ] Görsel tür düzeyinde doğru, kamu malı, başka bir kayıtla paylaşılmıyor.
- [ ] `pnpm test` geçiyor.

## 6. Doğrulama kaydı

- **Ekim 2026, ilk tur:** atıflar, anlamlar ve görseller. Rapor:
  `catalog-verification-2026-10.md`.
- **Ekim 2026, ikinci tur:** 146 anlatı paragrafının hepsi kitapların tam metniyle karşılaştırıldı.
  Sonuç ve yapılan düzeltmeler aynı raporda.
