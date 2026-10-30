# Home: Our Learning Journey

Figma: "Frame 1618876734", node `6547:5798`, 1520 x 746px. Code: `src/components/sections/home/JourneySection/`. Content: `src/data/home-journey.ts`. Types: `src/types/home.ts` (`JourneyContent`, `JourneyStage`). Rendered from `src/app/(frontend)/page.tsx` as the **third panel** of `HorizontalScene`: the view keeps panning right from the Courage collage to this section (see [13-home-courage.md](13-home-courage.md#sideways-scroll-scene)). It is the fourth home section.

## What it is

A green pill **The 15-Year Journey**, the heading **Our Learning *Journey*** (grey Lexend Regular 40px, then "Journey" in Lexend Medium, brand blue, skewed -8 degrees like the Vision/Mission/Values titles) with a 612px intro paragraph on the right, and four columns, one per stage of schooling. Content is 1320px wide, centred in the 1520px frame (100px margins).

| Column | Colour | Level | Range | Caption | Caption width |
| --- | --- | --- | --- | --- | --- |
| 1 | `#d0d8e4` (`brand-mist`) | Pre-Primary | (Pre-Nursery to UKG) | The Path of **Discovery** | 130 |
| 2 | `#a0b1ca` (new `brand-steel-dark`) | Primary | (Classes I to V) | The Path of **Foundation** | 130 |
| 3 | `#416295` (new `brand-slate`) | Secondary | (Classes VI to X) | The Path of **Independence** | 172 |
| 4 | `#123b7a` (`brand-blue`) | Senior Secondary | (Classes XI and XII) | The Path of **Direction** | 172 |

Columns 1 and 2 use navy text (`#061939`), columns 3 and 4 white. Each column is 330px wide (the last 329) and 590px high, with a centred 171px content block: level (Plus Jakarta Sans Medium 20px, +2% spacing), range (SemiBold 14px, uppercase), photo 171 x 343, caption ("THE PATH OF" 14px SemiBold uppercase with 28% spacing, then the stage word in Medium 20px). Vertical positions in a column: content 469px tall, so 60.5px above and below.

The green pill is the shared `Badge` component (`src/components/ui/Badge/`), also used by [the LPS 360 Framework](15-home-framework.md).

Frame layout: pill at the top (35px high), the heading row 20px below it, then 48px, then the columns.

## Layout and responsive behaviour

- **lg (1024px) and up:** exactly the design: four columns in a row, intro paragraph on the right of the heading. Column height follows the screen height, `clamp(520px, 100svh - 220px, 590px)`, so the whole panel always fits in the pinned scene on short screens (590px, as in Figma, on screens 810px or more high).
- **md (768 to 1023px):** my interpretation: heading and paragraph stacked, columns in a 2 x 2 grid.
- **Phone:** one column per stage, stacked.
- Tablets and phones are in the sideways scene too (since 2026-10-22, see [13](13-home-courage.md#sideways-scroll-scene)). On a phone the four columns stack (about 2400px), which is taller than any screen: the pinned view first pans sideways to this panel, then scrolls DOWN through the columns at full size, then the pin ends.

## Animation

Owner's direction: a highly interactive homepage. Nothing is specified in Figma, so this is my design:

- **Desktop (scroll-driven, on the scene's timeline):** each part starts as it comes in from the right edge of the screen. The pill, heading and paragraph rise 24px and fade in. Then each column in turn: its colour grows up from the bottom (`clip-path`), its content rises 40px and fades in, and its photo settles from a 1.15 zoom to 1. Every column takes about 60% of its own width of scroll, and the last animation ends at 94% of the pan, so the last column can be looked at before the pan stops. Scrolling back reverses everything. It works through `useSceneTimeline` and `progressAt` (see [04-animation-guidelines.md](04-animation-guidelines.md)).
- **Tablets and phones:** the same scene timeline (the per-column scroll triggers that used to play below 1024px were removed). On a phone the columns are stacked, so they all start revealing when the panel arrives; the ones below the first are already shown when the view scrolls down to them (open item in [07-decisions.md](07-decisions.md)).
- **Reduced motion:** no animation, everything shown. Without JavaScript everything is shown too.

## Images

Source: four JPEG photos of the Figma file (1500 to 2000px wide, 1.9 to 2.9 MB each). The design shows each one cropped and shifted inside its 171 x 343 slot, so each file is **cropped to exactly that visible slot at 2x (342 x 686) and compressed to AVIF quality 95, 4:4:4**, in `public/images/home/journey/`. The crop positions are the Figma placements (for example "discovery": the photo is 590 x 393 placed at -187.5, -49.7 in the slot). Same pixels on screen as the design, about 90 KB each instead of 2 MB.

| File | Bytes | PSNR vs the same crop, resized | Values off by more than 4 / 255 |
| --- | --- | --- | --- |
| `discovery.avif` | 93 KB | 46.6 dB | 0.40% |
| `foundation.avif` | 87 KB | 46.8 dB | 0.39% |
| `independence.avif` | 85 KB | 47.2 dB | 0.33% |
| `direction.avif` | 94 KB | 46.2 dB | 0.44% |

They are served as they are (`unoptimized`, `next/image` would re-encode at quality 75) and are requested after the page has loaded and the browser is idle (`useIdleReady`), so they are cached before the view pans onto this section without competing with the hero. The zoom animation targets an inner box that always exists, so it does not depend on the photo having arrived.

## Fidelity

Verified in Chrome at 1920 x 993, at the end of the pan (section centred), against the Figma render (1520 x 747):

- The pill, heading, intro paragraph (612px wide, right edge at 1420px, two lines), all four columns (x 100, 430.25, 760.5, 1090.75; y 157; 330.25 x 590) and the 171 x 343 photos are within 1px of the design. Level, photo and caption positions inside a column are within 0.6px (60.6 / 119.4 / 486.4 from the column top against 60.6 / 119.6 / 486.6). The "Journey" glyphs were moved 8px to match Figma's glyphs (364 to 521px against 364 to 522px).
- The render matches Figma at 27 dB PSNR. The remaining difference is text weight (below) and photo resampling.
- The pan (three panels): VMV centred at the start; Courage centred with the heading fully typed; Journey centred at the end with the pill, heading, paragraph and all four columns fully revealed; columns reveal in order; scrolling back hides everything; no horizontal overflow; the Journey panel fits inside the screen (bottom at 870px of 993, 824 of 900, 769 of 800, 735 of 768). Checked at 1920, 1440, 1280 and 1024px wide.
- Below 1024px: no pin, no overflow, columns reveal as they scroll into view (390 and 800px), reduced motion shows everything (390 and 1920px). No console errors.

## Known issues and open items

- **Text weight.** In the Figma render the small text (pill, level, range, caption) looks lighter than in the browser. The design names Plus Jakarta Sans; the footer already showed that the design also uses Proxima Nova, which was not supplied (see [08-footer.md](08-footer.md)). If these texts are Proxima Nova in the final design, supply the font.
- **Gap before this section: 360px** (at 1920px) between the Courage frame and this frame. It was measured by eye from the small overview screenshot of the canvas, so it may be off by about 30px. One number in `page.tsx` (`gapBefore`).
- **Figma slip reproduced:** the first caption has its last letter of "Path of" ("f") in 12px while the rest is 14px. It is built as designed; set `smallLastPrefixLetter` to false in `home-journey.ts` to drop it.
- **Colours not in the brief's palette:** `#a0b1ca` and `#416295` (new tokens `brand-steel-dark`, `brand-slate`). `#a0b1ca` is close to but not the brief's steel `#aab9cf`; ask the designer if they should be the same.
- **Alt texts are mine.**
- **md and phone layouts** (2 x 2 and 1 column) are my interpretation. Link or button targets: none in the design.
- The Figma canvas has more frames below and to the right (dotted outlines): next sections.

## Phone: the tall panel and the lag report (2026-10-30)

On a phone the four columns stack, so the panel is 2408px tall (at 390px wide). `HorizontalScene` does not shrink it (`data-tall`): after the sideways pan the pinned scene moves the track up by the extra height (about 1564px of scrolling) with a scrubbed `y`. The owner reported lag there on a real phone. The emulated measurements are smooth, so the suspect is that script-driven vertical movement while the browser scrolls natively. An opt-in test, `?scroll=normalize`, is in `SmoothScroll.tsx` (see the changelog of 2026-10-30). Open: the result on a real phone, and whether to stop pinning the tall part on phones.
