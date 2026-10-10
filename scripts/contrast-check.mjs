// Checks WCAG contrast for the colour tokens in a theme CSS file (oklch values, as exported
// by tweakcn). Usage: node scripts/contrast-check.mjs apps/web/app/theme.css
// Reads the `:root` (light) and `.dark` blocks; exits 1 if any pair is below its threshold.
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/contrast-check.mjs <theme.css>");
  process.exit(2);
}

function parseBlock(css, selector) {
  const match = css.match(new RegExp(`${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`));
  const tokens = {};
  for (const [, name, l, c, h] of (match?.[1] ?? "").matchAll(
    /--([\w-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/g,
  )) {
    tokens[name] = { l: Number(l), c: Number(c), h: Number(h) };
  }
  return tokens;
}

function linearRgb({ l, c, h }) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

const luminance = (color) => {
  const [r, g, b] = linearRgb(color).map((v) => Math.min(1, Math.max(0, v)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum ratio]. 7 for body text, 4.5 for other text (WCAG AA),
// 3 for UI boundaries and focus rings (WCAG 1.4.11).
const PAIRS = [
  ["foreground", "background", 7],
  ["card-foreground", "card", 7],
  ["popover-foreground", "popover", 7],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive-foreground", "destructive", 4.5],
  ["destructive", "background", 4.5],
  ["primary", "background", 4.5],
  ["ring", "background", 3],
  ["input", "background", 3],
];

const css = readFileSync(file, "utf8");
let failures = 0;
for (const [mode, selector] of [
  ["light", ":root"],
  ["dark", ".dark"],
]) {
  const tokens = parseBlock(css, selector);
  console.log(`\n${mode}`);
  for (const [fg, bg, min] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      console.log(`  skip ${fg} on ${bg} (token missing)`);
      continue;
    }
    const ratio = contrast(tokens[fg], tokens[bg]);
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${fg} on ${bg}: ${ratio.toFixed(2)} (need ${min})`);
  }
}
console.log(failures === 0 ? "\nAll pairs pass." : `\n${failures} pair(s) below threshold.`);
process.exit(failures === 0 ? 0 : 1);
