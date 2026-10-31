import { type ReactNode, useState } from "react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types/maket";
import { MemoriesMap } from "./maket-anilar";
import { Garden } from "./maket-bahce";
import { PlaceMap } from "./maket-harita";

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

function Diaries({ phone }: { phone: boolean }) {
  const [partnerOpen, setPartnerOpen] = useState(true);
  const [reading, setReading] = useState<string | null>(null);
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
        Partnerin günlüğü:
        <button type="button" onClick={() => setPartnerOpen(true)}>
          <Chip on={partnerOpen}>açık</Chip>
        </button>
        <button type="button" onClick={() => setPartnerOpen(false)}>
          <Chip on={!partnerOpen}>yok</Chip>
        </button>
      </div>
      <Grid phone={phone}>
        <div className="grid content-start gap-3">
          <Box label="Bugün yaz">
            <div className="mt-1 h-24 rounded border border-neutral-300 bg-white" />
            <div className="flex justify-between pt-1 text-xs text-neutral-600">
              <span>0 / 2.000</span>
              <Btn>Yayınla</Btn>
            </div>
          </Box>
          <p className="text-xs text-neutral-600">Günlüklerin</p>
          {/* One list: the open entry on top, highlighted; past ones under it, newest first. */}
          <div className="rounded border-2 border-neutral-800 bg-white p-2">
            <p className="text-xs font-medium text-neutral-800">
              Açık · bugün 09:12 · partnerine 18 sa daha açık · düzenle / sil
            </p>
            <Lines n={2} />
          </div>
          {[
            "28 Ekim · D. çiçek bıraktı: Papatya",
            "25 Ekim · D. çiçek bıraktı: Lavanta",
            "21 Ekim · çiçek bırakılmadı",
          ].map((t) => (
            <button
              key={t}
              type="button"
              className="text-left"
              onClick={() => setReading((open) => (open === t ? null : t))}
            >
              <Box label={`${t} · ${reading === t ? "kapat" : "oku"}`}>
                <Lines n={reading === t ? 7 : 1} />
              </Box>
            </button>
          ))}
        </div>
        <div className="grid content-start gap-3">
          <p className="text-xs text-neutral-600">Partnerin</p>
          {partnerOpen ? (
            <Box label="D. · 6 saat önce · 18 sa kaldı">
              <Lines n={3} />
              <Btn>Çiçek bırak</Btn>
            </Box>
          ) : (
            <Box label="D. bugün henüz yazmadı">
              <div className="flex items-center gap-2 pt-2">
                <Img className="h-14 w-12" />
                <p className="text-xs text-neutral-700">
                  En son bıraktığın çiçek
                  <br />
                  <span className="font-medium">Papatya · 28 Ekim</span>
                  <br />
                  <span className="text-neutral-500">Bahçede gör →</span>
                </p>
              </div>
            </Box>
          )}
        </div>
      </Grid>
    </div>
  );
}

function Memories({ phone }: { phone: boolean }) {
  const [mode, setMode] = useState<"Zaman" | "Harita">("Zaman");
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(["Zaman", "Harita"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}>
            <Chip on={mode === m}>{m}</Chip>
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-neutral-400" />
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
      {mode === "Zaman" ? (
        <MemoriesMap key="zaman" phone={phone} />
      ) : (
        <PlaceMap key="harita" phone={phone} />
      )}
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
      "Medyası olmayan yıl, ay ve gün hiç çizilmez. Biçimi merkezden: öğeler merkeze en yakın altıgen hücrelere yerleşir, az öğe olsa da toplu bir küme olur. Sırası okuma düzeninde: sol üstten sağ alta, eskiden yeniye. En üst seviyede bütün aylar tek ızgarada; yıllar basamaklı çizgiyle ayrılır.",
      "Tekerlek yalnızca seviye değiştirir: yukarı, imlecin altındakine bir seviye in; aşağı, bir seviye çık. Gezinme imlecin merkeze uzaklığıyla; ortadaki kesikli dairede hareket yok.",
      "Bir öğeye tıklamak/dokunmak da bir seviye iner. Telefonda iki parmakla yakınlaş/uzaklaş, tek parmakla sürükle. Üstteki yol (Tüm yıllar › 2026 › …) seçili tarihi gösterir ve geri çıkar.",
      'Son seviye her iki yolda da aynı gün görünümü (eski Gün ayrıntısı): not kendi satırında, rota "Rotayı göster" ile, açıklamalar yalnızca tam ekran görüntüleyicide.',
      "Üstte Zaman / Harita seçimi; ikisi aynı mantıkta. Harita: dünya → ülke → il → gün. Yalnızca anısı olan ülkeye girilir (şimdilik Türkiye); ülkede yalnızca anısı olan iller, daire büyüklüğü medya sayısı; ildeki gün kartları zamandaki gibi; güne inmek zamandaki güne girmekle aynı. Birkaç ili gezen gün her ilde görünür.",
      'Tarihi eksikler: yalnızca yılı bilinen o yılın içinde "Ayı bilinmeyenler", yalnızca ayı bilinen o ayın içinde "Günü bilinmeyenler", tarihsizler en üst seviyede en dışta.',
    ],
    open: [
      "Etiket, il ve tür filtreleri: şimdilik çip olarak duruyor; kullanıcı ayrıca bakacak.",
      "Harita: il ile gün arasında ilçe seviyesi de olsun mu? (Konum il/ilçe tutuluyor; şu an ilçeler atlanıyor.)",
      "Harita: ülke seviyesinde iller daire mi kalsın, yoksa ilin kendi sınırı mı boyansın (medya çoksa koyu)?",
    ],
  },
  {
    slug: "gunluk",
    name: "Günlükler",
    body: (phone) => (
      <div className="grid gap-4">
        <Garden phone={phone} />
        <Diaries phone={phone} />
      </div>
    ),
    why: [
      "Bahçe ve günlükler tek ekranda: üstte bahçe, altta günlükler.",
      "Bahçe izometrik kare bir alan (Forest gibi). Her gün bir kare, merkezden kare spiral halinde dışa; ilk kare 1 Kasım 2026. Çiçek bırakılmayan gün boş kare.",
      "Aynı gün ikimiz de çiçek bıraktıysak ikinci çiçek o güne en yakın boş kareye gider; yalnızca kesinleşmiş (günlükleri kapanmış) günlerin boş kareleri sayılır. Boş kare yoksa spiralin sonuna yeni kare eklenir, sonraki günler bir kayar. Maket taşınan çiçekleri kesik çizgiyle işaretliyor (gerçekte görünmez).",
      "Bir kareye dokununca o günün çiçeği, kimin bıraktığı, anlamı ve günlüğü. Günlüğü silinmiş çiçek kalır, metni yok.",
      "Çiçekler kataloğun Curtis çizimlerinden, arka planı temizlenmiş halleriyle (maket gri).",
      "Yazma alanı her zaman açık. Kendi günlüklerin tek listede: açık olan en üstte vurgulu, altında geçmişler; birine dokununca tam metni açılır.",
      'Partnerin yalnızca açık günlüğü burada (çiçek bırak). Yokken: "D. bugün henüz yazmadı" ve en son bıraktığın çiçek, bahçeye bağlantıyla.',
    ],
    open: [
      'Bahçe her zaman 1 Kasım 2026\'dan mı başlasın, yoksa ilk günlüğün gününden mi (SPEC G9 şu an "ilk günlüğün günü" diyor)?',
      "İkinci çiçeğin yeri: a) kendi gününe en yakın boş kare [O] · b) spiral merkezine en yakın boş kare. İkisinde de yer, gün kesinleşince (iki günlük de kapanınca) bir kez hesaplanıp kalıcı yazılır; sonra hiç değişmez.",
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

// Adding a memory is reached from Anılar, not from the menu.
const MENU = SCREENS.filter((s) => s.slug !== "ani-ekle");
const PHONE_MENU = ["anilar", "gunluk"];

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
                <nav className="grid grid-cols-3 border-t border-neutral-300 bg-neutral-50 text-center text-xs">
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
