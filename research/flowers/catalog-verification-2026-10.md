# Çiçek kataloğu doğrulaması (Ekim 2026)

`packages/shared/src/flowers/catalog-data.json` (61 kayıt) ve `curtis-artwork.json` (55 görsel
eşleşmesi, 47 farklı dosya) için yapılan kontrol.

## Yöntem

- **Anlamlar:** Her kaydın `context` alanındaki kaynak atıfları (Phillips 1825, Ingram 1869)
  `research/flowers/stage-1/*.csv` tablolarıyla ve kitapların archive.org tam metinleriyle
  (`floralemblems00philrich`, `florasymbolica00ingr`, `sentimentofflowe00tyas`) karşılaştırıldı:
  atıf yapılan başlık var mı, sayfa doğru mu, Türkçe anlam kaynaktaki anlamı karşılıyor mu.
  Uzun anlatı metinleri (narratives) bu turda satır satır doğrulanmadı.
- **Görseller:** Her görselin Wikimedia Commons'taki tür kategorisi alındı, şüpheli olanlar
  görsel olarak incelendi.

## Anlamlar

Atıfların tamamı kaynaklarda bulundu; sayfa numaraları tutarlı. Araştırma tablolarında
eksik olan birkaç başlık (Phillips "Solitude", "Humility", "Secrecy"; Ingram "Judas Flower",
"Broom", gül sözlüğü) kitapların tam metninden doğrulandı.

Düzeltme önerilen kayıtlar:

| # | Kayıt | Katalogdaki anlam | Kaynakta | Öneri |
|---|---|---|---|---|
| M1 | Lavanta | güvensizlik, ayrılık | Phillips s. 67: **Türk çiçek dilinde "gayret"** (assiduity); "güvensizlik ve ayrılık" kıta Avrupası yorumu | "gayret" eklenmeli ve Türk / Avrupa farkı belirtilmeli |
| M2 | Ayçiçeği | inanç, bağlılık, kararlılık, kıskançlık, terk edilmiş aşk | Ingram bölüm başlığı: **False riches** (sahte zenginlik); uzun boylu: haughtiness (kibir); bodur: adoration (hayranlık) | Ingram'ın ana anlamları eklenmeli |
| M3 | Sarı nergis | aldatıcı umut, aldatıcılık | Ingram bölüm başlığı: **Unrequited love** (karşılıksız aşk); sözlük: regard (saygı) | "karşılıksız aşk" eklenmeli |
| M4 | Aynısefa | çaresizlik, adanmışlık, … | Ingram bölüm başlığı: **Grief** (keder) | "keder" eklenmeli |
| M5 | Beyaz leylak | gençlik, geçici gençlik | Ingram: **Youthful innocence** (gençliğin masumiyeti) | "masumiyet" eklenmeli |
| M6 | Beyaz gül | saflık, yas, anma | Ingram sözlüğü: "I am worthy of you" (sana layığım) | İsteğe bağlı ekleme |
| M7 | Büyük çiçekli manolya | vakar, ihtişam, onur | Ingram sözlüğü: "Love of nature" (doğa sevgisi) | İsteğe bağlı ekleme |

Doğrulanan örnekler: gül evreleri (tomurcuk: aşk itirafı, yarı açmış: aşk, tam açmış: nişan;
Ingram s. 43, Berkeley'in *Utopia*'sı), kurumuş gül = tatlı hatıralar (Ingram s. 45), gizlilik =
iki tomurcuk üzerinde tam açmış gül (Phillips s. 274), erguvan = inançsızlık (Ingram "Judas
Flower").

## Görseller

### Kaydın gösterdiği bitkiyle uyuşmayan görseller

| Kayıt | Görseldeki bitki | Not |
|---|---|---|
| Papatya | Katmerli (çift katlı) bahçe papatyası, Curtis Plate 228 | "Katmerli papatya"ya tam uyuyor; "Papatya" için tek katlı papatya gerekli |
| Haşhaş | *Papaver orientale* (Doğu gelinciği), Plate 57 | Haşhaş *P. somniferum* |
| Beyaz haşhaş | Aynı Doğu gelinciği | |
| Menekşe, Kokulu menekşe, Hercai menekşe | *Viola pedata* (Kuzey Amerika menekşesi), Plate 89 | Üç kayıt da aynı yanlış türü paylaşıyor |
| Aslanağzı | *Linaria* (nevruzotu); Curtis döneminde *Antirrhinum* sayılıyordu | Aslanağzı *Antirrhinum majus* |
| Anemon | *Hepatica nobilis* (kebek); eskiden *Anemone hepatica* | Kaynaktaki anemon bahçe anemonu (*A. coronaria*) |
| Safran çiçeği | *Crocus chrysanthus* (sarı çiğdem) | Safran *Crocus sativus* (mor) |
| Cezayir menekşesi | *Catharanthus roseus* (Madagaskar menekşesi); eskiden *Vinca rosea* | Kaynaktaki *Vinca minor / major* |
| Beyaz leylak | Mor leylak, Plate 183 | |
| Gül (genel) | Plate 407: beyaz yapraklı, ortası kırmızı katmerli güller | En çok "Beyaz gül"e uyuyor |
| Gül tomurcuğu, Beyaz gül tomurcuğu | Plate 407 | Tomurcuk detayı kırpılacak (G3) |
| Tam açmış gül | *Rosa corymbulosa*, 1914: tek katlı yaban gülü kümesi | Tam açmış (katmerli, olgun) bir gül değil; üslubu da geç dönem |
| Yarı açmış gül | *Rosa glutinosa*, 1919: yaban gülü ve kuşburnu | Yarı açmış gül değil |
| Kurumuş gül | *Rosa omeiensis*, 1913: taze yaban gülü ve kuşburnu | Kurumuş gül değil |

### Aynı cins, farklı tür (kayıt adı belirli bir türü işaret ediyor)

| Kayıt | Görseldeki tür | Fark |
|---|---|---|
| Yüksükotu (*D. purpurea*) | *Digitalis ferruginea* | Pas rengi yüksükotu; mor değil |
| Kına çiçeği (*I. balsamina*) | *Impatiens cuspidata* | Farklı tür |
| Büyük çiçekli manolya (*M. grandiflora*) | *Magnolia kobus* | Küçük beyaz çiçekli Japon manolyası |
| Ayçiçeği | *Helianthus mollis* | Küçük çiçekli; bilinen ayçiçeği (*H. annuus*) değil |
| Sarı nergis (*N. pseudonarcissus*) | *Narcissus minor* | Çok yakın tür; küçük boru nergis |
| Tek katlı gül | *Rosa ecae* (sarı) | Phillips'in kastettiği yaban gülü / eglantin |

### Cins düzeyinde uygun

Hasekiküpesi (*A. canadensis*), Siklamen (*C. persicum*), Funda (*E. subdivaricata*), Süsen
(*I. spuria*), Zambak (*L. bulbiferum*), Elma çiçeği (*M. spectabilis*), Nergis
(*N. triandrus*), Su zambağı (*N. candida*), Çarkıfelek (*P. alata*), Düğün çiçeği
(*R. acris*), Lale (*T. clusiana*), Kırmızı gül (*R. chinensis*), Kardelen (*G. elwesii*) ve
türü doğrudan uyan diğerleri.

### Görseli olmayan kayıtlar

Aynısefa, Horozibiği, Erguvan, Portakal çiçeği, Müge, Unutma beni.

### Bulunan adaylar (ilk tarama)

William Curtis, *Flora Londinensis* (1777): tek katlı papatya (*Bellis perennis*), kokulu
menekşe (*Viola odorata*), yabani hercai menekşe (*Viola tricolor*). Diğer kayıtlar için
Commons'ta *Edwards's Botanical Register*, Redouté, Köhler ve Flora Batava gibi aynı dönem
kaynaklarında adaylar var.

## İkinci tur: anlatı metinleri

Katalogdaki 146 anlatı paragrafının her biri, atıf yapılan sayfalarla archive.org tam
metinleri üzerinden karşılaştırıldı (ayrıntılı kayıt: her paragraf için karar, kaynak sayfa
ve İngilizce alıntı; doğrulama sırasında üretildi, düzeltmeler doğrudan kataloğa işlendi).

| Sonuç | Paragraf |
|---|---|
| Kaynağa sadık | 84 |
| Küçük sapma (düzeltildi) | 61 |
| Kaynakta olmayan cümle (düzeltildi) | 1 |
| Kaynakla çelişen | 0 |

Uydurma bir olay, kişi ya da efsane bulunmadı. Sapmaların türleri:

- **İhtiyat ifadesinin düşmesi:** kaynak "söylenir", "belki", "ileri sürülür" derken metin
  olgu gibi anlatıyordu (unutma beni / Waterloo, Brahma'nın lotusta doğuşu, erguvan şiiri).
- **Aktarılan şairin adının olmaması:** Phillips ve Ingram'ın alıntıladığı şiirler kaynağın
  kendi sözü gibi verilmişti (Eliza Cook, Shaw, Cowper, William Browne, Jami, Adelaide Procter).
- **İki tanığın birleştirilmesi:** gül mezar âdetlerinde Evelyn ile Camden.
- **Dışarıdan bilgi eklenmesi:** "IV. Henri" (kaynakta "Henry the Great"), "Fransa'ya",
  Harpokrates "sessizlik tanrısı", "uzun hapislik".
- **Çeviri hatası:** kırmızı gülde "güllerin yeni hükümdarı" (kaynakta çiçeklerin istediği yeni
  hükümdar); beyaz gül tomurcuğunda Venus'un "oğlu" (kaynakta sevgilisi).
- **Kaynakta olmayan cümle:** beyaz gül tomurcuğunda "aşkı tanımayan kalbi temsil eder"
  açıklaması; Phillips simgeyi açıklamaz, yalnız miti ve dizeleri verir.
- **Ad yazımları:** kaynaktaki biçime döndü (Clytie, Leucothoe, Fulke, Geoffry/Gefroi, Pedma,
  Culpepper, Lutzen, Proserpine).

Atıf düzeltmeleri: sayfa aralıkları (gül "Secrecy" s. 274–275, lale s. 112–113, gül evreleri
s. 43, siklamen s. 119, süpürgeotu s. 172–173, Cezayir menekşesi s. 86–88, beyaz gül s. 27–28,
beyaz haşhaş s. 277–278, kırmızı gül s. 30–31); erguvandaki şiirin adı ("The Wayside Inn",
Adelaide Procter); manolyada "Fransa sarayı" yerine Bretagne meclisi ve Paris.

### Anlam alanı

Kaynakta hiç geçmeyen ya da yanlış çevrilmiş anlamlar düzeltildi:

| Kayıt | Değişiklik | Kaynak |
|---|---|---|
| Papatya | "anma" çıkarıldı | Kaynakta yok |
| Ayçiçeği | "bağlılık" çıkarıldı | Kaynakta yok |
| Akşamsefası | "gizli sevgi" → "utangaç sevgi" | Ingram: bashful love |
| Hint lotusu | "sessiz aşk" → "sessizlik" | Phillips: Silence |
| Çarkıfelek | "taassup" çıkarıldı | Phillips: Religious Superstition |
| Küpe çiçeği | "seçicilik" çıkarıldı | Kaynakta yok; anlam: Taste |
| Büyük çiçekli manolya | "onur" çıkarıldı | Kaynakta yok |
| Elma çiçeği | "seni seçiyorum" çıkarıldı | Ingram: Preference |
| Kırmızı gül | "tutku" çıkarıldı | Kaynakta yok |
| Leylak | "ilk aşk" → "ilk aşk heyecanı" | Ingram: Love's first emotions |
| Menekşe | "tevazu" eklendi | Ingram bölüm başlığı: Modesty |
| Zambak | "saflık" eklendi | Ingram s. 273: purity |
| Lavanta | "ayrılık" → "anlaşmazlık" | Phillips: disunion |

Açık soru (Y4): aşağıdaki anlamlar kaynakta simge anlamı olarak verilmiyor, ama atıf yapılan
sayfalardaki anlatıdan çıkıyor (örneğin haşhaşta Roma cenaze âdetinden "yas").

| Kayıt | Anlatıdan çıkan anlamlar |
|---|---|
| Papatya | çocukluk, kararsızlık |
| Ayçiçeği | kıskançlık, terk edilmiş aşk |
| Akşamsefası | karanlıkta umut |
| Lale | saplantı, aşırılık |
| Hercai menekşe | aşk yarası, kalıcı aşk |
| Anemon | yas |
| Erguvan | ihanet, sessiz ve karşılıksız sevgi, hatıra, yas |
| Ters lale | kahramanlık anısı |
| Sümbül | kıskançlık, yas, anma |
| Süsen | iyi haber |
| Unutma beni | uzakta bağlılık |
| Süpürgeotu | pişmanlık |
| Aynısefa | adanmışlık, bütün düşüncelerin tek yöne çevrilmesi |
| Portakal çiçeği | evlilik |
| Küpe çiçeği | zarafet |
| Haşhaş | uyku, yas |
| Hasekiküpesi | maskaralık |
| Acem borusu | kolay kopuş |
| Yüksükotu | gizli tehlike |
| Zambak | sadelik, inanç, korunma, anma |
| Beyaz leylak | geçici gençlik |

## Görsel değişiklikleri (G1–G5 uygulandı)

Her kayıt kendi görselini aldı; iki kayıt artık aynı görseli paylaşmıyor. Kaynak dosyaların
hepsi Wikimedia Commons'ta kamu malı (ya da Flickr Commons "No restrictions") olarak işaretli.
Kırpma oranları `packages/shared/src/flowers/flower-artwork.json` içinde.

| Kayıt | Yeni görsel | Kaynak, yıl | Not |
|---|---|---|---|
| Papatya | Tek katlı *Bellis perennis* | Curtis, *Flora Londinensis*, 1777 | Kırpıldı (küçük bitki, büyük sayfa) |
| Kokulu menekşe | *Viola odorata* | Curtis, *Flora Londinensis* | Kırpıldı |
| Yüksükotu | *Digitalis purpurea* | Curtis, *Flora Londinensis* | |
| Anemon | *Anemone coronaria* | Curtis's *Botanical Magazine* No. 841 | |
| Hint lotusu | Renkli *Nelumbo* çiçeği | Curtis's *Botanical Magazine* | Eskisi renksiz çizimdi |
| Gül tomurcuğu | Tomurcuk detayı | Curtis's *Botanical Magazine* Plate 3475 | Kırpıldı (G3) |
| Yarı açmış gül | Yarı açmış yosun gülü | *The Botanical Magazine* Plate 69, 1788 | Kırpıldı |
| Gül | *Rosa gallica regalis* | Redouté, *Les Roses* | |
| Tam açmış gül | *Rosa gallica flore giganteo* | Redouté, *Les Roses* | |
| Beyaz gül tomurcuğu | Beyaz yosun gülü tomurcukları | Redouté, *Les Roses* | Kırpıldı (G3) |
| Safran çiçeği | *Crocus sativus* | Redouté, *Les Liliacées* | |
| Müge | *Convallaria majalis* | Redouté, *Les Liliacées* | Yeni (G5) |
| Cezayir menekşesi | *Vinca major* | Redouté, Duhamel *Traité des arbres* | Kırpıldı |
| Erguvan | *Cercis siliquastrum* | Redouté, Duhamel *Traité des arbres* | Yeni (G5), kırpıldı |
| Büyük çiçekli manolya | *Magnolia grandiflora* | Redouté, Duhamel *Traité des arbres* | Kırpıldı |
| Horozibiği | İbikli *Celosia* | *Edwards's Botanical Register* | Yeni (G5) |
| Portakal çiçeği | Çiçekli portakal dalı | *The Botanical Register*, 1815 | Yeni (G5), kütüphane damgası kırpıldı |
| Aslanağzı | *Antirrhinum majus* | *Paxton's Magazine of Botany*, 1838 | |
| Aynısefa | *Calendula officinalis* | C. Hullmandel taş baskısı, 19. yüzyıl | Yeni (G5), yazı kırpıldı |
| Unutma beni | *Myosotis sylvatica* | Sowerby, *English Botany* (1863 baskısı) | Yeni (G5), kırpıldı |
| Kına çiçeği | *Impatiens balsamina* | Weinmann, *Phytanthoza iconographia*, 1737–45 | Renk skalası kırpıldı |
| Menekşe | *Viola odorata* | *Flora Batava* | |
| Hercai menekşe | *Viola tricolor* | *Flora Batava* | Curtis'teki yabani tür çok küçük ve soluk |
| Haşhaş | *Papaver somniferum* | *Flora Batava* | |
| Beyaz haşhaş | Beyaz *P. somniferum* çiçeği | Köhler, *Medizinal-Pflanzen*, 1887 | Kırpıldı |
| Ayçiçeği | *Helianthus annuus* | Besler, *Hortus Eystettensis* | Curtis döneminde *H. annuus* plakası bulunamadı |
| Tek katlı gül | Aynı plaka | Curtis's *Botanical Magazine* | Parça çizimleri kırpıldı (G2) |

G1 sırasının dışına çıkılan yerler: Curtis'te tür düzeyinde uygun plaka yoksa aynı dönemin
el boyaması baskıları kullanıldı; o da yoksa (ayçiçeği, haşhaş, menekşeler) daha erken ya da
daha geç bir botanik baskı seçildi.

Görsel bulunamayan iki kayıt (seçilemez durumda, karar bekliyor):

- **Beyaz leylak:** Dönem kaynaklarında beyaz leylak plakası bulunamadı (Redouté'ninki açık
  lila).
- **Kurumuş gül:** Botanik plakalarda kurumuş gül çizilmez.
