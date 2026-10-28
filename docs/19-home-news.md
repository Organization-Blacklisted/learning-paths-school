# Home: What's New At LPS

Figma: "Frame 1618876584", node `6282:899`, 1520 x 506px. Code: `src/components/sections/home/NewsSection/`. Content: `src/data/home-news.ts`. Types: `NewsContent`, `NewsItem` in `src/types/home.ts`. Photos and arrow: `public/images/home/news/`. On the home page it is the section **above the CTA band** (after the LPS 360 Framework).

## What it is

Left, a 502px block centred against the cards: the green pill **BEYOND THE SCHOOL GATE**, the heading **What's New *At LPS*** (grey Lexend Regular 40px, then the blue slanted Lexend Medium part, like "Our Learning Journey") and a 471px paragraph. Right, three news cards, 24px apart, 506px high: a text panel (303px, background `#fbfbfb`) with the date (green `#4da44b`, Medium 16px), the title (SemiBold 18px, navy), up to five lines of text (Plus Jakarta Sans **Light** 18px, navy at 80%) and a green arrow, and a 203px photo below (card background `#f6f6f6`). Intro and cards together are 502 + 24 + 994 = 1520px, the main container.

**The three cards are the design's placeholders** (the same date, title and text three times, two of them with the same photo). The real news will come from the CMS later. Each card is a link (`href`: `#` for now); its accessible name is the title and date.

## Layout and responsive behaviour

- **1600px and up** (the container is then the full 1520px): the design: intro left, three **equal** cards in the 994px column. The Figma cards are 318, 318 and 310px wide; equal widths of 315.3px are used (the 8px difference looks like a slip in the design), so the third card's text sits 4 to 6px left of Figma's.
- **1024 to 1599px:** (my interpretation, only desktop exists in Figma) the intro goes above, the three cards form a row of equal columns. The side-by-side layout would squeeze the cards to 209px at 1280px, too narrow for the text.
- **Below 1024px:** the intro above, and the cards become a row you swipe sideways, each 318px (at most 80% of the screen), snapping to the card edges; the row reaches the screen edges. **Fixed 2026-10-28 (owner screenshot, 375px phone):** the first card sat flush against the left screen edge instead of the page margin. Cause: `snap-start` aligns a card to the very edge of the scroll area and ignores its padding, so the browser scrolled the row by one margin on load (and every card rested at the edge after a swipe). Fix: `scroll-px-gutter` (scroll padding equal to the margin) below 1024px, `lg:scroll-px-0` from there. Checked in Chrome at 375, 390 and 600px: the first card is on the same left edge as the heading above it, and after a swipe each card rests at the margin. (At 900px the row ends before card 2 can reach the margin: that is the end of the row, not a fault.)
- The excerpt is limited to five lines with an ellipsis (`line-clamp-5`); the placeholder text happens to end exactly after five lines, as in Figma (it is cut at "very import").

## Animation (owner: "as you think will suit it")

Once, about 1.4 s, when the section scrolls into view (top at 75% of the screen); nothing in Figma, my design:

1. The pill, heading and paragraph rise in one after another.
2. **Each card grows up from the bottom** (owner, 2026-10-28: "same animation like the other sections where the card grows from bottom to top"): a `clip-path` wipe from `inset(100% 0 0 0)` to open, 0.9 s `power2.out`, one card after another (0.14 s apart), the same wipe the Alumni portraits and the Journey columns use. It was a 60px rise with a fade before. In each card the **photo settles from a 1.15 zoom to 1**, then the date, title and text rise in (from 0.35 s into the card's wipe), and the **green arrow draws itself** left to right. The clip is **removed when the card is open** (`clearProps: "clipPath"`): a clip would cut off the hover lift and shadow of the card. The reset when the section is off screen and the quick replay work as before.

**Hover and keyboard focus** on a card: it lifts 6px with a soft shadow, the photo zooms to 1.06 (the box stays, the image moves inside), the title turns brand blue, and the arrow slides 8px to the right and lengthens by 15%. Reduced motion: no animation and no hover movement (colour and shadow only), all content shown. Everything is only hidden by JS, so without it the section is fully visible.

Implementation note: the arrow has two nested boxes, because GSAP writes its own transform (and sets `translate: none`) on whatever it animates, which would cancel a CSS hover slide on the same element. The photo's zoom animation targets a wrapper that always exists, so the animation does not depend on the image having arrived.

## Images

The Figma shows each photo cropped and shifted inside its 318 x 203 slot, so each file is **cropped to that visible slot at 2x (636 x 406) and compressed to AVIF quality 95, 4:4:4**: `news-1.avif` 92 KB (47.7 dB), `news-2.avif` 101 KB (45.8 dB). Two cards use `news-1`. Served as they are (`unoptimized`), requested after the page has loaded and the browser is idle (`useIdleReady`). `arrow.svg` is the Figma export, unmodified. The photos are decorative (empty alt): the card link has a name.

## Fonts

The design uses Plus Jakarta Sans **Light (300)** for the excerpt. It was not among the loaded weights, so `PlusJakartaSans-Light.woff2` was added to `src/fonts/index.ts` (8 font files in total, about 270 KB; see [05-design-system.md](05-design-system.md)).

## Fidelity

Verified in Chrome at 1920px (frame 1520 x 506) against the Figma render:

- Pill at x 0, y 149 (Figma 149), 279 wide; heading 52px under the pill top; paragraph 127px under it, three lines, 471 wide. Cards start at x 526 and are 506 high, 24px apart, the last ends at 1520. Date at card x +18, y +21; title 12px below the date; excerpt five lines, 261 wide; arrow at card x +17, y 258.9, 27 x 14.7; photo 203 high at the bottom of the card. All within 1.5px.
- The whole render is 18 dB (11% of values differ by more than 24): the equal card widths, two rendering differences (Figma's grayscale anti-aliasing against Chrome's coloured sub-pixel text in the screenshot) and the photo crops of the third card. The layout and text positions match.
- Hover (1920px): the card moves up 6px with a shadow, the photo scale is 1.06, the title is `#123b7a`, the arrow moves 8px.
- Layout switches checked at 1700, 1440, 1280, 1100, 768 and 390px, and with reduced motion at 390 and 1920px: no horizontal page overflow, hidden until scrolled to, all visible after the animation, never hidden with reduced motion. No console errors.

## Known issues and open items

- Content is placeholder: replace with the news from the CMS (Payload) when it exists; the card links are `#`.
- Card width 310 vs 318 in Figma (above). The third card's photo and the crop are the Figma's.
- Two new colours not in the brief's palette: `brand-paper` `#fbfbfb` and `brand-cloud` `#f6f6f6`.
- The carousel behaviour below 1024px (swipe) is mine; Figma shows only the three cards. If the design means the cards to scroll or slide on desktop too, tell me.
