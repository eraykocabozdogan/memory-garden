// Builds small derivatives of the flower plates for places that show many at once. Full plates
// are ~260 KB each (16 MB for all 61), far too much to load together.
//   thumb/<id>.webp  240px-wide previews (image backgrounds)
//   collage.webp     one wide collage of plates (the "silk + collage" background)
//   atlas.webp       every plate in an 8×8 grid of 160×256 cells (one WebGL texture for the
//                    3D flower; cell i is plate i in catalog order, see app/lib/plate-atlas.ts)
// Usage: pnpm flowers:thumbs   (reads apps/web/public/flowers/art)
import { readFileSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = new URL("../apps/web/public/flowers/", import.meta.url);
const art = fileURLToPath(new URL("art/", root));
const thumb = fileURLToPath(new URL("thumb/", root));
const catalog = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../packages/shared/src/flowers/catalog-data.json", import.meta.url)),
    "utf8",
  ),
);
const ids = catalog.map((flower) => flower.id);
const PAPER = { r: 250, g: 243, b: 227 };

// Thumbnails.
await mkdir(thumb, { recursive: true });
let total = 0;
for (const file of (await readdir(art)).filter((name) => name.endsWith(".webp"))) {
  const info = await sharp(art + file)
    .resize({ width: 240, withoutEnlargement: true })
    .webp({ quality: 62 })
    .toFile(thumb + file);
  total += info.size;
}
console.log(`thumb/: ${Math.round(total / 1024)} KB total`);

async function grid({ cols, rows, cellW, cellH, gap, order, file, quality }) {
  const width = cols * cellW + (cols + 1) * gap;
  const height = rows * cellH + (rows + 1) * gap;
  const tiles = await Promise.all(
    order.slice(0, cols * rows).map(async (id, i) => ({
      input: await sharp(`${art}${id}.webp`)
        .resize(cellW, cellH, { fit: "cover", position: "top" })
        .toBuffer(),
      left: gap + (i % cols) * (cellW + gap),
      top: gap + Math.floor(i / cols) * (cellH + gap),
    })),
  );
  const info = await sharp({ create: { width, height, channels: 3, background: PAPER } })
    .composite(tiles)
    .webp({ quality })
    .toFile(fileURLToPath(new URL(file, root)));
  console.log(`${file}: ${width}×${height}, ${Math.round(info.size / 1024)} KB`);
}

// A fixed shuffle so neighbouring plates differ.
const shuffled = ids.map((id, i) => ({ id, k: (i * 37) % ids.length }));
shuffled.sort((a, b) => a.k - b.k);
await grid({
  cols: 10,
  rows: 4,
  cellW: 220,
  cellH: 340,
  gap: 6,
  order: shuffled.map((x) => x.id),
  file: "collage.webp",
  quality: 72,
});
await grid({
  cols: 8,
  rows: 8,
  cellW: 160,
  cellH: 256,
  gap: 0,
  order: ids,
  file: "atlas.webp",
  quality: 75,
});
