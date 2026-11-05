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
| About Us | Welcome to LPS, Principal’s Welcome, Partnerships, Campus Experience, Awards & Recognition, Signature Events, Student Council, Information Desk |
| Admissions | Why LPS, Admissions Overview, Admission to Class XI, Student Services, Enquire Now |
| Pre-Primary | Welcome to LPS Pre-Primary, Learning Approach, Student Life, Events & Celebrations |
| Primary | Welcome to LPS Primary, Learning Approach, Student Life, Events & Celebrations, Inter House Activities |
| Secondary | Welcome to LPS Secondary, Learning Approach, Student Life, Clubs, Events & Celebrations, Inter House Activities |
| XI & XII (was "Higher Secondary") | Welcome to LPS Senior Secondary, Academic Framework, Department of Commerce, Department of Humanities, Department of Science, LPS Business Conclave, Career Readiness Programme |
| Alumni | Alumni Guidance, Success Stories |
| Connect | News & Events, Careers, Contact Us |

To change any of it: edit `src/data/menu.ts`.
- **Every address is `#`** until the pages exist ([03-sitemap.md](03-sitemap.md)), **except eight links**: the two "Contact us" links (the utility link at the top and the one under Connect) are `/contact-us` ([28-contact-page.md](28-contact-page.md)) "Principal’s Welcome" under About Us is `/principals-welcome` ([29-principals-welcome.md](29-principals-welcome.md)) and "Partnerships" under About Us is `/partnerships` ([30-partnerships.md](30-partnerships.md)) and "Awards & Recognition" under About Us is `/awards-recognition` ([31-awards-recognition.md](31-awards-recognition.md)) and "Student Council" under About Us is `/student-council` ([32-student-council.md](32-student-council.md)) and "Signature Events" under About Us is `/signature-events` ([33-signature-events.md](33-signature-events.md)) and the first "Welcome to LPS" under About Us is `/welcome-to-lps` ([34-welcome-to-lps.md](34-welcome-to-lps.md); the stage-specific "Welcome to LPS Pre-Primary" and the like are other pages and stay `#`).

## Tablet and phone (my design: only desktop is in Figma)

- **Tablet, 768 to 1279px:** the same white panel and the same two columns (main items left, links right, the divider), without the photo (a tablet does not download it); the close button and the two small links at the top, the buttons at the bottom.
- **Phone, below 768px** (changed 2026-10-29 from the owner's reference picture): the white panel with the **crest photo across the top** (`menu-crest-wide.avif`, a wider cut of the same picture, 780 x 358, 83 KB, 45.5 dB) and the **close button on the photo** (32px, top right); under the photo **"Parent Login" and "Contact us" in one row** (13px text, 24px icons; 12px below 360px, so they stay in one row down to 320px); the main items **stacked**, 18 to 20px text, with a chevron and a **light line under each** (1px, silver at 70%; under the whole item, so an opened item’s links are inside it; rows about 51px, no gap; not on desktop or laptop, where the Figma design has no lines); the chosen one **opens downward** and shows its links under it, with the green mark (28px here, so it stays clear of the dividers; 41px on desktop) (**an accordion**: tapping it again closes it; all are closed when the menu opens); then the two buttons one under the other, full width. The panel scrolls if the screen is too short (a phone with a section open, or a 640px high one); with every item closed it fits an 844px high phone exactly (the rows are 44px tall, still a full tap target).
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

## Fix 2026-11-02: the right-hand links shook while the menu opened

- **Cause:** the first list's links start rising after a 950 ms delay (the panel is still arriving). A timer at 1200 ms then switched the delay to the short 60 ms one for later hovers, **while those links were still animating**. Changing the delay of a running CSS animation shifts its timeline, so the links jumped forward at 1.2 s: the shake the owner saw ("all these right items shake when opening").
- **Fix (`MegaMenu.tsx`):** the switch now happens only after the first list has finished rising (950 ms + the last link's stagger + 900 ms + 100 ms, about 2.5 s), and only the FIRST list uses the long delay at all: a list chosen by pointing at another item always uses the short one, so its delay never changes while it plays.
- **Checked** on the dev server by sampling every frame of the first link's opacity and offset while the menu opened: a smooth rise from about 1.0 s to 1.8 s, no jump at 1.2 s.

## Second fix 2026-11-02: hover no longer changes the list unless the mouse really moves

- **Why:** the owner still saw the right-hand links shake "sometimes" after the first fix. I could not reproduce it in an automated Chrome (no jank, no layout shift, no long tasks, nothing moves sideways; checked on the Contact and Home pages, at four window sizes, with classic scrollbars, down to the pixels). The most likely remaining cause, and the only one that depends on something random (where the mouse rests): while the menu slides in, the main items also rise 12px under a mouse that is resting over the lists, and a real browser then sends "pointer enter" for whatever ends up under the pointer, with no mouse movement, so the chosen item and its link list swapped back and forth by themselves.
- **Fix (`MegaMenu.tsx`):** pointing at a main item chooses it only if the pointer's screen position really changed in the last 200 ms. The position is watched on the whole document (`pointermove`, capture). Events caused by the page moving under a resting mouse come at the same position and are ignored; a real mouse move changes it. (An earlier attempt used the event's `movementX/Y`: Chrome reports 0 for automated input, so it could not be verified and was dropped.)
- **Tests:** two unit tests (a hover at a resting position does nothing; the same item chosen once the mouse really moves). In Chrome with the menu open: hover events at an unchanged position are ignored, a real move onto item 4 and then item 6 chooses them.
- **Not proven:** this fixes the cause I think is likeliest; if the shake still happens, a screen recording (or the window size and the Windows display scale) is what is needed next.

## Third fix 2026-11-02: the whole canvas twitched when the menu opened (the real cause)

- **What the owner saw:** "it opens smooth the first time, but when you close it and open it again the whole canvas shakes and jitters a little" (not only the right-hand items).
- **Cause (measured, on every open):** opening the menu locks the page's scroll (`lockScroll`, `overflow: hidden` on `<html>`), which removes the page's scrollbar. On a desktop with classic scrollbars (Windows) the page then becomes 15px wider in the very first frame: everything centred behind the menu (the header, every section) **jumped 7.5px sideways**, and the menu panel itself changed width from 1905 to 1920px. The page behind is in view for most of the 1000 ms slide, so the whole canvas twitched. The earlier two fixes (a delay change at 1.2 s, hover events under a resting mouse) were real but small; none of the automated tests could see this because they opened the menu once and watched the menu's links, not the page behind it.
- **Fix (`globals.css`):** `html { scrollbar-gutter: stable; }`. The scrollbar's space is always reserved, so locking or releasing the scroll no longer changes any width. Measured on the Home and Contact pages, three opens and closes each: the header's x and the menu's width never change. The page scrollbar still shows as before; a phone or a Mac (overlay scrollbars) is not affected. While the menu is open the reserved 15px strip beside it is white, like the panel. A page shorter than the window would show a blank 15px strip on the right on a classic-scrollbar desktop (every page of the site scrolls).
- **Not retried:** the opposite approach (padding the page by the scrollbar's width in `lockScroll`) would also have to pad the fixed header; the gutter does it with one CSS rule.

## Fourth fix 2026-11-03: the main items shook when the menu opened (the real cause, found by the owner)

- **What the owner saw:** clicking the hamburger, the big menu opened with things shaking (not on hover). The three earlier fixes did not remove it.
- **How it was found:** a long run of measurements in a headless Chrome showed nothing (smooth frames, nothing behind or inside the menu moving, no scrollbar appearing, the browser's threads idle). The owner's method did: switch all the menu's animations off (the shaking was gone), then add them back one group at a time. The group that brought it back: **the main items rising and fading in** (About Us, Admissions ...).
- **Cause and fix:** the items rise by a CSS transition; the browser makes a layer for each item when its rise starts and drops it when it ends, and text is drawn differently on a layer and off it, so each item flickered once (eight times in a row). The items (and the other rising parts: the top row, the two buttons and the active list's links) now stay on their own layer for as long as the menu is open: `will-change: transform, opacity` while `open` (the `promoted()` helper in `MegaMenu.tsx`). Same cause and remedy as the page reveals ([04-animation-guidelines.md](04-animation-guidelines.md)). Confirmed by the owner for the main items.
- **How it was found, kept for next time:** a stage number in the component switched the menu's animation groups on one at a time (0 nothing moves, 1 the panel slide, 2 the main items, 3 the small links, 4 the top row and the buttons, 5 the small hover effects). The owner checked each stage on their own screen; the shaking came back at stage 2. The switch was removed once the whole menu was confirmed; only `promoted` (the layer classes) stays. If the menu ever shakes again, the same bisect is the fastest way to find the part.
