// Builds the plate collage for the "silk + collage" login background: 15 plates in a 5×3 grid
// of large cells, so each plate stays big enough to read on a tablet (a 10×4 grid of small
// cells was too small). Usage: pnpm flowers:collage   (reads apps/web/public/flowers/art)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = new URL("../apps/web/public/flowers/", import.meta.url);
const art = fileURLToPath(new URL("art/", root));
const catalog = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../packages/shared/src/flowers/catalog-data.json", import.meta.url)),
    "utf8",
  ),
);
const PAPER = { r: 250, g: 243, b: 227 };
const COLS = 5;
const ROWS = 3;
const CELL_W = 440;
const CELL_H = 680;
const GAP = 8;

// A fixed shuffle so neighbouring plates differ.
const order = catalog
  .map((flower, i) => ({ id: flower.id, k: (i * 37) % catalog.length }))
  .sort((a, b) => a.k - b.k)
  .map((x) => x.id)
  .slice(0, COLS * ROWS);

const width = COLS * CELL_W + (COLS + 1) * GAP;
const height = ROWS * CELL_H + (ROWS + 1) * GAP;
const tiles = await Promise.all(
  order.map(async (id, i) => ({
    input: await sharp(`${art}${id}.webp`)
      .resize(CELL_W, CELL_H, { fit: "cover", position: "top" })
      .toBuffer(),
    left: GAP + (i % COLS) * (CELL_W + GAP),
    top: GAP + Math.floor(i / COLS) * (CELL_H + GAP),
  })),
);
const info = await sharp({ create: { width, height, channels: 3, background: PAPER } })
  .composite(tiles)
  .webp({ quality: 74 })
  .toFile(fileURLToPath(new URL("collage.webp", root)));
console.log(`collage.webp: ${width}×${height}, ${Math.round(info.size / 1024)} KB`);
