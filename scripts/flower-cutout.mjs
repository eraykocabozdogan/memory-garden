// Cuts each Curtis plate's flower out of its paper, so the login background can show flowers
// instead of yellow paper. Writes alpha-channel WebP files to apps/web/public/flowers/cutout/.
// Usage: pnpm flowers:cutout [id ...]   (no ids = the whole catalog)
//
// How it works, per plate:
//   1. Read the paper colour as the median of the border pixels.
//   2. Drop every paper-coloured pixel, wherever it is, so the paper trapped between leaves goes
//      too. The paper is yellow, so even cream petals stay on the flower side of the threshold.
//   3. Flood-fill from the border with a looser threshold, for stained or shaded paper the strict
//      threshold misses.
//   4. Drop small leftover islands (the engraved captions: "No. 841", "Pub. by W. Curtis").
//   5. Feather the mask by a pixel or two, then trim to what is left.
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = new URL("../apps/web/public/flowers/", import.meta.url);
const artDir = fileURLToPath(new URL("art/", root));
const outDir = fileURLToPath(new URL("cutout/", root));
const catalog = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../packages/shared/src/flowers/catalog-data.json", import.meta.url)),
    "utf8",
  ),
);

const MAX_EDGE = 1400; // working and output resolution
const BORDER = 10; // ring of pixels read as "this is the paper"
const FILL = 34; // colour distance that still counts as paper anywhere on the plate
const STAIN = 52; // looser distance, used only for paper connected to the border
const HUE = 20; // how far a stain may stray from the paper's yellowness (red minus blue)
const EDGE = 62; // colour distance that is certainly not paper (used for the soft edge)
const ISLAND = 0.02; // keep islands at least this big relative to the largest one

function paperColour(data, width, height) {
  const rs = [];
  const gs = [];
  const bs = [];
  const push = (x, y) => {
    const i = (y * width + x) * 3;
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  };
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < BORDER; x++) push(x, y);
    for (let x = 0; x < BORDER; x++) push(width - 1 - x, y);
  }
  for (let x = 0; x < width; x += 2) {
    for (let y = 0; y < BORDER; y++) push(x, y);
    for (let y = 0; y < BORDER; y++) push(x, height - 1 - y);
  }
  const median = (xs) => xs.sort((a, b) => a - b)[xs.length >> 1];
  return [median(rs), median(gs), median(bs)];
}

// Chebyshev distance to the paper colour: the engravings are darker and more saturated than the
// paper, and this keeps aged, blotchy paper on the paper side.
function distanceField(data, width, height, paper) {
  const dist = new Uint8Array(width * height);
  // Aged paper is yellow: red sits well above blue. White petals do not, which keeps the loose
  // "stain" pass from eating a white lily.
  const yellow = new Uint8Array(width * height);
  const paperYellow = paper[0] - paper[2];
  for (let p = 0, i = 0; p < dist.length; p++, i += 3) {
    const d = Math.max(
      Math.abs(data[i] - paper[0]),
      Math.abs(data[i + 1] - paper[1]),
      Math.abs(data[i + 2] - paper[2]),
    );
    dist[p] = d > 255 ? 255 : d;
    yellow[p] = Math.abs(data[i] - data[i + 2] - paperYellow) <= HUE ? 1 : 0;
  }
  return { dist, yellow };
}

// Paper anywhere on the plate, plus whatever the border flood reaches with the looser threshold.
function backgroundMask(dist, yellow, width, height) {
  const bg = new Uint8Array(width * height);
  for (let p = 0; p < bg.length; p++) if (dist[p] < FILL) bg[p] = 1;
  const stack = [];
  const push = (p) => {
    if (!bg[p] && dist[p] < STAIN && yellow[p]) {
      bg[p] = 1;
      stack.push(p);
    }
  };
  for (let p = 0; p < bg.length; p++) if (bg[p]) stack.push(p);
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % width;
    if (x > 0) push(p - 1);
    if (x < width - 1) push(p + 1);
    if (p >= width) push(p - width);
    if (p < dist.length - width) push(p + width);
  }
  return bg;
}

// Labels what is left and keeps only the big islands, so captions and specks fall away.
function dropIslands(bg, width, height) {
  const seen = new Uint8Array(width * height);
  const islands = [];
  for (let start = 0; start < seen.length; start++) {
    if (bg[start] || seen[start]) continue;
    const pixels = [];
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const p = stack.pop();
      pixels.push(p);
      const x = p % width;
      const step = (q) => {
        if (!bg[q] && !seen[q]) {
          seen[q] = 1;
          stack.push(q);
        }
      };
      if (x > 0) step(p - 1);
      if (x < width - 1) step(p + 1);
      if (p >= width) step(p - width);
      if (p < seen.length - width) step(p + width);
    }
    islands.push(pixels);
  }
  const largest = islands.reduce((m, is) => Math.max(m, is.length), 0);
  const killed = new Uint8Array(width * height);
  let dropped = 0;
  for (const island of islands) {
    if (island.length >= largest * ISLAND) continue;
    dropped++;
    for (const p of island) {
      bg[p] = 1;
      killed[p] = 1; // ink, not paper: the soft edge must not bring it back
    }
  }
  return { islands: islands.length, dropped, killed };
}

async function cutout(id) {
  const image = sharp(`${artDir}${id}.webp`).resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const paper = paperColour(data, width, height);
  const { dist, yellow } = distanceField(data, width, height, paper);
  const bg = backgroundMask(dist, yellow, width, height);
  const { islands, dropped, killed } = dropIslands(bg, width, height);

  // Soft edge: inside the flower the alpha is full; where paper was removed it fades out with
  // the colour distance, so the cut does not leave a hard sawtooth line.
  const alpha = new Uint8Array(width * height);
  for (let p = 0; p < alpha.length; p++) {
    if (!bg[p]) {
      alpha[p] = 255;
      continue;
    }
    if (killed[p]) {
      alpha[p] = 0;
      continue;
    }
    const t = (dist[p] - FILL) / (EDGE - FILL);
    alpha[p] = t <= 0 ? 0 : t >= 1 ? 255 : Math.round(t * t * (3 - 2 * t) * 255);
  }
  // sharp hands a blurred one-channel buffer back as three channels, so read it with its stride.
  const soft = await sharp(Buffer.from(alpha), { raw: { width, height, channels: 1 } })
    .blur(1.2)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const stride = soft.info.channels;

  const rgba = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    rgba[p * 4] = data[p * 3];
    rgba[p * 4 + 1] = data[p * 3 + 1];
    rgba[p * 4 + 2] = data[p * 3 + 2];
    rgba[p * 4 + 3] = soft.data[p * stride];
  }
  const info2 = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(`${outDir}${id}.webp`);

  const kept = alpha.reduce((n, a) => n + (a > 127 ? 1 : 0), 0);
  return {
    id,
    paper,
    islands,
    dropped,
    cover: kept / (width * height),
    size: info2.size,
    out: `${info2.width}×${info2.height}`,
  };
}

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : catalog.map((flower) => flower.id);
mkdirSync(outDir, { recursive: true });
for (const id of ids) {
  const r = await cutout(id);
  console.log(
    `${r.id.padEnd(28)} ${r.out.padStart(10)}  kâğıt rgb(${r.paper})  ada ${r.islands} (${r.dropped} atıldı)  çiçek %${(r.cover * 100).toFixed(1)}  ${Math.round(r.size / 1024)} KB`,
  );
}
