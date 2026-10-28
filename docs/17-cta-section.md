# Shared section: CTA band

Figma: "Frame 1618876569", node `6106:1235`, 1520 x 335px. A **reusable** call-to-action band that closes many pages (the owner: "this runs on multiple pages"). Code: `src/components/sections/shared/CtaSection/`. Default content: `src/data/cta.ts` (`defaultCta`), type `CtaContent` in `src/types/cta.ts`. Parts it uses: `ui/Badge` (new `size="compact"`) and the new `ui/ButtonLink` (`variant="light"`). It is on the home page after the LPS 360 Framework section.

## How to use it on a page

```tsx
import CtaSection from "@/components/sections/shared/CtaSection";
import { defaultCta } from "@/data/cta";

<CtaSection />                                              // the standard admissions band
<CtaSection content={{ ...defaultCta, text: "Other words.", button: { label: "Book a visit", href: "/visit" } }} />
```

Content fields: `label` (accessible name of the section), `badge` (the green pill, shown as written), `titleLead` (white sans-serif), `titleAccent` (the highlighted serif part), `text`, `button` (`label`, `href`). Everything else (gradient, bars, spacing, animation) is fixed, so every page's band looks the same. It is a normal `Section`: main 1520px container, 200px above, and 200px below when it is the last thing on the page. It can go **anywhere** between sections: the spacing rule is the same as for every section (one 200px gap above, and 200px below only if it is the last section).

Default copy (from Figma): pill "THE NEXT CHAPTER IS STILL BEING WRITTEN"; heading "Every Generation Takes *LPS Forward*"; text "From 150 students in 2008 to a community of more than  4,000 today, the scale has changed." (two spaces after "more than", as in the design); button "Explore Admissions" (link is `#` until the admissions page exists).

## The design

- **Band:** 15px corners, gradient to the right from `#123b7a` (`brand-blue`) to `#0a295e` (new token `brand-blue-darker`), clipped.
- **Decoration** (decorative, `aria-hidden`), all anchored to the band's **right** edge so on narrow screens it stays at the right: a blue glow (Figma SVG `glow.svg`, a `#0065FF` circle of 407.8px blurred by 167, shown at 1075.8px) and five slanted white 3% bars (each: rotate 8.82 degrees, squash to 80% tall, slant -37.08 degrees, sized 239 to 437px wide, 820px tall).
- **Content** (padding 51px left, 57px right at xl, vertically centred): pill (Plus Jakarta Sans Regular 17px, 33px high, as written), 20px, heading (Plus Jakarta Sans Regular 48px white, -1% spacing; "LPS Forward" in the accent serif, slanted -8 degrees like the other headings), 20px, paragraph (18px, line height 1.5, white 80%, 545px wide), and the **white button at the bottom right** (4px corners, 15 x 13px padding, "Explore Admissions" in graphite, green external-link icon of 24px; the icon is the two Figma SVG pieces unmodified).
- **Responsive:** from xl (1280px) as designed: content left, button bottom right, one heading line. Below that, my interpretation (only desktop exists in Figma): everything stacks, the heading wraps, the button sits under the text, the pill wraps onto two lines if needed (`Badge` height is a minimum).

## Animation

Plays once, about 1 second, when the band scrolls into view (top at 80% of the screen), not scroll-driven, quick on purpose: the five bars slide in from the right one after another, the glow swells, then the pill, heading, paragraph and button rise in one after the other. Reduced motion: nothing animated, all shown. Without JavaScript all shown too.

## Fidelity

Verified in Chrome at 1920px (band 1520 x 335) against the Figma render:

- Band 1520 x 335, 15px corners, gradient colours within 1 level on the left and middle (48 to 50 dB there). Pill at x 51, y 71.3 (Figma 71.5), 383 x 33 (384 x 33). Heading at x 51, 53px below the pill top, box 65.4px high like the Figma group. Paragraph 545 wide, two lines, 20px under the heading. Button right edge at 1463 (Figma 1463), bottom aligned with the paragraph, icon 24px.
- Whole render 21.7 dB; the remaining difference is the two font substitutions below and the glow: in the bottom right corner the Figma render is a little bluer (blue channel 207 against 188 at the glow centre; the SVG was used exactly as exported, so this is how the browser and Figma blur it).
- Responsive at 1440, 1280, 1100, 768 and 390px and with reduced motion at 390 and 1920px: nothing outside the band, no horizontal overflow, everything visible after the animation (and never hidden with reduced motion), correct layout switch at 1280px. No console errors.

## Known issues and open items

- **Scaver is not supplied.** "LPS Forward" uses the font Scaver in Figma (an elegant display serif). It falls back to a system serif through the `font-accent` token (`--font-accent` in `src/styles/typography.css`: Scaver, then Iowan Old Style, Palatino, Georgia). Supply the font files (`.woff2`) and add them in `src/fonts/index.ts`; the token then picks them up with no other change. The widths differ slightly meanwhile (the accent text box is 281px in Figma).
- **Proxima Nova is not supplied** (the button text, same as the footer, see [08-footer.md](08-footer.md)): Plus Jakarta Sans is used, so the button is 229px wide instead of 219px.
- **Link target** of the button is `#`. Page-specific wording is passed by each page.
- The CTA button never wraps or shrinks (`shrink-0 whitespace-nowrap` in `ButtonLink`, 2026-10-28): at 1308px wide it used to break "Explore Admissions" onto two lines.
- The footer's own "Begin an Admission Enquiry" button still has its own copy of the green look; `ButtonLink variant="primary"` is the same look and the footer can switch to it when next touched.
- Two CTAs back to back (this band and the footer's big call to action) is the design's decision; worth a look once more pages exist.
