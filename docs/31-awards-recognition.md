# Awards & Recognition page and the reusable awards section

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `5893:1651` ("About us - Awards & Recognition"; the awards frame is `5894:1874`, 924px wide). The header and the footer of the frame are the site's own. Route: **`/awards-recognition`** (the owner wrote `/awards-recognition/`; Next serves the address without the trailing slash and redirects the other). Built 2026-11-03, **local, not pushed yet** (see "Before it goes live").

| Part | Code |
| --- | --- |
| Route | `src/app/(frontend)/awards-recognition/page.tsx` (server, static, `revalidate = 3600`) and `AwardsRecognitionPageClient.tsx` (Live Preview) |
| **Hero, text-only look** | the reusable `PageHero` with no `image` ([29-principals-welcome.md](29-principals-welcome.md)): nothing new |
| **Awards section (new, reusable)** | `src/components/sections/shared/AwardsSection/`, types `src/types/awards.ts` |
| Content (defaults) | `src/data/awards-recognition.ts`, types `src/types/awards-recognition.ts` |
| CMS | global `awards-recognition` (`src/globals/AwardsRecognition.ts`), reader `src/lib/api/awards-recognition.ts` (tag `awards-recognition`), mapper `awards-recognition-map.ts`, seed `scripts/seed-awards-recognition.ts` (`npm run seed:awards-recognition`), migration `20261103_050817_awards_recognition_page` |
| Assets | `public/images/awards/`: the three photos (AVIF, 1848 x 1170, 130 to 380 KB) and `laurel.avif` (234 x 648, 26 KB) |

The page has **no call to action and no photo strip**: the design ends with the awards, 111px above the footer.

## The page, top to bottom (1920px; it all scales down with the screen)

1. **Hero, text only** (the same as the Principal's and the Partnerships pages): the green pill "AWARDS & RECOGNITION", the heading "Celebrating Excellence, *Impact and Achievement*" (the `<h1>`, one line), "Recognising milestones that reflect our commitment", and the rule with the crest.
2. **Three award blocks**, 90px under the hero's card, **60px apart**, each 924px wide and centred (x 498 to 1422):
   - a **photo**, 924 x 585px;
   - **62px under it** the blue slanted **title** (Lexend Medium 40px: "School Awards", "Student Awards", "Achievers’ Awards");
   - **31px under that** the **paragraph** (18px, navy at 80%, centred, 642 to 659px wide, 5, 3 and 4 lines);
   - and framing the title and the paragraph, **a laurel on each side**, 78 x 216px, 32px in from the edges of the block (the right one is the left one mirrored).
3. The footer, **111px** under the last block.

The page colour is snow (`#f9f9f9`).

**Checked against Figma at 1920 x 993** (measured in Chrome, `tests/interactions.mjs` section 16, each block measured while it is on the screen with its entrance finished): the pill at y 166, the heading at y 215 (1132px wide, one line), the rule at 377; the photos at y 543, 1478 and 2401 (924 x 585, x 498); the laurels at x 530 and 1312, y 1202, 2125 and 3048; the titles at y 1190, 2138 and 3055 (the author nudged the text of the second and third block by 13 and 7px, so each block carries its own offset); the paragraphs at 643, 642 and 659px wide, with the same line breaks as the design (5, 3 and 4 lines); the footer at y 3375.

## What is new and reusable

### The awards section (`<AwardsSection content />`)

Blocks of a wide photo with a laurel-framed title and paragraph under it, for any page that shows awards, achievements or milestones. `AwardsContent` (`src/types/awards.ts`): `label` (the region's accessible name), `awards: { image, title, text, design }[]`.

- **Scaling.** The author nudged the text and the laurels of every block by hand, so each block carries its own `design` (`AwardDesign`: `textWidth`, `textTop`, `laurelTop`, in Figma pixels of the 924px block). The group under the photo is a size container (`@container`) as wide as the block and every offset is `calc(N * 100cqw / 924)`, so the group is the same picture at any width. The photo always keeps its 924 : 585 shape and fills it (a photo of another shape is cropped at its middle). The text keeps its size (the fluid size of the h2; 16 to 18px for the paragraph); only the spacing scales.
- **Laurels and narrow screens.** From 640px the two laurels frame the text as designed and the column of text is **at most its designed width and never reaches the laurels**. Below 640px the laurels are left out and the text takes the whole width (on a phone the laurels would leave a column too narrow to read).
- **Laurel markup.** Each laurel is a box of the scaled size (`<span aria-hidden>`) with the image filling it. A plain `<Image width height>` warned in the browser (Next.js: "has either width or height modified, but not the other") whenever the scaled size was a fraction of a pixel.
- **Animation (mine, nothing in Figma):** once per block when it comes into view (quicker when it comes back): the photo is opened from the bottom while it settles from a slight zoom, the laurels drift in from the sides, then the title and the paragraph rise in. Each block has its own trigger. Reduced motion: none of it. **A block that scrolls out of view is put back to its hidden start** (the site-wide replay rule, `useScrollReveal`), so a test must measure a block while it is on the screen.
- **Accessibility:** a region named for the section, one `<article>` per award, the title as a heading, each photo with its description, the laurels hidden from assistive technology.

### The laurel and the photos

The laurel in the design is the raw 1024 x 684 sketch **stretched to 78 x 216 without turning it** (checked by comparing the exported pixels with every rotation and flip); the file is that sketch stretched to 3x (234 x 648, AVIF with transparency), so it stays sharp. The three photos are the files of the design cropped at their middle to 924 : 585 and resized to 1848 x 1170 (2x), AVIF at quality 60.

## In the CMS (the "Awards & Recognition page" global, group Pages)

Tabs: **Hero** (pill, heading in two parts, line under it: no photo) and **Awards** (the **list of blocks**, each a photo, a title and a paragraph), and the **SEO** tab. Drafts, Live Preview (the real page next to the form), Save draft and Publish work as on the other pages; editors may publish. A published change clears the cache tag `awards-recognition`.

- **The awards are a flexible list** (1 to 10 blocks, sortable by dragging). It is `required` as well as `minRows: 1`; each block needs its photo, title and paragraph.
- **Design values stay in code.** The mapper (`mapAwardsRecognition`) gives each CMS block the `design` of the default block at the same position (the first three) and a block beyond the third the generic values (`GENERIC_DESIGN`: the widest text column, 659px). Reordering moves the offsets with the position (a few pixels).
- Same rule as the other pages: the defaults (`src/data/awards-recognition.ts`) are the base, the CMS overrides what an editor wrote, and anything it lacks is the default; a row without a readable photo is left out; `awardsRecognitionDocFromData` (the seed) is proved to give the defaults back.

**Tested on the dev branch** with a throwaway admin (deleted afterwards): a visitor reads the published page and cannot write (403); an admin signs in and publishes an edit (a renamed block and a fourth block) and the page shows it at once with four blocks; an empty list and a block without a photo are refused (400); the original is restored and the page is back to three blocks.

## Text from the design, and what is mine

- **The Student Awards paragraph is cut off in the design** ("...showcasing their e"). I completed it as **"...showcasing their exceptional talents."** The owner should confirm the wording.
- The straight apostrophe of "Achievers' Awards" is the typographic one (**Achievers’ Awards**), as elsewhere on the site.
- Mine, not from the design: the accessible names (the section's name and the photos' descriptions) and the page's title and description for search engines.

## Tests

- **Unit (307 in all, 21 new):** `AwardsSection.test.tsx` (region, every award in order with its photo description, heading and paragraph, the decorative laurels with the right one mirrored, the photo's shape, sizes in container units, any number of awards), `awards-recognition-map.test.ts` (defaults, an empty document, hero overrides without a photo, the editor's blocks as THE blocks with the offsets by position, a fourth block with the generic offsets, an unreadable upload keeping its default photo, an empty list, the seed round trip, the three designed blocks, the completed Student Awards sentence), `globals/AwardsRecognition.test.ts` (access, the fields, the list's rules, no character limit) and the revalidate route's fifth tag.
- **Browser** (`tests/interactions.mjs` section 16, 27 checks): the Figma geometry at 1920 (hero, photos, laurels, titles, paragraphs and their line breaks, the footer), no overflow, laurels framing the text only from 640px and the text never reaching them at 320, 360, 390, 768, 1024, 1280 and 1536, every photo and laurel loaded, reduced motion (nothing hidden), the menu's "Awards & Recognition" link. `tests/qa.mjs` section 10: title, description, canonical, og:url, one h1, one main, every image with an alt, every photo described and the laurels decoration only, the sitemap, axe.

## Before it goes live

1. **Deploy runs the migration** (`vercel-build` applies `src/migrations`): 4 new tables and 2 enums for this global; no existing table changes.
2. **Production has no content for this page until it is seeded** (`SEED_PRODUCTION=1 npm run seed:awards-recognition`, only when the owner says). Until then the live page shows the defaults (the same text, the photos from `/public`). **After seeding production from a developer machine, delete the leftover "dev" row** that Payload's dev mode leaves in the production migrations table, or the NEXT deploy's migration step stops on an interactive question and fails: `delete from payload_migrations where name = 'dev' and batch = -1;` (see [06-changelog.md](06-changelog.md), 2026-11-02).
3. Open: the Student Awards sentence above (wording to confirm); the laurel is a low-resolution sketch (the school may have a vector).
