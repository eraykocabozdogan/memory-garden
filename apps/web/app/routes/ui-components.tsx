import { flowerCatalog } from "@memory-garden/shared/flowers/catalog";
import { differenceInCalendarDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
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

// Design-system preview (stage 2, decision 11): working drafts of the components shadcn does not
// cover, hand-written on what the earlier decisions gave us — no new package. Drafts to judge by
// touch, not finished screens: the upload fakes the transfer (the real one is stage 5, signed
// PUTs straight to R2) and the data is stand-in.
// The owner's second round: masonry stays and the separate timeline goes, with the months
// dividing the gallery instead; the viewer gains zoom; the countdown is the herbarium label, picked
// from three shapes.

const PHOTOS = flowerCatalog
  .filter((flower) => flower.artwork)
  .slice(0, 12)
  .map((flower, i) => ({
    id: flower.id,
    name: flower.name,
    src: flower.artwork?.src ?? "",
    // Stand-in dates, newest first, three to a month, so the month rules are visible.
    date: new Date(2026, 9 - Math.floor(i / 3), 26 - (i % 3) * 9),
  }));

export default function UiComponents() {
  return (
    <main className="grid gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl">Özel bileşen taslakları</h1>
        <p className="max-w-prose text-muted-foreground">
          Karar 11. Hepsi elde yazıldı, yeni paket yok: sürükle-bırak yükleme, aylara bölünmüş
          galeri, yakınlaştırmalı tam ekran görüntüleyici ve herbaryum etiketi biçiminde geri sayım
          kartı.
        </p>
      </header>

      <Uploader />
      <Gallery />
      <Countdowns />

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
  preview?: string;
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

  // The object URLs are only for this preview; let them go with the page.
  useEffect(() => {
    return () => {
      for (const file of queue) if (file.preview) URL.revokeObjectURL(file.preview);
    };
  }, [queue]);

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const added = [...files].map((file) => ({
      id: next.current++,
      name: file.name,
      size: file.size,
      // A thumbnail of what was chosen, so a finished row shows the actual photo.
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
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
          16 MB'lık parçalara bölünür.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Taslak:</strong> transfer taklit ediliyor, dosyalar hiçbir yere gitmiyor ve
          aşağıdaki galeriye eklenmiyor. Gerçek yükleme Aşama 5'te.
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
              <li key={file.id} className="flex items-center gap-3 rounded-md border bg-card p-2">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt=""
                    className="size-10 shrink-0 rounded border object-cover"
                  />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded border text-xs text-muted-foreground">
                    video
                  </span>
                )}
                <div className="grid min-w-0 flex-1 gap-1">
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

  // One masonry block per month, so a rule and a month name separate them (the owner's choice
  // over a timeline of its own).
  const months = new Map<string, typeof PHOTOS>();
  for (const item of PHOTOS) {
    const key = format(item.date, "LLLL yyyy", { locale: tr });
    months.set(key, [...(months.get(key) ?? []), item]);
  }

  return (
    <Card data-testid="galeri">
      <CardHeader>
        <CardTitle className="text-base">2 · Galeri ve tam ekran görüntüleyici</CardTitle>
        <p className="text-sm text-muted-foreground">
          Fotoğraflar kendi oranlarını korur (masonry) ve aylar bir çizgiyle ayrılır. Bir anıya
          dokununca tam ekrana açılır: çift dokunarak ya da parmakla sıkıştırarak yakınlaştır,
          kaydırarak gez, Esc ile kapat.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6">
        {[...months].map(([month, items]) => (
          <section key={month} className="grid gap-3">
            <h3 className="flex items-center gap-3 font-heading text-sm tracking-wide text-muted-foreground uppercase">
              {month}
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </h3>
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 2xl:columns-5">
              {items.map((item) =>
                // While the viewer holds this photo's transition name, the tile must not also
                // carry it: a name has to be unique or the browser drops the transition.
                open === item.id ? (
                  <div key={item.id}>
                    <Tile item={item} onOpen={() => show(item.id)} />
                  </div>
                ) : (
                  <ViewTransition key={item.id} name={`foto-${item.id}`}>
                    <div>
                      <Tile item={item} onOpen={() => show(item.id)} />
                    </div>
                  </ViewTransition>
                ),
              )}
            </div>
          </section>
        ))}
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

function Tile({ item, onOpen }: { item: (typeof PHOTOS)[number]; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mb-3 block w-full overflow-hidden rounded-md border bg-card shadow-card"
    >
      <img src={item.src} alt={item.name} className="w-full" />
    </button>
  );
}

const ZOOM_IN = 2.5;

function Viewer({
  photo,
  onStep,
  onClose,
}: {
  photo: (typeof PHOTOS)[number];
  onStep: (by: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // Live pointers, so one finger pans or swipes and two fingers pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const drag = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null);

  // A new photo starts unzoomed and centred.
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const toggleZoom = () => {
    if (zoom > 1) reset();
    else setZoom(ZOOM_IN);
  };

  const spread = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  const down = (event: ReactPointerEvent) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 2) {
      pinch.current = { distance: spread(), zoom };
      drag.current = null;
    } else {
      drag.current = { x: event.clientX, y: event.clientY, offset };
    }
  };

  const move = (event: ReactPointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pinch.current && pointers.current.size === 2) {
      const next = (spread() / pinch.current.distance) * pinch.current.zoom;
      setZoom(Math.min(6, Math.max(1, next)));
      return;
    }
    // Panning only matters once the photo is bigger than the screen.
    if (drag.current && zoom > 1) {
      setOffset({
        x: drag.current.offset.x + (event.clientX - drag.current.x),
        y: drag.current.offset.y + (event.clientY - drag.current.y),
      });
    }
  };

  const up = (event: ReactPointerEvent) => {
    const start = drag.current;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;

    // Unzoomed, a flick of more than a tenth of the screen moves to the next photo.
    if (start && zoom === 1) {
      const dx = event.clientX - start.x;
      if (Math.abs(dx) > window.innerWidth / 10) onStep(dx < 0 ? 1 : -1);
    }
    if (zoom <= 1) setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="grid h-svh w-full grid-rows-[auto_1fr_auto]">
      <div className="flex items-center gap-3 p-3">
        <DialogTitle className="font-heading text-lg">{photo.name}</DialogTitle>
        <span className="text-sm text-muted-foreground">
          {format(photo.date, "d MMMM yyyy", { locale: tr })}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            aria-label="Uzaklaştır"
            onClick={() => setZoom((z) => Math.max(1, z - 0.75))}
          >
            −
          </Button>
          <span className="w-12 text-center text-sm text-muted-foreground" data-testid="zoom">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Yakınlaştır"
            onClick={() => setZoom((z) => Math.min(6, z + 0.75))}
          >
            +
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>

      {/* Flex, not grid: a percentage max-height on a grid item resolves against an auto-sized
          track, which is indefinite, so the photo would ignore it and overflow the row. */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer gestures over the photo; the zoom and step controls below are the keyboard path. */}
      <div
        className="flex min-h-0 touch-none items-center justify-center overflow-hidden px-3"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={toggleZoom}
        onWheel={(event) =>
          setZoom((z) => Math.min(6, Math.max(1, z - Math.sign(event.deltaY) * 0.25)))
        }
      >
        <ViewTransition name={`foto-${photo.id}`}>
          <img
            src={photo.src}
            alt={photo.name}
            draggable={false}
            className="max-h-full max-w-full object-contain"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              cursor: zoom > 1 ? "grab" : "zoom-in",
            }}
          />
        </ViewTransition>
      </div>

      <div className="flex items-center justify-between p-3">
        <Button size="sm" variant="outline" onClick={() => onStep(-1)} aria-label="Önceki anı">
          ←
        </Button>
        <p className="text-sm text-muted-foreground">
          Çift dokun ya da parmaklarını aç: yakınlaşır. Kaydır: gezer.
        </p>
        <Button size="sm" variant="outline" onClick={() => onStep(1)} aria-label="Sonraki anı">
          →
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 11e · countdown

function Countdowns() {
  const [today] = useState(() => new Date());
  const target = new Date(today.getFullYear(), 11, 31);
  const days = Math.max(0, differenceInCalendarDays(target, today));
  const when = format(target, "d MMMM yyyy", { locale: tr });
  const flower = PHOTOS[0];

  return (
    <Card data-testid="geri-sayim" className="max-w-md">
      <CardHeader>
        <CardTitle className="text-base">3 · Geri sayım kartı</CardTitle>
        <p className="text-sm text-muted-foreground">
          Herbaryum etiketi: gün, çiçeğin yanındaki yaprağa yazılmış.
        </p>
      </CardHeader>
      <CardContent>
        {/* A herbarium label: the day is written on the sheet beside its flower. */}
        <figure
          data-testid="sayim"
          className="grid gap-3 rounded-lg border bg-card p-4 shadow-card"
        >
          <img
            src={flower?.src}
            alt=""
            className="h-28 w-full rounded border object-cover object-top"
          />
          <div className="border-2 border-foreground/70 p-3">
            <p className="border-b border-foreground/40 pb-1 text-center text-[0.65rem] tracking-[0.2em] uppercase">
              Yıl dönümü
            </p>
            <p className="pt-2 text-center font-heading text-4xl font-semibold">
              <CountUp to={days} /> <span className="text-base font-normal">gün</span>
            </p>
            <p className="text-center text-sm text-muted-foreground">{when}</p>
          </div>
        </figure>
      </CardContent>
    </Card>
  );
}
