# Home: The Courage To Find Your Path

Figma: "Group 237", node `6529:1750`, 1548 x 747.865px. Code: `src/components/sections/home/CourageSection/`. Content: `src/data/home-courage.ts`. Types: `src/types/home.ts` (`CourageContent`, `CouragePhoto`). Rendered from `src/app/(frontend)/page.tsx` as the second panel of `HorizontalScene`, to the right of Vision/Mission/Values. It is the third home section.

## What it is

The heading **The Courage To Find Your Path** (Lexend Deca Medium, 102px, letter spacing -1%, line height 1.2, capitalised by CSS) in light grey `#e8e8e8` with "your path" in brand blue `#123b7a`, and a collage of eight photos around and over it. The heading is one line. Some photos overlap the heading, so layer order matters: photos first, then the heading, then the slide photo on top (it covers the end of "Courage").

Positions in the Figma frame (px, relative to the group's top left):

| Photo | Left | Top | Box | How it fills the box in Figma |
| --- | --- | --- | --- | --- |
| Chess (girl, red polo) | 1003.0 | 0 | 217.8 x 198.5 | **stretched** to the box (see open items) |
| Building | 447.8 | 320.0 | 213.8 x 209.1 | cover |
| Stage (five students) | 671.2 | 215.4 | 321.0 x 313.7 | cropped: photo 139.46% of the box width, shifted -31.01% |
| Race | 1003.0 | 215.4 | 321.0 x 313.7 | cover |
| Roller skating | 1334.8 | 212.5 | 213.2 x 208.4 | cover |
| Carrom (turban) | 1334.8 | 435.0 | 162.4 x 158.7 | cover |
| Dance (black and white) | 780.8 | 541.3 | 211.4 x 206.6 | cover |
| Slide (small boy), drawn above the heading | 489.6 | 152.0 | 172.1 x 156.8 | cropped: 129.1% of the box width, shifted -25.17% |

Heading: left 0, top 65px, box 1530.9 x 122.

## Sideways scroll scene

Owner (2026-10-21, with the Figma "Homepage Version 2" canvas): the hero is on top; scrolling goes down to Vision/Mission/Values, and as the user keeps scrolling the view goes **to the right** to this section. In Figma this section is right of the VMV column (VMV content 598 to 1311px, this section from 1464px, a 153px gap, both starting about 170px below the hero).

Built by `src/components/layouts/HorizontalScene/` (client component, used in `page.tsx` with three panels: Vision/Mission/Values, this collage, and [Our Learning Journey](14-home-journey.md); the pan is one continuous scroll across all of them):

1. The scene is a pinned, screen-high stage (ScrollTrigger, `pin: true`, `scrub: true`). The panels sit in a row (the track). When the stage reaches the top of the screen the VMV column is exactly centred, with the start of this section visible to its right.
2. While pinned, **one pixel of vertical scroll moves the track one pixel left**, until this section is centred (first the collage, then, with the same movement, the Journey section: 3551px of scroll in total at 1920px wide). Then the pin is released and the page scrolls on.
3. The VMV staggered reveal (see [12](12-home-vision-mission-values.md)) plays during the scroll down, before the pan starts.
4. Layout is plain CSS (correct before JavaScript runs): from **lg (1024px)** up (it was 768px until the Journey section was added: its 2 x 2 layout is too tall for a pinned screen on a tablet), and when the user has not asked for reduced motion, the panels are a row in a clipped stage; otherwise they are an ordinary vertical stack with the section spacing (200px at desktop, 80px minimum) between them, and no pin. The JS only adds the pin and the movement (`gsap.matchMedia` with the same query).
5. Panel widths: the content width (715 / 1520 / 1520) plus the 40px container gutters on each side, capped at the screen width. The gap between the contents is set per panel (`gapBefore`, px at 1920px, scaled with the screen width): 153px before the collage, 360px before the Journey section. The distance is measured from the DOM, so it follows any width. Spacing above and below the scene is the section token (200px).
6. The collage photos are requested after the page has loaded and the browser is idle (`useIdleReady`, 0.8 s after), so they are in the cache before the view pans onto them (native lazy loading made them pop in) without competing with the hero on a slow connection. Each photo's box has its size from the start, so nothing shifts when they arrive.

## The heading effect: the typewriter (the client's final choice); a rotating word is built and kept as the other option

**History (2026-10-22):** the client first asked for no typewriter and a heading **fully visible, with an effect like boltonschool.org**, which was built; a little later they asked to **go back to the original typewriter**. **The typewriter is the effect in use** (`headingEffect: "typewriter"` in `src/data/home-courage.ts`, exactly as it was before: the screenshots of the tablet size match the old baseline pixel for pixel). The rotating word stays available (`headingEffect: "rotate"`) in case the client changes their mind again. What they had asked for: That site shows its strapline ("A place to ...") in full all the time and only the last word swaps: the new word fades in while sliding in from 10% to its left, the old one fades out sliding 10% to the right (0.5 s ease in-out), every few seconds, with the slot sized for the longest word so nothing around it moves. (Measured on their live page, 2026-10-22.)

- **What the heading does with `headingEffect: "rotate"` (NOT the current setting):** "The Courage To Find Your" is plain text from the start; the last word, in blue, swaps among `rotatingWords` (`src/components/ui/RotatingWord`): every 3.5 s, only while the word is at least 60% on screen, held still while the pointer is over it, and not at all with reduced motion (the first word, "Path", stays). Screen readers get the real heading ("The Courage To Find Your Path") and ignore the swapping word.
- **The photos still pop in with the scroll** (unchanged, see below); only the heading changed.
- **The typewriter is the current setting** and works exactly as described in the next section. To try the rotating word again, set `headingEffect: "rotate"`; nothing else changes.
- **The words are PLACEHOLDERS.** "Path" is the design's word; "Way", "Goal" and "Gift" are my suggestions so the effect can be seen ("Find Your Way / Goal / Gift"). **The client must give the real words**, or say that only "Path" stays (then nothing rotates). **Keep them short:** the slot is as wide as the longest word and the Figma heading already fills the collage frame ("Path" is 224px wide at the desktop size, room for about 28px more). "Voice" (265px) and "Dream" (328px) were tried and run out of the frame, and off the edge of the screen on a smaller window. A test (`npm run qa:interact`) fails if the longest word leaves the heading's box at any width.
- **Accessibility note (WCAG 2.2.2, pause/stop/hide for content that updates by itself for more than 5 seconds):** the swap stops with reduced motion and while the pointer is over it, and it only runs while on screen; there is no visible pause button. If the client wants strict compliance, either add a pause control or stop the rotation after a few cycles.

## Animation: typewriter heading and popping photos (the current setting, `headingEffect: "typewriter"`)

Owner's brief (2026-10-21): the heading must start as a **typewriter** as the user scrolls, and the photo grid must come in with a **popping animation**. The owner also said the whole homepage will be highly interactive, so scenes should keep being built around scroll.

- **Typewriter.** The heading is split into one span per character (the page's text for screen readers is a separate `sr-only` copy, the spans are `aria-hidden`). The characters appear one by one, with a thin blue caret on the last typed character (a `box-shadow`, so it never moves the text). Capitalising is done in code (`capitalizeWords`), because CSS `capitalize` would capitalise every one-letter span.
- **Pop.** Each photo scales from 40% to 100% with a small overshoot (`back.out(2)`) and fades in. Each pops over 20% of the pan, starting just as its left side enters the screen on the right, so they appear one after another from left to right (building and slide first, then stage and dance, then chess and race, then skating and carrom). Measured at 1920px: building at about 3% of the pan, slide 5%, stage 21%, dance 28%, chess and race 46%, skating and carrom 71%.
- **Scroll-driven (desktop).** Both animations are tweens on the scene's one timeline (see below), so scroll controls them exactly. They are placed where the collage itself comes into view, measured on the page with `progressAt`: typing runs from the collage's left edge entering the screen until 90% of the way to the collage being centred (the whole heading is typed just before it is centred), and scrolling back un-types and un-pops. Checked at 0, 10, 25, 40, 55, 70, 85, 90 and 100% of the pan: 0, 3, 8, 13, 18, 23, 27, 29 and 29 characters typed, and the caret is always on the last typed character.
- **Tablets and phones (since 2026-10-22):** the same scene as on desktop: the collage is the second panel and the typing and the pops follow the scroll exactly as above (the phone's two-column photo grid fits one screen, so it is shown whole). The one-off 3-second entrance that used to play below 1024px was removed.
- **Reduced motion:** no animation, everything shown. Without JavaScript everything is also shown (the hiding is done by the script).

How a panel joins the scene's scroll: `useSceneTimeline((tl, { stage, distance }) => { ... })` from `src/components/layouts/HorizontalScene/`. `HorizontalScene` owns one scrubbed timeline of duration 1 (0 = the pan starts, 1 = the last panel is centred, `distance` = px of scroll the pan takes). A panel adds its tweens at positions between 0 and 1. The callback only runs in the pinned row layout, and everything it sets is undone when that layout ends (for example when the window is resized below 768px).

## How it is built

- **Desktop (768px and up): one scaling piece.** The collage frame keeps the Figma aspect ratio (1548 / 747.865). Every photo and the heading are positioned in **percent of the frame**, and the heading size is `102 / 1548` of the frame width (container query units, `cqw`), so every proportion of the design holds at any width. The frame sits in the shared main container (1520px), so at its widest it is 1520 / 1548 = 98.2% of the Figma size (the owner's earlier rule for the footer was the same: use the main container, a small difference from Figma is fine). To get exact Figma size instead, pass `contentWidth={1548}` to the `Section` (one-line change).
- **Phone (below 768px): my interpretation, the design only exists for desktop.** A collage scaled to 320px would have tiles under 60px and 20px text. Instead the heading wraps on its own and is **centred** (owner request, 2026-10-22; fluid `text-h1`, 32 to 39px, two lines) and the eight photos follow in a two column grid of 4:3 tiles. Photos are cropped to fill their tile, never stretched. The chess photo is anchored to the top so the face stays in the tile.
- Heading is an `h2`. The grey colour is a new token `--color-brand-ghost: #e8e8e8` (not in the brief's palette).
- Photos are `next/image` with `unoptimized` (already compressed, `next/image` would re-encode at quality 75) and load lazily as the section approaches, so they do not compete with the hero.
- Animation: see the next section.

## Images

Source: the original Figma photos (JPEG, 4096 x 2734, 5.7 to 11 MB each, about 64 MB in total). Resized to about twice their largest displayed size (so they stay sharp on 2x screens) and compressed with `sharp` to **AVIF quality 95, 4:4:4, effort 6** in `public/images/home/courage/`:

| File | Size (px) | Bytes | PSNR vs the resized original | Values off by more than 4 / 255 |
| --- | --- | --- | --- | --- |
| `chess.avif` | 440 x 659 | 72.7 KB | 47.3 dB | 0.27% |
| `building.avif` | 640 x 427 | 103.4 KB | 46.4 dB | 0.43% |
| `stage.avif` | 900 x 601 | 155.0 KB | 47.6 dB | 0.20% |
| `race.avif` | 940 x 627 | 244.4 KB | 45.6 dB | 0.46% |
| `skating.avif` | 640 x 427 | 96.7 KB | 46.4 dB | 0.53% |
| `carrom.avif` | 340 x 510 | 46.1 KB | 47.5 dB | 0.29% |
| `dance.avif` | 640 x 427 | 60.3 KB | 51.5 dB | 0.00% |
| `slide.avif` | 450 x 300 | 64.6 KB | 45.0 dB | 0.86% |

About 0.85 MB in total. Quality 88 was tried first and measured 41 to 45 dB (the photos are grainy), so it was raised to 95 to keep at least 45 dB, the project's rule.

## Fidelity

Verified in Chrome against the dev server:

- At 1920px the collage frame is 1520 x 734.3 (aspect 1548 / 747.865 exactly). All eight photo boxes are within **0.02px** of the Figma position and size multiplied by 1520 / 1548. The heading is 100.16px (102 x 0.982), 63.8px from the top (65 x 0.982), colours `#e8e8e8` and `#123b7a`, `capitalize`, no overflow.
- Rendered frame against the Figma render resized to the same width: 29.5 dB, 1.9% of values differ by more than 24 (resampling of a photo collage, plus the 98.2% scale). Side by side the layout, crops, overlaps and layer order match, including the girl photo overlapping "Find" and the slide photo covering the end of "Courage".
- **Sideways scene** (1920x993, 1280x800, 1024x768, 768x1024): at the pin start the stage is at the top and the VMV column is centred horizontally (exactly half the screen width) and vertically; half way the VMV column has moved left by exactly half the distance (within 3px); at the end the collage is centred on the screen (within 2px) and all 8 photos are loaded; the page then scrolls on normally, scrolling back restores the start, and there is no horizontal overflow at any step. No console errors.
- Responsive: no horizontal overflow and all photos inside the frame at 2560, 1920, 1280, 1024, 768, 600, 390 and 360px. The heading is one line from 768px up (45px at 768px) and two lines at 360 and 390px, never overlapped by a photo on a phone. No console errors.

## Known issues and open items

- **The chess photo is stretched in the Figma design.** The 684 x 1024 portrait photo is squeezed into a 218 x 198 landscape box (about 64% too wide), so the face looks wide. It was built exactly like that to match Figma. Likely a design slip: ask the designer. To show it undistorted, change `fit: "stretch"` to `"cover"` for `chess` in `src/data/home-courage.ts`. The stage and slide crops are about 5% off proportion too (a smaller version of the same thing).
- **Container width:** 1520 instead of Figma's 1548 (see above).
- **Alt texts are mine** (descriptions of the photos). Refine with the school.
- **Phone layout and the 768px breakpoint are my interpretation.** The collage is quite small just above 768px (smallest photo about 72px).
- **Scroll feel of the pan** (1 px of scroll per px of movement, no hold at either end) is my starting point. The owner may want it slower or faster, or a short pause on the VMV column before the pan starts.
- The Figma canvas has more frames to the right (dotted outlines). Adding more panels to the scene is one more entry in `page.tsx`.
- The header scrolls away while the scene is pinned (same open question as the hero).
- **Animation timing is my starting point:** typing 0 to 90% of the pan, 20% pop length, overshoot 2, start scale 40%. Easy to change at the top of `CourageSection.tsx`. A typing sound or a skippable intro are not done.
- The pop start positions are measured once when the scene is built; after a window resize inside the desktop layout they are slightly off until the page is reloaded (the order and look are unchanged).
