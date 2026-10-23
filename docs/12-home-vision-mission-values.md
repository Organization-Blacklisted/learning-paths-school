# Home: Vision, Mission and Values

Figma: node `6507:183` ("Frame 1618876728"), a 715px centred column. Code: `src/components/sections/home/VisionMissionValuesSection/`. Content: `src/data/home-vision.ts`. Types: `src/types/home.ts`. Rendered from `src/app/(frontend)/page.tsx`, below the hero.

## What it is

A shield with a short line under it, then three blocks, **Our Vision**, **Our Mission** and **Our Values**, each with a title and a paragraph, joined by 33px connector lines.

| Part | Spec (Figma) |
| --- | --- |
| Shield + short line | `public/images/home/vision/shield.svg`, 55.8156 x 86 (shield 28 x 34, amber under blue; the line is inside the same file). Unmodified. |
| Title | Lexend Deca Regular 40px (`text-h2`), `#123B7A` (`brand-blue`), centred, letter spacing -1%, skewed `skewX(-8deg) scaleY(0.99)` for the italic look (the font has no italic). Layout box 47.53px high. |
| Paragraph | Plus Jakarta Sans Regular 18px (`text-body-lg`), line height 1.5, letter spacing -1%, centred, `#474747` (new token `brand-graphite`). Fixed widths 511 / 509 / 565px, which decide the line breaks (3, 2 and 3 lines). |
| Connector lines | 1 x 33px, `#123B7A` at 40% opacity |
| Spacing | shield, 37px, then blocks; title to paragraph 14px; block to line to block 24px each |

Copy (from Figma): Vision "To create responsible, independent individuals who have the knowledge, attitude, and courage to be successful in an ever-changing world." Mission "We aim to empower all students to be independent thinkers, lifelong learners, and responsible citizens." Values "Through enquiry, hands-on experiences and connections across subjects, we help students move beyond knowing the answer to understanding the thinking behind it."

## Notes

- **Placement.** As in the Figma "Homepage Version 2" canvas, this column sits to the left of "The Courage To Find Your Path", and the page pans sideways from one to the other. The component is the first **panel** of `HorizontalScene` (see [13-home-courage.md](13-home-courage.md#sideways-scroll-scene)), which provides the container, the 200px section spacing and the pin. The component itself renders one `<section aria-label>` with the 715px column.
- **Staggered reveal** (see below). Changed by the owner on 2026-10-21: the first version was pinned and scroll-scrubbed, which left a mostly empty screen with only the shield. Now it simply plays by itself when it comes into view.
- **Lines.** The two connectors are CSS, shifted half a pixel left (`-translate-x-[0.5px]`). In Figma all three lines (the one inside the shield SVG and both connectors) sit half a pixel left of the column centre, so they render as the same soft 2px line at about half intensity. Without the shift the connectors were one crisp darker pixel and did not match the shield's line. Verified pixel values match Figma within 1 level.
- Titles are `h2`. The page's one `h1` is the hidden one in the hero (see [home hero](11-home-hero.md)).

## Staggered reveal

Not pinned and not scroll-controlled. When the top of the column reaches 75% of the screen height, one GSAP timeline plays **once** by itself (about 3 seconds), each step starting before the previous one ends so it flows. Scrolling away and back does not replay it.

| Order | Step | Duration (s) | Overlap |
| --- | --- | --- | --- |
| 1 | Shield and its short line are revealed top to bottom (`clip-path` from `inset(0 0 58% 0)` to `inset(0 0 0% 0)`: the shield first, then the line draws down) | 0.9 | |
| 2 | **Our Vision** fades in and rises 24px | 0.8 | starts 0.3 before step 1 ends |
| 3 | Connector line 1 draws down (`scaleY` 0 to 1, origin top) | 0.5 | 0.3 |
| 4 | **Our Mission** fades in and rises | 0.8 | 0.2 |
| 5 | Connector line 2 draws down | 0.5 | 0.3 |
| 6 | **Our Values** fades in and rises | 0.8 | 0.2 |

Only `opacity`, `transform` and `clip-path` change, so the layout never shifts while it plays. The final state is exactly the Figma frame.

- **Smoothness:** the moving parts are kept on their own GPU layer during the reveal (`force3D: true`, `will-change`, cleared when it finishes) and the rise is 24px (was 40px). Added after the owner said the first reveal felt "shaky"; measured 16.7 ms per frame with no dropped frames, also with a 4x CPU slowdown, and the final positions are unchanged. The cause could not be reproduced in the headless test, so this is a likely fix, not a confirmed one.
- **History:** the first version (same day) was pinned for 3 screens and scrubbed by scroll. The owner saw a screen with only the shield and a lot of empty space, and asked for the whole thing to be revealed in a staggered manner instead. The hero stays scroll-controlled.
- **Reload below the section:** if the page loads already scrolled past the section, it is shown finished (no waiting for a trigger that already passed).
- **Reduced motion:** no timeline. The finished column is shown as a normal static section.
- **Content stays in the DOM** at opacity 0 before the reveal, so assistive technology and search engines read all three blocks.
- Helpers: `src/lib/gsap.ts` (`registerGsap`). See the [animation guidelines](04-animation-guidelines.md).

## Fidelity

Verified in Chrome against the production build (the static, finished state):

- The frame is 715 x 685.6px, exactly as in Figma. The shield, all three titles, all three paragraphs and both connectors are at their Figma coordinates (within 0.1px at the 1920px layout).
- The paragraphs wrap like Figma (3, 2, 3 lines). Fonts, sizes and colours are as specified.
- Title glyph positions are within 0 to 1px of Figma's. The component screenshot, measured on a whole-pixel column position with grayscale antialiasing, differs from the Figma screenshot in about 1% of pixels (anti-aliasing of text).
- No horizontal overflow from 360px to 2560px. At 360 and 390px the text scales down (title 28px, body 16px) and wraps, centred. No console errors.
- **Reveal:** checked in Chrome on the dev server at 1920 x 993. Before the trigger line (column top at 900px, trigger at 745px) nothing is visible and the shield is clipped. After it: the shield clip opens first (0.9 s), Vision is at 89% opacity at 1.0 s, Mission at 64% at 1.6 s, Values at 90% at 2.6 s, all three at 100% by 4 s, connectors drawn between. No pin spacer for this section, no console errors.

## Known issues and open items

- The title wrapper and mobile sizes: mobile text sizes follow the existing fluid scale, and the paragraph widths are the desktop ones capped by the screen, so mobile wrapping is my interpretation (Figma has desktop only).
- The grey `#474747` is not in the brief's palette. It was added as `brand-graphite`.
- Section background, spacing around it and how it combines with the "Courage To Find Your Path" scene are not designed in this frame.
- **Timing is a tuning setting:** durations, overlaps and the 75% trigger line are my choice (no motion spec from Figma).
