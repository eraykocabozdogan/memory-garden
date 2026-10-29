// Builds small previews of the flower plates for places that show many at once (the login
// background). Full plates are ~260 KB each (16 MB for all 61), far too much to load together.
// Usage: pnpm flowers:thumbs   (reads apps/web/public/flowers/art, writes .../flowers/thumb)
import { mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const art = fileURLToPath(new URL("../apps/web/public/flowers/art/", import.meta.url));
const thumb = fileURLToPath(new URL("../apps/web/public/flowers/thumb/", import.meta.url));
const WIDTH = 240;

await mkdir(thumb, { recursive: true });
let total = 0;
for (const file of (await readdir(art)).filter((name) => name.endsWith(".webp"))) {
  const info = await sharp(art + file)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 62 })
    .toFile(thumb + file);
  total += info.size;
}
console.log(`thumbnails written to ${thumb} (${Math.round(total / 1024)} KB total)`);
