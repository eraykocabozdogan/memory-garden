import { flowerCatalog } from "@memory-garden/shared/flowers/catalog";
import { differenceInCalendarDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  type DragEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { Link } from "react-router";

import { CountUp } from "~/components/count-up";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import type { Route } from "./+types/ui-components";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Özel bileşen taslakları · Memory Garden" },
    { name: "robots", content: "noindex" },
  ];
}

// Design-system preview (stage 2, decision 11): working drafts of the four components shadcn
// does not cover, all hand-written on what earlier decisions already gave us — no new package.
// They are drafts to judge by touch, not the finished screens: the upload here fakes the
// transfer (the real one is stage 5, signed PUTs straight to R2), and the data is stand-in.

const PHOTOS = flowerCatalog
  .filter((flower) => flower.artwork)
  .slice(0, 12)
  .map((flower, i) => ({
    id: flower.id,
    name: flower.name,
    src: flower.artwork?.src ?? "",
    // Stand-in dates, newest first, three to a month, so the grouping is visible.
    date: new Date(2026, 9 - Math.floor(i / 3), 26 - (i % 3) * 9),
  }));

export default function UiComponents() {
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl">Özel bileşen taslakları</h1>
        <p className="text-muted-foreground">
          Karar 11. Dördü de elde yazıldı, yeni paket yok: sürükle-bırak yükleme, galeri, tam ekran
          görüntüleyici, zaman çizelgesi ve geri sayım. Dokunarak dene.
        </p>
      </header>

      <Uploader />
      <Gallery />
      <Timeline />
      <Countdown />

      <div>
        <Button size="sm" variant="ghost" render={<Link to="/ui" />}>
          ← Önizleme
        </Button>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------- 11a · upload

type Upload = {
  id: number;
  name: string;
  size: number;
  progress: number;
  state: "bekliyor" | "yükleniyor" | "bitti" | "iptal";
};

const PART = 16 * 1024 * 1024; // the architecture's multipart part size
const SINGLE = 100 * 1024 * 1024; // above this a file goes up in parts
const PARALLEL = 2; // the architecture uploads at most two files at a time

function human(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Uploader() {
  const [queue, setQueue] = useState<Upload[]>([]);
  const [over, setOver] = useState(false);
  const next = useRef(0);

  // The real transfer is stage 5; here each running file just advances, so the queue, the
  // two-at-a-time rule and the part count can be judged.
  useEffect(() => {
    if (!queue.some((file) => file.state === "yükleniyor")) return;
    const timer = setInterval(() => {
      setQueue((list) =>
        list.map((file) =>
          file.state === "yükleniyor"
            ? file.progress >= 100
              ? { ...file, progress: 100, state: "bitti" as const }
              : { ...file, progress: Math.min(100, file.progress + 7) }
            : file,
        ),
      );
    }, 120);
    return () => clearInterval(timer);
  }, [queue]);

  // Start the next waiting file whenever a slot frees up.
  useEffect(() => {
    const running = queue.filter((file) => file.state === "yükleniyor").length;
    if (running >= PARALLEL) return;
    const waiting = queue.find((file) => file.state === "bekliyor");
    if (!waiting) return;
    setQueue((list) =>
      list.map((file) => (file.id === waiting.id ? { ...file, state: "yükleniyor" } : file)),
    );
  }, [queue]);

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const added = [...files].map((file) => ({
      id: next.current++,
      name: file.name,
      size: file.size,
      progress: 0,
      state: "bekliyor" as const,
    }));
    setQueue((list) => [...list, ...added]);
  };

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    add(event.dataTransfer.files);
  };

  return (
    <Card data-testid="yukleme">
      <CardHeader>
        <CardTitle className="text-base">1 · Dosya yükleme</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sürükle bırak ya da seç. Aynı anda en çok {PARALLEL} dosya yüklenir; 100 MB üstü dosyalar
          16 MB'lık parçalara bölünür. Burada transfer taklit ediliyor.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* The drop area is the file input's own label: clicking anywhere in it opens the
            picker, and the drag handlers sit on an interactive element rather than a bare div. */}
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={drop}
          data-over={over || undefined}
          className="grid cursor-pointer justify-items-center gap-3 rounded-lg border-2 border-dashed border-input p-8 text-center transition-colors data-over:border-primary data-over:bg-accent/40"
        >
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => add(event.target.files)}
          />
          <span className="font-hand text-2xl text-muted-foreground">Anılarını buraya bırak</span>
          <span className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm">
            Dosya seç
          </span>
          <span className="text-xs text-muted-foreground">Fotoğraf (HEIC dahil) ve video</span>
        </label>

        {queue.length > 0 && (
          <ul className="grid gap-2">
            {queue.map((file) => (
              <li key={file.id} className="grid gap-1 rounded-md border bg-card px-3 py-2">
                <div className="flex items-baseline gap-3 text-sm">
                  <span className="truncate">{file.name}</span>
                  <span className="text-muted-foreground">{human(file.size)}</span>
                  {file.size > SINGLE && (
                    <span className="text-xs text-muted-foreground">
                      {Math.ceil(file.size / PART)} parça
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{file.state}</span>
                  {file.state !== "bitti" && file.state !== "iptal" && (
                    <Button
                      size="xs"
                      variant="ghost"
                      aria-label={`${file.name} iptal`}
                      onClick={() =>
                        setQueue((list) =>
                          list.map((item) =>
                            item.id === file.id ? { ...item, state: "iptal" as const } : item,
                          ),
                        )
                      }
                    >
                      İptal
                    </Button>
                  )}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-150"
                    style={{ width: `${file.state === "iptal" ? 0 : file.progress}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------- 11b/11c · gallery and viewer

function Gallery() {
  const [masonry, setMasonry] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const index = PHOTOS.findIndex((photo) => photo.id === open);
  const photo = PHOTOS[index];

  // Opening and closing cross with a view transition, because the photo travels between the
  // grid and the viewer. Stepping from one photo to the next does not: nothing moves, and
  // holding the change behind a transition only makes the arrows feel heavy.
  const show = (id: string | null) => startTransition(() => setOpen(id));
  const step = (by: number) => {
    const target = PHOTOS[(index + by + PHOTOS.length) % PHOTOS.length];
    if (target) setOpen(target.id);
  };

  return (
    <Card data-testid="galeri">
      <CardHeader>
        <CardTitle className="text-base">2 · Galeri ve tam ekran görüntüleyici</CardTitle>
        <p className="text-sm text-muted-foreground">
          Bir anıya dokununca tam ekrana açılır; ok tuşları, kaydırma ve Esc çalışır. Izgara ile
          masonry arasında geçiş yapıp hangisinin daha iyi durduğuna bak.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        <nav aria-label="Galeri düzeni" className="flex gap-2">
          <Button
            size="sm"
            variant={masonry ? "outline" : "default"}
            aria-pressed={!masonry}
            onClick={() => setMasonry(false)}
          >
            Izgara
          </Button>
          <Button
            size="sm"
            variant={masonry ? "default" : "outline"}
            aria-pressed={masonry}
            onClick={() => setMasonry(true)}
          >
            Masonry
          </Button>
        </nav>

        <div
          className={
            masonry ? "columns-2 gap-3 sm:columns-3" : "grid grid-cols-2 gap-3 sm:grid-cols-3"
          }
        >
          {PHOTOS.map((item) =>
            // While the viewer holds this photo's transition name, the tile must not also carry
            // it: a name has to be unique in the document or the browser drops the transition.
            open === item.id ? (
              <div key={item.id}>
                <Tile item={item} masonry={masonry} onOpen={() => show(item.id)} />
              </div>
            ) : (
              <ViewTransition key={item.id} name={`foto-${item.id}`}>
                <div>
                  <Tile item={item} masonry={masonry} onOpen={() => show(item.id)} />
                </div>
              </ViewTransition>
            ),
          )}
        </div>
      </CardContent>

      <Dialog open={Boolean(photo)} onOpenChange={(next) => !next && show(null)}>
        <DialogContent
          showCloseButton={false}
          // Full bleed, and without the dialog's own open/close animation: the view transition
          // is what carries the photo from the grid to here.
          className="inset-0 top-0 left-0 h-svh w-full max-w-none translate-x-0 translate-y-0 rounded-none bg-background p-0 ring-0 sm:max-w-none data-closed:animate-none data-open:animate-none"
          // On the dialog, not on the window: Base UI keeps key events inside the popup for its
          // own focus handling, so a window listener never sees the arrows.
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
        >
          {photo && <Viewer photo={photo} onStep={step} onClose={() => show(null)} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Tile({
  item,
  masonry,
  onOpen,
}: {
  item: (typeof PHOTOS)[number];
  masonry: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={
        masonry
          ? "mb-3 block w-full overflow-hidden rounded-md border bg-card shadow-card"
          : "block w-full overflow-hidden rounded-md border bg-card shadow-card"
      }
    >
      <img
        src={item.src}
        alt={item.name}
        className={masonry ? "w-full" : "aspect-square w-full object-cover object-top"}
      />
    </button>
  );
}

function Viewer({
  photo,
  onStep,
  onClose,
}: {
  photo: (typeof PHOTOS)[number];
  onStep: (by: number) => void;
  onClose: () => void;
}) {
  const start = useRef<number | null>(null);

  return (
    <div
      className="grid h-svh w-full grid-rows-[auto_1fr_auto]"
      onPointerDown={(event) => {
        start.current = event.clientX;
      }}
      onPointerUp={(event) => {
        // A flick of more than a tenth of the screen moves to the next photo.
        if (start.current === null) return;
        const dx = event.clientX - start.current;
        start.current = null;
        if (Math.abs(dx) > window.innerWidth / 10) onStep(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center gap-3 p-3">
        <DialogTitle className="font-heading text-lg">{photo.name}</DialogTitle>
        <span className="text-sm text-muted-foreground">
          {format(photo.date, "d MMMM yyyy", { locale: tr })}
        </span>
        <Button size="sm" variant="ghost" className="ml-auto" onClick={onClose}>
          Kapat
        </Button>
      </div>

      {/* Flex, not grid: a percentage max-height on a grid item resolves against an auto-sized
          track, which is indefinite, so the photo would ignore it and overflow the row. */}
      <div className="flex min-h-0 items-center justify-center overflow-hidden px-3">
        <ViewTransition name={`foto-${photo.id}`}>
          <img src={photo.src} alt={photo.name} className="max-h-full max-w-full object-contain" />
        </ViewTransition>
      </div>

      <div className="flex items-center justify-between p-3">
        <Button size="sm" variant="outline" onClick={() => onStep(-1)} aria-label="Önceki anı">
          ←
        </Button>
        <p className="text-sm text-muted-foreground">Kaydır ya da ok tuşlarını kullan</p>
        <Button size="sm" variant="outline" onClick={() => onStep(1)} aria-label="Sonraki anı">
          →
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- 11d · timeline

function Timeline() {
  // Group by month, newest first: the shape the memories page will have.
  const months = new Map<string, typeof PHOTOS>();
  for (const photo of PHOTOS) {
    const key = format(photo.date, "LLLL yyyy", { locale: tr });
    months.set(key, [...(months.get(key) ?? []), photo]);
  }

  return (
    <Card data-testid="zaman-cizelgesi">
      <CardHeader>
        <CardTitle className="text-base">3 · Zaman çizelgesi</CardTitle>
        <p className="text-sm text-muted-foreground">
          Anılar aya göre gruplanır; ay başlığı kaydırırken üstte kalır.
        </p>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {[...months].map(([month, items]) => (
          <section key={month}>
            <h3 className="sticky top-0 bg-card/95 py-2 font-heading text-sm tracking-wide text-muted-foreground uppercase backdrop-blur">
              {month}
            </h3>
            <ul className="grid gap-2 border-l border-border pb-4 pl-4">
              {items.map((item) => (
                <li key={item.id} className="relative flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -left-[1.3rem] size-2 -translate-y-1/2 rounded-full bg-primary"
                  />
                  <img
                    src={item.src}
                    alt=""
                    className="size-12 rounded-md border object-cover object-top"
                  />
                  <span className="mr-auto">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(item.date, "d MMM", { locale: tr })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------ 11e · countdown

function Countdown() {
  const [today] = useState(() => new Date());
  const target = new Date(today.getFullYear(), 11, 31);
  const days = Math.max(0, differenceInCalendarDays(target, today));

  return (
    <Card data-testid="geri-sayim">
      <CardHeader>
        <CardTitle className="text-base">4 · Geri sayım kartı</CardTitle>
        <p className="text-sm text-muted-foreground">
          Özel günler sayfasındaki kart. Sayı Karar 9-5'in sayacıyla akıyor.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid justify-items-center gap-1 rounded-lg border bg-card p-6 shadow-card">
          <p className="font-hand text-2xl text-muted-foreground">Yıl dönümüne</p>
          <p className="font-heading text-6xl font-semibold">
            <CountUp to={days} />
          </p>
          <p className="text-muted-foreground">gün</p>
          <p className="pt-2 text-sm text-muted-foreground">
            {format(target, "d MMMM yyyy", { locale: tr })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
