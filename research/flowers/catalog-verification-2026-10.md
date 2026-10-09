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
