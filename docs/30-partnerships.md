# Partnerships page and the reusable partners section

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `5748:505` ("About us - Partners", 1920 x 2929px; the partner cards are frame `5751:769`). The header and the footer of the frame are the site's own. Route: **`/partnerships`** (the owner wrote `/partnerships/`; Next serves the address without the trailing slash and redirects the other). Built 2026-11-03; **pushed, deployed and seeded on production the same day** (see "Going live").

| Part | Code |
| --- | --- |
| Route | `src/app/(frontend)/partnerships/page.tsx` (server, static, `revalidate = 3600`) and `PartnershipsPageClient.tsx` (Live Preview) |
| **Hero, text-only look** | the reusable `PageHero` with no `image` ([29-principals-welcome.md](29-principals-welcome.md)): nothing new |
| **Partners section (new, reusable)** | `src/components/sections/shared/PartnersSection/`, types `src/types/partners.ts` |
| Call to action and photo strip | the existing `CtaSection` and `MarqueeSection` with `spacing="inner"` (120px), exactly as on the Principal's page |
| Content (defaults) | `src/data/partnerships.ts`, types `src/types/partnerships.ts` |
| CMS | global `partnerships` (`src/globals/Partnerships.ts`), reader `src/lib/api/partnerships.ts` (tag `partnerships`), mapper `partnerships-map.ts`, seed `scripts/seed-partnerships.ts` (`npm run seed:partnerships`), migration `20261103_044102_partnerships_page` |
| Assets | `public/images/partnerships/`: the eight logos (AVIF, 3 to 18 KB each) and `divider.svg` |

## The page, top to bottom (1920px; it all scales down with the screen)

1. **Hero, text only** (the same as the Principal's page): the green pill "OUR PARTNERSHIPS", the heading "Stronger Together Through *Shared Purpose*" (the `<h1>`, one line), "Building meaningful connections that enrich learning experiences", and the rule with the crest.
2. **The introduction** (36px under the hero's card): one centred paragraph, 1520px wide, three lines, 18px, navy at 80%.
3. **The partner cards**, 60px under the introduction: three rows of 3, 3 and 2 cards (the last row is centred), each **494 x 187px**, **18px apart across and 44px down**, white with a 1px border at 12% black and 6px corners. A card holds the **logo**, a thin **divider** (a line that fades out at both ends with a dark green dot) and a **label** ("Curriculum Partner"), all centred.
4. **The call to action** ("Every Generation Takes LPS Forward") 131px under the cards (11px more than the usual 120: the design draws it so), then **the photo strip** 120px under it, touching the footer.

The page colour is snow (`#f9f9f9`), as on the Contact and Principal's pages.

**Checked against Figma at 1920 x 993** (measured in Chrome, by `tests/interactions.mjs` section 15): the pill at y 166, the heading at y 215, the rule at 377, the introduction at y 489 (81px high), the cards at y 630, 861 and 1092 (Figma 630, 861, 1092; widths 494.7 for 494), the call to action band at 1409 (Figma 1410), the photo strip at 1864 (Figma 1865). **Every logo box and every label is within 1px of its Figma offset inside its card.**

## What is new and reusable

### The partners section (`<PartnersSection content />`)

An introduction and a grid of logo cards, for any page that lists partners, sponsors or affiliations. `PartnersContent` (`src/types/partners.ts`): `label`, `intro`, `partners: { logo, role, design }[]`.

- **A card scales as one piece.** The author of the design placed every logo by hand, so the offsets differ from card to card (the logo's top is 35, 21, 23 or 25px; the gap to the divider 2 to 16px; ...). Each card carries its own `design` values in Figma pixels of the 494px card (`PartnerDesign`), and the section scales them with the card itself: the card is a size container (`@container`) and every size is `calc(N * 100cqw / 494)`. So a card is the same picture at any width. The text keeps its size (16 to 18px) and may wrap on a narrow card, which only makes that card taller (187px is a minimum).
- **The grid:** three cards a row from 1024px (as designed), two from 640px, one below. `flex-wrap` with `justify-center`, so a short last row is centred, as in the design.
- **Animation (mine):** the introduction rises in, then the cards rise in one after another, once when the section comes into view (quicker when it comes back); a card lifts 4px under the pointer. Reduced motion: none of it.
- **A lesson:** GSAP writes `translate: none` inline on every element it animates, and that **beats a CSS hover class that uses `translate`**. The first version animated the card and lifted the same card on hover, and the hover did nothing. The list item is what GSAP animates; the lift is on the card inside it (`data-partner` and `data-partner-card`).
- **Accessibility:** a region named for the section, a list of cards, each logo with its description, the divider hidden from assistive technology.

### Logos and the divider

The logos are AVIF with transparency (`sharp`, quality 90). They are the files uploaded in the design, except Arise, which Figma crops: it is cut to the visible part (457 x 311) and scaled to 2x its box (276 x 188). Macmillan's file is shown 3px right of where Figma crops it (invisible). The **divider is an SVG** (`divider.svg`, 182 x 17): two lines with a fading end and a 7px dot (`#10522F`), measured from the exported pixels, so it stays sharp at any size.

## In the CMS (the "Partnerships page" global, group Pages)

Tabs: **Hero** (pill, heading in two parts, line under it: no photo) and **Partners** (the introduction and the **list of partners**, each a logo and a label), and the **SEO** tab. Drafts, Live Preview (the real page next to the form), Save draft and Publish work as on the other pages; editors may publish. A published change clears the cache tag `partnerships`.

- **The partners are a flexible list** (1 to 12 cards, sortable by dragging): partners come and go. It is `required` as well as `minRows: 1`; each card needs its logo and its label.
- **Design values stay in code.** The mapper (`mapPartnerships`) gives each CMS card the `design` of the default card at the same position (the first eight), and a card beyond the eighth the generic values (`GENERIC_DESIGN`: a 200 x 70 logo box). So if an editor drags the cards into another order, each position keeps its offsets (a difference of a few pixels), and a logo with another shape is fitted into its box (never cropped or stretched).
- Same rule as the other pages: the defaults (`src/data/partnerships.ts`) are the base, the CMS overrides what an editor wrote, and anything it lacks is the default; a row without a readable logo is left out; `partnershipsDocFromData` (the seed) is proved to give the defaults back.

**Tested on the dev branch** with a throwaway admin (deleted afterwards): a visitor reads the published page (8 partners) and cannot write (403); an admin signs in and publishes an edit (a renamed card, a ninth card, a new introduction and heading) and the page shows it at once with nine cards; an empty list and a card without a logo are refused (400); the original is restored and the page is back to eight cards.

## Text from the design, and two corrections

As written in the design, except "Guidence Program Partner" is **"Guidance Program Partner"** and the double space in "Knowledge  Partner" is one space (both look like slips; tell me if they are wanted as drawn). Mine, not from the design: the accessible names (the sections' names and the logos' descriptions) and the page's title and description for search engines.

## Tests

- **Unit (286 in all, 19 new):** `PartnersSection.test.tsx` (region, introduction, every partner in order with its logo description and label, the decorative dividers, sizes in container units, any number of partners), `partnerships-map.test.ts` (defaults, an empty document, overrides, the editor's cards as THE cards with the offsets by position, a ninth card with the generic offsets, an unreadable upload keeping its default logo, an empty list, the seed round trip, the eight designed partners), `globals/Partnerships.test.ts` (access, the fields, the list's rules, no character limit) and the revalidate route's fourth tag.
- **Browser** (`tests/interactions.mjs` section 15, 31 checks): the Figma geometry at 1920 (hero, introduction, the eight cards, every logo and label, the call to action, the photo strip), the grid at 320, 360, 390, 768, 1024, 1280 and 1536 (no overflow, 1, 2 or 3 cards a row, a short last row centred, everything of a card inside it), every logo loaded, the hover lift, reduced motion (nothing hidden), the menu's "Partnerships" link. `tests/qa.mjs` section 9: title, description, canonical, og:url, one h1, one main, every image with an alt and every logo with a name, the sitemap, axe.

## Going live (done)

1. **Deploy runs the migration** (`vercel-build` applies `src/migrations`): 4 new tables and 2 enums for this global; no existing table changes.
2. **Seeded on production on 2026-11-03** (`SEED_PRODUCTION=1 npm run seed:partnerships`, on the owner's word). Until the page cache refreshes (within an hour, or at the first Publish in the admin) the live page keeps showing the defaults, which are the same text and photos. A production seed runs in migrating mode since 2026-11-03 (no schema push), so it leaves **no "dev" row** and nothing has to be deleted afterwards (the manual step of 2026-11-02 is gone; see [10-payload-cms.md](10-payload-cms.md), "Seeding safely"). The step is repeated for a new page the same way.
3. Open: the logos are low resolution (the World Scholar's Cup file is 257 x 62, about 1x): ask the school for SVG or high-resolution logos; the two spelling slips above.
