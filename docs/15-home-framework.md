# Home: The LPS 360 Framework

Figma: "Frame 1618876729", node `6529:1879`, 1421 x 1075px. Code: `src/components/sections/home/FrameworkSection/`. Content and all positions: `src/data/home-framework.ts`. Types: `src/types/home.ts` (`FrameworkContent`, `FrameworkItem`). Shared green pill: `src/components/ui/Badge/` (also used by [Our Learning Journey](14-home-journey.md)). Rendered from `src/app/(frontend)/page.tsx` **after** the sideways scene: when the pan ends on the Journey section the page continues **down** to this (in the Figma canvas it sits below the Journey frame). It is the fifth home section and uses the standard `Section` (200px above and below).

## What it is

A green pill **The LPS 360 Framework**; the heading **By the end of 15 years at LPS, *your child becomes a Pioneer*** (grey Lexend Regular 40px, then the blue skewed Lexend Medium part, like "Our Learning Journey"; shown in **Title Case** through CSS `capitalize`, as in Figma, since 2026-10-27); a 842px intro paragraph; and a **diagram** (**1319** x 773px, "Group 241"; 1228 wide until 2026-10-27): an ellipse ring (525 x 592) with a photo of two students in an ellipse inside it (377 x 463), the label **LPS 360** above, and seven pills around it that spell **PIONEER**. Each pill is 219 x 55, joined to the ring by a short line and a dot on the ring, with a description beside it.

| Pill | Side | Pill colour | Description |
| --- | --- | --- | --- |
| P Proficient | left, top | `#123b7a` | Learner-centred approach for robust competency and skills. |
| I Inclusive | left, middle | `#0e2f61` | SEN-SEL-parenting support for every child to know "I AM ENOUGH" |
| O Open-minded | left, bottom | `#123b7a` | Choice and collaboration to enable Critical Thinking and Decision Making. |
| N Novel | bottom, centre | `#0e2f61` | STEAM driven innovation, problem-solving, and holistic thinking to drive creative, independent learning. |
| E Enterprising | right, middle | `#123b7a` | Resourcefulness and initiatives to develop Agents of Change |
| E Ethical | right, bottom | `#123b7a` | Promotes Sustainability to inculcate socially responsible citizens |
| R Resilient | right, top | `#123b7a` | Sports Excellence and Wellness to promote Self-governance, Anti-fragility, and physical fitness. |

Pill anatomy (Plus Jakarta Sans Bold 20px, -1% spacing): a dark rounded body, a white circle outline with the letter, a white capsule (171.4 x 40.6, soft shadow) that holds the label, and a small white bar joining circle and capsule. **The pills on the left are the right-hand design mirrored** (the letter circle is on the ring side and the white capsule sticks out away from the ring); the text is not mirrored.

Positions in the diagram (Figma px, from its top left): ring 358, 10; photo 431.19, 71.82; LPS 360 581.62, 0; pills P 195.6, 57; I 109.6, 254; O 193.6, 497; N 535.6, 634; right side from the top: **Resilient 825.75, 57 (219.296 x 54.64); Enterprising 914.06, 254; Ethical 828.06, 497.16** (changed on 2026-10-27, see below). All are in `home-framework.ts`.

**Order on the ring (new design, 2026-10-27).** Going round from the top left the letters must spell **PIONEER**: P, I, O down the left, N at the bottom, then up the right side E (Ethical, bottom right), E (Enterprising, middle right), R (Resilient, top right). Before, the right side ran Enterprising, Ethical, Resilient from the top, which spelled PIONREE. Only the positions changed: each right-hand pill keeps its wording, colours and its description's offset from the pill (Resilient 70.89 right and 89.05 down, Enterprising 52.66 and 70.06, Ethical 8.3 and 92.11); the connector line and dot belong to the position on the ring. The order of the items in the data (and so the reading order on a phone) is still P, I, O, N, Enterprising, Ethical, Resilient. **Checked against Figma node `6282:930` on 2026-10-27** (design context and metadata read through the Figma connector). The new design widened the diagram from 1228 to **1319px** because the Resilient description is now a **422px** box (two lines) that runs to the diagram's right edge, so the stage is 1319px wide here too (`stage.width` in the data, and `1319` in the two stage classes of `FrameworkSection.tsx`). The ring therefore sits 39px left of the heading's centre, as in Figma. Right-hand groups, exact numbers (Figma px): Resilient pill 825.75, 57, line 793.4 / 84.32, dot 789.54 / 77.91, text 897 / 146 / 422 wide; Enterprising pill 914.06, 254, line 881.87 / 281.36, dot 878 / 274.96, text 966.72 / 324.06 / 314.365 wide; Ethical pill 828.06, 497.16, line 795.99 / 524.67, dot 792.12 / 518.27, text 836.36 / 589.27 / 311.103 wide. The left side, the ring, the photo, the label, the colours and the font sizes already matched. A browser check measures the ring, the photo, the label, the seven pills and the seven descriptions against these numbers (all within 0.9 Figma px at 1920, 1440 and 1280px, no horizontal overflow).

**Careful with the right-hand groups.** The design context gives each right-hand group's left edge, but the group is the mirror image of a left-hand one: the dot is at the group's left edge, the pill at its right. The first build put the dots on the far side of the pills; it was found by comparing with the Figma render and fixed (the Novel group is mirrored the same way: dot at x 621.4, line at 627.0, on the ring's bottom point).

## Layout and responsive behaviour

- **lg (1024px) and up: the diagram is positioned exactly like the design and scales as one piece.** `--u` is one Figma pixel (diagram width / 1228, never above 1px); every size and position (including the text sizes) is `calc(N * var(--u))`, so the text wraps exactly like the design at any width. At 1920px, 1440px and wider it is exactly the 1228 x 773 of the design; at 1280px it is 1200 wide (0.977), at 1024px 944 wide (0.769, descriptions 13.8px).
- **Below 1024px:** the design only exists for desktop, so this is my interpretation: heading (wraps), the paragraph, "LPS 360", the photo (up to 260px wide, centred), then each pill followed by its description, stacked and centred. The ring, lines and dots are hidden (they are decorative and do not load).
- The heading is one line from 1280px (xl); below that it wraps (balanced).

## Animation

Owner: a highly interactive homepage. Nothing is specified in Figma, so this is my design. It plays **once, by itself**, when the section scrolls into view (top at 65% of the screen), about 2.5 seconds (not scroll-driven: this section scrolls normally, the owner disliked a pinned scroll-driven text section earlier):

1. The pill, heading and paragraph rise 24px and fade in, one after another.
2. The ring grows in (scale 0.85 to 1) and the photo pops (0.6 to 1, small overshoot); "LPS 360" drops in.
3. The seven pills follow, 0.16s apart, in the order P, I, O, N, E, E, R: each flies in from its side (left pills from the left, right pills from the right, Novel from below), its line draws out from the pill toward the ring, its dot pops, and its description rises in.

Reduced motion: no animation, everything shown. Without JavaScript everything is shown too.

## Images

- Loading: the photo is requested after the page has loaded and the browser is idle (`useIdleReady`); its box (`aspect-ratio` on a phone, the Figma size from lg) keeps its space meanwhile.
- `pioneers.avif`: the ellipse photo (the Figma PNG with transparent corners, 755 x 927, 0.9 MB) as **AVIF quality 95 with alpha**, 170 KB, 47.1 dB on the visible pixels. Served as it is (`unoptimized`).
- The ring, the letter circle (`circle.svg`), the six lines (`line135.svg` to `line140.svg`) and the seven dots (`dot221.svg` to `dot226.svg`) are the Figma SVGs, **unmodified** (they differ slightly in colour, `#123B7A` or `#0E2F61`), in `public/images/home/framework/`. The lines and dots are only rendered from lg up.

## Fidelity

Verified in Chrome at 1920px, after the animation, against the Figma render (1421 x 1075, content area 1228 x 1003 cropped):

- Diagram 1228 x 773. The ring, photo, "LPS 360", all seven pills (within 0.02px) and all seven descriptions (positions and sizes, and the 2 or 3 line wraps) are at their Figma positions. The intro is 842 wide, two lines, centred. The heading part in blue is within 1px of Figma's glyph position (a small -ml and +mr were needed because Figma's text boxes differ from the browser's; same trick as the Journey heading).
- The whole render matches Figma at 26.0 dB PSNR (3% of values off by more than 24). A difference map shows what is left is text and photo edge anti-aliasing, not layout.
- Responsive at 1440, 1280, 1024, 800 and 390px (and 390 and 1920px with reduced motion): no horizontal overflow, nothing outside the screen, no description overlapping a pill, every part hidden before the section is reached and fully visible after the animation (reduced motion: never hidden). No console errors.

## Known issues and open items

- **Text weight:** like the other sections, small text may look heavier in the browser than in the Figma render (Proxima Nova question in [08-footer.md](08-footer.md)).
- **Colours not in the brief's palette:** `#0e2f61` (`brand-blue-deep`) and `#0b2349` (`brand-blue-night`, only the ENTERPRISING label). The Novel label is `#0f2f61` in Figma (1 level off `#0e2f61`) and uses `brand-blue-deep`. Small design inconsistencies like these (the letter "O" is 1px lower than the others, the Resilient pill is 0.3px wider) were mostly reproduced; the Novel label colour and the letter positions are normalised to the data in `home-framework.ts`.
- **Below 1024px is my interpretation** (list layout).
- **Alt text** of the photo is mine; the ring, lines and dots are decorative.
- The Figma canvas has more frames below (dotted outlines): next sections.
- **Sideways scroll below 360px wide (found 2026-10-28, not fixed):** the white label boxes of the diagram stick out of the screen by 5px at 350px wide and by 20px at 320px wide, so the page scrolls sideways a little on very small phones. Seen with a measurement of every element wider than the screen; it is the `absolute bg-white` boxes of this diagram. Not caused by the 2026-10-28 changes (the side margin is 20px below 400px, as before).
