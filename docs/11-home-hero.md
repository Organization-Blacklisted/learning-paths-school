# Home hero

Homepage hero. Figma: component set "Component 2" (`6253:893`) with three variants (`6253:892`, `6253:891`, `6253:890`), one per slide. The instance used on the page is node `6282:929`. The header inside that frame is the separate [header](09-header.md).

Code: `src/components/sections/home/HeroSlideshowSection/`. Content: `src/data/home-hero.ts`. Types: `src/types/home.ts`. Rendered from `src/app/(frontend)/page.tsx`.

## Slides

| # | Title | Quote | Text scale | Image |
| --- | --- | --- | --- | --- |
| 1 | Courage | "I am enough." | compact: 72 / 28 / 64px | `public/images/home/hero/slide-1.avif` |
| 2 | Commitment | "I can make an impact." | large: 80 / 32 / 72px | `slide-2.avif` |
| 3 | Excellence | "I can become better." | large: 80 / 32 / 72px | `slide-3.avif` |

Each slide has a title (Lexend Deca SemiBold, capitalised), a small "that" (Lexend Deca SemiBold) and an amber `#F9A825` quote (Lexend Deca Medium) skewed with the exact Figma matrix `[1, -0.13917; 0, 0.99027]`. Letter spacing -1%, line height 120%, and the Figma drop shadows. The first slide uses a smaller text scale and slightly different positions than the other two. That is in the design and was kept.

Pagination: a 56 x 8 white pill for the active slide, 12px `#464949` circles for the others, 7px apart, bottom right.

## Behaviour: scroll-controlled

Decided by the owner (2026-10-21): the hero autoplays when the page loads, and once the user scrolls, the scroll takes over and moves through slide 2 and slide 3, and then the page moves on down to the Vision/Mission/Values section (which then pans sideways to "The Courage To Find Your Path", see [13-home-courage.md](13-home-courage.md)), like the ESPN feature.

- **The hero is pinned** to the screen. Scrolling moves one "progress" value from slide 1 to slide 3, **one screen of scroll per slide change** (2 screens in total, so the hero's pin spacer is 3 screens tall). After slide 3 the hero is released and scrolls away.
- That one value drives everything: the image track slides sideways, the texts fade, and the pagination pill glides to the next dot. Scrolling back reverses it.
- **Text:** each text is visible only within half a slide of its own slide, so the outgoing text is gone before the next one appears. A plain cross-dissolve (both at 50%) overlapped into unreadable text when the user stopped half way. At exactly half way between two slides there is no text, just the photos.
- **Autoplay on landing** (from the Figma prototype: 3.5 s per slide, 0.4 s change, loops 1, 2, 3, back to 1). Autoplay works by **scrolling the page** to the next slide's position, so the scroll position is always the single source of truth. The 3 to 1 step scrolls back two screens in 0.4 s, so it visibly passes through slide 2 on the way, as the prototype's track does.
- **The user takes over:** the first wheel, touch or navigation key (arrows, page up/down, home, end, space) stops autoplay. It comes back only if the user returns to the very top and leaves it idle for about 5 s, and it does not start at all if the page loads already scrolled (a reload part way down).
- **Dots:** clickable, they scroll to that slide. Only the active text is exposed to screen readers (`aria-hidden`, `inert`).
- **Reduced motion:** nothing is pinned, no smooth scrolling, no autoplay. Slide 1 shows and the dots switch slides instantly.
- The page has one `h1` (visually hidden, "Learning Paths School").

## Implementation

GSAP ScrollTrigger (`pin: true`) plus Lenis smooth scrolling (`SmoothScroll` component in the layout). A `render(progress)` function writes the track position, the text opacities and the dot sizes and colours for any progress value; scroll calls it continuously, dots and reduced motion call it directly. Shared helpers: `src/lib/gsap.ts` (`registerGsap`) and `src/lib/scroll.ts` (`scrollToY`, which uses Lenis when active). See the [animation guidelines](04-animation-guidelines.md).

History: a first version used custom GSAP with its own autoplay and swipe, then it was rewritten with Embla (less code, swipe and autoplay built in). Scroll control needs the slide to follow the scroll position, which Embla cannot do, so the hero went back to GSAP, now scroll-driven. Embla stays installed for ordinary carousels. Horizontal swipe and hover-pause were dropped with it: on a phone, vertical scrolling is the gesture that moves the slides.

Slides 2 and 3 are **requested only after the page has loaded and the browser is idle** (`useIdleReady`), with `loading="eager"` once rendered (lazy loading would never fetch them: they are off screen on the track). Before this, all three hero photos were requested at once and on a throttled phone slide 1 landed last (10 s). The autoplay timer skips a change while the next slide's photo has not arrived, so a blank slide is never shown. See [production readiness](16-production-readiness.md).

## Images

Source: three PNGs supplied by the owner (1920 x 993, 2.2 to 2.4 MB each, the design's dark top and bottom gradients are baked in). They replaced an earlier set that was exported from Figma and compressed too hard.

Compressed once with `sharp` to **AVIF quality 92** (4:4:4, effort 6), native size, no resizing:

| Slide | File | Size | Fidelity vs the PNG |
| --- | --- | --- | --- |
| 1 (runner) | `slide-1.avif` | 212 KB | 48.0 dB, 0.11% of values off by more than 4 |
| 2 (students) | `slide-2.avif` | 229 KB | 47.5 dB, 0.18% |
| 3 (guitar) | `slide-3.avif` | 245 KB | 47.1 dB, 0.22% |

(The "off by more than 4" figure is the share of colour values that differ by more than 4 out of 255.) The live page, screenshotted in Chrome, differs from the original PNGs by under 0.9 out of 255 on average in the photo area.

How the settings were chosen, measured on the same images: WebP quality 82 (the first attempt) gave about 41 dB with up to 5% of values visibly off, which looked soft. WebP quality 98 gave about 45 dB at 270 to 290 KB. AVIF quality 90 gave 46 to 47 dB at only 170 to 190 KB. Lossless WebP is 1.4 to 1.6 MB.

**The images are served as they are** (`unoptimized` on `next/image`). By default `next/image` re-encodes every image at quality 75 when serving it, which would add a second lossy pass and undo the careful compression. Verified: the bytes served by the site are identical to the files in `public/`, and the page does not go through `/_next/image`. The cost is that every device gets the same 1920px file (about 210 to 250 KB) instead of a smaller one for phones.

Because the gradients are baked into the images, there are no CSS gradient overlays.

Rules for all site images: compress before adding to the project, but check the quality. Measure PSNR (aim for about 45 dB or more) rather than trusting a quality number, and remember that `next/image` re-encodes unless `unoptimized` is set or a higher `quality` is allowed in `images.qualities`.

## Text sizes

New fluid tokens in `src/styles/typography.css`: `text-hero-80`, `-72`, `-64`, `-32`, `-28`, with line height 1.2 and letter spacing -0.01em. Desktop sizes are from Figma. **The mobile minimums are my assumption** (44 / 40 / 36 / 20 / 18px). They scale between 360px and 1280px like the rest of the type scale.

## Layout

Full viewport height (`100svh`, minimum 600px), image covers. Text and dots sit on the 1740px content column (90px margins at 1920px), anchored to the bottom: text 58.2px (slide 1) or 49.3px (slides 2 and 3) up, dots 50px. Below 768px the text sits higher (96px) and the dots lower (32px) so they never overlap.

## Fidelity

Verified in Chrome against the production build (and a smoke test on the running dev server):

- **Geometry:** at 1920 x 993 (the Figma frame size) the title, "that", quote and all three dots of every slide are within about 1px of Figma at their slide's scroll position (the quote box of slide 1 is a fixed 503px box in Figma, so only its position and height are compared).
- **Scroll mapping at exact positions:** 0 screens is slide 1; 0.25 screens has text 1 at half opacity; 0.5 screens has no text and the track at -16.7%; 0.75 screens has text 2 at half; 1 screen is slide 2; 1.5 screens has no text; 2 screens is slide 3. After 2 screens the hero is released.
- **Autoplay:** 3.5 s between slides (measured 3.51 s and 3.41 s), sequence 2, 3, then back through 2 to 1. A wheel scroll stops it for good (6 s watched, nothing moved).
- **Reduced motion:** no pin spacers, no Lenis, no autoplay, slide 1 shown, dots switch instantly.
- **Screen sizes:** one screen of scroll shows slide 2 with no horizontal overflow at 390 x 844, 768 x 1024, 1280 x 800, 1920 x 993 and 2560 x 1300. No console errors.
- The earlier pixel diff of the text area against Figma (about 1%) was measured on the previous version; the text and dots are unchanged.

## Known issues and open items

- **Image resolution.** The Figma source photos are small: 1536 x 1024 (slides 1 and 3) and 1721 x 914 (slide 2). The hero is 1920px wide, so they are already upscaled by about 1.25 times and will look soft on large or retina screens. Ask the school for the original high-resolution photos.
- **Alt texts are mine** (descriptions of the photos). Refine them with the school.
- **Autoplay has no visible pause button.** It stops on the first user scroll or key, and is off with reduced motion, but WCAG 2.2.2 asks for a pause control on auto-advancing content longer than 5 seconds. Needs a design decision.
- **The header scrolls away while the hero is pinned** (the transparent header is positioned at the top of the page, not fixed), so the menu is not reachable during the two screens of the pinned hero. Decide whether the header should stay fixed during the scroll scenes.
- **Scroll distance** is one screen per slide. This is a feel setting (`end` in the ScrollTrigger); the owner or team may want it shorter or longer. Snapping to whole slides when scrolling stops is not done (Lenis and ScrollTrigger snapping conflict; it can be added with Lenis snapping).
- The rest of the homepage is not built.
- Figma also contains a "Component 3" next to "Component 2". It was not used.
