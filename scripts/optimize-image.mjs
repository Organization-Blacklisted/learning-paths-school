// Turns a photo into the AVIF the site serves: crop, resize, encode, then MEASURE what the encoding cost. The recipe is the one every photo
// of the site was made with (docs/16 and the section docs): AVIF, 4:4:4 colour, effort 6, quality chosen so the result stays at about
// 45 dB or more against the source (PSNR), and served as it is (`unoptimized`), because next/image would re-encode it at quality 75.
//
//   node scripts/optimize-image.mjs <input> --out <file.avif> [options]
//
//   --out <file>        where to write the AVIF (e.g. public/images/home/news/news-4.avif). Required unless --dry.
//   --width <px>        resize to this width, keeping the proportions.
//   --size <WxH>        resize AND crop to exactly this size (cover, centred), e.g. 636x406. Use the box the photo fills in the design at 2x.
//   --crop <x,y,w,h>    cut this region out of the SOURCE first (pixels), before resizing; for photos the design shows cropped or shifted.
//   --quality <1-100>   AVIF quality (default 95).
//   --auto              instead of a fixed quality, find the LOWEST quality that still meets --min-db (smaller files, same rule).
//   --min-db <dB>       the fidelity to keep (default 45). The script warns, and exits with 1, when the result is below it.
//   --alpha             keep transparency (for cut-out photos); otherwise any alpha channel is removed.
//   --dry               measure only, write nothing.
//
// Examples:
//   node scripts/optimize-image.mjs raw/choir.jpg --out public/images/home/ecosystem/choir.avif --size 1900x664 --auto
//   node scripts/optimize-image.mjs raw/chess.jpg --out public/images/home/courage/chess.avif --width 440 --quality 95
//   node scripts/optimize-image.mjs raw/pioneers.png --out public/images/home/framework/pioneers.avif --alpha --quality 95
//
// Photos for the Open Graph preview are NOT made with this: social sites do not read AVIF (use a 1200 x 630 JPG or PNG).
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: "string" },
    width: { type: "string" },
    size: { type: "string" },
    crop: { type: "string" },
    quality: { type: "string", default: "95" },
    auto: { type: "boolean", default: false },
    "min-db": { type: "string", default: "45" },
    alpha: { type: "boolean", default: false },
    dry: { type: "boolean", default: false },
  },
});

const [input] = positionals;
const fail = (message) => {
  console.error(`optimize-image: ${message}\nSee the header of scripts/optimize-image.mjs for the options.`);
  process.exit(2);
};
if (!input) fail("no input file given.");
if (!values.out && !values.dry) fail("--out is required (or use --dry).");
const minDb = Number(values["min-db"]);
if (!Number.isFinite(minDb)) fail("--min-db must be a number.");

// ---- the reference: the source after cropping and resizing (what the encoder is given), as raw pixels
let pipeline = sharp(input, { failOn: "error" }).rotate(); // .rotate() applies the EXIF orientation of camera photos
if (values.crop) {
  const [left, top, width, height] = values.crop.split(",").map(Number);
  if ([left, top, width, height].some((n) => !Number.isInteger(n))) fail("--crop must be four whole numbers: x,y,w,h.");
  pipeline = pipeline.extract({ left, top, width, height });
}
if (values.size) {
  const [width, height] = values.size.toLowerCase().split("x").map(Number);
  if (!width || !height) fail("--size must look like 636x406.");
  pipeline = pipeline.resize({ width, height, fit: "cover", position: "centre", kernel: "lanczos3" });
} else if (values.width) {
  pipeline = pipeline.resize({ width: Number(values.width), kernel: "lanczos3" });
}
if (!values.alpha) pipeline = pipeline.removeAlpha();

const { data: reference, info } = await pipeline.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const pixels = info.width * info.height;

/** Fidelity of an encoded file against the reference: PSNR over the colour channels of the visible pixels, and the share of values off by more than 4 of 255. */
async function measure(buffer) {
  const decoded = await sharp(buffer).ensureAlpha().raw().toBuffer();
  let squares = 0;
  let values = 0;
  let off = 0;
  for (let p = 0; p < pixels; p++) {
    const i = p * 4;
    if (reference[i + 3] === 0) continue; // fully transparent: its colour is never seen
    for (let c = 0; c < 3; c++) {
      const d = reference[i + c] - decoded[i + c];
      squares += d * d;
      values++;
      if (Math.abs(d) > 4) off++;
    }
  }
  const mse = squares / Math.max(1, values);
  return { db: mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse), off: (100 * off) / Math.max(1, values) };
}

const encode = (quality) => pipeline.clone().avif({ quality, effort: 6, chromaSubsampling: "4:4:4" }).toBuffer();

let quality = Number(values.quality);
let buffer = await encode(quality);
let result = await measure(buffer);

if (values.auto) {
  // Fidelity rises with quality, so search for the lowest quality that still meets the target (about 6 encodes).
  let low = 50;
  let high = 100;
  let best = null;
  while (low <= high) {
    const mid = Math.round((low + high) / 2);
    const candidate = await encode(mid);
    const measured = await measure(candidate);
    if (measured.db >= minDb) {
      best = { quality: mid, buffer: candidate, ...measured };
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  if (best) ({ quality, buffer, ...result } = best);
  else console.warn(`No quality up to 100 reaches ${minDb} dB for this image (the source may be very grainy): using ${quality}.`);
}

if (!values.dry) {
  mkdirSync(dirname(values.out), { recursive: true });
  writeFileSync(values.out, buffer);
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const inputSize = statSync(input).size;
const verdict = result.db >= minDb ? "OK" : `BELOW ${minDb} dB`;
console.log(
  `${values.dry ? "[dry run] " : ""}${input}  ${kb(inputSize)}  ->  ${values.out ?? "(not written)"}  ${info.width}x${info.height}  ${kb(buffer.length)}\n` +
    `  quality ${quality}${values.auto ? " (found by --auto)" : ""}, ${result.db.toFixed(1)} dB, ${result.off.toFixed(2)}% of colour values off by more than 4  [${verdict}]`,
);
process.exitCode = result.db >= minDb ? 0 : 1;
