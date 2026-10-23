// Visual regression over the whole home page: walks down the page at five screen sizes, takes a screenshot at every half screen of
// scroll (so pinned scenes are captured at every stage of their animation too), and compares them with a saved baseline.
//
//   npm run qa:snapshot:save     take the baseline (run it BEFORE a refactor, on the same build)
//   npm run qa:snapshot          compare the current site with the baseline; differences are written to .qa/diff/
//
// Needs the production build running (npm run qa:serve). The hero slideshow moves by itself, so the first screen of each size is
// only compared loosely. Pass --only=390 to run a single width. URL: QA_URL (default http://localhost:3002).
import { mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const BASE = process.env.QA_URL ?? "http://localhost:3002";
const SAVE = process.argv.includes("--save");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const ROOT = ".qa";
const DIRS = { baseline: join(ROOT, "baseline"), current: join(ROOT, "current"), diff: join(ROOT, "diff") };

const SIZES = [
  { name: "1920", opts: { viewport: { width: 1920, height: 993 } } },
  { name: "1440", opts: { viewport: { width: 1440, height: 900 } } },
  { name: "1024", opts: { viewport: { width: 1024, height: 768 } } },
  { name: "768", opts: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
  { name: "390", opts: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
].filter((s) => !ONLY || s.name === ONLY);

// Both images are shrunk to a quarter before comparing, so a text line moved by a pixel or two (smooth scrolling settles to a
// sub-pixel) does not count, while a missing, moved or recoloured element does. A pixel counts as different when its colour moved
// by more than this (summed over R, G, B).
const PIXEL_TOLERANCE = 60;
// A screenshot fails when more than this share of its (shrunk) pixels differ.
const MAX_DIFF_SHARE = 0.003;
const SHRUNK_WIDTH = { 1920: 480, 1440: 360, 1024: 256, 768: 192, 390: 130 };
const MAX_DIFF_SHARE_HERO = 0.2;
// The phone width is a little looser: text there can sit exactly on a half pixel (the Vision heading is at y = 690.498), so between two runs it is drawn
// one pixel higher or lower; that is invisible and not a change. A real change (a moved or missing element) is far above this.
const MAX_DIFF_SHARE_BY_WIDTH = { 390: 0.005 };

for (const dir of SAVE ? [DIRS.baseline] : [DIRS.current, DIRS.diff]) {
  // Saving ONE width (--only=390) must keep the other widths of the baseline: remove only that width’s files.
  if (SAVE && ONLY && existsSync(dir)) {
    for (const file of readdirSync(dir)) if (file.startsWith(ONLY + "-")) rmSync(join(dir, file));
  } else {
    rmSync(dir, { recursive: true, force: true });
  }
  mkdirSync(dir, { recursive: true });
}

const browser = await chromium.launch({ channel: "chrome" });
const taken = [];
const scrollErrors = [];

for (const size of SIZES) {
  const page = await (await browser.newContext(size.opts)).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  await page.goto(BASE + "/", { waitUntil: "load" });
  // The marquee never stands still (and its position depends on timing), and the Courage heading’s rotating word changes every few seconds:
  // hide both (their boxes keep their size; the rotation has its own checks in interactions.mjs).
  await page.addStyleTag({ content: "[data-marquee-list], [data-rotating-word] { visibility: hidden !important; }" });
  await page.waitForTimeout(1500);

  // Scrolls with the mouse wheel, like a visitor (window.scrollTo fights the smooth scrolling and lands in the wrong place).
  const step = Math.round(size.opts.viewport.height / 2);
  await page.mouse.move(2, Math.round(size.opts.viewport.height / 2));
  let y = 0;
  for (let i = 0; ; i++) {
    if (i > 0) await page.mouse.wheel(0, step);
    // long enough for the smooth scroll to settle (about 1.2 s), for a one-off entrance (about 1.4 s) and for photos to arrive
    await page.waitForTimeout(i === 0 ? 400 : 2300);
    const landed = await page.evaluate(() => Math.round(scrollY));
    if (Math.abs(landed - y) > 3) scrollErrors.push(`${size.name} stop ${i}: wanted ${y}, at ${landed}`);
    const name = `${size.name}-${String(i).padStart(3, "0")}.png`;
    await page.screenshot({ path: join(SAVE ? DIRS.baseline : DIRS.current, name) });
    taken.push(name);
    const atEnd = await page.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 2);
    if (atEnd) break;
    y += step;
  }
  if (errors.length) console.log(`console errors at ${size.name}:`, errors);
  if (scrollErrors.length) console.log("scroll did not land where expected:", scrollErrors.splice(0));
  await page.context().close();
}
await browser.close();

if (SAVE) {
  console.log(`Baseline saved: ${taken.length} screenshots in ${DIRS.baseline}`);
  process.exit(0);
}

// Compare
let failed = 0;
const baselineNames = readdirSync(DIRS.baseline).filter((f) => !ONLY || f.startsWith(ONLY + "-"));
for (const name of baselineNames) {
  if (!existsSync(join(DIRS.current, name))) {
    failed++;
    console.log(`FAIL  ${name}: missing in the current run (the page is a different height)`);
    continue;
  }
  const [a, b] = await Promise.all(
    [DIRS.baseline, DIRS.current].map((d) =>
      sharp(join(d, name))
        .resize({ width: SHRUNK_WIDTH[name.split("-")[0]] })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true }),
    ),
  );
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
    failed++;
    console.log(`FAIL  ${name}: size changed ${a.info.width}x${a.info.height} -> ${b.info.width}x${b.info.height}`);
    continue;
  }
  const mask = Buffer.alloc(a.info.width * a.info.height * 4);
  let different = 0;
  for (let p = 0; p < a.data.length; p += 4) {
    const delta = Math.abs(a.data[p] - b.data[p]) + Math.abs(a.data[p + 1] - b.data[p + 1]) + Math.abs(a.data[p + 2] - b.data[p + 2]);
    if (delta > PIXEL_TOLERANCE) {
      different++;
      mask[p] = 255;
      mask[p + 3] = 255;
    } else {
      mask[p] = b.data[p];
      mask[p + 1] = b.data[p + 1];
      mask[p + 2] = b.data[p + 2];
      mask[p + 3] = 90;
    }
  }
  const share = different / (a.info.width * a.info.height);
  const limit = name.endsWith("-000.png") ? MAX_DIFF_SHARE_HERO : (MAX_DIFF_SHARE_BY_WIDTH[name.split("-")[0]] ?? MAX_DIFF_SHARE);
  if (share > limit) {
    failed++;
    console.log(`FAIL  ${name}: ${(share * 100).toFixed(3)}% of pixels differ`);
    await sharp(mask, { raw: { width: a.info.width, height: a.info.height, channels: 4 } })
      .png()
      .toFile(join(DIRS.diff, name));
  }
}
console.log(
  failed
    ? `\n${failed} of ${baselineNames.length} screenshots differ (see ${DIRS.diff})`
    : `\nALL ${baselineNames.length} SCREENSHOTS MATCH THE BASELINE`,
);
process.exit(failed ? 1 : 0);
