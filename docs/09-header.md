# Header

Implemented from Figma file `vmveiWg8pCIGYCrlaqrRLw`:

| Variant | Node | Frame |
| --- | --- | --- |
| Transparent (over the hero) | `6282:929` | 1920 x 993. The header is only the top row. The hero image, gradients, "Courage that I am enough" text and slider dots in that frame are hero content and were **not** built. |
| Solid | `5688:14371` | 1920 x 74 |

Code: `src/components/layouts/Header/`. Content: `src/data/header.ts`. Types: `src/types/header.ts`. Rendered once from `src/app/layout.tsx`.

## Variants

| | Transparent | Solid |
| --- | --- | --- |
| Background | none | `bg-brand-blue` (`#123B7A`) |
| Content column | 1740px (90px margins at 1920px) | 1520px (200px margins at 1920px) |
| Height | row is 60px, starts 40px from the top (header box is 100px) | 74px bar, 45px row starting 14px from the top |
| Position | `fixed` at the top of the screen (since 2026-10-28; was `absolute`), looks transparent only over the hero, see "Scroll-up header" | `sticky top-0` (keeps its 74px in the page flow) |
| Menu icon | white (`menu-light.svg`) | green `#4DA44B` (`menu-green.svg`) |
| Logo, "Admissions Open" | identical in both (white text) | |

`<Header variant="transparent" | "solid" />`. If `variant` is omitted, **the home page (`/`) is transparent and every other page is solid.** That rule is my inference (the transparent design is shown over the "Homepage" hero). To change it, edit the one line in `Header.tsx` or pass `variant` explicitly.

The transparent header is white on whatever is under it. It needs a dark hero image (the Figma hero has a dark gradient at the top for this). The placeholder home page has a dark navy background for the same reason.

## Scroll-up header (owner request, 2026-10-28)

On every page the header **slides away while the visitor scrolls down and comes back the moment they scroll up.** Local, not committed or pushed yet.

- **The rule** is a pure function in `src/lib/headerVisibility.ts` (tested in `headerVisibility.test.ts`): never hidden in the first 80px of the page (also the negative positions of a phone's rubber band); below that it hides after 8px of scrolling down and shows after 8px of scrolling up. Smaller wobbles change nothing, so it does not flicker. Both numbers are constants at the top of the file.
- **Solid pages** (everything except the home page): the bar is `sticky`, as before, and only slides up and down (translate), so the content under it does not move.
- **Home page:** the bar is now `fixed` (it was `absolute` and left with the hero, so it could not come back further down). The transparent look only works over the hero, so the bar has two looks:
  - **Transparent**, while it is over the hero. The hero section carries `data-header-overlay`; the header is "over the hero" while the bottom of that section is more than 74px below the top of the screen. The hero is pinned for about three screens, so this covers the whole hero scroll.
  - **Solid blue bar** (the same bar as on the other pages: 1520px column, 74px, green menu icon) everywhere after the hero, because white text over the white sections is unreadable.
  - The change between the looks is a 0.3s transition of the background, padding, row height and content width, and the menu icon cross-fades (both icons are always in the button), so it morphs instead of jumping.
- **Keyboard:** tabbing into a hidden header shows it (`onFocus`).
- **Reduced motion:** it still hides and shows, with no sliding or morphing (`motion-reduce:transition-none`).
- If a page has no `data-header-overlay` section (the home sections switched off), only the very top of the page counts as "over the hero".
- **Checked in Chrome on the dev server** (`localhost:3000`): at the top the home header is transparent and over the hero; scrolling down inside the hero hides it; scrolling up inside the hero shows it, still transparent; far below the hero it hides on the way down and comes back as the solid blue bar on the way up; scrolling back up it turns transparent when the hero's bottom reaches about 99px from the top, with no sample where it was transparent over a white section; back at the top nothing has moved. On a solid page (the 404 at a 420px-high window): sticky, 74px, content starts under it, hides down, shows up. Tabbing into a hidden header shows it (one run failed only because Tab was pressed while the smooth-scroll was still running down, which correctly hides it again). Reduced motion hides and shows. No console errors. Unit tests: 9. Not run: the full QA suites and the screenshot comparison, a phone or touch device (the rule is the same, the touch rubber band is covered by a unit test), and the other views at the transparent and solid looks on a real laptop width.

## Layout details (matches Figma at 1920px)

- Logo: **353px wide, about 52px tall** from 768px up; **259 x 38px** below (since 2026-10-28, the designer's outlined-vector file `lps-logo-v2.svg`; the previous file and the Figma logo of 2026-10-19 were 353 x 60 and 328 x 60). The width was kept so the row and gutters did not change; the new shape is lower (aspect 6.8). A 60px-tall version would be 408px wide: open design decision. In the solid bar it is taller than the 45px row and is centred on it, as in Figma.
- Right group: "Admissions Open" (18px, white), 32px gap, 37px menu icon.
- Both groups are vertically centred in the row.

Responsive (my interpretation, only desktop is designed):

| Viewport | Behaviour |
| --- | --- |
| below 640px | "Admissions Open" is hidden. Logo is 44px tall (about 259px wide). Gutters 20px. |
| 640px to 767px | "Admissions Open" shown. Logo 44px tall. |
| 768px and up | Logo 60px tall (353px wide). Gutters: the fluid `--spacing-gutter` (about 38px at 768px, 5% of the screen width, up to 80px; was 40px). |

## Assets (`public/images/header/`)

- `lps-logo-v2.svg` (**current, 2026-10-28**): the designer's final logo, `LPS-Logo-new-q-04 1.svg`. **All paths, no embedded PNG** (sharp at any size, 2x included), 90 KB after svgo (52.7 dB against the original at 4x), `viewBox` cropped from the 4153.7 x 804.2 canvas to the drawing (`431 158 3294 484`) so the logo sits on the gutter; nothing redrawn. Its tagline reads "SEVEN TIME IN A ROW" (no S; to confirm with the owner). New file name because of the 7-day `/images` cache. The description below is the previous file, `lps-logo.svg` (deleted), kept as history.
- ~~`lps-logo.svg`~~: **replaced on 2026-10-28 by the new logo supplied by the owner** (file `Logo (1).svg`, renamed `lps-logo.svg`; the old file was `logo.svg`. It has a new NAME on purpose: `/images` is cached for 7 days, so a new file under the old name would have kept showing the old logo in browsers, and to visitors after a deploy, for up to a week), 353 x 60, with the complete tagline ("...SEVEN TIMES IN A ROW"). It has no background elements (checked: the corners are transparent), so nothing was removed from it. It was optimised with the project's svgo recipe (209 KB to **121 KB**, 48.4 dB against the original when both are rendered at 4x). The wordmark and the tagline are one embedded PNG (500 x 87) placed with a transform: svgo's 2-decimal rounding moved it by 1.3px, so `scripts/svgo.config.cjs` now keeps the precision of transforms (see the changelog). History of the previous logo (Figma node `6523:8812`, 328 x 60): its Figma SVG export includes the ancestors' backgrounds (an `#EFEFEF` rect, an off-canvas outline path, and a `#F9F9F9` page-size rect). **Those three elements were removed and nothing else was changed**, so the logo is transparent. The same export as PNG is fully opaque, which is why SVG is used.
- `menu-light.svg`, `menu-green.svg`: the two `jam:menu` icons, unmodified (they are different shapes and colours in the two variants).

## Fidelity

Verified in Chrome against the production build:

- All four measured elements (header box, logo, "Admissions Open", menu button) are within 0px of Figma's position, in **both** variants, at 1920px.
- No horizontal overflow at 360, 390, 640, 768, 1024, 1280, 1536, 1920 and 2560px, in both variants. No console errors.
- Solid bar vs the Figma frame: 2.5% of pixels differ. A zoomed shift test shows the difference is sub-pixel placement of the logo (Figma puts it at y=6.5px; the best-fit shifts of 0px and +1px score almost the same) plus the font difference below.
- The footer was re-checked after changing `Container` and is unchanged (745px tall, 0 elements off).

## Known differences and open items

- **Font.** "Admissions Open" is **DM Sans** in Figma. DM Sans was not supplied, so it uses Plus Jakarta Sans (about 3px wider text).
- ~~**The logo's tagline is cut off in the Figma design** ("...SEVEN TIMES IN A R").~~ **Fixed 2026-10-28:** the new logo file has the full tagline "...SEVEN TIMES IN A ROW".
- **Logo weight.** The previous `logo.svg` was 219 KB (very detailed paths plus an embedded wordmark PNG). Optimised on 2026-10-21 with svgo (path precision 2 decimals, `viewBox` and ids kept): **130 KB**, the same drawing (51.7 dB against the original when both are rendered at 4x). A cleaner logo export from the designer would still be smaller.
- **Menu button does nothing yet.** The off-canvas menu is not designed. The button has an accessible name ("Open menu") but no action. When the menu is designed it needs `aria-expanded`, `aria-controls`, a focus trap and Escape handling.
- **"Admissions Open" link is `#`** until the target page exists.
- **Scroll behaviour:** see "Scroll-up header" above. Open: the owner/designer has not drawn the solid look over the home sections (it reuses the solid bar from the other pages) or the transition between the looks; the 0.3s morph, 8px and 80px are my values.
- **`usePathname()` and dynamic routes.** `Header` uses `usePathname()`. Cache Components (which would require a `Suspense` boundary for this) is **off** since the Payload setup, so nothing is needed today. If Cache Components is ever turned back on, wrap `<Header />` in `<Suspense>` (or always pass `variant` explicitly).
- No hover/focus styles were in the design. Added: link underline on hover, menu button fades slightly on hover, visible focus outlines.
