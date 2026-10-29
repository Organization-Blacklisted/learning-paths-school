# Footer

Implemented from Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `6282:795` (1920px desktop frame). Code is in `src/components/layouts/Footer/`, content in `src/data/footer.ts`, types in `src/types/footer.ts`. It is rendered once, from `src/app/layout.tsx`.

## Structure

1. **Call to action:** eyebrow ("THE NEXT PATH COULD BEGIN HERE"), heading with "Lead" highlighted, description, "Begin an Admission Enquiry" button.
2. **Info columns:** Contact info, Useful links (two lists), Connect (Facebook, YouTube, X, Instagram).
3. **Bottom bar:** copyright, "Privacy Policy | Terms & Conditions".

Editing text or links means editing `src/data/footer.ts` only.

## Design tokens used

| Design value | Token |
| --- | --- |
| Background `#061939` | `bg-brand-navy` |
| Button `#338845` | `bg-brand-green` |
| "Lead" highlight `#4DA44B` | `text-brand-green-light` (added; not in the brief's palette) |
| Heading 40px Lexend Deca Medium | `font-heading text-h2 font-medium` |
| 18px text | `text-body-lg` |
| Rules: white at 16% opacity | `border-white/16` |
| Social box border: white at 14% | `border-white/14` |

## Layout and breakpoints

The Figma file has **only the desktop design**. Tablet and mobile are my interpretation. If the design has tablet/mobile frames, send the links and this should be checked against them.

| Viewport | Layout |
| --- | --- |
| below 768px | Everything stacked. Sections separated by horizontal rules. Links in one column. |
| 768px to 1199px | Heading and description/button side by side (two equal columns). Info sections stacked. Link lists in two columns. |
| 1200px and up | **The desktop design** (owner, 2026-10-24: laptops keep it; it started at 1400px before). CTA row: heading column 528px, text column up to 619px (at 1200px it takes the 568px that are left, the text wraps more). Three-column info row (`1fr 548px 1fr`), vertical dividers, top rule. The gap between columns grows from 40px (at 1200px the side columns are 246px) to 146px. |
| 1600px and up | The content column is its full 1520px (the standard main container). |
| 1650px and up | CTA column narrows to the exact Figma width (590px, shifted 13px right). |
| 1920px | Matches Figma. |

Bottom bar (copyright and the legal links): below 1024px the two lines are stacked and **centred** (owner, 2026-10-24); from 1024px they are on one row, copyright at the left edge and the links at the right edge (as in Figma).

Content column: the standard `Container` (the brief's 1520px main container, no special width) has the fluid side gutter `--spacing-gutter` (5% of the screen width, 20px to 80px; a local trial since 2026-10-28, it was 20px / 40px), so the content is exactly 1520px wide from 1680px up, with 200px margins at 1920px. Below 1680px the footer content is narrower than before (1296px at 1440, 1152px at 1280, 1080px at 1200: the three info columns still fit, with 226px side columns at 1200).

**The rules (Figma updated 2026-10-29, from 1200px):** the horizontal rule above the info row sits at the very TOP of that row, and the two vertical dividers hang from it down to the bottom bar's rule (316px, one row under the rule). Figma had a bug that drew the horizontal rule 29px lower, so the dividers stuck out above it; the owner reported it and the design was corrected. In the code the rule is the info grid's `before` (`-top-px`, 1px above the grid) and the dividers start at the top of the grid (`dividerClass` in `Footer.tsx`). Measured at 1920px against the corrected Figma render: rule directly above the dividers, dividers 316px tall ending at the bottom rule, and the gap from the button to the rule 71px (it was 101px). Same geometry at 1440 and 1200px. Below 1200px the info columns are stacked with horizontal rules and are unchanged.

**Deviation from Figma, accepted by the owner:** the Figma footer column is 1530px (195px margins). Using the shared 1520px container instead moves the left and right edges 5px further in at 1920px (left items at x=200 instead of 195, legal links ending at 1720 instead of 1725; the CTA right column shifts 5px left too). The middle and right columns are unchanged (x=686 and x=1380), because the side columns shrink by 5px each (340 / 548 / 340 instead of 345 / 548 / 345). All vertical positions and the 745px height are unchanged.

## Fidelity

Verified in Chrome against the production build, comparing against the Figma metadata and a 1920px Figma screenshot:

- Footer height at 1920px: 745px (Figma: 745px).
- All 18 measured elements (headings, paragraphs, links, buttons, social icons, bottom bar) were within 0px of their Figma position at 1920px (x, y, width, height) when the footer used the Figma 1530px column. With the 1520px container the vertical positions and the 745px height are unchanged, the middle and right columns are unchanged, and the left and right edges are 5px further in (see the deviation above). Re-checked in Chrome: 0 elements off against the updated expected positions, no overflow from 360px to 2560px. The pixel diff vs the Figma screenshot rose from about 2.8% to 4.7% because of that 5px shift.
- Rules, dividers (including the 30px that rise above the top rule), borders, and the four social icons show no difference in a pixel diff.
- No horizontal overflow at 360, 390, 768, 1024, 1280, 1399, 1400, 1536, 1610, 1920 and 2560px. No console errors.
- 2026-10-24 (the 1200px change): measured in Chrome on the production build at 390, 768, 1000, 1100, 1199, 1200, 1250, 1280, 1360, 1399, 1400, 1440, 1649, 1650 and 1920px: the info row is stacked up to 1199px and three columns from 1200px, the CTA row is the desktop row from 1200px, no page overflow, no text sticking out of its column. From 1400px up the measured widths did not change (the gap formula only lost its 64px floor, which only applied below 1400px). **Correction (found by the screenshot comparison on 2026-10-24):** that change also dropped the CTA row's `align-items: end` (it had come from the tablet `md:items-end` class that also applied on desktop), which moved the CTA text and button 14px up from 1200px; restored with `min-[1200px]:items-end` (the row is bottom-aligned, as in Figma). The one visible difference at 1200 to about 1290px: the address in the narrow left column wraps after "Pin-".

Not pixel-identical, and why:
- **Proxima Nova text.** The CTA description, button label, column titles ("Contact info", "Useful links", "Connect"), copyright and legal links are set in **Proxima Nova** in Figma. That font was not supplied, so they use Plus Jakarta Sans. It is wider, so the button is 263px wide instead of 253px, and the description needs a 619px box to stay on two lines. Supply the Proxima Nova files (or confirm Plus Jakarta Sans is acceptable) to close this.
- **Antialiasing.** Windows Chrome uses ClearType subpixel antialiasing and Figma's screenshot uses grayscale, so glyph edges differ slightly even for identical fonts and positions.
- **Bullets** are drawn as 6px CSS circles positioned from measurements of Figma's, within 0.5px, rather than the browser's default list marker (which sat 2.5px off).

## Decisions and deviations

- The four line SVGs exported from Figma were **not** used. They are plain 1px white lines (16% opacity, except the eyebrow rule at 100%), so they are CSS borders and stretch with the layout. The four social SVGs are used unmodified from `public/images/footer/`.
- Facebook and Instagram icons include their own 40px bordered box; YouTube and X are bare glyphs inside a CSS-bordered box. That is how Figma builds them, and it was kept.
- Hover and focus styles are **not in the design** and were added: text links underline on hover, the button brightens, and every link has a visible focus outline.
- Phone and email are real `tel:` and `mailto:` links. The phone link is `tel:+91-0172-5134300` exactly as written (the "0" after +91 looks like a trunk digit, so confirm the number).

## Open items

- **All footer links except `tel:` and `mailto:` are `#` placeholders.** Pages (Admission Enquiry, School Timings, Holiday List, Privacy Policy, ...) are not in the sitemap yet. Social profile URLs are also needed.
- Proxima Nova font files (see above).
- Tablet and mobile design (see above).
- No animation yet. The site is meant to be heavily animated, so footer entrance animation needs a decision once the animation library is chosen.
