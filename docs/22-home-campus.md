# Home: A Campus Built Around Possibility

Figma: "Frame 1618876520", node `6282:783`, 1520 x 830px. Code: `src/components/sections/home/CampusSection/`. Content: `src/data/home-campus.ts`. Types: `CampusContent` in `src/types/home.ts`. Poster and icon: `public/images/home/campus/`. On the home page it is **below the alumni scene and above What's New** (the owner: "its position is down").

## What it is

Centred: the green pill **SPACE TO EXPLORE**, the heading **A *Campus* Built Around Possibility** (Lexend Regular 40px, "Campus" blue, slanted, Lexend Medium), an 818px paragraph (three lines), and below it, 40px lower, a **1200 x 594 media box** with the label **In-vision 360** and a small icon (white, 18px text, 32px icon) at its bottom right (32px from the right edge, 19px from the bottom).

## The media box is a video that does not exist yet (the owner's instruction)

In Figma the box is a video. **Until the video exists it shows a poster image**: the Figma file's own poster frame of that video. The poster is the node's render exported at 2x (2400 x 1188) and compressed to **AVIF 1800 x 891 (1.5x), quality 88: 281 KB, 46 dB** (`campus-poster.avif`). The 360 icon is the Figma SVG, unmodified (`in-vision-360.svg`). (Figma's file also holds the poster as a raw 1920 x 1080 frame, a slightly different frame of the clip; the export is used because it is what the design shows.)

### How to add the video later

1. Put the file in `public/videos/` (for example `campus.mp4`; also a `.webm` is welcome; keep it small: a muted loop of 10 to 20 s, H.264, under about 4 MB, 1200 to 1600px wide).
2. In `src/data/home-campus.ts` un-comment and set `media.video`: `video: { src: "/videos/campus.mp4", type: "video/mp4" }`. Nothing else changes.

What the video does once it is set (already built and tested with a test clip): it **plays muted, looping and inline, only while at least 35% of the box is on screen**, and pauses when scrolled away; it never autoplays with reduced motion (the poster stays); the `poster` attribute shows the poster while it loads (`preload="none"`, so it costs nothing until used). **A Pause / Play button appears at the bottom left of the box** (WCAG 2.2.2: moving content longer than 5 seconds needs a way to stop it); its label follows the video's real state. The alt text moves to the video's `aria-label`.

## Layout and responsive behaviour

Heading and paragraph are centred and wrap; the media box is 1200px wide at most and keeps its 1200:594 ratio at every width (350px wide on a phone); the label and icon shrink (16px text, 24px icon) and sit 16px from the right and 12px from the bottom below 640px. Normal `Section` (main container, 200px above).

## Animation (nothing in Figma; mine)

- **Text:** the pill, heading and paragraph rise in when the section scrolls into view (timed, replays quickly like the other sections).
- **Media opening (owner, 2026-10-28: "make this more premium"): scrubbed by the scroll, not timed.** While the box rises from the bottom of the screen to 40% down (`start: "top 92%"`, `end: "top 40%"`, `scrub: 0.6`) it opens from a smaller rounded window (`inset(9% 11% round 28px)`) to the full square box while the image settles from a 1.16 zoom, and the label comes in over the last 30%. It follows the visitor's hand and runs backwards when scrolling up. It was a 1.1 s timed clip before.
- **Pointer depth (mouse only, `(hover: hover) and (pointer: fine)`):** the image drifts up to 10 x 7px against the pointer (`quickTo`, 1 s ease) and a soft white light (560px radial gradient, `mix-blend-soft-light`) follows it, fading in and out as the pointer enters and leaves. Transforms and opacity only. The image layer is 12px larger on every side so no edge shows.
- **Parallax:** while the section crosses the screen the image drifts from -5% to +5% inside the box, scrubbed by scroll (the image layer is 12% taller than the box). It gives the still poster depth, and the video too.
- **Label:** "In-vision 360" and its icon now sit on a **glass pill** (`bg-black/25`, `backdrop-blur-md`, hairline `border-white/25`), 24px from the right and bottom edges from 640px (16px below); the Pause button moved to the same 24px. This differs from the Figma frame (plain white text at 32px / 19px) and was made for the "premium" request: easy to undo.
- Reduced motion: none of it, everything shown (box full, label visible). Touch: no pointer effects. Everything is only hidden by JS (the light is `opacity-0` in CSS).

### Checked after the 2026-10-28 change

In Chrome on the dev server at 1440 x 900: the opening is continuous (frame tops 818, 728, 638, 548, 458, 368px give clip insets 8.4%, 4.4%, 1.9%, 0.6%, 0.08%, 0% and a zoom of 1.15 down to 1.00), fully closed again (9%, zoom 1.16) when scrolled back up, the label fades in over the last stretch; a pointer at 25% / 30% of the box moves the image 5 / 2.8px and shows the light, leaving resets both; with reduced motion the box is full (no clip, no zoom) and the light is hidden; on a 390px touch phone the box is 350 x 173, full, no light; no horizontal overflow and no console errors. Seen in screenshots (mid-opening, pointer over the box, the glass label). Not run: the full QA suites and screenshot comparison (the Campus frames differ by the label pill), a real phone, the video path with a test clip.

## Fidelity

Verified in Chrome on the live home page at 1920 x 1080: the box is 1200 x 594 at x 160 and 236px below the top; the pill, heading (y 51) and paragraph (y 115, three lines, 818 wide) are at the Figma positions; the label is at x 1009, y 543 of the box with a 32px icon. Hidden before the entrance, fully shown after; the image drifts 10px over 300px of scroll. Checked at 1440, 1100, 768 and 390px (and reduced motion): no overflow, ratio 2.02, label inside the box, poster loaded. The video path was verified with a temporary test clip (deleted): plays muted and looping, Pause stops it, Play resumes it, reduced motion keeps it paused. No console messages.

## Known issues and open items

- **The video:** supply it (and decide: with sound on request? the design has an "In-vision 360" label and icon, which hint at a 360 viewer: if it means a real 360 video or tour, a different player is needed; for now the tag is a static label).
- Framing: the poster is baked at the design's crop; the parallax shows slightly different slices of it as you scroll.
- Alt text of the poster is mine.
- Figma's frame says 830px high but renders 776px (the media is clipped in its own preview); the design is built from the layer sizes (a 594px box).
