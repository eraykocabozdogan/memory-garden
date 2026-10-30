// Packs the cut-out flowers into one sheet for the login background: as much flower and as little
// empty space as possible (the owner's request). Overlap is allowed; each flower goes where it
// covers the most still-empty ground.
// Usage: pnpm flowers:bouquet            dense, 93% covered -> bouquet.webp
//        pnpm flowers:bouquet 0.72 seyrek  looser, so the silk shows between the flowers
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = new URL("../apps/web/public/flowers/", import.meta.url);
const cutDir = fileURLToPath(new URL("cutout/", root));
const target = Number(process.argv[2] ?? 0.93);
const suffix = process.argv[3] ? `-${process.argv[3]}` : "";
const out = fileURLToPath(new URL(`bouquet${suffix}.webp`, root));
const idsOut = fileURLToPath(
  new URL("../packages/shared/src/flowers/cutouts.json", import.meta.url),
);

// Plates whose cut-out is poor, so they would show as pale ghosts or leftover paper blobs:
// near-white flowers the paper threshold cannot separate (white rose, white lilac, white lily,
// narcissus, tulip, lavender, apple blossom, white poppy, periwinkle), scans with a printed
// frame or a heavy border (sunflower, balsam, snapdragon), and plates that are already tight
// crops, so they cut off square (two rose buds). `pnpm flowers:cutout` still writes them.
const SKIP = new Set([
  "antirrhinum",
  "crocus-sativus",
  "helianthus",
  "impatiens-balsamina",
  "lavandula-angustifolia",
  "lilium-beyaz",
  "magnolia-grandiflora",
  "malus-cicek",
  "narcissus",
  "narcissus-pseudonarcissus",
  "papaver-somniferum-beyaz",
  "rosa-beyaz",
  "rosa-beyaz-tomurcuk",
  "rosa-tomurcuk",
  "rosa-yari-acmis",
  "syringa-beyaz",
  "tulipa",
  "vinca",
]);

const WIDTH = 2200;
const HEIGHT = 1600;
const GRID = 8; // the coverage map runs at 1/8 scale
const TARGET = target; // stop once this much of the sheet is covered
const ROUNDS = 4; // passes over the catalogue, each one smaller than the last
const SCALES = [0.5, 0.36, 0.26, 0.18]; // flower height as a share of the sheet height
const TILT = [-14, -7, 0, 7, 14];

const gw = Math.ceil(WIDTH / GRID);
const gh = Math.ceil(HEIGHT / GRID);
const covered = new Uint8Array(gw * gh);
let coveredCount = 0;

const ids = readdirSync(cutDir)
  .map((f) => f.replace(".webp", ""))
  .filter((id) => !SKIP.has(id));
// A fixed shuffle: the sheet is a build artefact, so it must come out the same every time.
const shuffled = ids
  .map((id, i) => ({ id, k: (i * 37) % ids.length }))
  .sort((a, b) => a.k - b.k)
  .map((x) => x.id);

function score(mask, mw, mh, left, top) {
  let gain = 0;
  for (let y = 0; y < mh; y++) {
    const gy = top + y;
    if (gy < 0 || gy >= gh) continue;
    for (let x = 0; x < mw; x++) {
      const gx = left + x;
      if (gx < 0 || gx >= gw) continue;
      if (mask[y * mw + x] && !covered[gy * gw + gx]) gain++;
    }
  }
  return gain;
}

function apply(mask, mw, mh, left, top) {
  for (let y = 0; y < mh; y++) {
    const gy = top + y;
    if (gy < 0 || gy >= gh) continue;
    for (let x = 0; x < mw; x++) {
      const gx = left + x;
      if (gx < 0 || gx >= gw) continue;
      if (mask[y * mw + x] && !covered[gy * gw + gx]) {
        covered[gy * gw + gx] = 1;
        coveredCount++;
      }
    }
  }
}

const placements = [];
for (let round = 0; round < ROUNDS && coveredCount / covered.length < TARGET; round++) {
  const scale = SCALES[round];
  for (const id of shuffled) {
    if (coveredCount / covered.length >= TARGET) break;
    const tilt = TILT[(placements.length * 3) % TILT.length];
    const height = Math.round(HEIGHT * scale);
    const buffer = await sharp(`${cutDir}${id}.webp`)
      .resize({ height, withoutEnlargement: false })
      .rotate(tilt, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const meta = await sharp(buffer).metadata();
    const raw = await sharp(buffer)
      .resize(
        Math.max(1, Math.round(meta.width / GRID)),
        Math.max(1, Math.round(meta.height / GRID)),
      )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const mw = raw.info.width;
    const mh = raw.info.height;
    const mask = new Uint8Array(mw * mh);
    for (let p = 0; p < mask.length; p++)
      mask[p] = raw.data[p * raw.info.channels + 3] > 110 ? 1 : 0;

    // Try a coarse lattice of positions, keep the one that fills the most empty ground.
    let best = { gain: -1, left: 0, top: 0 };
    const step = Math.max(4, Math.round(Math.min(mw, mh) / 3));
    for (let top = -Math.round(mh / 3); top < gh - Math.round(mh / 3); top += step) {
      for (let left = -Math.round(mw / 3); left < gw - Math.round(mw / 3); left += step) {
        const gain = score(mask, mw, mh, left, top);
        if (gain > best.gain) best = { gain, left, top };
      }
    }
    if (best.gain <= 0) continue;
    apply(mask, mw, mh, best.left, best.top);

    // sharp only composites images that fit inside the sheet at a non-negative offset, so the
    // part that hangs over an edge is cut off here instead.
    const px = best.left * GRID;
    const py = best.top * GRID;
    const sx = Math.max(0, -px);
    const sy = Math.max(0, -py);
    const w = Math.min(meta.width - sx, WIDTH - Math.max(0, px));
    const h = Math.min(meta.height - sy, HEIGHT - Math.max(0, py));
    if (w <= 0 || h <= 0) continue;
    const cropped =
      sx === 0 && sy === 0 && w === meta.width && h === meta.height
        ? buffer
        : await sharp(buffer).extract({ left: sx, top: sy, width: w, height: h }).png().toBuffer();
    placements.push({ input: cropped, left: Math.max(0, px), top: Math.max(0, py) });
  }
}

const info = await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(placements)
  .webp({ quality: 80, alphaQuality: 90 })
  .toFile(out);

if (!existsSync(out)) throw new Error(`bouquet${suffix}.webp yazılamadı`);
// The login background's other view shows a single cut-out, drawn from this same list.
writeFileSync(idsOut, `${JSON.stringify(ids, null, 2)}\n`);
console.log(
  `bouquet${suffix}.webp: ${WIDTH}×${HEIGHT}, ${placements.length} çiçek, kaplama %${((coveredCount / covered.length) * 100).toFixed(1)}, ${Math.round(info.size / 1024)} KB`,
);
