import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import artwork from "../packages/shared/src/flowers/flower-artwork.json" with { type: "json" };

// Usage: pnpm flowers:assets [--force] [id ...]
// Without --force only missing images are generated. Passing ids limits the run to those entries.
const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIds = new Set(args.filter((arg) => !arg.startsWith("--")));
const entries = artwork.filter(({ id }) => onlyIds.size === 0 || onlyIds.has(id));

const outputDirectory = path.join(
  import.meta.dirname,
  "..",
  "apps",
  "web",
  "public",
  "flowers",
  "art",
);
const userAgent = "MemoryGarden/1.0 (https://github.com/eraykocabozdogan/memory-garden)";
const apiUrl = "https://commons.wikimedia.org/w/api.php";
const sourceWidth = 2400;
// A crop keeps at least this many source pixels across, so small details stay sharp.
const minimumCropWidth = 1400;

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithRetry(url) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": userAgent } });
    if (response.ok) return response;
    if (attempt === 6) throw new Error(`Download failed (${response.status}): ${url}`);
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN;
    await pause(Number.isFinite(retryAfter) ? retryAfter * 1_000 : attempt * 10_000);
  }
  throw new Error(`Download failed: ${url}`);
}

async function querySourceImages(fileNames, width = sourceWidth) {
  const sourceImages = new Map();
  for (let index = 0; index < fileNames.length; index += 40) {
    const url = new URL(apiUrl);
    url.searchParams.set("action", "query");
    url.searchParams.set(
      "titles",
      fileNames
        .slice(index, index + 40)
        .map((fileName) => `File:${fileName}`)
        .join("|"),
    );
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url|size");
    url.searchParams.set("iiurlwidth", String(width));
    url.searchParams.set("format", "json");

    const body = await (await fetchWithRetry(url)).json();
    for (const page of Object.values(body.query?.pages ?? {})) {
      sourceImages.set(page.title.replace(/^File:/, "").replaceAll("_", " "), page.imageinfo?.[0]);
    }
  }
  return sourceImages;
}

function requiredWidth(entry) {
  return entry.crop ? Math.ceil(minimumCropWidth / entry.crop.width) : sourceWidth;
}

// Narrow crops need a larger rendition than the default; Commons caps a rendition at the original size.
async function upgradeRenditions(sourceImages, pendingEntries) {
  for (const entry of pendingEntries) {
    const imageInfo = sourceImages.get(entry.fileName);
    if (!imageInfo) continue;
    const width = Math.min(imageInfo.width, requiredWidth(entry));
    if (width <= (imageInfo.thumbwidth ?? imageInfo.width)) continue;
    const [larger] = (await querySourceImages([entry.fileName], width)).values();
    if (larger) sourceImages.set(entry.fileName, larger);
  }
}

function sourceUrl(imageInfo) {
  // Commons returns the original instead of a thumbnail when the original is narrower.
  return imageInfo.thumburl ?? imageInfo.url;
}

async function cropRegion(buffer, crop) {
  if (!crop) return buffer;
  const { width, height } = await sharp(buffer).metadata();
  return sharp(buffer)
    .extract({
      left: Math.round(crop.left * width),
      top: Math.round(crop.top * height),
      width: Math.round(crop.width * width),
      height: Math.round(crop.height * height),
    })
    .toBuffer();
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

await mkdir(outputDirectory, { recursive: true });

const pending = [];
for (const entry of entries) {
  const outputPath = path.join(outputDirectory, `${entry.id}.webp`);
  if (!force && (await exists(outputPath))) continue;
  pending.push({ ...entry, outputPath });
}

const sourceImages = await querySourceImages([...new Set(pending.map(({ fileName }) => fileName))]);
await upgradeRenditions(sourceImages, pending);
const downloaded = new Map();

for (const [index, entry] of pending.entries()) {
  let sourceBuffer = downloaded.get(entry.fileName);
  if (!sourceBuffer) {
    const imageInfo = sourceImages.get(entry.fileName);
    if (!imageInfo) throw new Error(`No Wikimedia image found for ${entry.fileName}`);
    sourceBuffer = Buffer.from(await (await fetchWithRetry(sourceUrl(imageInfo))).arrayBuffer());
    downloaded.set(entry.fileName, sourceBuffer);
    await pause(1_500);
  }

  const cropped = await cropRegion(await sharp(sourceBuffer).rotate().toBuffer(), entry.crop);
  const image = await sharp(cropped)
    .resize({ width: 1280, height: 1900, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toBuffer();

  await writeFile(entry.outputPath, image);
  process.stdout.write(`[${index + 1}/${pending.length}] ${entry.id}\n`);
}

if (pending.length === 0) process.stdout.write("All flower images already exist.\n");
