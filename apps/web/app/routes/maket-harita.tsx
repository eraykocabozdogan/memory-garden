import { honeycomb, MEDIA, MONTHS, type Placed, WEEKDAYS, ZoomStage } from "./maket-anilar";

// Harita, second round (owner, 2026-10-31): the same zoomable stage as Anılar, by place.
// Four levels: the world → a country → a province's days → one day's media (the same day
// view as in time). Only countries with memories can be entered; for now that is Türkiye,
// as memories abroad are out of scope (SPEC §5). Outlines are rough hand-drawn shapes here;
// the real screen would draw true borders.

type Level =
  | { kind: "world" }
  | { kind: "country" }
  | { kind: "province"; p: string }
  | { kind: "day"; p: string; y: number; m: number; d: number };

// Rough positions on a 1000×420 Türkiye outline.
const PROVINCES: { id: string; name: string; x: number; y: number }[] = [
  { id: "istanbul", name: "İstanbul", x: 175, y: 70 },
  { id: "izmir", name: "İzmir", x: 95, y: 215 },
  { id: "mugla", name: "Muğla", x: 140, y: 300 },
  { id: "antalya", name: "Antalya", x: 300, y: 320 },
  { id: "ankara", name: "Ankara", x: 400, y: 150 },
  { id: "nevsehir", name: "Nevşehir", x: 520, y: 210 },
  { id: "trabzon", name: "Trabzon", x: 760, y: 70 },
  { id: "van", name: "Van", x: 900, y: 230 },
];

const TURKEY =
  "M 30 120 L 120 60 L 230 40 L 330 70 L 480 60 L 620 50 L 760 40 L 880 70 L 970 120 L 960 230 L 930 300 L 820 320 L 700 330 L 560 360 L 430 350 L 330 380 L 220 360 L 120 340 L 60 290 L 40 210 Z";

/** The days each province appears on: every full-date day falls in one or two provinces. */
const VISITS = (() => {
  const days = new Map<string, { y: number; m: number; d: number; count: number }>();
  for (const x of MEDIA) {
    if (x.precision !== "day" || x.y === undefined || x.m === undefined || x.d === undefined)
      continue;
    const key = `${x.y}-${x.m}-${x.d}`;
    const day = days.get(key) ?? { y: x.y, m: x.m, d: x.d, count: 0 };
    day.count++;
    days.set(key, day);
  }
  const visits = new Map<string, { y: number; m: number; d: number; count: number }[]>();
  [...days.values()].forEach((day, i) => {
    // A day can cover a route through several provinces; it shows in each of them.
    const stops =
      i % 4 === 0 ? [i % PROVINCES.length, (i + 3) % PROVINCES.length] : [i % PROVINCES.length];
    for (const s of stops) {
      const id = PROVINCES[s]?.id ?? "";
      visits.set(id, [...(visits.get(id) ?? []), day]);
    }
  });
  for (const list of visits.values()) list.sort((a, b) => a.y - b.y || a.m - b.m || a.d - b.d);
  return visits;
})();

const provinceName = (id: string) => PROVINCES.find((p) => p.id === id)?.name ?? id;
const mediaIn = (id: string) => (VISITS.get(id) ?? []).reduce((n, d) => n + d.count, 0);

function layout(level: Level, zoom: (next: Level) => void, phone: boolean): Placed[] {
  const scale = phone ? 0.7 : 1;

  if (level.kind === "world") {
    // Continents as grey blobs; Türkiye, the only country with memories, is the one way in.
    const blobs = [
      { d: "M -420 -120 q 80 -60 160 -20 q 40 80 -20 160 q -90 40 -140 -40 z", label: "" },
      { d: "M -300 60 q 60 -10 80 60 q -20 90 -70 100 q -40 -60 -10 -160 z", label: "" },
      { d: "M -60 -130 q 70 -30 110 10 q -10 40 -60 50 q -40 -10 -50 -60 z", label: "" },
      { d: "M -50 -20 q 70 0 90 70 q -10 100 -70 110 q -50 -80 -20 -180 z", label: "" },
      { d: "M 80 -140 q 200 -40 300 30 q 20 90 -120 110 q -160 -20 -180 -140 z", label: "" },
      { d: "M 300 100 q 60 0 80 40 q -30 40 -80 30 q -20 -40 0 -70 z", label: "" },
    ];
    const count = [...VISITS.keys()].reduce((n, id) => n + mediaIn(id), 0);
    return [
      {
        key: "world",
        x: 0,
        y: 0,
        node: (
          <svg
            width={900 * scale}
            height={420 * scale}
            viewBox="-450 -210 900 420"
            aria-hidden="true"
          >
            {blobs.map((b) => (
              <path key={b.d} d={b.d} fill="#e5e5e5" stroke="#a3a3a3" />
            ))}
          </svg>
        ),
      },
      {
        key: "tr",
        x: 75 * scale,
        y: -85 * scale,
        node: (
          <button
            type="button"
            data-zoom="country:tr"
            onClick={() => zoom({ kind: "country" })}
            className="rounded border-2 border-neutral-800 bg-neutral-300 px-2 py-1 text-xs font-semibold"
          >
            Türkiye · {count}
          </button>
        ),
      },
    ];
  }

  if (level.kind === "country") {
    const k = 0.9 * scale;
    const placed: Placed[] = [
      {
        key: "outline",
        x: 0,
        y: 0,
        node: (
          <svg width={1000 * k} height={420 * k} viewBox="0 0 1000 420" aria-hidden="true">
            <path d={TURKEY} fill="#f5f5f5" stroke="#404040" strokeWidth={2} />
          </svg>
        ),
      },
    ];
    // Only provinces with memories are drawn; the bigger the circle, the more media.
    for (const p of PROVINCES) {
      const n = mediaIn(p.id);
      if (n === 0) continue;
      const r = Math.min(46, 14 + Math.sqrt(n) * 3.2) * scale;
      placed.push({
        key: p.id,
        x: (p.x - 500) * k,
        y: (p.y - 210) * k,
        node: (
          <button
            type="button"
            data-zoom={`province:${p.id}`}
            onClick={() => zoom({ kind: "province", p: p.id })}
            className="grid place-items-center rounded-full border-2 border-neutral-700 bg-neutral-300 text-center text-[0.65rem] leading-tight"
            style={{ width: r * 2, height: r * 2 }}
          >
            {p.name}
            <br />
            {n}
          </button>
        ),
      });
    }
    return placed;
  }

  if (level.kind === "province") {
    const days = VISITS.get(level.p) ?? [];
    const cardW = 96 * scale;
    const cardH = 116 * scale;
    const spots = honeycomb(days.length, cardW, cardH, 12);
    const span = Math.max(...spots.map((s) => Math.abs(s.x)), 0) * 2 + cardW * 2;
    const tall = Math.max(...spots.map((s) => Math.abs(s.y)), 0) * 2 + cardH * 2;
    // A rough province outline drawn around its day cards.
    const outline = `M ${-span / 2} ${-tall / 4} Q ${-span / 2.2} ${-tall / 2} 0 ${-tall / 2} Q ${span / 2.4} ${-tall / 1.9} ${span / 2} ${-tall / 6} Q ${span / 1.9} ${tall / 3} ${span / 4} ${tall / 2} Q ${-span / 3} ${tall / 1.8} ${-span / 2} ${tall / 5} Z`;
    return [
      {
        key: "outline",
        x: 0,
        y: 0,
        node: (
          <svg
            width={span * 1.1}
            height={tall * 1.15}
            viewBox={`${-span * 0.55} ${-tall * 0.575} ${span * 1.1} ${tall * 1.15}`}
            aria-hidden="true"
            className="pointer-events-none"
          >
            <path d={outline} fill="#fafafa" stroke="#404040" strokeWidth={2} />
          </svg>
        ),
      },
      ...days.map((day, i) => {
        const s = spots[i] ?? { x: 0, y: 0 };
        const weekday = WEEKDAYS[(new Date(day.y, day.m - 1, day.d).getDay() + 6) % 7];
        return {
          key: `${day.y}-${day.m}-${day.d}`,
          x: s.x,
          y: s.y,
          node: (
            <button
              type="button"
              data-zoom={`day:${day.y}:${day.m}:${day.d}`}
              onClick={() => zoom({ kind: "day", p: level.p, ...day })}
              className="grid gap-1 rounded border border-neutral-500 bg-white p-1 text-left"
              style={{ width: cardW, height: cardH }}
            >
              <div className="rounded-sm bg-neutral-300" style={{ height: cardH * 0.5 }} />
              <span className="text-[0.7rem] leading-tight text-neutral-800">
                {day.d} {MONTHS[day.m - 1]} {day.y}
                <br />
                <span className="text-neutral-500">
                  {weekday} · {day.count}
                </span>
              </span>
            </button>
          ),
        };
      }),
    ];
  }

  // One day: the same view as entering a day by time.
  const count =
    (VISITS.get(level.p) ?? []).find((d) => d.y === level.y && d.m === level.m && d.d === level.d)
      ?.count ?? 0;
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
    ? { kind: "province", p: level.p }
    : level.kind === "province"
      ? { kind: "country" }
      : level.kind === "country"
        ? { kind: "world" }
        : null;

function crumbs(level: Level): { label: string; level: Level }[] {
  const list: { label: string; level: Level }[] = [{ label: "Dünya", level: { kind: "world" } }];
  if (level.kind !== "world") list.push({ label: "Türkiye", level: { kind: "country" } });
  if (level.kind === "province" || level.kind === "day")
    list.push({ label: provinceName(level.p), level: { kind: "province", p: level.p } });
  if (level.kind === "day")
    list.push({ label: `${level.d} ${MONTHS[level.m - 1]} ${level.y}`, level });
  return list;
}

function zoomTarget(level: Level, hit: string | undefined): Level | null {
  if (!hit) return null;
  const [kind, a, b, c] = hit.split(":");
  if (level.kind === "world" && kind === "country") return { kind: "country" };
  if (level.kind === "country" && kind === "province" && a) return { kind: "province", p: a };
  if (level.kind === "province" && kind === "day")
    return { kind: "day", p: level.p, y: Number(a), m: Number(b), d: Number(c) };
  return null;
}

export function PlaceMap({ phone }: { phone: boolean }) {
  return (
    <ZoomStage<Level>
      label="Yer haritası"
      start={{ kind: "world" }}
      phone={phone}
      layout={(level, zoom) => layout(level, zoom, phone)}
      parentOf={parentOf}
      zoomTarget={zoomTarget}
      crumbs={crumbs}
    />
  );
}
