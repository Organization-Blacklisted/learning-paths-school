# Design System

## Brand

TBD: logo and tone, pending assets from the school.

## Colors

### Brand palette

Source: the "04 Colour palette & design tokens" section of the project brief, which says to use the supplied palette image as the approved palette. Defined in `src/styles/colors.css` and imported by `globals.css`.

| Swatch | Hex | Token | Tailwind examples |
| --- | --- | --- | --- |
| Amber | `#F9A825` | `--color-brand-amber` | `bg-brand-amber`, `text-brand-amber` |
| Green | `#338845` | `--color-brand-green` | `bg-brand-green` |
| Green light (not in the brief; from the Figma footer) | `#4DA44B` | `--color-brand-green-light` | `text-brand-green-light` |
| Graphite (not in the brief; body text in the Figma vision/mission/values section) | `#474747` | `--color-brand-graphite` | `text-brand-graphite` |
| Ghost (not in the brief; light grey of the "The courage to find" heading in Figma) | `#E8E8E8` | `--color-brand-ghost` | `text-brand-ghost` |
| Steel dark (not in the brief; second column of the Figma "Our Learning Journey", close to steel) | `#A0B1CA` | `--color-brand-steel-dark` | `bg-brand-steel-dark` |
| Slate (not in the brief; third column of "Our Learning Journey") | `#416295` | `--color-brand-slate` | `bg-brand-slate` |
| Blue deep (not in the brief; darker pills of the "LPS 360 Framework" diagram) | `#0E2F61` | `--color-brand-blue-deep` | `bg-brand-blue-deep` |
| Blue night (not in the brief; the ENTERPRISING label in the diagram) | `#0B2349` | `--color-brand-blue-night` | `text-brand-blue-night` |
| Blue darker (not in the brief; end of the CTA band gradient) | `#0A295E` | `--color-brand-blue-darker` | `to-brand-blue-darker` |
| Paper (not in the brief; text panel of the news cards) | `#FBFBFB` | `--color-brand-paper` | `bg-brand-paper` |
| Cloud (not in the brief; news card background) | `#F6F6F6` | `--color-brand-cloud` | `bg-brand-cloud` |
| Navy (darkest) | `#061939` | `--color-brand-navy` | `bg-brand-navy`, `text-brand-navy` |
| Blue | `#123B7A` | `--color-brand-blue` | `bg-brand-blue` |
| Blue mid | `#2F538B` | `--color-brand-blue-mid` | `bg-brand-blue-mid` |
| Steel (light blue-grey) | `#AAB9CF` | `--color-brand-steel` | `bg-brand-steel` |
| Mist (lightest blue-grey) | `#D0D8E4` | `--color-brand-mist` | `bg-brand-mist`, `border-brand-mist` |

Notes:
- **Values are unverified against Figma.** The brief says to extract exact HEX/RGB from the source Figma colour styles before implementation. These hex codes were read from the labels printed on the palette image. Compare them with Figma and correct if they differ.
- **Names describe the colour, not its role.** Roles (primary, accent, text, surface, success) are not decided yet. When they are, add semantic aliases, e.g. `--color-primary: var(--color-brand-blue)`, and use those in components.
- The `brand-` prefix avoids confusion with Tailwind's built-in `amber`, `green` and `blue` scales.
- Tokens use `@theme static`, so every colour is also available as a CSS variable (`var(--color-brand-navy)`), which helps for animation code and CSS modules.
- Verified: all 7 variables are in the compiled CSS, and the `bg-`, `text-` and `border-` utilities generate.

### Base tokens

Still the generator's defaults, in `src/app/globals.css`. They are not yet tied to the brand palette:

| Token | Light | Dark |
| --- | --- | --- |
| `--background` | `#ffffff` | `#0a0a0a` |
| `--foreground` | `#171717` | `#ededed` |

The dark-mode block is leftover boilerplate. Decide whether the site has a dark mode at all (the brief does not mention one) and, if not, remove it. See [decisions](07-decisions.md).

## Typography

Fonts are local files in `src/fonts/`, loaded in `src/fonts/index.ts` with `next/font/local` (`display: swap`). Only `.woff2` is shipped (the legacy `.woff` files were removed). Every browser released since about 2016 supports it; only Internet Explorer 11 does not.

| Role | Family | Tailwind class | CSS token | Weights |
| --- | --- | --- | --- | --- |
| Headings | Lexend Deca | `font-heading` | `--font-heading` | loaded: 400, 500, 600 (files for 100 to 900 are supplied), no italics |
| Body | Plus Jakarta Sans | `font-body` (also `font-sans`) | `--font-body` | loaded: 300, 400, 500, 600, 700 upright (files for 200 to 800 with italics are supplied) |

- Tokens are defined in `src/styles/typography.css`. To swap a font, change only that file.
- **Accent serif:** `font-accent` (`--font-accent`) is for one highlighted phrase, used by the CTA band ("LPS Forward"). The design's font is **Scaver**, not supplied yet, so it falls back to a system serif. See [17-cta-section.md](17-cta-section.md).
- `h1` to `h6` get `font-heading` by default via a base rule in `globals.css`. `body` gets `font-body`.
- Use `font-heading` / `font-body` in components, not the family names.
- Lexend Deca has no italic files, so `italic` on a heading is browser-synthesized. Avoid it.
- Role assignment (Lexend = headings, Plus Jakarta = body) was an assumption when the fonts were added. The Figma footer supports it (heading is Lexend Deca Medium; links and contact text are Plus Jakarta Sans), but the owner has not confirmed it.
- The Figma footer also uses **Proxima Nova**, which was not supplied. See [footer](08-footer.md).

### Font loading (optimised 2026-10-21)

Next.js preloads **every** font file declared in `src/fonts/index.ts` on every page, so only the weights the design uses are declared: **Lexend Deca 400, 500, 600** and **Plus Jakarta Sans 300, 400, 500, 600, 700** (all upright; 300 was added for the news card text), 8 files and about 270 KB instead of 23 files and 775 KB. The other supplied files are still in `src/fonts/lexend/` and `src/fonts/plus-jakarta/` (Lexend Deca 100 to 900, no italics; Plus Jakarta Sans 200 to 800, each with an italic). To use another weight, add one line to `src/fonts/index.ts`, for example `{ path: "./lexend/LexendDeca-Light.woff2", weight: "300", style: "normal" }`. A weight that is used in the markup but not declared is not an error: the browser picks the nearest declared one and fakes the rest, so check new designs against the list. See [production readiness](16-production-readiness.md).

### Type scale (fluid)

Source: the "Text style / Desktop size" table in the project brief. Defined in `src/styles/typography.css`. Each size scales smoothly with the viewport using `clamp()`, growing linearly from its minimum at a **360px** viewport to its maximum at **1280px**, and staying at those values outside that range. **No font size on the site is a fixed number (owner rule, 2026-10-28):** `text-body`, `text-body-sm` and the `text-px-*` sizes below are clamps too, and `src/styles/typography.test.ts` fails if a token is not a clamp or if a component uses `text-[17px]`, an inline numeric `fontSize` or a px line height (`leading-[26px]`, `leading-5`); line heights are ratios.

| Brief text style | Tailwind class | Desktop (brief) | Mobile min (assumed) | `clamp()` value | Line height (assumed) |
| --- | --- | --- | --- | --- | --- |
| Subpage hero H1 | `text-h1` | 48px | 32px | `clamp(2rem, 1.6087rem + 1.7391vw, 3rem)` | 1.15 |
| H2, primary section headings | `text-h2` | 40px | 28px | `clamp(1.75rem, 1.4565rem + 1.3043vw, 2.5rem)` | 1.2 |
| H3, smaller headings / cards | `text-h3` | 20px | 18px | `clamp(1.125rem, 1.0761rem + 0.2174vw, 1.25rem)` | 1.3 |
| Body large | `text-body-lg` | 18px | 16px | `clamp(1rem, 0.9511rem + 0.2174vw, 1.125rem)` | 1.6 |
| Body regular | `text-body` | 16px | 15px | `clamp(0.9375rem, 0.913rem + 0.1087vw, 1rem)` | 1.6 |
| Body small, supporting text and labels | `text-body-sm` | 14px | 13px | `clamp(0.8125rem, 0.788rem + 0.1087vw, 0.875rem)` | 1.5 |
| Homepage hero H1 | not defined | "Varies" | | | |

Resolved sizes, measured in Chrome against the production build:

| Viewport | h1 | h2 | h3 | body-lg | body | body-sm |
| --- | --- | --- | --- | --- | --- | --- |
| 360px | 32.0 | 28.0 | 18.0 | 16.0 | 15.0 | 13.0 |
| 768px | 39.1 | 33.3 | 18.9 | 16.9 | 15.4 | 13.4 |
| 1280px | 48.0 | 40.0 | 20.0 | 18.0 | 16 | 14 |
| 1920px | 48.0 | 40.0 | 20.0 | 18.0 | 16 | 14 |

Notes:
- **Only the desktop sizes come from the brief.** The mobile minimums and all line heights are my provisional values. The brief says mobile type scaling and font weights are "to confirm against Figma". Update them when Figma is checked.
- **Font weights are deliberately not set** in the tokens, because the brief says weights are still to be confirmed. Apply them per element (`font-semibold`, etc.) for now.
- **Homepage hero H1 is not defined.** The brief says "Varies / follow the specific homepage banner composition in Figma". Add a token once Figma gives the sizes.
- `h1` to `h6` elements are **not** auto-sized. Pick the size with a class, because the page's `<h1>` is not always the "subpage hero" style (the homepage hero differs).
- To change the fluid range, edit the viewport bounds and recompute the `clamp()` values. They are `min + (max - min) * (100vw - 360px) / (1280px - 360px)`, written as `intercept + slope*vw`.
- The tokens use `@theme static`, so `var(--text-h1)` also works in plain CSS and animation code.

### Homepage hero text

From the Figma hero (node `6282:929`). Fluid between a 360px and a 1280px viewport like the rest of the scale, line height 1.2, letter spacing -0.01em. Mobile minimums are provisional.

| Token | Desktop | Mobile min | Used for |
| --- | --- | --- | --- |
| `text-hero-80` | 80px | 44px | Slides 2 and 3: title |
| `text-hero-72` | 72px | 40px | Slide 1: title. Slides 2 and 3: quote |
| `text-hero-64` | 64px | 36px | Slide 1: quote |
| `text-hero-32` | 32px | 20px | Slides 2 and 3: "that" |
| `text-hero-28` | 28px | 18px | Slide 1: "that" |

See [home hero](11-home-hero.md).

## Spacing and layout

Two values from the project brief ("Main content container: 1520 px for most sections (desktop)" and "Section-to-section spacing: 200 px as a common desktop reference") are shared pieces, so every section uses the same numbers.

### Container widths

`CONTAINER_WIDTH` in `src/components/layouts/Container/Container.constants.ts`, used by `<Container contentWidth={...}>` and `<Section contentWidth={...}>`:

| Name | Width | Used by |
| --- | --- | --- |
| `main` (default) | **1520px** | Every normal section (brief), the footer, the solid header |
| `wide` | 1740px | The home hero text and the transparent header (Figma, 90px margins at 1920px) |

(The Figma footer is 1530px wide. It uses `main` instead, a 10px difference accepted by the owner.)

The container adds side gutters around the content. **LOCAL TRIAL (2026-10-28, not pushed): the gutter is the fluid token `--spacing-gutter` = 5% of the screen width, never below 20px and never above 80px** (about 51px at 1024, 64px at 1280, 68px at 1366, 72px at 1440, 80px from 1600 up); it used to be a flat 20px (below 768px) and 40px (768px and up). The content area is exactly the chosen width (1520px for the main container) from 1680px up and shrinks with the screen below that; at 1920px the margins are still 200px. See [06-changelog.md](06-changelog.md).

### Section spacing

Token `--spacing-section` in `src/styles/spacing.css`: **200px on desktop**, fluid down to **80px** on small screens (scales between a 360px and a 1280px viewport like the type scale; the 80px minimum is my assumption, the brief only gives 200px). Available as Tailwind utilities: `gap-section`, `pt-section`, `pb-section`, `mt-section`, and so on.

| Viewport | `--spacing-section` |
| --- | --- |
| 360px | 80px |
| 768px | 133px |
| 1024px | 167px |
| 1280px and up | 200px |

### The `Section` component

`src/components/layouts/Section/`. Use it for every page section:

```tsx
<Section label="Our values">…content…</Section>                       // main container + standard spacing
<Section contentWidth={CONTAINER_WIDTH.wide} label="…">…</Section>      // a different container width
<Section spacing="none" contained={false}>…full-bleed…</Section>        // e.g. a hero that sets its own height
```

Spacing rule: **every section starts one `--spacing-section` (200px at desktop) below whatever is above it** (the hero or the previous section), and **the last section on the page also gets one `--spacing-section` below it**, before the footer (`pt-section last:pb-section`; `last:` applies when the section is the last child of `<main>`). So between two sections there is exactly one gap, never two. A section that is not the last child, or a page that ends with something other than a `Section`, gets no bottom spacing from this. (The hero, the header and the footer do not use `Section`; they set their own sizes.)

Dev server note: after the spacing file was added, a running `npm run dev` kept serving a stylesheet without the new token and the sections showed no spacing at all. Restart the dev server (delete `.next`, then `npm run dev`) whenever a new CSS file is added.

Verified in Chrome: the container content is 1520px at 1920px; the token is 200px at 1280px and wider, 167px at 1024px, 133px at 768px and 80px at 360px; two adjacent sections are exactly one token apart at every width.

## Components

| Component | Location | Status |
| --- | --- | --- |
| `Badge` | `components/ui/Badge` | the green pill (default and compact sizes) |
| `ButtonLink` | `components/ui/ButtonLink` | green and light link buttons |
| `SectionTitle` | `components/ui/SectionTitle` | the h2 of a section (Lexend Regular, fluid h2 size, graphite); tracking and wrapping per design in `className` |
| `Accent` | `components/ui/Accent` | the blue slanted word inside a heading (Lexend Medium, `skewX(-8deg) scaleY(0.99)`) |
| `BodyText` | `components/ui/BodyText` | the large body paragraph (fluid 16 to 18px, line height 1.5); colour in `className` |
| `Photo` | `components/ui/Photo` | a photo that waits for `ready` (see `useIdleReady`); already-compressed AVIF, not re-encoded |
| `RotatingWord` | `components/ui/RotatingWord` | one word of a line that swaps by itself (crossfade + 10% slide, 0.5 s), like boltonschool.org; built for the Courage heading's `"rotate"` option (not the one in use now) |
| `TabBar` | `components/ui/TabBar` | accessible tab bar with a sliding highlight, phone auto-scroll, arrow/Home/End keys |

Type sizes of small details: `text-px-12`, `-14`, `-16`, `-17`, `-18`, `-20`: **fluid since 2026-10-28** (the number is the size from 1280px up, the design size; 360px minimum is 11, 13, 15, 16, 16 and 18px; size only, set the line height with a ratio `leading-[1.5]`, not px). See [23-shared-building-blocks.md](23-shared-building-blocks.md).
