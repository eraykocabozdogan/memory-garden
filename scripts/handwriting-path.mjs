// Turns the fixed handwritten lines into SVG paths, so they can be animated as if a pen were
// drawing them (decision 9, candidate 9-3b). A left-to-right mask only uncovers finished
// letters; following the glyph's own outline is what reads as writing.
// Usage: pnpm handwriting
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import opentype from "opentype.js";
import wawoff from "wawoff2";

// The static Caveat, not the variable one the app loads for display: opentype.js reads the
// variable font's outlines as .notdef boxes. Fontsource splits a face into subsets, and basic
// Latin and the Turkish letters live in different files, so both are loaded and each character
// is drawn with whichever one has it.
const require = createRequire(import.meta.url);
const SUBSETS = ["latin", "latin-ext"];
const out = fileURLToPath(new URL("../apps/web/app/lib/handwriting.json", import.meta.url));

const LINES = ["Her anı bir çiçek…"];
const SIZE = 100; // path units; CSS scales the SVG, so this is only precision
const PAD = 8;

// One at a time: wawoff2's wasm module does not survive concurrent calls.
const fonts = [];
for (const subset of SUBSETS) {
  const file = require.resolve(`@fontsource/caveat/files/caveat-${subset}-400-normal.woff2`);
  const ttf = Buffer.from(await wawoff.decompress(readFileSync(file)));
  fonts.push(opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength)));
}

function fontFor(char) {
  const code = char.codePointAt(0);
  return fonts.find((font) => font.tables.cmap?.glyphIndexMap?.[code] !== undefined);
}

/** Draws the line character by character, keeping each glyph's own advance. */
function draw(text, originX, originY) {
  const path = new opentype.Path();
  let x = originX;
  let previous = null;
  for (const char of text) {
    const font = fontFor(char);
    if (!font) {
      console.warn(`uyarı: "${char}" hiçbir alt kümede yok, atlandı`);
      continue;
    }
    const glyph = font.charToGlyph(char);
    if (previous?.font === font)
      x += font.getKerningValue(previous.glyph, glyph) * (SIZE / font.unitsPerEm);
    path.extend(glyph.getPath(x, originY, SIZE));
    x += (glyph.advanceWidth * SIZE) / font.unitsPerEm;
    previous = { font, glyph };
  }
  return path;
}

/** Splits "M…M…" path data into one entry per contour: a dash pattern restarts at every M, so
    a single path cannot be drawn progressively. Each contour animates on its own instead. */
function contours(d) {
  return d
    .split(/(?=M)/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Rough length of a contour, by walking its points. Good enough to share the time out so the
    pen moves at a steady speed instead of spending as long on a dot as on a letter. */
function length(d) {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let total = 0;
  for (let i = 2; i + 1 < numbers.length; i += 2) {
    total += Math.hypot(numbers[i] - numbers[i - 2], numbers[i + 1] - numbers[i - 1]);
  }
  return Math.round(total);
}

const lines = LINES.map((text) => {
  const box = draw(text, 0, 0).getBoundingBox();
  // Move the drawing to the origin so the viewBox is tight around the letters.
  const path = draw(text, -box.x1 + PAD, -box.y1 + PAD);
  const d = path.toPathData(2);
  const strokes = contours(d).map((part) => ({ d: part, length: length(part) }));
  return {
    text,
    d,
    strokes,
    width: Math.ceil(box.x2 - box.x1 + PAD * 2),
    height: Math.ceil(box.y2 - box.y1 + PAD * 2),
  };
});

writeFileSync(out, `${JSON.stringify(lines, null, 2)}\n`);
for (const line of lines) {
  console.log(
    `"${line.text}" → ${line.width}×${line.height}, ${line.strokes.length} kontur, ${line.d.length} karakter yol`,
  );
}
