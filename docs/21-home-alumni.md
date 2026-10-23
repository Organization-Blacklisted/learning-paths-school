# Home: Their Paths Continue Long After They Leave (alumni)

Figma: "Frame 1618876383", node `6282:755`, 1520 x 461px. Code: `src/components/sections/home/AlumniSection/`. Content: `src/data/home-alumni.ts`. Types: `AlumniContent`, `AlumniPerson` in `src/types/home.ts`. Portraits: `public/images/home/alumni/`. It is the **second panel of the second sideways scene** on the home page: the owner placed it **to the right of "The Ecosystem Behind LPS 360"** on the canvas, so after the Ecosystem section the view pans right to it (see [13-home-courage.md](13-home-courage.md#sideways-scroll-scene) for how the scene works; the Ecosystem section is the first panel, [20-home-ecosystem.md](20-home-ecosystem.md)).

## What it is

Left, a 633px block: the green pill **BEYOND THE SCHOOL GATE**, the two-line heading **Their *Paths Continue* / Long After They Leave** (Lexend Regular 40px, the blue slanted Lexend Medium "Paths Continue" on the first line), and two paragraphs (Plus Jakarta Sans 18px, 497px wide). Right, two alumni 16px apart, each a 428 x 385px portrait with the name (SemiBold 18px, navy) and the university (Light 18px, navy at 80%) centred under it: Maitreya Grylls, University of Saskatchewan; Aastha Walia, Michigan State University. The two blocks are 633 + 15 + 872 = 1520px.

## The scene

`page.tsx` now has two scenes: scene 1 (Vision/Mission/Values, Courage, Journey) and **scene 2: Ecosystem, then alumni**, with the LPS 360 Framework between them and What's New after. The gap between the Ecosystem and the alumni content is **200px** at 1920px (measured from the owner's canvas screenshot, as the other gaps were), set with `gapBefore: 200`. The pan is 1920px of scroll at 1920px wide.

### New in HorizontalScene: panels taller than the screen are scaled to fit

The Ecosystem panel is about 1026px high, taller than most laptop screens, and a pinned stage cannot show more than the screen: its bottom (the bullet list) would have been cut off for the whole pan. `HorizontalScene` now **scales any panel taller than the window down to the window height** (about its top centre, never below 50%) and gives its box the scaled height, so the stage never grows past the screen. A screen 1026px or higher shows the Ecosystem at the design size; at 950px high it is 93%; at 800px about 77%. Panels that fit are untouched. It runs before every ScrollTrigger measurement (the `refreshInit` event), so a resize, a font or an image loading is always taken into account; the scaling is cleared below 1024px and with reduced motion. This also protects the first scene on short screens.

## Layout and responsive behaviour

- **1600px and up** (container 1520px): the design.
- **Below 1600px** (my interpretation, only desktop exists in Figma): the text goes above, the two portraits sit side by side underneath at their own aspect ratio (428:385), shrinking with the screen, with the names under them (16px text below 640px).
- **With reduced motion:** no sideways scene: Ecosystem, then the alumni section, stacked. (Tablets and phones are in the scene too since 2026-10-22.)

## Animation (nothing in Figma; mine)

- **In the scene (1024px and up):** driven by the pan, reversible. As the text block comes in from the right the pill, heading and paragraphs rise in; then each portrait **opens from the bottom** (a clip) while its photo settles from a 1.15 zoom, and the name and university rise in below it. Each part starts as it enters the screen, and the last animation ends at 94% of the pan.
- **Tablets and phones:** the same scene timeline as on desktop (the one-off entrance below 1024px was removed).
- **Reduced motion:** nothing is animated, everything shown. Everything is only hidden by JS.

## Images

Both Figma portraits are the same 1122 x 1402 file placed and cropped differently, so each is **cropped to its visible 428 x 385.18 slot at 2x (856 x 770) and compressed to AVIF quality 95, 4:4:4**: `alumnus-1.avif` 172 KB (47.6 dB) and `alumna-1.avif` 188 KB (47.4 dB). The crop positions are the Figma placements (the first photo is 457.9 x 572.2 shifted by -19.4, -44.9 in the slot; the second fills a 429.9 x 474.4 box with `object-cover`, 3.9px up). Served as they are (`unoptimized`) and requested after the page has loaded and the browser is idle (`useIdleReady`); each portrait's box has its size meanwhile.

## Fidelity

Verified in Chrome on the live home page (scroll to the end of scene 2), 1920 x 1080:

- Frame 1520 x 461. Pill at y 67.5, heading 52px below it, paragraphs 175px below the pill and 497 wide; cards at x 648 and 1092, 428 wide, 461 high; portraits 428 x 385.2; captions 217.6 wide, 405.9px down, 49px high. The render is 27.9 dB against Figma (2% of values differ, text anti-aliasing and 0.5px).
- Scene: three pinned scenes on the page; at the pin start the Ecosystem is centred with the whole section on screen and the alumni text still hidden at the right; half way the first portrait is open and the second still closing; at the end the alumni section is centred (960px), everything revealed and the portraits loaded; scrolling back restores the start. At 1920 x 950 the stage is 950px high (fits); at 1440 x 800 the stage is 800px (the Ecosystem is scaled to fit; before this fix it was 1041px and its bottom was cut). The first scene's checks and the other sections' checks still pass; a scroll through the whole page has no horizontal overflow and no console messages.

## Known issues and open items

- Content is the two alumni of the design; the real list (more alumni? a carousel?) is not designed.
- **Scaled panels are slightly smaller than the design on short screens** (see above); the text stays sharp but is up to 23% smaller at 800px high.
- The gap before this section (200px) is measured by eye from the canvas overview.
- Alt texts are mine. The names are not links.
