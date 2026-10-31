import { turkeyProvinces } from "@memory-garden/shared/locations/turkey-locations";
import borders from "../data/borders.json";

import {
  DayView,
  honeycomb,
  MEDIA,
  MONTHS,
  type Placed,
  WEEKDAYS,
  ZoomStage,
} from "./maket-anilar";

// Harita, second round (owner, 2026-10-31): the same zoomable stage as Anılar, by place.
// Four levels: the world → a country → a province's days → one day's media (the same day
// view as in time). Only countries with memories can be entered; for now that is Türkiye,
// as memories abroad are out of scope (SPEC §5). Like the calendar outline in time, real
// borders frame everything here: Natural Earth (public domain), see app/data/borders.json.

type Level =
  | { kind: "world" }
  | { kind: "country" }
  | { kind: "province"; p: string }
  | { kind: "day"; p: string; y: number; m: number; d: number };

type Ring = [number, number][];
type Borders = {
  world: { id: string; name: string; rings: Ring[] }[];
  provinces: { code: string; name: string; rings: Ring[] }[];
};
const BORDERS = borders as unknown as Borders;

// Provinces the stand-in days are spread over, by plate code.
const VISITED = ["34", "35", "48", "07", "06", "50", "61", "65"];

const provinceName = (code: string) => turkeyProvinces.find((p) => p.code === code)?.name ?? code;

/** A plain equirectangular projection, squeezed by the cosine of Türkiye's latitude. */
const SQUEEZE = Math.cos((39 * Math.PI) / 180);
const project = ([lon, lat]: [number, number]) => [lon * SQUEEZE, -lat] as const;

function bounds(rings: Ring[]) {
  const pts = rings.flat().map(project);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/** SVG path for rings, fitted so the box `b` becomes `width` wide, centred on the origin. */
function pathFor(rings: Ring[], b: ReturnType<typeof bounds>, width: number) {
  const k = width / (b.x1 - b.x0);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  return rings
    .map(
      (ring) =>
        `M ${ring
          .map(project)
          .map(([x, y]) => `${((x - cx) * k).toFixed(1)} ${((y - cy) * k).toFixed(1)}`)
          .join(" L ")} Z`,
    )
    .join(" ");
}

const point = (lon: number, lat: number, b: ReturnType<typeof bounds>, width: number) => {
  const k = width / (b.x1 - b.x0);
  const [x, y] = project([lon, lat]);
  return { x: (x - (b.x0 + b.x1) / 2) * k, y: (y - (b.y0 + b.y1) / 2) * k };
};

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
    const stops = i % 4 === 0 ? [i, i + 3] : [i];
    for (const stop of stops) {
      const code = VISITED[stop % VISITED.length] ?? "";
      visits.set(code, [...(visits.get(code) ?? []), day]);
    }
  });
  for (const list of visits.values()) list.sort((a, b) => a.y - b.y || a.m - b.m || a.d - b.d);
  return visits;
})();

const mediaIn = (id: string) => (VISITS.get(id) ?? []).reduce((n, d) => n + d.count, 0);

function layout(level: Level, zoom: (next: Level) => void, phone: boolean): Placed[] {
  const scale = phone ? 0.7 : 1;

  if (level.kind === "world") {
    // Every country is drawn; only one with memories (Türkiye, for now) can be entered.
    const width = 1000 * scale;
    const all = BORDERS.world.flatMap((c) => c.rings);
    const b = bounds(all);
    const count = [...VISITS.keys()].reduce((n, code) => n + mediaIn(code), 0);
    const tr = BORDERS.world.find((c) => c.id === "TUR");
    const label = point(35, 44.5, b, width);
    return [
      {
        key: "world",
        x: 0,
        y: 0,
        node: (
          <svg
            width={width}
            height={((b.y1 - b.y0) / (b.x1 - b.x0)) * width}
            viewBox={`${-width / 2} ${(-((b.y1 - b.y0) / (b.x1 - b.x0)) * width) / 2} ${width} ${((b.y1 - b.y0) / (b.x1 - b.x0)) * width}`}
          >
            <title>Dünya</title>
            {BORDERS.world
              .filter((c) => c.id !== "TUR")
              .map((c) => (
                <path
                  key={c.id + c.name}
                  d={pathFor(c.rings, b, width)}
                  fill="#ececec"
                  stroke="#bdbdbd"
                  strokeWidth={0.6}
                />
              ))}
            {tr && (
              <path
                d={pathFor(tr.rings, b, width)}
                data-zoom="country:tr"
                fill="#525252"
                stroke="#262626"
                className="cursor-pointer"
              />
            )}
          </svg>
        ),
      },
      {
        key: "tr-label",
        x: label.x,
        y: label.y,
        node: (
          <button
            type="button"
            data-zoom="country:tr"
            onClick={() => zoom({ kind: "country" })}
            className="rounded-full border border-neutral-800 bg-white px-2 text-xs font-semibold whitespace-nowrap"
          >
            Türkiye · {count}
          </button>
        ),
      },
    ];
  }

  if (level.kind === "country") {
    // All 81 provinces with their own borders; those with memories darken with their count.
    const width = 1000 * scale;
    const b = bounds(BORDERS.provinces.flatMap((p) => p.rings));
    const height = ((b.y1 - b.y0) / (b.x1 - b.x0)) * width;
    const most = Math.max(...VISITED.map(mediaIn));
    const shade = (n: number) => {
      const t = n / most;
      const v = Math.round(220 - t * 120);
      return `rgb(${v} ${v} ${v})`;
    };
    const placed: Placed[] = [
      {
        key: "provinces",
        x: 0,
        y: 0,
        node: (
          <svg
            width={width}
            height={height}
            viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
          >
            <title>Türkiye illeri</title>
            {BORDERS.provinces.map((p) => {
              const n = mediaIn(p.code);
              const d = pathFor(p.rings, b, width);
              return n === 0 ? (
                <path key={p.code} d={d} fill="#fafafa" stroke="#a3a3a3" strokeWidth={0.7} />
              ) : (
                <path
                  key={p.code}
                  d={d}
                  data-zoom={`province:${p.code}`}
                  fill={shade(n)}
                  stroke="#404040"
                  strokeWidth={1}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
        ),
      },
    ];
    for (const code of VISITED) {
      const n = mediaIn(code);
      const centre = turkeyProvinces.find((p) => p.code === code);
      if (n === 0 || !centre) continue;
      const at = point(centre.longitude, centre.latitude, b, width);
      placed.push({
        key: `label-${code}`,
        x: at.x,
        y: at.y,
        node: (
          <button
            type="button"
            data-zoom={`province:${code}`}
            onClick={() => zoom({ kind: "province", p: code })}
            className="rounded bg-white/85 px-1 text-[0.65rem] leading-tight whitespace-nowrap text-neutral-900"
          >
            {provinceName(code)} · {n}
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
    // The province's own border, sized so its cards sit inside it.
    const rings = BORDERS.provinces.find((p) => p.code === level.p)?.rings ?? [];
    const b = bounds(rings);
    const aspect = (b.y1 - b.y0) / (b.x1 - b.x0);
    // Big enough to hold the cards' block, small enough that the whole province stays in view.
    const width = Math.max(span, tall / aspect) * 1.05;
    const height = width * aspect;
    return [
      {
        key: "outline",
        x: 0,
        y: 0,
        node: (
          <svg
            width={width}
            height={height}
            viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
            aria-hidden="true"
            className="pointer-events-none"
          >
            <path d={pathFor(rings, b, width)} fill="#fafafa" stroke="#404040" strokeWidth={2} />
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
  const weekday = WEEKDAYS[(new Date(level.y, level.m - 1, level.d).getDay() + 6) % 7];
  const date = `${level.d} ${MONTHS[level.m - 1]} ${level.y}, ${weekday}`;
  return [{ key: "day", x: 0, y: 0, node: <DayView phone={phone} date={date} count={count} /> }];
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
