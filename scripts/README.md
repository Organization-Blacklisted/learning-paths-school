# scripts/

Tools for the site's images. They exist so that adding or replacing a photo is a one-line job that anyone can repeat, with the same quality rules as the photos already on the site.

| File | What it does |
| --- | --- |
| `optimize-image.mjs` | Photo in, AVIF out: crop, resize, encode, and **measure** what the encoding cost. `npm run images:optimize -- <input> --out <file.avif> [options]` |
| `check-images.mjs` | Audits `public/images` (format, weight, width). `npm run images:check`. Part of `npm run check`, the pre-commit hook and CI. |
| `svgo.config.cjs` | The svgo settings used for the site's SVGs. |
| `make-favicon.mjs` | One logo PNG (transparent background) in, the site's three icons out: `src/app/favicon.ico` (16/32/48px), `icon.png` (192px) and `apple-icon.png` (180px on white). `node scripts/make-favicon.mjs <logo.png>`. It trims the empty margin first, so the crest is as large as possible in a browser tab. |
| `seed-home.ts` | Puts the current home page and its photos into the CMS (`npm run seed:home`, see [docs/26-cms-home-plan.md](../docs/26-cms-home-plan.md)). Not an image tool. |

## Replacing an image (do not reuse the file name)

`/images` is served with `Cache-Control: public, max-age=604800` (7 days, `next.config.ts`). A new image under the **same name** is not fetched by browsers that already have the old one, for up to a week (hard refresh only fixes it on one computer), and visitors get the same after a deploy. So **when an image is replaced, give the new file a new name** (`logo.svg` became `lps-logo.svg` on 2026-10-28 for this reason) and update the reference.

## Adding a photo

1. Get the best source you can: the original from the school or the Figma export at 2x. Never start from an already compressed copy.
2. Decide the size it is shown at in the design, and make the file **about twice that** (so it stays sharp on 2x screens).
3. Make it:

   ```bash
   # a photo the design shows cropped to a slot of 318 x 203 px: cut to that slot at 2x (636 x 406), lowest quality that keeps 45 dB
   npm run images:optimize -- raw/news-4.jpg --out public/images/home/news/news-4.avif --size 636x406 --auto

   # a photo shown at its own proportions, e.g. 640px wide
   npm run images:optimize -- raw/stage.jpg --out public/images/home/courage/stage.avif --width 640 --auto

   # a photo the design shows cropped AND shifted inside its slot: cut the visible part out of the source first (x,y,w,h in source pixels)
   npm run images:optimize -- raw/dance.jpg --out public/images/home/journey/discovery.avif --crop 220,0,900,1800 --size 342x686 --auto

   # a cut-out photo with transparent corners
   npm run images:optimize -- raw/pioneers.png --out public/images/home/framework/pioneers.avif --alpha --quality 95
   ```

4. Read the last line it prints: the file size, the fidelity in dB, and `[OK]` or `[BELOW 45 dB]` (it also exits with an error then). **45 dB or more is the project's rule**: measure, do not trust a quality number. Grainy photos need a higher quality for the same dB (the Courage photos needed 95, a smooth poster needed 86).
5. Use it in the page with the `Photo` component (it is served as it is, never re-encoded by `next/image`). Give it real `alt` text.
6. Run `npm run images:check`.

## What every photo of the site was made with

AVIF, 4:4:4 colour, effort 6, quality 85 to 95, 45 to 48 dB against the source, served `unoptimized`.

| Photos | Made at | Quality | Weight |
| --- | --- | --- | --- |
| Hero slides (3) | native 1920 x 993 from the supplied PNGs, no resizing | 92 | 212 to 245 KB each |
| Courage collage (8) | about 2x their largest displayed size (340 to 940px wide) | 95 | 46 to 244 KB |
| Journey columns (4) | the visible slot at 2x, 342 x 686 | 95 | 85 to 94 KB |
| Framework ellipse (with transparency) | 755 x 927 | 95 | 170 KB |
| News cards (3) | the visible slot at 2x, 636 x 406 | 95 | about 100 KB |
| Ecosystem photos (5) | the slot at 1.25x, 1900 x 664 | 85 for the choir; 88 to 94 (found with `--auto`) for the four from 2026-10-23 | 173 to 382 KB |
| Alumni portraits (2) | the slot at 2x, 856 x 770 | 95 | about 175 KB |
| Campus poster | 1.5x, 1800 x 891 | 88 | 281 KB |
| Marquee photos (6) | square crops, 640 x 640 | 95 | 140 to 207 KB |

(Details and measured dB per photo are in the section docs, `docs/13` to `docs/22`, and `docs/11-home-hero.md`.) `--auto` will often find a lower quality than these, with the same 45 dB.

## Limits checked by `images:check`

All photos AVIF (the Open Graph preview in `public/images/og/` is the one exception: social sites do not read AVIF, use a 1200 x 630 JPG or PNG); at most 400 KB per photo; 6 MB for all photos together (4.1 MB now); at most 2400px wide; SVGs at most 150 KB. The numbers are at the top of `check-images.mjs`: raise one only with a reason, and write the reason in `docs/24-qa-suite.md`.

## SVGs

Optimise with `npx svgo@3 --config scripts/svgo.config.cjs input.svg -o output.svg` (path precision 2 decimals; the viewBox and ids are kept; transforms keep 8 decimals, because a logo with an embedded wordmark image is placed by a transform in fractions of its box and rounding it to 2 decimals shifted the wordmark by 1.3px). **After optimising a logo, render the original and the result at 4x and compare them** (the header logo of 2026-10-28 came out at 48.4 dB; a shift shows up as about 15 dB). Figma's SVG export of a node can carry the backgrounds of its parent frames: look for stray full-page `<rect>` elements and remove them (that is how the header logo was cleaned, `docs/09-header.md`). Keep the SVG's own `width` and `height` attributes.

## Not covered here

- Video (the campus video): when it exists, keep it a muted loop of 10 to 20 s, H.264, under about 4 MB (`docs/22-home-campus.md`).
- Fonts: `.woff2` only, only the weights the design uses (`src/fonts/index.ts`).
- Getting the originals out of Figma: done through the Figma tools by hand; the 2x export of the node is the source.
