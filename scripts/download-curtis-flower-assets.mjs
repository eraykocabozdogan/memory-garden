import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import artwork from "../features/flowers/curtis-artwork.json" with { type: "json" };

const outputDirectory = path.join(process.cwd(), "public", "flowers", "curtis");
const userAgent = "ikimize flower catalog/1.0 (Wikimedia Commons asset import)";
const apiUrl = "https://commons.wikimedia.org/w/api.php";

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithRetry(url) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": userAgent } });
    if (response.ok) return response;
    if (attempt === 5) throw new Error(`Download failed (${response.status}): ${url}`);
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN;
    await pause(Number.isFinite(retryAfter) ? retryAfter * 1_000 : attempt * 10_000);
  }
  throw new Error(`Download failed: ${url}`);
}

async function querySourceImages(fileNames, width) {
  const url = new URL(apiUrl);
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", fileNames.map((fileName) => `File:${fileName}`).join("|"));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size");
  url.searchParams.set("iiurlwidth", String(width));
  url.searchParams.set("format", "json");

  const body = await (await fetchWithRetry(url)).json();
  return new Map(
    Object.values(body.query?.pages ?? {}).map((page) => [
      page.title.replace(/^File:/, ""),
      page.imageinfo?.[0],
    ]),
  );
}

async function getSourceImages(fileNames) {
  const sourceImages = await querySourceImages(fileNames, 1200);
  const unscaledFileNames = fileNames.filter((fileName) =>
    sourceImages.get(fileName)?.thumburl?.includes("thumbnail_unscaled"),
  );
  if (unscaledFileNames.length === 0) return sourceImages;

  const smallerThumbnails = await querySourceImages(unscaledFileNames, 600);
  for (const [fileName, imageInfo] of smallerThumbnails) sourceImages.set(fileName, imageInfo);
  return sourceImages;
}

await mkdir(outputDirectory, { recursive: true });

const downloaded = new Map();
const sourceImages = await getSourceImages([...new Set(artwork.map(({ fileName }) => fileName))]);

for (const [index, entry] of artwork.entries()) {
  const outputPath = path.join(outputDirectory, `${entry.id}.webp`);
  try {
    await access(outputPath);
    process.stdout.write(`[${index + 1}/${artwork.length}] ${entry.id} (existing)\n`);
    continue;
  } catch {
    // Download missing generated assets only.
  }

  let sourceBuffer = downloaded.get(entry.fileName);
  if (!sourceBuffer) {
    const source = sourceImages.get(entry.fileName);
    if (!source?.thumburl) throw new Error(`No Wikimedia image found for ${entry.fileName}`);
    sourceBuffer = Buffer.from(
      await (await fetchWithRetry(source.thumburl)).arrayBuffer(),
    );
    downloaded.set(entry.fileName, sourceBuffer);
    await pause(1_500);
  }

  const image = await sharp(sourceBuffer)
    .rotate()
    .resize({ width: 1280, height: 1900, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toBuffer();

  await writeFile(outputPath, image);
  process.stdout.write(`[${index + 1}/${artwork.length}] ${entry.id}\n`);
}
