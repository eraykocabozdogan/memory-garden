import {
  type ReactNode,
  type TouchList as ReactTouchList,
  useEffect,
  useRef,
  useState,
} from "react";

// Anılar, second round (owner, 2026-10-31): one zoomable map instead of a list. Four levels:
// every year with its months → one year's months → one month's day cards → one day's media.
// Months keep a real calendar outline (Monday first, ragged first and last week) but nothing
// sits on day squares. Items circle the centre like a watch's app grid, newest in the middle.
// The wheel only changes level; moving the pointer away from the centre pans, faster further
// out, still inside a dead zone. Touch: pinch changes level, one finger drags. Grey on purpose.

type Precision = "day" | "month" | "year" | "none";
type Media = { y?: number; m?: number; d?: number; precision: Precision };

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];
const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Stand-in archive: three years, some months empty, a few items with partial or no dates.
const MEDIA: Media[] = (() => {
  const list: Media[] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (const y of [2024, 2025, 2026]) {
    for (let m = 1; m <= (y === 2026 ? 10 : 12); m++) {
      if (rand() < 0.3) continue; // a month with nothing in it is simply not drawn
      const days = 1 + Math.floor(rand() * 6);
      for (let i = 0; i < days; i++) {
        const d = 1 + Math.floor(rand() * new Date(y, m, 0).getDate());
        const count = 1 + Math.floor(rand() * 9);
        for (let j = 0; j < count; j++) list.push({ y, m, d, precision: "day" });
      }
      if (rand() < 0.25) list.push({ y, m, precision: "month" });
    }
    list.push({ y, precision: "year" });
  }
  list.push({ precision: "none" }, { precision: "none" });
  return list;
})();

type Level =
  | { kind: "years" }
  | { kind: "year"; y: number }
  | { kind: "month"; y: number; m: number }
  | { kind: "day"; y: number; m: number; d: number };

const desc = (a: number, b: number) => b - a;
const unique = (values: number[]) => [...new Set(values)].sort(desc);
const yearsWithMedia = () => unique(MEDIA.flatMap((x) => (x.y === undefined ? [] : [x.y])));
const monthsOf = (y: number) =>
  unique(MEDIA.flatMap((x) => (x.y === y && x.m !== undefined ? [x.m] : [])));
const inMonth = (y: number, m: number) => MEDIA.filter((x) => x.y === y && x.m === m);
const daysOf = (y: number, m: number) =>
  unique(inMonth(y, m).flatMap((x) => (x.d === undefined ? [] : [x.d])));

// --------------------------------------------------------------- hex rings

/** Axial positions spiralling out from the centre: 1, then rings of 6, 12, 18… */
function spiral(count: number) {
  const dirs = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ] as const;
  const out: [number, number][] = [[0, 0]];
  for (let ring = 1; out.length < count; ring++) {
    let q = -ring;
    let r = ring; // start bottom-left, walk the ring
    for (const [dq, dr] of dirs) {
      for (let step = 0; step < ring && out.length < count; step++) {
        out.push([q, r]);
        q += dq;
        r += dr;
      }
    }
  }
  return out.slice(0, count);
}

/** Centres for `count` boxes of w×h laid in a honeycomb (rows offset by half a box). */
function honeycomb(count: number, w: number, h: number, gap: number) {
  return spiral(count).map(([q, r]) => ({ x: (q + r / 2) * (w + gap), y: r * (h + gap) }));
}

// ------------------------------------------------------------ month outline

/** The month's calendar silhouette: Monday-first rows, ragged first and last week. */
function calendarShape(y: number, m: number, cell: number) {
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const days = new Date(y, m, 0).getDate();
  const rows = Math.ceil((offset + days) / 7);
  const end = offset + days - (rows - 1) * 7; // cells used in the last row
  const c = cell;
  const path = [
    `M ${offset * c} 0`,
    `H ${7 * c}`,
    `V ${(rows - 1) * c}`,
    `H ${end * c}`,
    `V ${rows * c}`,
    "H 0",
    `V ${c}`,
    `H ${offset * c}`,
    "Z",
  ].join(" ");
  return { path, width: 7 * c, height: rows * c };
}

let clipId = 0;

/** A month at the two outer levels: its outline filled edge to edge with cropped photos. */
function MonthFrame({
  y,
  m,
  cell,
  onZoom,
}: {
  y: number;
  m: number;
  cell: number;
  onZoom: () => void;
}) {
  const [id] = useState(() => `cal-${clipId++}`);
  const { path, width, height } = calendarShape(y, m, cell);
  const count = inMonth(y, m).length;
  // A loose brick of tiles; the outline crops them, so the month reads as one collage.
  const tiles: { x: number; y: number; w: number; h: number }[] = [];
  const rows = Math.round(height / (cell * 1.5));
  const rowH = height / Math.max(1, rows);
  for (let r = 0; r < rows; r++) {
    let x = r % 2 ? -cell : 0;
    let k = r;
    while (x < width) {
      const w = cell * (1.5 + ((k * 7) % 3) * 0.5);
      tiles.push({ x, y: r * rowH, w, h: rowH });
      x += w;
      k++;
    }
  }
  const shown = Math.min(count, tiles.length);
  const hidden = count - shown;
  return (
    <button
      type="button"
      onClick={onZoom}
      data-zoom={`month:${y}:${m}`}
      className="block text-left"
      style={{ width }}
    >
      <p className="pb-1 text-[0.7rem] font-medium tracking-wide whitespace-nowrap text-neutral-700 uppercase">
        {cell < 15 ? MONTHS[m - 1]?.slice(0, 3) : `${MONTHS[m - 1]} ${y}`} · {count}
      </p>
      <svg width={width} height={height} aria-hidden="true">
        <clipPath id={id}>
          <path d={path} />
        </clipPath>
        <g clipPath={`url(#${id})`}>
          {tiles.slice(0, shown).map((t) => (
            <rect
              key={`${t.x}-${t.y}`}
              x={t.x}
              y={t.y}
              width={t.w}
              height={t.h}
              fill="#d4d4d4"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </g>
        <path d={path} fill="none" stroke="#404040" strokeWidth={1.5} />
        {hidden > 0 && (
          <text x={width - 6} y={height - 6} textAnchor="end" fontSize={cell * 0.45} fill="#404040">
            +{hidden}
          </text>
        )}
      </svg>
    </button>
  );
}

function Tile({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  return (
    <div
      className="grid place-items-center rounded border border-dashed border-neutral-500 bg-neutral-50 p-2 text-center text-xs text-neutral-600"
      style={{ width: w, height: h }}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------ the levels

type Placed = { key: string; x: number; y: number; node: ReactNode };

function layout(level: Level, zoom: (next: Level) => void, phone: boolean): Placed[] {
  const scale = phone ? 0.75 : 1;

  if (level.kind === "years") {
    const cell = 11 * scale;
    const monthW = 7 * cell;
    const years = yearsWithMedia();
    const blocks = years.map((y) => {
      const months = monthsOf(y);
      const spots = honeycomb(months.length, monthW, monthW, 16 * scale);
      return { y, months, spots };
    });
    // Space the years by the widest and tallest block actually drawn, so none overlap.
    const extent = (axis: "x" | "y") =>
      Math.max(...blocks.flatMap((b) => b.spots.map((p) => Math.abs(p[axis])))) * 2 + monthW;
    const blockW = extent("x");
    const blockH = extent("y") + 40;
    const centres = honeycomb(blocks.length + 1, blockW, blockH, 40 * scale);
    const placed: Placed[] = blocks.flatMap(({ y, months, spots }, i) => {
      const c = centres[i] ?? { x: 0, y: 0 };
      const label: Placed = {
        key: `y${y}`,
        x: c.x,
        y: c.y - blockH / 2 + 4,
        node: (
          <button
            type="button"
            data-zoom={`year:${y}`}
            onClick={() => zoom({ kind: "year", y })}
            className="rounded-full border border-neutral-700 bg-white px-3 py-0.5 text-sm font-semibold"
          >
            {y}
          </button>
        ),
      };
      return [
        label,
        ...months.map((m, j) => ({
          key: `${y}-${m}`,
          x: c.x + (spots[j]?.x ?? 0),
          y: c.y + (spots[j]?.y ?? 0),
          node: <MonthFrame y={y} m={m} cell={cell} onZoom={() => zoom({ kind: "year", y })} />,
        })),
      ];
    });
    const last = centres[blocks.length] ?? { x: 0, y: 0 };
    const undated = MEDIA.filter((x) => x.precision === "none").length;
    if (undated > 0) {
      placed.push({
        key: "undated",
        x: last.x,
        y: last.y,
        node: (
          <Tile w={140 * scale} h={90 * scale}>
            Tarihi bilinmeyenler · {undated}
          </Tile>
        ),
      });
    }
    return placed;
  }

  if (level.kind === "year") {
    const cell = 22 * scale;
    const months = monthsOf(level.y);
    const yearOnly = MEDIA.filter((x) => x.y === level.y && x.precision === "year").length;
    const spots = honeycomb(months.length + (yearOnly ? 1 : 0), 7 * cell, 7 * cell, 24 * scale);
    const placed: Placed[] = months.map((m, i) => ({
      key: `${level.y}-${m}`,
      x: spots[i]?.x ?? 0,
      y: spots[i]?.y ?? 0,
      node: (
        <MonthFrame
          y={level.y}
          m={m}
          cell={cell}
          onZoom={() => zoom({ kind: "month", y: level.y, m })}
        />
      ),
    }));
    if (yearOnly) {
      const s = spots[months.length] ?? { x: 0, y: 0 };
      placed.push({
        key: "month-unknown",
        x: s.x,
        y: s.y,
        node: (
          <Tile w={7 * cell} h={5 * cell}>
            Ayı bilinmeyenler · {yearOnly}
          </Tile>
        ),
      });
    }
    return placed;
  }

  if (level.kind === "month") {
    const { y, m } = level;
    const days = daysOf(y, m);
    const noDay = inMonth(y, m).filter((x) => x.precision === "month").length;
    const cardW = 92 * scale;
    const cardH = 112 * scale;
    const spots = honeycomb(days.length + (noDay ? 1 : 0), cardW, cardH, 12);
    const span = Math.max(...spots.map((s) => Math.abs(s.x))) * 2 + cardW * 2;
    const { path, width, height } = calendarShape(y, m, Math.max(span, 6 * cardW) / 7);
    const placed: Placed[] = [
      {
        key: "outline",
        x: 0,
        y: 0,
        node: (
          <svg width={width} height={height} aria-hidden="true" className="pointer-events-none">
            <path d={path} fill="none" stroke="#404040" strokeWidth={2} />
          </svg>
        ),
      },
    ];
    days.forEach((d, i) => {
      const s = spots[i] ?? { x: 0, y: 0 };
      const weekday = WEEKDAYS[(new Date(y, m - 1, d).getDay() + 6) % 7];
      const count = inMonth(y, m).filter((x) => x.d === d).length;
      placed.push({
        key: `d${d}`,
        x: s.x,
        y: s.y,
        node: (
          <button
            type="button"
            data-zoom={`day:${d}`}
            onClick={() => zoom({ kind: "day", y, m, d })}
            className="grid gap-1 rounded border border-neutral-500 bg-white p-1 text-left"
            style={{ width: cardW, height: cardH }}
          >
            <div className="rounded-sm bg-neutral-300" style={{ height: cardH * 0.55 }} />
            <span className="text-[0.7rem] leading-tight text-neutral-800">
              {d} {MONTHS[m - 1]}
              <br />
              <span className="text-neutral-500">
                {weekday} · {count}
              </span>
            </span>
          </button>
        ),
      });
    });
    if (noDay) {
      const s = spots[days.length] ?? { x: 0, y: 0 };
      placed.push({
        key: "day-unknown",
        x: s.x,
        y: s.y,
        node: (
          <Tile w={cardW} h={cardH}>
            Günü bilinmeyenler · {noDay}
          </Tile>
        ),
      });
    }
    return placed;
  }

  // One day: its media as a masonry, the last level.
  const count = inMonth(level.y, level.m).filter((x) => x.d === level.d).length;
  const columns = phone ? 2 : Math.min(4, Math.max(2, count));
  const w = 150 * scale;
  return [
    {
      key: "day",
      x: 0,
      y: 0,
      node: (
        <div className="gap-2" style={{ columnCount: columns, width: columns * (w + 8) }}>
          {Array.from({ length: count }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
              key={i}
              className="mb-2 rounded-sm bg-neutral-300"
              style={{ height: w * (0.8 + ((i * 5) % 4) * 0.25) }}
            />
          ))}
        </div>
      ),
    },
  ];
}

const parentOf = (level: Level): Level | null =>
  level.kind === "day"
    ? { kind: "month", y: level.y, m: level.m }
    : level.kind === "month"
      ? { kind: "year", y: level.y }
      : level.kind === "year"
        ? { kind: "years" }
        : null;

function crumbs(level: Level): { label: string; level: Level }[] {
  const list: { label: string; level: Level }[] = [
    { label: "Tüm yıllar", level: { kind: "years" } },
  ];
  if (level.kind !== "years")
    list.push({ label: `${level.y}`, level: { kind: "year", y: level.y } });
  if (level.kind === "month" || level.kind === "day")
    list.push({
      label: MONTHS[level.m - 1] ?? "",
      level: { kind: "month", y: level.y, m: level.m },
    });
  if (level.kind === "day") list.push({ label: `${level.d} ${MONTHS[level.m - 1]}`, level });
  return list;
}

/** Turns what the pointer is over into the next level down, one step at a time. */
function zoomTarget(level: Level, hit: string | undefined): Level | null {
  if (!hit) return null;
  const [kind, a, b] = hit.split(":");
  if (level.kind === "years" && (kind === "year" || kind === "month"))
    return { kind: "year", y: Number(a) };
  if (level.kind === "year" && kind === "month")
    return { kind: "month", y: Number(a), m: Number(b) };
  if (level.kind === "month" && kind === "day")
    return { kind: "day", y: level.y, m: level.m, d: Number(a) };
  return null;
}

export function MemoriesMap({ phone }: { phone: boolean }) {
  const [level, setLevel] = useState<Level>({ kind: "years" });
  const stage = useRef<HTMLDivElement>(null);
  const camera = useRef({ x: 0, y: 0 });
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const world = useRef<HTMLDivElement>(null);
  const lastZoom = useRef(0);
  const levelRef = useRef(level);
  levelRef.current = level;

  const zoom = (next: Level) => {
    camera.current = { x: 0, y: 0 };
    setLevel(next);
  };
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // Wheel: up = one level in, on what the pointer is over; down = one level out. Never scrolls.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Date.now() - lastZoom.current < 450 || Math.abs(event.deltaY) < 4) return;
      lastZoom.current = Date.now();
      if (event.deltaY > 0) {
        const up = parentOf(levelRef.current);
        if (up) zoomRef.current(up);
        return;
      }
      const hit = (event.target as Element).closest<HTMLElement>("[data-zoom]")?.dataset.zoom;
      const next = zoomTarget(levelRef.current, hit);
      if (next) zoomRef.current(next);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  // Pan by pointer position: nothing inside the dead zone, faster towards the edge.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const element = stage.current;
      const p = pointer.current;
      if (element && p) {
        const { width, height } = element.getBoundingClientRect();
        const dx = p.x - width / 2;
        const dy = p.y - height / 2;
        const dist = Math.hypot(dx, dy);
        const dead = Math.min(width, height) * 0.18;
        const edge = Math.min(width, height) / 2;
        if (dist > dead) {
          const speed = Math.min(1, (dist - dead) / (edge - dead)) * 9;
          camera.current.x += (dx / dist) * speed;
          camera.current.y += (dy / dist) * speed;
        }
      }
      if (world.current) {
        world.current.style.transform = `translate(${-camera.current.x}px, ${-camera.current.y}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Touch: one finger drags, two fingers pinch a level in or out.
  const touch = useRef<{ x: number; y: number; spread?: number } | null>(null);
  const spread = (t: ReactTouchList) =>
    t.length < 2
      ? 0
      : Math.hypot(
          (t[0]?.clientX ?? 0) - (t[1]?.clientX ?? 0),
          (t[0]?.clientY ?? 0) - (t[1]?.clientY ?? 0),
        );

  const placed = layout(level, zoom, phone);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {crumbs(level).map((c, i, all) => (
          <span key={c.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-neutral-400">›</span>}
            <button
              type="button"
              onClick={() => zoom(c.level)}
              className={i === all.length - 1 ? "font-semibold" : "text-neutral-600 underline"}
            >
              {c.label}
            </button>
          </span>
        ))}
        <span className="ml-auto text-xs text-neutral-500">
          {phone
            ? "İki parmak: yakınlaş/uzaklaş · tek parmak: gez"
            : "Tekerlek: yakınlaş/uzaklaş · fareyi kenara götür: gez"}
        </span>
      </div>
      <div
        ref={stage}
        role="application"
        aria-label="Anı haritası"
        className="relative h-[560px] touch-none overflow-hidden rounded border border-neutral-300 bg-white select-none"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        }}
        onMouseLeave={() => {
          pointer.current = null;
        }}
        onTouchStart={(e) => {
          touch.current = {
            x: e.touches[0]?.clientX ?? 0,
            y: e.touches[0]?.clientY ?? 0,
            spread: spread(e.touches),
          };
        }}
        onTouchMove={(e) => {
          const t = touch.current;
          if (!t) return;
          if (e.touches.length === 2 && t.spread) {
            const ratio = spread(e.touches) / t.spread;
            if (ratio > 1.35 || ratio < 0.75) {
              touch.current = null;
              if (ratio < 0.75) {
                const up = parentOf(level);
                if (up) zoom(up);
              } else {
                const mx = ((e.touches[0]?.clientX ?? 0) + (e.touches[1]?.clientX ?? 0)) / 2;
                const my = ((e.touches[0]?.clientY ?? 0) + (e.touches[1]?.clientY ?? 0)) / 2;
                const hit = document.elementFromPoint(mx, my)?.closest<HTMLElement>("[data-zoom]")
                  ?.dataset.zoom;
                const next = zoomTarget(level, hit);
                if (next) zoom(next);
              }
            }
            return;
          }
          const x = e.touches[0]?.clientX ?? 0;
          const y = e.touches[0]?.clientY ?? 0;
          camera.current.x -= x - t.x;
          camera.current.y -= y - t.y;
          touch.current = { ...t, x, y };
        }}
        onTouchEnd={() => {
          touch.current = null;
        }}
      >
        {/* The dead zone, drawn so it can be judged; the real screen would not show it. */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 aspect-square h-[36%] -translate-1/2 rounded-full border border-dashed border-neutral-300" />
        <div
          key={JSON.stringify(level)}
          className="absolute top-1/2 left-1/2 animate-in fade-in zoom-in-95 duration-300"
        >
          <div ref={world}>
            {placed.map((p) => (
              <div key={p.key} className="absolute -translate-1/2" style={{ left: p.x, top: p.y }}>
                {p.node}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
