# Signature Events page and the reusable alternating rows section

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `5894:1875` ("Signature Event", 1920 x 6102px; the nine events are the frame `5894:2001`). The header and the footer of the frame are the site's own. Route: **`/signature-events`** (the owner wrote `/signature-events/`; Next serves the address without the trailing slash and redirects the other). Built 2026-11-04, **local, not pushed yet** (see "Going live").

| Part | Code |
| --- | --- |
| Route | `src/app/(frontend)/signature-events/page.tsx` (server, static, `revalidate = 3600`) and `SignatureEventsPageClient.tsx` (Live Preview) |
| **Hero, text-only look** | the reusable `PageHero` with no `image` ([29-principals-welcome.md](29-principals-welcome.md)): nothing new |
| **Alternating rows (new, reusable)** | `src/components/sections/shared/AlternatingRowsSection/`, types `src/types/alternating-rows.ts` |
| Content (defaults) | `src/data/signature-events.ts`, types `src/types/signature-events.ts` |
| CMS | global `signature-events` (`src/globals/SignatureEvents.ts`), reader `src/lib/api/signature-events.ts` (tag `signature-events`), mapper `signature-events-map.ts`, seed `scripts/seed-signature-events.ts` (`npm run seed:signature-events`), migration `20261104_050246_signature_events_page` |
| Assets | `public/images/signature-events/`: nine AVIF photos |

The page has **no call to action and no photo strip**: the design ends with the ninth event, 127px above the footer (which has its own "Where could your child's learning lead?" band).

## The page, top to bottom (1920px; it all scales down with the screen)

1. **Hero, text only** (the same as the Principal's, Partnerships, Awards and Student Council pages): the green pill "SIGNATURE EVENTS", the heading "Moments *That Inspire*" (the `<h1>`, one line), "Celebrating moments of learning, creativity and connection", and the rule with the crest.
2. **Nine events**, **100px under the hero's rule** (the hero brings about 30px of space of its own, so the section adds 70), in a block 1520px wide. Each event is a row **523px high**; **the rows touch each other** (no space between them). A row is a **photo 818 x 523px** and, **138px from it**, a **column of text 564px wide**, centred on the photo's height: the heading in blue, slanted, 40px, then **22px under it** the paragraph (18px, navy at 80%). **The first row has its text on the left and its photo on the right; the next one the other way round, and so on.**
3. The footer, **127px** under the last photo.

The page colour is snow (`#f9f9f9`).

| # | Event | Heading | Paragraph |
| --- | --- | --- | --- |
| 1 | Pre-Primary Annual Show | 1 line | 5 lines |
| 2 | Primary School Annual Show | **2 lines** (set by hand) | 4 |
| 3 | World Scholar's Cup- Regional Round | 2 | 5 |
| 4 | School Athletic Meet | 1 | 5 |
| 5 | Club Explorama - Showcase of club activities | 2 | 4 |
| 6 | Achiever's Day | 1 | 5 |
| 7 | Company Program | 1 | 4 |
| 8 | Community service program | 1 | 5 |
| 9 | LPS Business Conclave | 1 | 8 |

**Checked against Figma at 1920 x 993** (measured in Chrome, `tests/interactions.mjs` section 21, each row measured while it is on the screen with its entrance finished): the pill at y 166, the heading at y 215, the rule at 377; the nine photos 818 x 523 at y 523, 1046, ... 4707, at x 902 (rows 1, 3, 5, 7, 9) or x 200 (the others); the headings at the heights Figma has them (the text group is centred on the photo: y 682, 1195, 1705, 2251, 2764, 3297, 3834, 4343 and 4826), one or two lines as drawn; the paragraphs 564px wide at x 200 or x 1156, 22px under the heading, in 5, 4, 5, 5, 4, 5, 4, 5 and 8 lines like the design's; the footer at y 5357.

## What is new and reusable

### The alternating rows section (`<AlternatingRowsSection content />`)

Rows of a big photo and a column of text, the sides alternating. `AlternatingRowsContent` (`src/types/alternating-rows.ts`): `label` (the region's name), `rows: { image, title, text, design }[]`.

- **The first row has its photo on the right**, then left, right... whatever the number of rows (`index % 2`); it is decided by position, so an editor who adds, removes or drags a row keeps the zig-zag.
- **A row scales as one picture.** Each row is a size container (`@container`) and every size is `calc(N * 100cqw / 1520)` (the designed block): the photo 818, the gap 138, the text column 564 and the heading's width. At any width a row is the same picture. The text keeps its size (the h2 size, 18px) and may wrap more on a narrow screen. Same idea as the split features section of the Student Council page ([32-student-council.md](32-student-council.md)).
- **Each heading has the width the author gave it** (`design.titleWidth`, in Figma pixels): in the design "Primary School Annual Show" is on two lines although it would fit on one, "Community service program" is a few pixels wider than its column and still on one line, and "World Scholar's Cup- Regional Round" breaks after "Cup-". Giving each row its width reproduces every break. It is design, so it lives in code (by position; an event added after the ninth gets the width of the column, `GENERIC_EVENT_DESIGN`).
- **Below 1024px** (my interpretation, only desktop is designed) the photo is on top and the text under it, the rows 40px apart; from 1024px side by side, touching.
- **The first photo loads right away** when the page passes `priority` (the biggest thing on the first screen; without it Chrome logged an LCP warning at every width).
- **Animation (mine):** per row, the photo is opened from the edge of the page it sits on (from the right for a photo on the right) while it settles from a slight zoom, then the heading and the paragraph rise in. Once when it comes into view (quicker when it comes back). Reduced motion: none. It uses the shared reveal, which keeps the layers of what it moves while it is on the screen ([04-animation-guidelines.md](04-animation-guidelines.md)).
- **Accessibility:** a region named for the section, each row an `<article>`, the heading an `<h2>`, the photo described.

### The photos

The sources are the raw photos from the design file (1000 to 2560px). Each is cut at its middle to the design box 818 x 523 (the design uses `object-cover`, centred) and converted with the project's own tool, **`npm run images:optimize -- <source> --out <file> --size WxH --auto`, to at least 45 dB**. Nine photos take **2.2 MB**:

| Photo | Event | Size | Weight |
| --- | --- | --- | --- |
| `pre-primary-show.avif` | 1 | 960 x 614 (1.17x) | 389 KB |
| `primary-show.avif` | 2 | 1636 x 1046 (2x) | 365 KB |
| `world-scholars-cup.avif` | 3 | 1080 x 690 (1.32x, the source's own size) | 149 KB |
| `athletic-meet.avif` | 4 | 1000 x 639 (1.22x) | 328 KB |
| `club-explorama.avif` | 5 | 1636 x 1046 (2x) | 117 KB |
| `achievers-day.avif` | 6 | 1636 x 1046 (2x) | 220 KB |
| `company-program.avif` | 7 | 1124 x 719 (1.37x, the source's own size) | 174 KB |
| `community-service.avif` | 8 | 1024 x 655 (1.25x, the source's own size) | 148 KB |
| `business-conclave.avif` | 9 | 960 x 614 (1.17x) | 385 KB |

The 400 KB limit per photo (`npm run images:check`) is what forced the busy photos (the stage show, the athletic meet, the conclave letters) below 2x: at 45 dB the 2x versions were 743, 651 and 806 KB. Three of the sources are small (1000 to 1600px): the design file holds nothing better. **The image budget of the whole site was raised from 10 to 11 MB** (`scripts/check-images.mjs`): this page took it from 8.5 to 10.7 MB. The next page with big photos will have to find its room (or the owner raises the limit again, as on 2026-11-02 and today).

## In the CMS (the "Signature Events page" global, group Pages)

Tabs: **Hero** (pill, heading in two parts, line under it: no photo), **Events** (the list of events, each a photo, a heading and a paragraph), and the **SEO** tab. Drafts, Live Preview (the real page next to the form), Save draft and Publish work as on the other pages; editors may publish. A published change clears the cache tag `signature-events`.

- **The events are a flexible list** (1 to 20, sortable by dragging). It is `required` as well as `minRows: 1`; each event needs its photo, heading and paragraph.
- **Design values stay in code.** The mapper (`mapSignatureEvents`) gives each CMS row the `design` of the default row at the same position (the first nine) and a row beyond the ninth the generic value. Which side the photo is on is decided by position.
- Same rule as the other pages: the defaults (`src/data/signature-events.ts`) are the base, the CMS overrides what an editor wrote, and anything it lacks is the default; a row without a readable photo is left out; `signatureEventsDocFromData` (the seed) is proved to give the defaults back.

**Tested on the dev branch:** the page is served from the CMS (its photos are the media library's `/api/media/file/signature-events-...` files) after `npm run seed:signature-events`, and the seed round trip is a unit test. The throwaway-admin edit test of the Student Council page was **not** repeated: the global, the access rules and the mapper are the same recipe, covered by `SignatureEvents.test.ts` and the mapper's tests.

## Text from the design

As written in the design, including its oddities (an editor can change them in the CMS): a closing quote mark at the end of the first paragraph (`impression.”`), the **Company Program paragraph that is the Primary School Annual Show's** and the **Community service paragraph that is the World Scholars Cup's** (placeholders in the design), the Business Conclave paragraph in Title Case, "Achiever's Day" drawn in another font (Scaver) in the design (here the same font as the other headings, as it is the only heading with it and the font is not in the project), and "World Scholar's Cup- Regional Round" with its dash. The headings are shown capitalised (`capitalize`), as the design has them ("Community Service Program"). Mine, not from the design: the accessible names (the section's name and the photos' descriptions) and the page's title and description for search engines.

## Tests

- **Unit (384 before this page; 24 new):** `AlternatingRowsSection.test.tsx` (region, every row in order with its photo, heading and paragraph, the blue heading, the sides alternating with the photo first for a small screen, the photo's shape, sizes in container units and never px, each row's heading width, only the first photo eager and only with `priority`, any number of rows), `signature-events-map.test.ts` (defaults, an empty document, hero overrides, the editor's events as THE rows with the heading width by position, a tenth with the generic one, an unreadable upload keeping its default photo, an empty list, the seed round trip, the nine events and photos) and `globals/SignatureEvents.test.ts` (access, the two parts, the list's rules, no character limit) and the revalidate route's seventh tag.
- **Browser** (`tests/interactions.mjs` section 21): the Figma geometry at 1920 (hero, nine photos on alternating sides, the headings' heights and lines, the paragraphs' columns and lines, the text centred on each photo, the footer), no overflow and no console warnings at 320, 360, 390, 768, 1024, 1280 and 1536 (below 1024px the text under the photo; from it side by side, alternating, centred; measured with reduced motion because a part that has not played yet is 24px low), reduced motion (nothing hidden), the menu's "Signature Events" link. `tests/qa.mjs` section 12: title, description, canonical, og:url, one h1, one main, every image with an alt, the nine photos described, the sitemap, axe.

## Going live

1. **Deploy runs the migration** (`vercel-build` applies `src/migrations`): 4 new tables and 2 enums for this global; no existing table changes.
2. **Production has no content for this page until it is seeded** (`SEED_PRODUCTION=1 npm run seed:signature-events`, only when the owner says; the recipe is in [10-payload-cms.md](10-payload-cms.md), "Seeding safely"). Until then the live page shows the defaults (the same text, the photos from `/public`). A production seed runs in migrating mode (no schema push), so it leaves no "dev" row.
3. Open: the placeholder paragraphs of the Company Program and Community service events (copies of other events' text in the design); the photos' resolution (below 2x because of the 400 KB limit and small sources).
