// Audits public/images against the rules the site's speed depends on. Runs in `npm run check`, the pre-commit hook and CI, so a heavy or
// wrongly-made image is stopped when it is added, not found later in a Lighthouse report.
//
//   npm run images:check
//
// Rules (change the numbers below, and say why in docs/24, if the design really needs more):
//   1. Photos are AVIF. A JPG, PNG or WebP photo is refused (make it with scripts/optimize-image.mjs). The one exception is the Open Graph
//      preview picture in public/images/og/, because social sites do not read AVIF.
//   2. One photo weighs at most MAX_PHOTO_KB. The heaviest today is the Ecosystem choir, 359 KB.
//   3. All photos together weigh at most MAX_TOTAL_KB (4.3 MB today).
//   4. A photo is at most MAX_WIDTH pixels wide: more is wasted bytes (the design's widest photo is 1920px).
//   5. An SVG weighs at most MAX_SVG_KB (the logo is 127 KB: if the designer sends a cleaner export, lower it).
import { readdirSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import sharp from "sharp";

const ROOT = "public/images";
const MAX_PHOTO_KB = 400;
const MAX_TOTAL_KB = 6 * 1024;
const MAX_WIDTH = 2400;
const MAX_SVG_KB = 150;
const OG_FOLDER = `public${sep}images${sep}og${sep}`;
const RASTER = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const problems = [];
const photos = [];
let svgCount = 0;

for (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  const kb = statSync(file).size / 1024;
  const name = relative(".", file).split(sep).join("/");

  if (ext === ".svg") {
    svgCount++;
    if (kb > MAX_SVG_KB)
      problems.push(`${name}: SVG is ${kb.toFixed(0)} KB (limit ${MAX_SVG_KB}). Optimise it with svgo, see scripts/README.md.`);
    continue;
  }
  if (!RASTER.has(ext)) continue;

  const isOg = file.startsWith(OG_FOLDER) || file.includes(OG_FOLDER);
  if (ext !== ".avif" && !isOg) {
    problems.push(
      `${name}: ${ext} photo. Photos must be AVIF: node scripts/optimize-image.mjs ${name} --out ${name.replace(/\.\w+$/, ".avif")} --auto`,
    );
    continue;
  }
  if (isOg) continue; // the social preview picture is exempt from the photo budget and format rules

  const { width, height } = await sharp(file).metadata();
  photos.push({ name, kb, width, height });
  if (kb > MAX_PHOTO_KB)
    problems.push(
      `${name}: ${kb.toFixed(0)} KB (limit ${MAX_PHOTO_KB}). Re-make it smaller: node scripts/optimize-image.mjs <source> --out ${name} --auto`,
    );
  if (width > MAX_WIDTH) problems.push(`${name}: ${width}px wide (limit ${MAX_WIDTH}). Resize it to about twice the size it is shown at.`);
}

const total = photos.reduce((sum, p) => sum + p.kb, 0);
if (total > MAX_TOTAL_KB)
  problems.push(`All photos together: ${(total / 1024).toFixed(1)} MB (limit ${(MAX_TOTAL_KB / 1024).toFixed(1)} MB).`);

const heaviest = [...photos]
  .sort((a, b) => b.kb - a.kb)
  .slice(0, 3)
  .map((p) => `${p.name.replace(`${ROOT}/`, "")} ${p.kb.toFixed(0)} KB`);
console.log(
  `${photos.length} photos, ${(total / 1024).toFixed(1)} MB in all (limit ${(MAX_TOTAL_KB / 1024).toFixed(1)} MB); ${svgCount} SVGs. Heaviest: ${heaviest.join(", ")}.`,
);
if (problems.length) {
  console.error(`\n${problems.length} image problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Image budget OK.");
