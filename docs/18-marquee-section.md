# Shared section: photo marquee

Figma: "Group 143", node `6282:891`, 1920 x 320px. A **reusable**, endlessly scrolling strip of photos used on many pages, **at any position** (the owner: "its reused at multiple pages"; on the home page it happens to be directly above the footer). Code: `src/components/sections/shared/MarqueeSection/`. Default content: `src/data/marquee.ts` (`defaultMarquee`), type `MarqueeContent` in `src/types/marquee.ts`. Photos: `public/images/marquee/`. On the home page it is the last section, after the CTA band, with `attachToFooter` so it touches the footer.

## How to use it on a page

```tsx
import MarqueeSection from "@/components/sections/shared/MarqueeSection";

<MarqueeSection />                                                       // the standard strip, anywhere on the page
<MarqueeSection attachToFooter />                                        // last thing before the footer: touches it (home page)
<MarqueeSection content={{ label: "Sports day", images: [{ id: "a", src: "/images/…/a.avif", alt: "…" }, …] }} />
```

**It can go anywhere between sections.** It is a normal `Section`: full width (not inside the container), 200px of section spacing above it, and 200px below it only when it is the last section (the same rule as every other section, so the gap between two sections is always one 200px). Only when it must touch the footer, pass `attachToFooter` (no space below). Checked in a production build with a test page: in the middle (200px above, 0 below, next section 200px further), as the last section (200px below), and on the home page with `attachToFooter` (0px to the footer). It works with any number of photos (the loop is built from the list), but six or more squares are best: one list must be wider than a phone screen.

## The design

Six square photos of 320 x 320 side by side with no gaps: exactly 1920px, the screen width in the design. In the code the tile size is **one sixth of the screen width, between 160px and 320px**, so at 1920px (and wider) it is the design and on a phone about 2.4 tiles show.

Photos (square crops from the Figma originals, centred, like the design's `object-cover`): roller skating, a stage performance, a sports-court race, a child on a climbing frame, a music room, a house parade with a red flag. 640 x 640 AVIF (twice the size shown), quality 95, 124 to 207 KB each, 44.7 to 47.1 dB, 974 KB in total. They are served as they are (`unoptimized`). Alt texts are mine.

## How the loop works

- The list is rendered **four times** in a row in one track. GSAP moves the track left by exactly one list's width, forever (`ease: none`, `repeat: -1`), so when it starts over nothing changes on screen: seamless. Four copies fill screens up to 5760px wide (checked at 3840px). The copies are `aria-hidden` and `inert`; only the first list is read by assistive technology.
- **Constant speed: 60 px per second** at every screen size (measured 60.5). The duration is the list width divided by the speed, and it is rebuilt (keeping its place in the loop) when the width changes.
- **Hover:** it eases to a stop under the pointer (0.6 s) and eases back up to speed on leaving (0.8 s), so a photo can be looked at.
- **Off screen:** it pauses (no work for the browser) and resumes when it comes back.
- **Reduced motion:** it does not move; the first photos are shown still.
- Photos are requested after the page has loaded and the browser is idle, plus 1 s (`useIdleReady`, the strip is at the bottom of the page). The tiles keep their size meanwhile. The same six URLs serve all four copies, so it is 6 downloads, not 24.

## Fidelity

Verified in Chrome (reduced motion for the static comparison at 1920px):

- Strip 1920 x 320 at x 0; six tiles at x 0, 320, 640, 960, 1280, 1600, each 320 x 320; directly above the footer (0px between).
- Against the Figma render: 31.4 dB. Per tile 29 to 35 dB (photo resampling). The one real difference is the ellipse below.
- Motion: 60.5 px/s; the loop stays within one list width at all times; hovering stops it (`-529.6` to `-529.6` over 0.8 s); leaving resumes it; it stands still while the strip is off screen.
- Tile size, height, no horizontal overflow and enough copies at 3840, 2560, 1440, 768 and 390px. No console errors.

## Known issues and open items

- **Figma "Ellipse 38" is not built.** A soft dark blurred ellipse (`#141414`, 145 x 50px, blur 53) sits on top of the strip at x 887, y 141 in the 1920px frame. It darkens that spot of the Figma render by about 20 levels. It is fixed to one place of the composition, so on a strip that scrolls it would be a stationary smudge in the middle of the screen, which can hardly be the intention (probably a stray layer; the design shows no shadow in other spots). The SVG is not in the project. **Needs the designer's answer**; if it is wanted, it is an absolutely positioned SVG over the strip.
- **No visible pause button.** WCAG 2.2.2 asks for a way to pause moving content that lasts more than 5 seconds. Hovering (and reduced motion) covers mouse users and users who ask for less motion; touch and keyboard users have no control. A design decision; the strip is decorative and has no interactive content.
- Alt texts are mine. Speed (60 px/s) and the hover behaviour are my choices (nothing in Figma).
- Page weight: 974 KB of photos, requested late (after load and idle), so the first screen is unaffected; included in the figures of [16-production-readiness.md](16-production-readiness.md) for the bottom of the page.
