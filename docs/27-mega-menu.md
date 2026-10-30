# Mega menu

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `6783:1333` ("Mega menu", 1920 x 993px, desktop only). Code: `src/components/layouts/MegaMenu/`. Content: `src/data/menu.ts`. Types: `src/types/menu.ts`. Assets: `public/images/menu/`. It is opened by the menu (hamburger) button of the header ([09-header.md](09-header.md)).

**Managed from the codebase only** (owner, 2026-10-29), not in the CMS: to change a link, a label or a sub menu, edit `src/data/menu.ts`.

## What it is

When the visitor clicks the hamburger, a panel **comes in from the right and covers the whole screen**.

**Desktop and laptop (from 1280px, the Figma design):** the screen is split in two halves.

- **Left, 960px at 1920:** a photo of the embossed school crest on blue paper (`menu-crest.avif`, 325 KB, 45.5 dB; the Figma layer is a crop of a wider picture, so the file is cut to what the design shows).
- **Right, a white panel:**
  - at the top, **PARENT LOGIN** and **CONTACT US** (16px semibold, spaced capitals, navy, with their blue icons) and the round **close button** (56px, brand blue, white cross, 80px from the right edge);
  - below, the **eight main items** in a column (About Us, Admissions, Pre-Primary, Primary, Secondary, XI & XII, Alumni, Connect: 30px light, charcoal);
  - a thin vertical **divider**, and the **links of the chosen main item** in a second column (16px, graphite);
  - at the bottom the two green buttons **Begin An Admission Enquiry** and **Career** (the shared `ButtonLink`).
- The chosen main item has a **green mark** at its left (the Figma line, `marker.svg`) and slides 12px to the right. **About Us is chosen** when the menu opens.
- **The links are revealed every time an item is chosen (desktop and laptop, owner request 2026-10-30):** each link rises 14px and fades in over 900 ms, one after another 80 ms apart, so pointing at another main item (or clicking it) does not just swap the list: the new links come in one by one. The first menu opening does the same for About Us, starting at about 950 ms (after the panel). It is a CSS animation (`animate-menu-link`, `@theme` in `globals.css`) restarted by the item becoming chosen; the list that was chosen fades out in 200 ms. Not on a phone (the accordion keeps its plain open and close), and not with reduced motion.
- **Choosing an item:** pointing at it with a mouse, clicking it, or pressing Enter or Space on it. The links of the other items cross-fade away; only the chosen item's links can be reached.

## Content

**The owner's final list (2026-10-29)** replaced the dummy links (the Figma frame only drew About Us' links). Spelling and capitals are the owner's, as given.

| Main item | Links |
| --- | --- |
| About Us | Welcome to LPS, Principalâ€™s Welcome, Partnerships, Campus Experience, Awards & Recognition, Signature Events, Student Council, Information Desk |
| Admissions | Why LPS, Admissions Overview, Admission to Class XI, Student Services, Enquire Now |
| Pre-Primary | Welcome to LPS Pre-Primary, Learning Approach, Student Life, Events & Celebrations |
| Primary | Welcome to LPS Primary, Learning Approach, Student Life, Events & Celebrations, Inter House Activities |
| Secondary | Welcome to LPS Secondary, Learning Approach, Student Life, Clubs, Events & Celebrations, Inter House Activities |
| XI & XII (was "Higher Secondary") | Welcome to LPS Senior Secondary, Academic Framework, Department of Commerce, Department of Humanities, Department of Science, LPS Business Conclave, Career Readiness Programme |
| Alumni | Alumni Guidance, Success Stories |
| Connect | News & Events, Careers, Contact Us |

To change any of it: edit `src/data/menu.ts`.
- **Every address is `#`** until the pages exist ([03-sitemap.md](03-sitemap.md)).

## Tablet and phone (my design: only desktop is in Figma)

- **Tablet, 768 to 1279px:** the same white panel and the same two columns (main items left, links right, the divider), without the photo (a tablet does not download it); the close button and the two small links at the top, the buttons at the bottom.
- **Phone, below 768px** (changed 2026-10-29 from the owner's reference picture): the white panel with the **crest photo across the top** (`menu-crest-wide.avif`, a wider cut of the same picture, 780 x 358, 83 KB, 45.5 dB) and the **close button on the photo** (32px, top right); under the photo **"Parent Login" and "Contact us" in one row** (13px text, 24px icons; 12px below 360px, so they stay in one row down to 320px); the main items **stacked**, 18 to 20px text, with a chevron and a **light line under each** (1px, silver at 70%; under the whole item, so an opened itemâ€™s links are inside it; rows about 51px, no gap; not on desktop or laptop, where the Figma design has no lines); the chosen one **opens downward** and shows its links under it, with the green mark (28px here, so it stays clear of the dividers; 41px on desktop) (**an accordion**: tapping it again closes it; all are closed when the menu opens); then the two buttons one under the other, full width. The panel scrolls if the screen is too short (a phone with a section open, or a 640px high one); with every item closed it fits an 844px high phone exactly (the rows are 44px tall, still a full tap target).
- It is **the same set of elements** in all three: the main items and their link lists are one `<ul>`, laid out as a grid with a column per list from 768px and as an accordion below it, so the keyboard and a screen reader get the same menu everywhere.

## Spacing that follows the screen height

Figma's vertical spacing is for a 993px high screen. On a 1366 x 768 laptop the same spacing needs 837px, so the menu would scroll. Every vertical gap (top, to the lists, between the main items, to the buttons, bottom) and the height of a main item therefore **shrinks evenly with the screen height**: at 993px and above it is exactly Figma's value, at 768px about 63% of it (`fit()` and `spacing` in `MegaMenu.tsx`; the buttons, the text and the close button keep their size). **A 1366 x 768 and a 1280 x 720 laptop show the whole menu without scrolling** (the browser checks prove it); only a screen shorter than about 680px scrolls the panel.

## Behaviour and accessibility

- It is a **modal dialog** (`role="dialog"`, `aria-modal`, named "Main menu"). The menu button says `aria-expanded`, `aria-controls="site-menu"`, `aria-haspopup="dialog"`.
- **Closed**, it is in the page (the links can be read by search engines) but off screen, **`inert`** (not focusable, not announced) and invisible.
- **Open:** the focus moves to the close button and **stays inside** (Tab on the last element goes to the first, Shift+Tab on the first to the last); **Escape** closes it and the **focus goes back to the menu button**; **the page behind cannot scroll** (`lockScroll()` in `src/lib/scroll.ts` stops the smooth scrolling and sets `overflow: hidden`); a click on **any link** closes it (and so does a page change).
- **Scrolling inside the menu:** on a phone its scrollbar is hidden (so opening the first item cannot make the panel jump 15px sideways when a scrollbar appears); the panel scrolls with the wheel and with touch (`data-lenis-prevent`, because the page-wide smooth scrolling is stopped while the menu is open and would otherwise cancel the wheel) and does not pass the scroll on to the page (`overscroll-contain`).
- **Reduced motion:** nothing slides or rises; the menu is in place at once.
- **Motion otherwise** (slowed twice on 2026-10-30, owner: "too fast and kind of shaking", then "the transitions need to be slow"): the panel slides in from the right over **1000 ms** with an even ease-in-out (it was 650 ms with a very fast start) and out over 700 ms; **the photo stays still** (it used to settle from a 1.1 zoom while the panel was still sliding, which made the big image shimmer); the small links, the main items and the buttons then **rise and fade in slowly** (900 ms each, 70 ms apart, 12px of travel), starting at 700 ms, when the panel has nearly arrived (they used to start at 280 ms, while it was still moving, and took 500 ms); on closing nothing is delayed and the fade is quick (250 ms). The colour change of a main item on hover has its own 250 ms and no delay (before, it inherited the entrance delay). The panel is promoted to its own layer (`will-change: translate`). Measured at 1920 x 993: the panel is halfway at about 510 ms, the first item starts to appear at about 800 ms and is complete at about 1.5 s, the last one is complete at about 2.0 s, and it leaves in about 660 ms. All of these are constants in `MegaMenu.tsx` (`riseMs`, `startAt`, the panel durations) if it needs to be slower or faster still.
- **The menu sits next to the `<header>`, not inside it:** the header slides away with a transform when the visitor scrolls down, and a fixed element inside a transformed one is placed against that element, not against the screen.
- **The photo is only asked for on a wide screen** (from 1280px), once the pointer or the focus is on the menu button or the menu has been opened; a tablet never downloads a photo, and a phone downloads only the small wide cut (`menu-crest-wide.avif`, 83 KB), also only when the menu is wanted.
- **Links are shown in capitals per word** (`capitalize`, as in Figma): "Welcome to LPS" is displayed "Welcome To LPS" on every link, whatever the casing in `menu.ts`.

## Tokens added

`text-px-30` (fluid, 24px at 360px to 30px from 1280px; the main items), colours `brand-charcoal` `#444444` (the main items) and `brand-silver` `#d1d1d1` (the divider). See [05-design-system.md](05-design-system.md).

## Fidelity

Checked in Chrome at 1920 x 993 against a render of the Figma node: the close button is exactly at x 1784, y 50, 56 x 56; the photo fills the left 960px; the divider is at x 1337 and 536px tall; the buttons are within 2px (Begin An Admission Enquiry at x 1041, 263 x 52 against 264 x 52; Career 133 wide); the first and last links of the second column are within 2px; the text of the main items is on Figma's lines. **One known difference of up to about 7px:** the main items below "About Us" (Admissions to Connect). In Figma the first row is taller (it carries the 41px mark), so the rest sit lower; here every row has the same height (41px) so that nothing jumps when another item is chosen, with the gap between rows set so that the last row is within 2px. The spacing of the two small links at the top is within 4px. The overlay layer of the Figma frame (a 72% black rectangle over the page) is not visible once the panel covers the screen, so it is not built.

## Tests

- `src/components/layouts/MegaMenu/MegaMenu.test.tsx` (14 tests): closed and inert, the eight items and four links when open, the chosen item and the swap of the links, the mouse, the phone accordion, Escape, the close button and the links, the focus in and back, the focus loop, the page scroll, the photo only on a wide screen, the content of `menu.ts`. `src/lib/scroll.test.ts` (3 tests): `lockScroll`.
- `tests/interactions.mjs`, section 10 (25 checks, in a real browser; the last two: the phone photo with the close button on it and the one-row links, and the mouse wheel scrolling the panel): the closed and open states, the full-screen cover, the photo, the close button position and focus, the eight items and About Us' links, the page not scrolling, switching items by click and by mouse, 40 Tab presses staying inside, Escape and the focus back, opening again from About Us, a link closing it, no console errors, reduced motion, 1366 x 768 and 1280 x 720 fitting, tablet (no photo, two columns), phone (stacked, accordion, close).

## Open items

- **The real addresses** of every link (all `#` now). The owner's list had "Welcome To LPS Primary"; written "Welcome to LPS Primary" like the other welcome links (owner agreed).
- Tablet and phone are my design: the designer should look at them.
- **"Parent Login" and "Contact us"** (the two small links at the top of the menu) have no destination yet (`#`).
- Phone: the photo and the one-row links follow the owner's reference picture; the logo is not shown on the menu.
