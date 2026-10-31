// Builds apps/web/app/data/borders.json: every country (for the world level of the place map)
// and Türkiye's 81 provinces, from Natural Earth (public domain), simplified with
// Douglas-Peucker. Node built-ins only; the zips are downloaded by hand once:
//
//   https://naciscdn.org/naturalearth/110m/cultural/ne_110m_admin_0_countries.zip
//   https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip
//
//   node scripts/natural-earth-borders.mjs <admin0.zip> <admin1.zip>
import { readFileSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const OUT = new URL("../apps/web/app/data/borders.json", import.meta.url);

/** The files inside a zip, by name. Handles stored and deflated entries. */
function unzip(path) {
  const buf = readFileSync(path);
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buf.readUInt16LE(end + 10);
  let pos = buf.readUInt32LE(end + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(pos + 10);
    const size = buf.readUInt32LE(pos + 20);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const local = buf.readUInt32LE(pos + 42);
    const name = buf.toString("utf8", pos + 46, pos + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + size);
    files.set(name, method === 8 ? inflateRawSync(raw) : raw);
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function readDbf(data) {
  const count = data.readUInt32LE(4);
  const headerLen = data.readUInt16LE(8);
  const recordLen = data.readUInt16LE(10);
  const fields = [];
  for (let pos = 32; data[pos] !== 0x0d; pos += 32) {
    fields.push([data.toString("latin1", pos, pos + 11).replace(/\0.*$/, ""), data[pos + 16]]);
  }
  const rows = [];
  for (let i = 0; i < count; i++) {
    let off = headerLen + i * recordLen + 1;
    const row = {};
    for (const [name, len] of fields) {
      row[name] = data
        .toString("utf8", off, off + len)
        .replace(/[\0\s]+$/, "")
        .trim();
      off += len;
    }
    rows.push(row);
  }
  return rows;
}

function readShp(data) {
  const shapes = [];
  let pos = 100;
  while (pos < data.length) {
    const len = data.readUInt32BE(pos + 4) * 2;
    const c = pos + 8;
    pos = c + len;
    if (data.readInt32LE(c) !== 5) {
      shapes.push([]);
      continue;
    }
    const partsN = data.readInt32LE(c + 36);
    const pointsN = data.readInt32LE(c + 40);
    const parts = Array.from({ length: partsN }, (_, i) => data.readInt32LE(c + 44 + 4 * i));
    parts.push(pointsN);
    const base = c + 44 + 4 * partsN;
    const pt = (i) => [data.readDoubleLE(base + 16 * i), data.readDoubleLE(base + 16 * i + 8)];
    shapes.push(
      parts
        .slice(0, -1)
        .map((from, i) =>
          Array.from({ length: (parts[i + 1] ?? from) - from }, (_, k) => pt(from + k)),
        ),
    );
  }
  return shapes;
}

function layer(path) {
  const files = unzip(path);
  const find = (ext) => [...files].find(([n]) => n.endsWith(ext))?.[1];
  return { shapes: readShp(find(".shp")), rows: readDbf(find(".dbf")) };
}

function simplify(points, tol) {
  if (points.length < 4) return points;
  const keep = points.map((_, i) => i === 0 || i === points.length - 1);
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const norm = Math.hypot(dx, dy);
    let best = -1;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      // A closed ring starts and ends on the same point: measure from that point instead.
      const d =
        norm < 1e-12
          ? Math.hypot(px - ax, py - ay)
          : Math.abs(dy * px - dx * py + bx * ay - by * ax) / norm;
      if (d > best) {
        best = d;
        idx = i;
      }
    }
    if (best > tol && idx > 0) {
      keep[idx] = true;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const round = (n, digits) => Math.round(n * 10 ** digits) / 10 ** digits;
const rings = (shape, tol, digits) =>
  shape
    .map((ring) => simplify(ring, tol))
    .filter((ring) => ring.length >= 4)
    .map((ring) => ring.map(([x, y]) => [round(x, digits), round(y, digits)]));

const [admin0, admin1] = process.argv.slice(2);
if (!admin0 || !admin1) {
  console.error("Usage: node scripts/natural-earth-borders.mjs <admin0.zip> <admin1.zip>");
  process.exit(1);
}

const countries = layer(admin0);
const world = countries.shapes
  .map((shape, i) => ({
    id: countries.rows[i].ADM0_A3,
    name: countries.rows[i].NAME,
    rings: rings(shape, 0.25, 1),
  }))
  .filter((c) => c.rings.length > 0);

const states = layer(admin1);
const provinces = states.shapes
  .map((shape, i) => ({ shape, row: states.rows[i] }))
  .filter(({ row }) => row.adm0_a3 === "TUR")
  .map(({ shape, row }) => ({
    code: row.iso_3166_2.replace("TR-", ""),
    name: row.name,
    rings: rings(shape, 0.012, 3),
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(
  OUT,
  JSON.stringify({
    source:
      "Natural Earth (public domain): ne_110m_admin_0_countries, ne_10m_admin_1_states_provinces",
    world,
    provinces,
  }),
);
console.log(`${world.length} countries, ${provinces.length} provinces → ${OUT.pathname}`);
