# Student Council page and the reusable photo banner and split features sections

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `5896:2063` ("Student Council", 1920 x 5181px; the content is frame `5896:2258`). The header and the footer of the frame are the site's own. Route: **`/student-council`** (the owner wrote `/student-council/`; Next serves the address without the trailing slash and redirects the other). Built 2026-11-04, **local, not pushed yet** (see "Going live").

| Part | Code |
| --- | --- |
| Route | `src/app/(frontend)/student-council/page.tsx` (server, static, `revalidate = 3600`) and `StudentCouncilPageClient.tsx` (Live Preview) |
| **Hero, text-only look** | the reusable `PageHero` with no `image` ([29-principals-welcome.md](29-principals-welcome.md)): nothing new |
| **Photo banner (new, reusable)** | `src/components/sections/shared/PhotoBannerSection/`, types `src/types/photo-banner.ts`: used twice on this page |
| **Split features (new, reusable)** | `src/components/sections/shared/SplitFeaturesSection/`, types `src/types/split-features.ts` |
| Content (defaults) | `src/data/student-council.ts`, types `src/types/student-council.ts` |
| CMS | global `student-council` (`src/globals/StudentCouncil.ts`), reader `src/lib/api/student-council.ts` (tag `student-council`), mapper `student-council-map.ts`, seed `scripts/seed-student-council.ts` (`npm run seed:student-council`), migration `20261104_043334_student_council_page` |
| Assets | `public/images/student-council/`: five AVIF photos and `divider.svg` (the thin rule, the Figma export unchanged) |

The page has **no call to action and no photo strip**: the design ends with the group photo, 120px above the footer (which has its own "Where could your child's learning lead?" band).

## The page, top to bottom (1920px; it all scales down with the screen)

1. **Hero, text only** (the same as the Principal's, Partnerships and Awards pages): the green pill "STUDENT COUNCIL", the heading "Nurturing Leadership and *Growth*" (the `<h1>`, one line), "Empowering students to lead, represent and inspire", and the rule with the crest.
2. **The wide photo**, 1520 x 723px, **60px under the hero's rule** (the hero brings about 30px of space of its own, so this section adds 30), then **60px under it** the title "*Early Leadership* With Learning Paths School Student Council" (one line, 40px: the first words blue and slanted, the rest grey) and **16px under that** a paragraph, 1221px wide, 3 lines, 18px, navy at 80%, centred.
3. **Three rows**, 120px under the paragraph, in a block 1437px wide, **60px apart**. Each: a **photo 777 x 565px** on the left and, centred on its height, a column of text: the **heading** in blue, slanted, in a two-line box (95px), **34px under it a thin rule** (517px, the blue at 18%), **34px under that** the paragraph (18px). The first two columns are **532px wide, 81px from the photo; the third is 572px wide, 88px from it** (the author placed them by hand).
4. **The title "*LPS Student* Council"** (centred) and, **29px under it**, the **group photo**, 1520 x 782px, 120px under the rows.
5. The footer, **120px** under the group photo.

The page colour is snow (`#f9f9f9`).

**Checked against Figma at 1920 x 993** (measured in Chrome, `tests/interactions.mjs` section 20, each part measured while it is on the screen with its entrance finished): the pill at y 166, the heading at y 215, the rule at 377; the wide photo 1520 x 723 at y 483; its title at y 1266 and its paragraph at y 1330 (1221px wide, 3 lines); the row photos 777 x 565 at x 241.5, y 1531, 2156 and 2781; the headings at y 1664, 2276 and 2901 (95px boxes); the rules at y 1794, 2405 and 3030 (517px); the paragraphs at y 1829, 2440 and 3065, 532, 532 and 572px wide, in 5, 6 and 6 lines like the design; the group title at y 3466 and its photo 1520 x 782 at y 3543; the footer at y 4445. (The first run showed everything 30px too low: the hero already brings 30px of space under its rule, so the first section's own space is 30px, not 60.)

## What is new and reusable

### The photo banner (`<PhotoBannerSection content />`)

One wide photo with a two-tone title and, when there is one, a paragraph. `PhotoBannerContent` (`src/types/photo-banner.ts`): `label` (the region's name), `image`, `titleAccent` (the blue slanted words), `titleRest` (the grey words), `text?`, `titlePosition` (`"above"` or `"below"` the photo) and `photoHeight` (the photo's height in Figma pixels at the 1520px width: 723 and 782 here, design values that live in code).

- **Both designs in one component:** the intro is the photo, then the title and the paragraph (gap 60px); the group photo is the title, then the photo (gap 29px).
- The photo keeps the shape of its design box and fills it (another shape is cropped at its middle). The first one is loaded right away (`priority`: the biggest thing on the first screen); the page passes it.
- **Animation (mine):** the photo is opened from the left while it settles from a slight zoom, then the title and paragraph rise in; once when it comes into view (quicker when it comes back). Reduced motion: none. It uses the shared reveal, which keeps the layers of what it moves while it is on the screen ([04-animation-guidelines.md](04-animation-guidelines.md)).
- **Accessibility:** a region named for the section, the title as an `<h2>`, the photo described.

### The split features section (`<SplitFeaturesSection content />`)

Rows of a photo on the left and a heading, a rule and a paragraph on the right. `SplitFeaturesContent` (`src/types/split-features.ts`): `label`, `rows: { image, title, text, design }[]`.

- **A row scales as one picture.** The author placed each row's text column by hand, so each row carries its own `design` (`{ gap, textWidth }`, in Figma pixels of the 1437px block), and the section scales it with the block: each row is a size container (`@container`) and every size is `calc(N * 100cqw / 1437)`. At any width a row is the same picture. The text keeps its size (the h2 size, 18px) and may wrap more on a narrow screen.
- **Below 1024px** (my interpretation, only desktop is designed) the photo is on top and the text under it; from 1024px side by side, the text centred on the photo's height.
- **The thin rule** is the Figma export (`divider.svg`) in a box of the scaled width with the image filling it: an `<Image>` that is given a width and a height of its own and then resized by CSS makes Next.js warn in the browser (found by the new test at 320 to 1536px), the same as the laurels of the Awards page.
- **The heading's box is two lines high** (95px at 40px: `min-h-[2.3766em]`) and the heading is centred in it, so a one-line heading sits where a two-line one does.
- **Animation (mine):** per row, the photo is opened from the left while it settles from a slight zoom, then the heading, the rule and the paragraph rise in.

### The photos

The sources are the raw photos (2000 to 4096px). Each is cut at its middle to its design box (the design uses `object-cover`, centred) and converted with the project's own tool, **`npm run images:optimize -- <source> --out <file> --size WxH --auto`, to at least 45 dB**:

| Photo | Used as | Size | Weight |
| --- | --- | --- | --- |
| `early-leadership.avif` | the wide photo (box 1520 x 723) | 2000 x 951 | 329 KB |
| `democracy.avif` | row 1 (box 777 x 565) | 1554 x 1130 (2x) | 317 KB |
| `voting.avif` | row 2 | 1400 x 1018 | 381 KB |
| `student-experience.avif` | row 3 | 1554 x 1130 (2x) | 333 KB |
| `student-council.avif` | the group photo (box 1520 x 782) | 1720 x 885 | 372 KB |

The 400 KB limit per photo (`npm run images:check`) is what forced `voting` and the group photo below 2x: at 45 dB the 2x versions were 489 KB and 562 KB, and the group photo needed 1720px (1.13x) to fit. **The image budget of the whole site is now 8.5 of 10 MB**: the next page with big photos will have to find its room (or the owner raises the limit, as on 2026-11-02).

## In the CMS (the "Student Council page" global, group Pages)

Tabs: **Hero** (pill, heading in two parts, line under it: no photo), **Introduction** (the wide photo, the title in two parts and the paragraph), **Rows** (the list of rows, each a photo, a heading and a paragraph), **Group photo** (the title in two parts and the photo), and the **SEO** tab. Drafts, Live Preview (the real page next to the form), Save draft and Publish work as on the other pages; editors may publish. A published change clears the cache tag `student-council`.

- **The rows are a flexible list** (1 to 8, sortable by dragging). It is `required` as well as `minRows: 1`; each row needs its photo, heading and paragraph.
- **Design values stay in code.** The mapper (`mapStudentCouncil`) gives each CMS row the `design` of the default row at the same position (the first three) and a row beyond the third the generic values (`GENERIC_FEATURE_DESIGN`: 532px at 81px). The photos' heights (723, 782) and where the titles are also stay in code.
- Same rule as the other pages: the defaults (`src/data/student-council.ts`) are the base, the CMS overrides what an editor wrote, and anything it lacks is the default; a row without a readable photo is left out; `studentCouncilDocFromData` (the seed) is proved to give the defaults back.

**Tested on the dev branch** with a throwaway admin (deleted afterwards): a visitor reads the published page and cannot write (403); an admin signs in and publishes an edit (a new intro title, a renamed row, a fourth row, a new group title) and the page shows it at once with four rows; an empty list of rows and a row without a photo are refused (400); the original is restored and the page is back to three rows.

## Text from the design

As written in the design, including its oddities (an editor can change them in the CMS): "Head Boy and Head Girl **And** Student President and Vice President" (a capital "And"), "Their role extends Student Council beyond titles" and the last paragraph that **ends without a full stop**. The headings are shown capitalised (`capitalize`), as the design has them ("Fostering Democracy And Responsibility"). Mine, not from the design: the accessible names (the sections' names and the photos' descriptions) and the page's title and description for search engines.

## Tests

- **Unit (350 before this page; 34 new):** `PhotoBannerSection.test.tsx` (region, photo and title with the blue words first, paragraph, the photo's shape for 723 and 782, the title under or above the photo, no paragraph when there is none, priority), `SplitFeaturesSection.test.tsx` (region, every row in order with its photo, heading and paragraph, the heading's style and box, the decorative rule between heading and paragraph, the photo's shape, sizes in container units and never px, each row's own column, any number of rows), `student-council-map.test.ts` (defaults, an empty document, overrides, the editor's rows as THE rows with the column by position, a fourth row with the generic one, an unreadable upload keeping its default photo, an empty list, the seed round trip, the designed values), `globals/StudentCouncil.test.ts` (access, the four parts, the two-part titles, the list's rules, no character limit) and the revalidate route's sixth tag.
- **Browser** (`tests/interactions.mjs` section 20): the Figma geometry at 1920 (hero, wide photo, title and paragraph with their lines, the rows' photos, headings, rules, paragraphs and columns, the group title and photo, the footer), no overflow and no console warnings at 320, 360, 390, 768, 1024, 1280 and 1536 (below 1024px the text under the photo; from it side by side and centred, measured with reduced motion because a part that has not played yet is 24px low), reduced motion (nothing hidden), the menu's "Student Council" link. `tests/qa.mjs` section 11: title, description, canonical, og:url, one h1, one main, every image with an alt, every photo described, the rules decoration only, the sitemap, axe.

## Going live

1. **Deploy runs the migration** (`vercel-build` applies `src/migrations`): 4 new tables and 2 enums for this global; no existing table changes.
2. **Production has no content for this page until it is seeded** (`SEED_PRODUCTION=1 npm run seed:student-council`, only when the owner says; the recipe is in [10-payload-cms.md](10-payload-cms.md), "Seeding safely"). Until then the live page shows the defaults (the same text, the photos from `/public`). A production seed runs in migrating mode (no schema push), so it leaves no "dev" row.
3. Open: the oddities of the text above (the owner may want them corrected); the photos' resolution (the group photo and `voting` are below 2x because of the 400 KB limit).

## The photo banner's title is optional now (2026-11-04)

`PhotoBannerContent.titleAccent` and `titleRest` are optional: with neither the banner is only the photo (the Welcome to LPS page's wide photo, [34-welcome-to-lps.md](34-welcome-to-lps.md)). The Student Council page is unchanged.
