# Principal's Welcome page, the text-only hero and the message section

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `5748:2` ("About us - Principal's Welcome", 1920 x 2987px). The header and the footer of the frame are the site's own. Route: **`/principals-welcome`**. Built 2026-11-02, **local, not pushed yet** (see "Before it goes live").

| Part | Code |
| --- | --- |
| Route | `src/app/(frontend)/principals-welcome/page.tsx` (server, static, `revalidate = 3600`) and `PrincipalsWelcomePageClient.tsx` (Live Preview) |
| **Hero, text-only look** | the reusable `PageHero` ([28-contact-page.md](28-contact-page.md)) with no `image`: `src/components/sections/shared/PageHero/` |
| **Message section (new, reusable)** | `src/components/sections/shared/MessageSection/`, type `src/types/message.ts` |
| Call to action and photo strip | the existing `CtaSection` and `MarqueeSection`, with the new `spacing="inner"` (120px) |
| Content (defaults) | `src/data/principals-welcome.ts`, types `src/types/principals-welcome.ts` |
| CMS | global `principals-welcome` (`src/globals/PrincipalsWelcome.ts`), reader `src/lib/api/principals-welcome.ts` (tag `principals-welcome`), mapper `principals-welcome-map.ts`, seed `scripts/seed-principals-welcome.ts` (`npm run seed:principals-welcome`), migration `20261102_071925_principals_welcome` |
| Assets | `public/images/principal/portrait.avif` (the portrait cut from the Figma photo: 1166 x 1224, 242 KB, 45.1 dB) |

## The page, top to bottom (1920px; it all scales down with the screen)

1. **Hero, text only** (32px under the header): the green pill "FROM THE PRINCIPAL'S DESK", the heading "Leading with *Purpose Inspiring Growth.*" (the `<h1>`, one line of 924px; the blue part is "Inspiring Growth."), "A vision for meaningful learning and lifelong growth", and the rule with the crest.
2. **The message** (85px under the hero): the portrait (777 x 816, 8px corners) on the left; on the right the heading `"How can I win medals, Ma'am?"` (40px, the blue part is "Ma'am?"), a 551px rule, five paragraphs (18px) and the signature "Mrs. Vandana Saxena" (bold italic, blue) with "Principal" under it.
3. **The call to action** ("Every Generation Takes LPS Forward") 120px under the message, then **the photo strip** 120px under it, touching the footer. Both are the site's existing sections, unchanged apart from their spacing; their content is the standard one (`src/data/cta.ts`, `marquee.ts`).

The page colour is snow (`#f9f9f9`), as on the Contact page.

**Checked against Figma at 1920 x 993** (the page measured in Chrome): pill y 166, the heading at x 498 and y 215, 924 x 58, the line of text and the rule at 284 and 378 (Figma 283 and 377), the portrait at 200, 539, 777 x 816, the call to action 1520 x 335 at y 1475 (Figma 1474), the photo strip's first photo at y 1930 (1929), the footer at 2250 (2249): all within 1px. The paragraphs break their lines exactly where the design's do (4, 4, 4, 4 and 5 lines; the text is at most 697px wide, the width of the design's text boxes). Pixel difference with the export, text anti-aliasing included: 3.5 (hero), 5.5 (message), 2.7 (call to action, after the owner dropped Scaver: its heading is Lexend now, see [17-cta-section.md](17-cta-section.md)).

## What is new and reusable

### The hero without a photo (`PageHero`, one component, two looks)

`PageHero` takes `image` as optional. **No image: the text-only look** (this page; the owner: "this page has text only, similar to the About hero"). Same card, same animation, same crest rule; the differences are the ones in the design: the card starts 32px under the header (there is no photo to overlap), the rule is 66px under the text (45px with a photo) and 30px from the bottom (51px), and the pill is **SemiBold** (Bold with a photo): `Badge size="eyebrow-semibold"`. In the CMS: `pageHeroFields({ photo: false })` leaves the Photo field out, and `pageHeroFromDoc` never gives a text-only hero a photo. Use it for the other text-only inner pages (About and the like).

### The message section (`<MessageSection content />`)

A portrait beside a letter, for any message from a person (the Principal, the Chairperson, a founder). `MessageContent` (`src/types/message.ts`): `label`, `image`, `titleLead`, `titleAccent`, `paragraphs: string[]`, `signatory: { name, role }`. A line break inside a paragraph is kept (it starts a new line with no extra space: the design's last paragraph does that).

- **Layout:** from 1024px the portrait (777fr) and the letter (706fr) are side by side, 37px apart and centred on each other; below 1024px the portrait is on top (as wide as the column, at most 560px) and the letter under it (my interpretation: only desktop is designed).
- **The section brings no space of its own** (`spacing="none"`): the page puts it where its design has it (85px under the hero on this page).
- The portrait is preloaded (`priority`): on a desktop it is the biggest thing on the first screen.
- **The signature's italic** is a new font file (Plus Jakarta Sans Bold Italic, `src/fonts/index.ts`, `plusJakartaItalic`) with `preload: false`: it is fetched only on a page that shows a signature, not on every page like the other weights.
- Animation (once, when it comes into view): the portrait rises and fades in, then the heading, the rule, the paragraphs and the signature one after the other. Reduced motion: nothing moves.

### Section spacing "inner" (120px)

`<Section spacing="inner">` (and the same prop on `CtaSection` and `MarqueeSection`) gives the 120px this design draws between sections (`--spacing-inner`: 120px from 1280px up, 64px at 360px). The home page keeps the 200px (`default`).

**A lesson that is written down because it cost an hour:** the token was first called `--spacing-block`. Tailwind turns every `--spacing-<name>` into utilities, and **`block` collided with its own `block` and `inline-block`**: it generated `.inline-block { inline-size: var(--spacing-block) }`, so every slanted blue word of a heading (`<Accent>` is `inline-block`) was suddenly 120px wide and the heading broke in two. Never name a spacing token with a Tailwind word (block, inline, flex, grid, hidden, table...). It is noted in `src/styles/spacing.css`.

### Shared code for the pages' globals

`src/globals/shared/page-global.ts` (`publishedOnlyAccess`, `revalidateOnPublish(tag)`, `livePreviewAt(path)`) and `src/lib/api/cached-global.ts` (`globalReader(slug, tag)`) replace the copies of the same rules: the Contact page now uses them too, and so does every page to come (Home still has its own copy). `src/lib/api/media-map.ts` (`photoFromMedia`) is the one place that turns a library photo into a page photo.

## In the CMS (the "Principal's Welcome page" global, group Pages)

Tabs: **Hero** (pill, heading in two parts, line under it: no photo), **Letter** (the portrait, the heading in two parts, the paragraphs (1 to 10, any length), the name and the role) and the **SEO** tab. Drafts, Live Preview (the real page next to the form), Save draft and Publish work as on the other pages; editors may publish. The paragraph list is `required` as well as `minRows: 1`; its rows are titled with the first words of each paragraph (`RowLabel` now cuts a long text). A published change clears the cache tag `principals-welcome`. The **call to action and the photo strip are not editable here**: they are the site's standard ones (on the home page they are the "Call to action" and "Photo strip" tabs, which change the home page only).

Same rule as the other pages: the defaults (`src/data/principals-welcome.ts`) are the base, the CMS overrides what an editor wrote, and anything it lacks is the default for that field; `principalsWelcomeDocFromData` (the seed) is proved to give the defaults back.

**Tested on the dev branch** with a throwaway admin and an editor (deleted afterwards): 24 API checks (a draft stays private, also with `?draft=true`; an editor publishes; the page shows the new pill and heading, the new letter with its line break and signature, and a new portrait with the alt text of the library; the old paragraphs are gone; an empty letter is refused; a visitor cannot write or read versions; the originals are restored) and the admin screens in a browser for both roles (the three pages in the dashboard, the Hero tab without a photo field, the Letter tab with its titled rows, Live Preview, no console errors). The Home page was re-published unchanged to prove that making every list `required` broke nothing there.

## Tests

- **Unit (251 in all, 33 new for this page and its shared code):** `MessageSection.test.tsx` (heading, portrait, paragraphs in order, the line break, the italic signature, the decorative rule, any person's content), `PageHero.test.tsx` (the text-only look: no photo, a semibold pill), `principals-welcome-map.test.ts` (defaults, overrides, empty list, the library portrait, the seed round trip), `page-hero-map.test.ts` (a text-only hero never gets a photo), `media-map.test.ts`, `globals/PrincipalsWelcome.test.ts` (privacy of drafts, fields, no photo in the hero, the list required), `globals/shared/page-global.test.ts` (the three shared rules) and the revalidate route's three tags.
- **Browser, on a clean production build (CI style):** `npm run qa` 33 of 33 (4 new, section 8) and `npm run qa:interact` 130 of 130 (23 new, section 12). The one axe finding on the page is the known white-on-green contrast of the pill and the call to action's pill ([16-production-readiness.md](16-production-readiness.md)).
- **CMS:** tested on the dev branch (above), not on production.

## Before it goes live

1. **Deploy runs the migration** (`vercel-build` applies `src/migrations`): 4 new tables and 2 enums for this global (and the 6 of the Contact page); no existing table changes.
2. **Production has no content for this page until it is seeded** (`SEED_PRODUCTION=1 npm run seed:principals-welcome`, only when the owner says). Until then the live page shows the defaults (the same content, the portrait from `/public`).
3. Open: the real addresses of the "Explore Admissions" button (`#`), a share image for the SEO tab, and the CTA and photo strip being editable from one place (see below).

## Open items

- **The CTA and the photo strip are the same on every page but editable only in the home page's tabs, and there only for the home page.** A shared "site" global (one CTA, one strip, used by every page) would fix it: a decision for the owner.
- The accessible names (the section's name and the portrait's description) are mine.
- Tablet and phone layouts are mine (only desktop is designed).
- The image budget is 10 MB (6.0 MB used).
