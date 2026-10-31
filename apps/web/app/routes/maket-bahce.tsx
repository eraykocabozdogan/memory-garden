import { useState } from "react";

import { MONTHS } from "./maket-anilar";

// Bahçe (owner, 2026-10-31): an isometric square garden like the Forest app. One square per
// day, laid in a square spiral out from the centre, the first square being 1 November 2026.
// A day with no flower is an empty square; a day with a flower holds it. When both of us left
// a flower the same day, the second one goes to the empty square nearest that day, doubles
// taken in order from the centre out, so the garden is not filled from the middle. A flower
// whose diary was deleted stays, without the text. Grey stand-ins for the catalogue cut-outs.

const START = new Date(2026, 10, 1);
const DAYS = 110; // the stand-in garden runs to mid-February 2027
const FLOWERS = ["Papatya", "Lavanta", "Gül", "Menekşe", "Lale", "Sümbül", "Nergis", "Karanfil"];

type Flower = { name: string; by: "E." | "D."; deleted: boolean; day: number; moved: boolean };

/** Grid positions of a square spiral: right 1, down 1, left 2, up 2, right 3… */
function squareSpiral(count: number) {
  const out: [number, number][] = [[0, 0]];
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ] as const;
  let x = 0;
  let y = 0;
  for (let leg = 0; out.length < count; leg++) {
    const [dx, dy] = dirs[leg % 4] ?? [1, 0];
    const steps = Math.floor(leg / 2) + 1;
    for (let s = 0; s < steps && out.length < count; s++) {
      x += dx;
      y += dy;
      out.push([x, y]);
    }
  }
  return out;
}

function grow() {
  let seed = 11;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cells = squareSpiral(DAYS);
  // What was left each day: none, one, or one from each of us.
  const left: Flower[][] = Array.from({ length: DAYS }, (_, day) => {
    const r = rand();
    const n = r < 0.35 ? 0 : r < 0.85 ? 1 : 2;
    return Array.from({ length: n }, (_, k) => ({
      name: FLOWERS[Math.floor(rand() * FLOWERS.length)] ?? "Papatya",
      by: k === 0 ? (rand() < 0.5 ? "E." : "D.") : "D.",
      deleted: rand() < 0.08,
      day,
      moved: false,
    }));
  });
  const square: Flower[][] = left.map((list) => list.slice(0, 1));
  // Second flowers, in order from the centre: each to the empty square nearest its own day.
  left.forEach((list, day) => {
    const extra = list[1];
    if (!extra) return;
    const [ox, oy] = cells[day] ?? [0, 0];
    let best = -1;
    let bestD = Number.POSITIVE_INFINITY;
    square.forEach((held, i) => {
      if (held.length > 0) return;
      const [x, y] = cells[i] ?? [0, 0];
      const d = (x - ox) ** 2 + (y - oy) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) square[best] = [{ ...extra, moved: true }];
    else square[day]?.push(extra); // no empty square left: it stays beside its pair
  });
  return { cells, square };
}

const GARDEN = grow();

const dateOf = (day: number) => {
  const d = new Date(START);
  d.setDate(d.getDate() + day);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export function Garden({ phone }: { phone: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  const tw = phone ? 34 : 48;
  const th = tw / 2;
  const { cells, square } = GARDEN;
  const iso = cells.map(([x, y]) => ({ left: (x - y) * (tw / 2), top: (x + y) * (th / 2) }));
  const minL = Math.min(...iso.map((p) => p.left));
  const minT = Math.min(...iso.map((p) => p.top));
  const width = Math.max(...iso.map((p) => p.left)) - minL + tw;
  const height = Math.max(...iso.map((p) => p.top)) - minT + th + tw;
  const flowers = square.flat().length;
  const shown = picked === null ? [] : (square[picked] ?? []);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2 text-xs text-neutral-700">
        <span className="rounded border border-neutral-400 px-2 py-0.5">{flowers} çiçek</span>
        <span className="rounded border border-neutral-400 px-2 py-0.5">İlk gün: {dateOf(0)}</span>
        <span className="rounded border border-neutral-400 px-2 py-0.5">
          Bugün: {dateOf(DAYS - 1)}
        </span>
      </div>
      <div className="overflow-auto rounded border border-neutral-300 bg-white p-4">
        <div className="relative mx-auto" style={{ width, height }}>
          {cells.map((_, i) => {
            const p = iso[i] ?? { left: 0, top: 0 };
            const held = square[i] ?? [];
            const today = i === DAYS - 1;
            return (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: one square per day, fixed order
                key={i}
                type="button"
                aria-label={`${dateOf(i)}${held[0] ? `, ${held[0].name}` : ", boş"}`}
                onClick={() => setPicked(i)}
                className="absolute"
                style={{
                  left: p.left - minL,
                  top: p.top - minT + tw,
                  width: tw,
                  height: th,
                  // Nearer squares (lower on screen) draw over farther ones; never below zero.
                  zIndex: Math.round(p.top - minT) + 1,
                }}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(50% 6%, 97% 50%, 50% 94%, 3% 50%)",
                    background: picked === i ? "#a3a3a3" : today ? "#d4d4d4" : "#ececec",
                    outline: "1px solid #fff",
                  }}
                />
                {held.map((f, k) => (
                  <span
                    key={`${f.day}-${f.by}`}
                    className="absolute flex flex-col items-center"
                    style={{ left: tw * (0.32 + k * 0.2), bottom: th * 0.45, width: tw * 0.36 }}
                  >
                    {/* A flower stand-in: a head on a stem; a dashed head is a moved second flower. */}
                    <span
                      className="rounded-full"
                      style={{
                        width: tw * 0.32,
                        height: tw * 0.32,
                        background: f.deleted ? "#e5e5e5" : "#737373",
                        border: f.moved ? "1.5px dashed #262626" : "1.5px solid #262626",
                      }}
                    />
                    <span style={{ width: 1.5, height: tw * 0.36, background: "#525252" }} />
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </div>
      <div className="rounded border border-neutral-400 bg-neutral-100 p-2 text-xs text-neutral-700">
        {picked === null
          ? "Bir kareye dokun: o günün çiçeği, kimin bıraktığı, anlamı ve günlüğü."
          : shown.length === 0
            ? `${dateOf(picked)} · çiçek bırakılmadı`
            : shown.map((f) => (
                <p key={`${f.day}-${f.by}`}>
                  <span className="font-medium">{f.name}</span> · {dateOf(f.day)} · {f.by} bıraktı
                  {f.moved ? ` · o günün ikinci çiçeği, en yakın boş kareye kondu` : ""}
                  {f.deleted ? " · günlük silindi, yalnızca çiçek kaldı" : " · günlüğü oku →"}
                </p>
              ))}
      </div>
    </div>
  );
}
