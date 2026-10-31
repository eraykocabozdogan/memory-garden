import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types/maket";
import { MemoriesMap } from "./maket-anilar";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Ekran haritası · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Screen map (SPEC §7, 2026-10-31): one grey-box wireframe per app screen, so structure (what is
// on a screen, how it is reached, where the filters sit) can be judged before any look. On
// purpose there is no theme, no logic and no tests; the page is thrown away once the screens
// are chosen. The open questions under each screen are the seeds of its 2–3 variants.

type Screen = {
  slug: string;
  name: string;
  body: (phone: boolean) => ReactNode;
  why: string[];
  open: string[];
};

// ------------------------------------------------------------------ pieces

function Box({
  label,
  className = "",
  children,
}: {
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded border border-neutral-400 bg-neutral-100 p-2 ${className}`}>
      {label && <p className="text-xs text-neutral-600">{label}</p>}
      {children}
    </div>
  );
}

function Img({ className = "h-20" }: { className?: string }) {
  return (
    <div
      className={`rounded-sm bg-neutral-300 bg-[linear-gradient(135deg,transparent_48%,#a3a3a3_49%,#a3a3a3_51%,transparent_52%)] ${className}`}
    />
  );
}

function Lines({ n = 2 }: { n?: number }) {
  return (
    <div className="grid gap-1 py-1">
      {Array.from({ length: n }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder lines
          key={i}
          className="h-2 rounded bg-neutral-300"
          style={{ width: `${90 - i * 20}%` }}
        />
      ))}
    </div>
  );
}

function Chip({ children, on = false }: { children: ReactNode; on?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${on ? "border-neutral-800 bg-neutral-800 text-white" : "border-neutral-400 bg-white text-neutral-700"}`}
    >
      {children}
    </span>
  );
}

function Btn({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded border border-neutral-500 bg-white px-2 py-1 text-xs text-neutral-800">
      {children}
    </span>
  );
}

function Grid({ phone, children }: { phone: boolean; children: ReactNode }) {
  return <div className={`grid gap-3 ${phone ? "" : "md:grid-cols-[2fr_1fr]"}`}>{children}</div>;
}

// ---------------------------------------------------------------- screens

function DayDetail({ phone }: { phone: boolean }) {
  const [route, setRoute] = useState(false);
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-medium text-neutral-800">14 Ağustos 2026, Cuma</p>
          <p className="text-xs text-neutral-600">İzmir → Kuşadası → Selçuk</p>
          <div className="flex gap-1 pt-1">
            <Chip>Ege tatili</Chip>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <Btn>‹ Önceki gün</Btn>
          <Btn>Sonraki gün ›</Btn>
        </div>
      </div>

      <div>
        <button type="button" onClick={() => setRoute((open) => !open)}>
          <Btn>{route ? "Rotayı gizle" : "Rotayı göster"}</Btn>
        </button>
        {route && <Box label="Rota haritası: İzmir → Kuşadası → Selçuk" className="mt-2 h-48" />}
      </div>

      <Box label="Not · E. ekledi">
        <Lines n={3} />
      </Box>

      <div className={`gap-2 ${phone ? "columns-2" : "columns-2 sm:columns-3 lg:columns-4"}`}>
        {["h-32", "h-20", "h-24", "h-28", "h-20", "h-32", "h-24", "h-28"].map((h, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
          <div key={i} className="mb-2">
            <Img className={h} />
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        Açıklamalar burada yok; bir fotoğrafa dokununca tam ekranda altında görünür.
      </p>

      <div className="flex gap-1">
        <Btn>Düzenle</Btn>
        <Btn>Öğe ekle</Btn>
        <Btn>Sil</Btn>
      </div>
    </div>
  );
}

function Memories({ phone }: { phone: boolean }) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Chip>Etiket ▾</Chip>
        <Chip>İl ▾</Chip>
        <Chip>Tür ▾</Chip>
        <Link to="/maket/ani-ekle" className="ml-auto">
          <Btn>+ Anı ekle</Btn>
        </Link>
      </div>
      <Box label="Geçen yıl bugün · 31 Ekim 2025">
        <div className="flex gap-2 pt-1">
          <Img className="h-14 w-20" />
          <Img className="h-14 w-20" />
          <div className="text-xs text-neutral-700">
            Ankara · 2 fotoğraf
            <br />
            <span className="text-neutral-500">Kapat ×</span>
          </div>
        </div>
      </Box>
      <MemoriesMap phone={phone} />
    </div>
  );
}

const SCREENS: Screen[] = [
  {
    slug: "anilar",
    name: "Anılar",
    body: (phone) => <Memories phone={phone} />,
    why: [
      "Liste değil, yakınlaştırılan bir harita. Dört seviye: bütün yıllar ve ayları → bir yılın ayları → bir ayın gün kartları → bir günün medyası.",
      "Her ay gerçek bir takvim çerçevesinde (pazartesi başlar, ilk ve son haftada eksik kareler); içi ayın fotoğraflarıyla kaplı, sığmayanlar +N. Günler karelere oturmaz.",
      "Medyası olmayan yıl, ay ve gün hiç çizilmez. Öğeler merkezin etrafında altıgen halkalarda, en yeni ortada.",
      "Tekerlek yalnızca seviye değiştirir: yukarı, imlecin altındakine bir seviye in; aşağı, bir seviye çık. Gezinme imlecin merkeze uzaklığıyla; ortadaki kesikli dairede hareket yok.",
      "Telefonda iki parmakla yakınlaş/uzaklaş, tek parmakla sürükle. Üstteki yol (Tüm yıllar › 2026 › …) seçili tarihi gösterir ve geri çıkar.",
      'Tarihi eksikler: yalnızca yılı bilinen o yılın içinde "Ayı bilinmeyenler", yalnızca ayı bilinen o ayın içinde "Günü bilinmeyenler", tarihsizler en üst seviyede en dışta.',
    ],
    open: [
      "Etiket, il ve tür filtreleri kalsın mı? Kalırsa çip mi olsun, yoksa onlar da sezgisel bir seçime mi dönsün?",
      "Bir öğeye tıklamak/dokunmak da bir seviye insin mi (şu an iniyor), yoksa yalnızca tekerlek ve iki parmak mı?",
      "Gezinme hızı ve ortadaki durgun bölgenin büyüklüğü doğru mu?",
    ],
  },
  {
    slug: "gun",
    name: "Gün ayrıntısı",
    body: (phone) => <DayDetail phone={phone} />,
    why: [
      "Bir günün bütün medyası tek masonry galeride, ekranın tamamında.",
      "Not, galerinin üstünde kendi satırında; fotoğrafların arasına girmiyor.",
      'Rota kapalı başlar, "Rotayı göster" ile açılır. Yalnızca tam günü olan anılarda var.',
      "Fotoğraf açıklamaları galeride görünmez, yalnızca tam ekran görüntüleyicide.",
      "Önceki/sonraki gün ile gezinme, listeye dönmeden.",
    ],
    open: [],
  },
  {
    slug: "harita",
    name: "Harita",
    body: (phone) => (
      <Grid phone={phone}>
        <Box label="Türkiye haritası · anı olan il/ilçelerde sayı rozeti" className="h-80">
          <div className="relative h-full">
            {[
              ["20%", "40%", "12"],
              ["45%", "35%", "4"],
              ["70%", "55%", "7"],
              ["30%", "70%", "21"],
            ].map(([x, y, n]) => (
              <span
                key={`${x}${y}`}
                className="absolute grid size-7 place-items-center rounded-full bg-neutral-700 text-xs text-white"
                style={{ left: x, top: y }}
              >
                {n}
              </span>
            ))}
          </div>
        </Box>
        <div className="grid content-start gap-2">
          <div className="flex gap-1">
            <Chip>Yıl ▾</Chip>
            <Chip>Etiket ▾</Chip>
          </div>
          <Box label="Seçili yer: Kuşadası · 21 gün">
            <div className="grid gap-1 pt-1">
              <Lines n={1} />
              <Lines n={1} />
              <Lines n={1} />
            </div>
          </Box>
        </div>
      </Grid>
    ),
    why: [
      "Harita yalnızca bu ekranda yüklenir (ağır). Bir yere dokununca o yerdeki günler listelenir.",
      "Konum ilk sürümde il/ilçe düzeyinde; nokta değil bölge.",
    ],
    open: [
      "Rozetler mi, ısı haritası gibi renk yoğunluğu mu, yoksa illerin boyanması mı?",
      "Seçili yerin günleri yan panelde mi, alttan açılan çekmecede mi?",
      "Haritanın ayrı bir ekran olması gerekli mi, yoksa Anılar'da bir görünüm (Gün/Ay/Yıl/Harita) mı?",
    ],
  },
  {
    slug: "gunluk",
    name: "Günlükler",
    body: (phone) => (
      <Grid phone={phone}>
        <div className="grid content-start gap-3">
          <Box label="Bugün yaz">
            <div className="mt-1 h-24 rounded border border-neutral-300 bg-white" />
            <div className="flex justify-between pt-1 text-xs text-neutral-600">
              <span>0 / 2.000</span>
              <Btn>Yayınla</Btn>
            </div>
          </Box>
          <Box label="Benim günlüklerim">
            <div className="grid gap-2 pt-1">
              <Box label="Bugün 09:12 · partnerine 18 sa daha açık · düzenle / sil">
                <Lines n={2} />
              </Box>
              <Box label="28 Ekim · kapandı · bırakılan çiçek: Papatya">
                <Lines n={2} />
              </Box>
            </div>
          </Box>
        </div>
        <div className="grid content-start gap-3">
          <Box label="Açık günlükler (partnerin)">
            <div className="grid gap-2 pt-1">
              <Box label="D. · 6 saat önce · 18 sa kaldı">
                <Lines n={3} />
                <Btn>Çiçek bırak</Btn>
              </Box>
            </div>
          </Box>
        </div>
      </Grid>
    ),
    why: [
      "Yazmak ve partnerin açık günlüğü aynı ekranda; ikisi de günlük ritmin parçası.",
      "Kalan süre her günlükte açıkça yazıyor (24 saat kuralı).",
      "Çiçek bırak kitap gibi bir pencerede kataloğu açar.",
    ],
    open: [
      'Yazma alanı her zaman açık mı, yoksa "Yaz" düğmesiyle tam ekran mı?',
      "Kapanan günlükler burada mı listelenir, yoksa yalnızca bahçede çiçekleriyle mi yaşar?",
      "Partnerin açık günlüğü yokken bu taraf ne gösterir?",
    ],
  },
  {
    slug: "bahce",
    name: "Bahçe",
    body: () => (
      <div className="grid gap-3">
        <Box label="Bahçe · bırakılan her çiçek bir bitki, ilk günlükten bugüne" className="h-72">
          <div className="flex h-full flex-wrap content-end gap-2 p-2">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
                key={i}
                className="w-6 rounded-t-full bg-neutral-400"
                style={{ height: 30 + ((i * 37) % 60) }}
              />
            ))}
          </div>
        </Box>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-700">
          <Box>47 çiçek</Box>
          <Box>İlk günlük: 3 Mart 2025</Box>
          <Box>En çok bırakılan: Papatya</Box>
        </div>
        <Box label="Bir çiçeğe dokununca: Papatya · 28 Ekim · D. bıraktı · anlamı: masumiyet" />
      </div>
    ),
    why: [
      "Projenin en özgün ekranı; bahçe büyüdükçe dolan tek bir sahne.",
      "Çiçeğe dokununca hangi günlüğe, kimin bıraktığı ve anlamı.",
    ],
    open: [
      "Bahçe zaman çizgisi gibi soldan sağa mı büyür, yoksa serbest bir tarhta mı?",
      "Silinmiş günlüğün çiçeği nasıl görünür (metni yok, çiçek kalır)?",
      "Bahçe Günlükler ile aynı ekranda mı (üstte bahçe, altta günlükler), ayrı mı?",
    ],
  },
  {
    slug: "etiketler",
    name: "Etiketler",
    body: (phone) => (
      <Grid phone={phone}>
        <div className={`grid content-start gap-3 ${phone ? "" : "sm:grid-cols-2"}`}>
          {["Ege tatili · 12–18 Ağu 2026 · 7 gün", "Ankara'ya taşınma · 2–5 Eki 2025 · 4 gün"].map(
            (t) => (
              <Box key={t} label={t}>
                <Img className="h-20" />
              </Box>
            ),
          )}
          <Btn>+ Etiket</Btn>
        </div>
        <Box label="Etiket ayrıntısı: Ege tatili">
          <p className="pt-1 text-xs text-neutral-700">Aralık: 12 Ağu – 18 Ağu 2026</p>
          <div className="grid gap-1 pt-2">
            {["12 Ağu ✓", "13 Ağu ✓", "14 Ağu ✓", "15 Ağu · elle çıkarıldı", "16 Ağu ✓"].map(
              (d) => (
                <div key={d} className="flex justify-between text-xs text-neutral-700">
                  {d}
                  <span className="text-neutral-500">çıkar / ekle</span>
                </div>
              ),
            )}
          </div>
        </Box>
      </Grid>
    ),
    why: [
      "Etiket bir gün aralığı: liste kartlarında ad, aralık, gün sayısı ve kapak.",
      "Ayrıntıda aralıktaki her gün; elle çıkarılan gün işaretli, geri eklenebilir.",
    ],
    open: [
      "Etiketlerin ayrı bir ekranı mı olmalı, yoksa Anılar'da etiket filtresi + etiket sayfası yeter mi?",
      "Etiket ayrıntısı günlerin listesi mi, yoksa o günlerin anıları (Anılar gibi) mı?",
    ],
  },
  {
    slug: "ozel-gunler",
    name: "Özel günler",
    body: (phone) => (
      <div className={`grid gap-3 ${phone ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {["İlk tanıştığımız gün · 14 Mart 2023", "Taşındığımız ev · 2 Ekim 2025"].map((t) => (
          <Box key={t} label={t}>
            <Img className="h-20" />
            <p className="pt-1 text-center text-sm text-neutral-800">134 gün · 4. yıl</p>
            <p className="pt-2 text-xs text-neutral-600">O tarihteki anılar</p>
            <div className="flex gap-1 pt-1">
              <Img className="h-10 w-14" />
              <Img className="h-10 w-14" />
              <Img className="h-10 w-14" />
            </div>
          </Box>
        ))}
        <Box label="+ Özel gün ekle: ad, tarih" className="grid place-items-center" />
      </div>
    ),
    why: [
      "Her özel gün bir herbaryum etiketi kartı (#11): kaçıncı yıl, geri sayım ve o tarihteki anılar.",
    ],
    open: [
      "Sıradaki özel gün Anılar ekranının başında da görünsün mü?",
      '"O tarihteki anılar" yalnızca o gün mü, yoksa o haftadan mı?',
    ],
  },
  {
    slug: "cop",
    name: "Çöp kutusu",
    body: () => (
      <div className="grid gap-2">
        {["14 Ağu 2026 · 3 fotoğraf · 27 gün kaldı", "2 Eki 2025 · 1 not · 4 gün kaldı"].map(
          (t) => (
            <Box key={t}>
              <div className="flex items-center gap-2">
                <Img className="h-12 w-16" />
                <p className="flex-1 text-xs text-neutral-700">{t}</p>
                <Btn>Geri al</Btn>
                <Btn>Kalıcı sil</Btn>
              </div>
            </Box>
          ),
        )}
      </div>
    ),
    why: [
      "Silinen her anı kalan günüyle; geri al ya da kalıcı sil. 30 gün sonra kendiliğinden gider.",
    ],
    open: ["Ayrı ekran mı, Ayarlar'ın içinde bir bölüm mü?", '"Hepsini boşalt" olsun mu?'],
  },
  {
    slug: "ayarlar",
    name: "Ayarlar",
    body: () => (
      <div className="grid max-w-xl gap-2">
        {[
          "Dil · Türkçe / English",
          "Tema · Açık / Koyu / Sistem",
          "Bildirimler · Partner günlük yazınca ● · Partner çiçek bırakınca ●",
          "Passkey · Bu cihazı ekle",
          "Şifre değiştir",
          "iPhone: Ana Ekrana Ekle yönergesi",
          "Çıkış",
        ].map((t) => (
          <Box key={t}>
            <p className="text-xs text-neutral-700">{t}</p>
          </Box>
        ))}
      </div>
    ),
    why: ["Tek sütun liste; yalnızca kurallarda geçen ayarlar."],
    open: ["Tema ve dil üst çubukta da hızlı erişimle dursun mu?"],
  },
  {
    slug: "ani-ekle",
    name: "Anı ekleme",
    body: (phone) => (
      <Grid phone={phone}>
        <div className="grid content-start gap-3">
          <Box label="1 · Dosyalar (en fazla 20, sürükle ya da seç, sırala)">
            <div className="grid grid-cols-4 gap-1 pt-1">
              <Img className="h-14" />
              <Img className="h-14" />
              <Img className="h-14" />
              <Box className="grid h-14 place-items-center p-0">
                <p className="text-xs text-neutral-600">+ Not</p>
              </Box>
            </div>
            <p className="pt-1 text-xs text-neutral-600">2 / 3 yükleniyor · %40</p>
          </Box>
          <Box label="2 · Tarih (fotoğraftan önerildi: 14 Ağustos 2026)">
            <div className="flex gap-1 pt-1">
              <Chip on>Gün</Chip>
              <Chip>Ay</Chip>
              <Chip>Yıl</Chip>
              <Chip>Tarihsiz</Chip>
            </div>
          </Box>
          <Box label="3 · Konumlar (rota sırasıyla): İzmir → Kuşadası → + il/ilçe" />
          <Box label="4 · Not">
            <Lines n={2} />
          </Box>
        </div>
        <div className="grid content-start gap-2">
          <Box label="Özet: 14 Ağu · 3 fotoğraf, 1 not · 2 yer" />
          <Btn>Kaydet</Btn>
          <Btn>Vazgeç (yüklenenler silinir)</Btn>
        </div>
      </Grid>
    ),
    why: [
      "Ekran listesinde yok ama akışlarda var; en sık yapılacak iş.",
      "Yükleme arka planda sürerken tarih, konum ve not doldurulabilir.",
    ],
    open: [
      "Tek uzun form mu, adım adım sihirbaz mı, yoksa önce dosyalar sonra alttan açılan bir çekmece mi?",
      "Telefonda doğrudan galeriden seçerek başlasın mı?",
    ],
  },
];

// -------------------------------------------------------------------- page

// The day screen and adding a memory are reached from Anılar, not from the menu.
const MENU = SCREENS.filter((s) => s.slug !== "ani-ekle" && s.slug !== "gun");
const PHONE_MENU = ["anilar", "gunluk", "bahce", "harita"];

export default function Maket() {
  const { ekran } = useParams();
  const [phone, setPhone] = useState(false);
  const screen = SCREENS.find((s) => s.slug === ekran);

  return (
    <div className="min-h-screen bg-white p-4 text-neutral-900 md:p-8">
      <header className="flex flex-wrap items-center gap-2 pb-4">
        <h1 className="mr-auto text-lg font-semibold">
          <Link to="/maket">Ekran haritası</Link>
          {screen && <span className="font-normal text-neutral-500"> · {screen.name}</span>}
        </h1>
        <button type="button" onClick={() => setPhone(false)}>
          <Chip on={!phone}>Masaüstü / tablet</Chip>
        </button>
        <button type="button" onClick={() => setPhone(true)}>
          <Chip on={phone}>Telefon</Chip>
        </button>
      </header>

      {!screen ? (
        <div className="grid gap-4">
          <p className="max-w-prose text-sm text-neutral-700">
            Uygulamanın bütün ekranları, gri kutularla. Amaç görünüş değil yapı: ekranda ne var,
            nereden gidiliyor, filtreler nerede. Her ekranın altında açık sorular var; varyantlar
            onlardan çıkacak. Not almak istediğin ekranı aç.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {SCREENS.map((s) => (
              <Link
                key={s.slug}
                to={`/maket/${s.slug}`}
                className="rounded border border-neutral-400 p-3 hover:bg-neutral-50"
              >
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-neutral-600">
                  {s.open.length > 0 ? `${s.open.length} açık soru` : "Kararlar alındı"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <div
            className={`mx-auto w-full overflow-hidden rounded-lg border-2 border-neutral-800 ${phone ? "max-w-[390px]" : ""}`}
          >
            <div className={`flex ${phone ? "min-h-[700px] flex-col" : "min-h-[560px]"}`}>
              {!phone && (
                <nav className="w-44 shrink-0 border-r border-neutral-300 bg-neutral-50 p-2">
                  <p className="px-2 pb-2 text-xs text-neutral-500">Yan menü</p>
                  {MENU.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/maket/${s.slug}`}
                      className={`block rounded px-2 py-1 text-sm ${s.slug === screen.slug ? "bg-neutral-800 text-white" : "text-neutral-700"}`}
                    >
                      {s.name}
                    </Link>
                  ))}
                </nav>
              )}
              <main className="flex-1 p-3">{screen.body(phone)}</main>
              {phone && (
                <nav className="grid grid-cols-5 border-t border-neutral-300 bg-neutral-50 text-center text-xs">
                  {PHONE_MENU.map((slug) => (
                    <Link
                      key={slug}
                      to={`/maket/${slug}`}
                      className={`py-3 ${slug === screen.slug ? "font-semibold" : "text-neutral-600"}`}
                    >
                      {SCREENS.find((s) => s.slug === slug)?.name}
                    </Link>
                  ))}
                  <span className="py-3 text-neutral-600">Diğer</span>
                </nav>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h2 className="pb-2 font-semibold">Neden böyle</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                {screen.why.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="pb-2 font-semibold">Açık sorular (varyant adayları)</h2>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-700">
                {screen.open.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
