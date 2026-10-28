// Makes the site's icons from ONE logo image (a PNG with a transparent background, any size, with or without empty margin around the artwork):
//
//   node scripts/make-favicon.mjs <logo.png>
//
// Writes into src/app (Next.js picks these file names up by itself and puts the <link> tags in every page):
//   favicon.ico     16, 32 and 48px in one file (the browser tab, bookmarks; 48px is what Google wants for search results)
//   icon.png        192px, transparent (Android, PWA, search engines; 512px was 207 KB, 192px is a fraction of that)
//   apple-icon.png  180px on WHITE (iPhone/iPad home screen: a transparent icon would get a black background)
//
// The empty margin of the source is trimmed first and replaced by a small even margin, so the artwork is as big as possible in a 16px tab.
// The ICO is written here by hand (a header plus the PNG images), so no extra package is needed.
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/make-favicon.mjs <logo.png>");
  process.exit(1);
}

// the artwork, margin trimmed (pixels that are almost transparent count as margin)
const trimmed = await sharp(input)
  .ensureAlpha()
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
  .toBuffer();

/** The artwork centred on a square canvas, `margin` is the share of the side kept free all around. */
async function square(size, margin, background) {
  const inner = Math.round(size * (1 - 2 * margin));
  const art = await sharp(trimmed).resize({ width: inner, height: inner, fit: "inside", kernel: "lanczos3" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: "centre" }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const white = { r: 255, g: 255, b: 255, alpha: 1 };

writeFileSync("src/app/icon.png", await square(192, 0.03, clear));
writeFileSync("src/app/apple-icon.png", await square(180, 0.08, white));

// favicon.ico: ICONDIR (6 bytes) + one 16-byte entry per image + the PNG images
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => square(size, 0.02, clear)));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type 1 = icon
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((png, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(sizes[i], at); // width
  header.writeUInt8(sizes[i], at + 1); // height
  header.writeUInt8(0, at + 2); // colours in the palette (0 = none)
  header.writeUInt8(0, at + 3); // reserved
  header.writeUInt16LE(1, at + 4); // colour planes
  header.writeUInt16LE(32, at + 6); // bits per pixel
  header.writeUInt32LE(png.length, at + 8); // size of the image data
  header.writeUInt32LE(offset, at + 12); // where the image data starts
  offset += png.length;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...images]));

console.log("src/app/icon.png (192), src/app/apple-icon.png (180, white), src/app/favicon.ico (16, 32, 48)");
