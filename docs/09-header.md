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
| Position | `absolute` at the top of the page, scrolls away | `sticky top-0`, stays visible |
| Menu icon | white (`menu-light.svg`) | green `#4DA44B` (`menu-green.svg`) |
| Logo, "Admissions Open" | identical in both (white text) | |

`<Header variant="transparent" | "solid" />`. If `variant` is omitted, **the home page (`/`) is transparent and every other page is solid.** That rule is my inference (the transparent design is shown over the "Homepage" hero). To change it, edit the one line in `Header.tsx` or pass `variant` explicitly.

The transparent header is white on whatever is under it. It needs a dark hero image (the Figma hero has a dark gradient at the top for this). The placeholder home page has a dark navy background for the same reason.

## Layout details (matches Figma at 1920px)

- Logo: 328 x 60. In the solid bar it is taller than the 45px row and is centred on it (top at y=6.5px), as in Figma.
- Right group: "Admissions Open" (18px, white), 32px gap, 37px menu icon.
- Both groups are vertically centred in the row.

Responsive (my interpretation, only desktop is designed):

| Viewport | Behaviour |
| --- | --- |
| below 640px | "Admissions Open" is hidden. Logo is 44px tall (about 240px wide). Gutters 20px. |
| 640px to 767px | "Admissions Open" shown. Logo 44px tall. |
| 768px and up | Logo 60px tall (328px wide). Gutters 40px. |

## Assets (`public/images/header/`)

- `logo.svg`: the exported logo node (`6523:8812`), 328 x 60. The Figma SVG export includes the ancestors' backgrounds (an `#EFEFEF` rect, an off-canvas outline path, and a `#F9F9F9` page-size rect). **Those three elements were removed and nothing else was changed**, so the logo is transparent. The same export as PNG is fully opaque, which is why SVG is used.
- `menu-light.svg`, `menu-green.svg`: the two `jam:menu` icons, unmodified (they are different shapes and colours in the two variants).

## Fidelity

Verified in Chrome against the production build:

- All four measured elements (header box, logo, "Admissions Open", menu button) are within 0px of Figma's position, in **both** variants, at 1920px.
- No horizontal overflow at 360, 390, 640, 768, 1024, 1280, 1536, 1920 and 2560px, in both variants. No console errors.
- Solid bar vs the Figma frame: 2.5% of pixels differ. A zoomed shift test shows the difference is sub-pixel placement of the logo (Figma puts it at y=6.5px; the best-fit shifts of 0px and +1px score almost the same) plus the font difference below.
- The footer was re-checked after changing `Container` and is unchanged (745px tall, 0 elements off).

## Known differences and open items

- **Font.** "Admissions Open" is **DM Sans** in Figma. DM Sans was not supplied, so it uses Plus Jakarta Sans (about 3px wider text).
- **The logo's tagline is cut off in the Figma design** ("...SEVEN TIMES IN A R"). It is reproduced as designed. This looks like a mistake in the design (a masked crop). Ask the designer for the full "...IN A ROW" version.
- **Logo weight.** `logo.svg` was 219 KB (very detailed paths plus an embedded wordmark PNG). Optimised on 2026-10-21 with svgo (path precision 2 decimals, `viewBox` and ids kept): **130 KB**, the same drawing (51.7 dB against the original when both are rendered at 4x). A cleaner logo export from the designer would still be smaller.
- **Menu button does nothing yet.** The off-canvas menu is not designed. The button has an accessible name ("Open menu") but no action. When the menu is designed it needs `aria-expanded`, `aria-controls`, a focus trap and Escape handling.
- **"Admissions Open" link is `#`** until the target page exists.
- **No scroll behaviour.** The transparent variant does not turn solid on scroll. If that is wanted (a common pattern), it needs a decision and a scroll listener or `IntersectionObserver`.
- **`usePathname()` and dynamic routes.** `Header` uses `usePathname()`. Cache Components (which would require a `Suspense` boundary for this) is **off** since the Payload setup, so nothing is needed today. If Cache Components is ever turned back on, wrap `<Header />` in `<Suspense>` (or always pass `variant` explicitly).
- No hover/focus styles were in the design. Added: link underline on hover, menu button fades slightly on hover, visible focus outlines.
