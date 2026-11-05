# Welcome to LPS page and its four new reusable sections

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `5688:14367` ("About us - Welcome to LPS", 1920 x 7028px). The header and the footer of the frame are the site's own. Route: **`/welcome-to-lps`** (the owner wrote `/welcome-to-lps/`; Next serves the address without the trailing slash and redirects the other). Built 2026-11-04, **local, not pushed yet** (see "Going live"). The menu's first "Welcome to LPS" link (under About Us) points here; the "Welcome to LPS Pre-Primary / Primary / Secondary / Senior Secondary" links are other pages.

| Part | Code |
| --- | --- |
| Route | `src/app/(frontend)/welcome-to-lps/page.tsx` (server, static, `revalidate = 3600`) and `WelcomeToLpsPageClient.tsx` (Live Preview) |
| **Hero with a photo** | the reusable `PageHero`, new prop `roomy` (below) |
| **Introduction (new, reusable)** | `src/components/sections/shared/IntroTextSection/`, types `src/types/intro-text.ts` |
| **Wide photo** | the reusable `PhotoBannerSection` ([32-student-council.md](32-student-council.md)) with no title (its title is optional now) |
| **Vision and Mission (new, reusable)** | `src/components/sections/shared/CrestCardsSection/`, types `src/types/crest-cards.ts` |
| **Principal's welcome** | the reusable `MessageSection`, new `variant="welcome"` ([29-principals-welcome.md](29-principals-welcome.md)) |
| **Values, "Guided by" (new, reusable)** | `src/components/sections/shared/ValuesListSection/`, types `src/types/values-list.ts` |
| **Story, pinned (new, reusable)** | `src/components/sections/shared/StorySwipeSection/`, types `src/types/story-swipe.ts` |
| Call to action, photo strip | the site's standard `CtaSection` and `MarqueeSection` (120px between sections, as on the Principal's page) |
| Content (defaults) | `src/data/welcome-to-lps.ts`, types `src/types/welcome-to-lps.ts` |
| CMS | global `welcome-to-lps` (`src/globals/WelcomeToLps.ts`, type `WelcomeToLps`), reader `src/lib/api/welcome-to-lps.ts` (tag `welcome-to-lps`), mapper `welcome-to-lps-map.ts`, seed `scripts/seed-welcome-to-lps.ts` (`npm run seed:welcome-to-lps`), migration `20261104_122630_welcome_to_lps_page` |
| Assets | `public/images/welcome/`: eight AVIF photos |

## The page, top to bottom (1920px; it all scales down with the screen)

1. **Hero with a photo** (1920 x 736, the "JAL HOUSE" march-past) and, over its bottom edge, the card of the other photo heroes: the green pill "ABOUT US", the heading "A Legacy of *Purposeful Learning*" (the `<h1>`), "Inspiring curiosity, capability and confidence", the crest rule. **This card is the roomy one: 60px between the line of text and the rule and 60px under the rule (371px high); the Contact page's has 45px and 51px (347px).** `PageHero` takes `roomy` for it ([28-contact-page.md](28-contact-page.md) has the other look).
2. **Two paragraphs**, 60px under the hero's card: 1185px wide, centred, 18px, 12px apart (2 and 4 lines, 54px and 108px).
3. **The wide photo**, 1520 x 737, 60px under the text (the design's 176px text frame is exactly its two paragraphs: 54 + 12 + 108 + 2).
4. **Our Vision and Our Mission**, 120px under the photo: two cards 485px wide, 138px apart (a block 1108px wide), each a crest picture 365 x 313px with the title over its middle on two lines (the 95px box), and 24px under it a paragraph of 3 lines (423px and 365px wide).
5. **The Principal's welcome**, a white band 1142px high 120px under the cards, full width, with 120px of room above and below: the portrait 859 x 902 (rounded 8px), 147px from a 512px column: "Welcome To" (grey) and 13px under it "*Learning Paths School*" (blue, slanted), 47px under that a 493px rule (a little crooked, rotated -0.35 degrees, as drawn), 47px under it a 515px paragraph (3 lines), 35px under it the name (bold italic, blue) and the role. The column is centred on the portrait.
6. **"Guided by"**, directly under the white band (no space): a full-width navy band 131px high with "Guided by" (38px, white) at the left of the container and the **active value** on it: "Courage & Commitment" (40px, white, slanted) 393px in, and its text at the right (544px wide, 3 lines). Under it the other values in blue, 60px apart, each with a thin grey line 48px under its title (see below for the behaviour).
7. **"A Story That Keeps Growing"**, 120px under the list: a white band 798px high (120px of room above and below), the heading centred over the slide, then the slide: the photo 840 x 450, 54px from the story column (a timeline with its marker, the period in green, 107px under it the story). The design shows only the first slide; the rest is the pinned story (below).
8. The standard call to action (120px under the story) and photo strip (120px), then the footer.

**Checked against Figma at 1920 x 993** (measured in Chrome, `tests/interactions.mjs` section 22; the design's y values +2, because its frame has the hero photo at y 72 and this site's header is 74px): the hero photo, pill (y 728), heading (776), rule (933, 46px) and the card (371px); the paragraphs (y 1099 and 1165); the wide photo (1335); the crest cards (x 466 and 1089, y 2192, 365 x 313; titles 132 and 201px wide, 95px high; paragraphs 423 and 365px wide at y 2529); the white band (y 2730, 1142px) with the portrait, the heading (3113), the rule, the paragraph and the name where the design has them; the navy band (y 3872, 131px), the values (y 3914, 4063, 4218.5, 4374) and the active text (544px wide, right edge 1720, y 3897); the story at rest (y 4589.6, heading 4709.6, photo 840 x 450 at x 200, y 4817.6, period at x 1104, story at x 1094, 760 x 243).

## What is new and reusable

### The values list (`<ValuesListSection content />`)

A short heading on a navy band and a list of blue titles, **one active at a time**: the band sits behind the active title and its text shows at the right. **The first value is active at the start; hovering (a mouse), focusing (the keyboard) or tapping a value makes it the active one, and the band slides to it.** Leaving the list keeps the last one active (no jump back). `ValuesListContent` (`src/types/values-list.ts`): `label`, `title`, `items: { title, text }[]`.

- **From lg:** the design (above). The band is a layer behind the list (`position: absolute`, 131px high) moved by script to the active row: its centre on the centre of the title button, **measured** (a `ResizeObserver` on the list), so it is right at any width and once the font has loaded; the first position is also what the server renders, so there is no jump. It slides in 0.5 s (none with reduced motion). The sizes of a row follow the heading size (`em`): the row is 2.3875em high, rows 1.5em apart (the first two 1.3375em, as drawn), the line 2.3875em under the title's top; the text is `min(544px, 100% - 12.5em)` wide so it never reaches the title on a narrow desktop. The active row's line fades out, the text fades in (0.3 s).
- **Below lg** (my interpretation, only desktop is designed): the band is a block on top with "Guided by", the values are a list with a line under each, and the text of the active one **opens under its title** (an accordion, one open at a time, animated with the grid-rows trick).
- **Accessibility:** every title is a button with `aria-expanded` and `aria-controls`; the texts of the other rows are `aria-hidden` and `inert`; ArrowDown and ArrowUp move between the buttons (focus makes a row active). Without JavaScript the first row is active.
- **Animation (mine):** the rows rise in one after the other when the section comes into view (once; quicker when it comes back). Reduced motion: none.

### The story swipe (`<StorySwipeSection content />`)

A heading and slides of a photo and a story along a timeline, **pinned from lg while the page scrolls through the slides** (the owner's brief: "a story swipe section which uses GSAP pinned thing, so the section gets pinned and we scroll and see the next slides"; made precise on 2026-11-05: "the section is fixed, only the content and the images update and the progress bar's active state moves", so **nothing moves sideways**: my first version panned the slides to the left, which the owner called wrong). `StorySwipeContent` (`src/types/story-swipe.ts`): `label`, `titleLead`, `titleAccent`, `slides: { image, period, text }[]`.

- **Layout from lg:** the slide starts at the left edge of the 1520px container and runs to the right edge of the **screen** (the design's story column and timeline go out of the frame at the right): the photo is 840px (55.26% of the container), the story column 54px from it, the bottom edges level (in the pinned layout: the photos' bottom edges are level at the bottom of the tallest slide, and the stories all start at the first slide's timeline, so a shorter story ends higher up and slide 1 is as the design only when it is the tallest). Everything scales with `--content` (the container's own width, at most 1520px, a gutter of the page each side), so the story column is the rest of the screen, never cut off: the story is at most 760px wide with a margin on its right. The timeline: a thin grey line to the edge, a green part over it, a round marker 10px in, the period in green 50px from its top; the story 107px under it (fluid below 1920px). **The green part of a slide's line is its step of the whole story: 1/3, 2/3 and the whole for three slides** (the design's 285px of 848px is the first of three). The heading is centred over the slide area, not over the page (the design centres it in its 1742px frame, 11px right of the page's centre).
- **The pin** (GSAP `matchMedia`: `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`): the stage (heading and slides) is pinned **in the middle of the screen** when it is shorter than the screen (`start: "center center"`, else `top top`), the whole viewport is white while it is pinned (the section's own band), **the slides lie on top of each other in one grid cell** (as high as the tallest slide; the later slides are hidden by CSS, `motion-safe:lg:invisible`, until GSAP shows them) and **only the content changes** (scrubbed, one step = 90% of the screen's height of scrolling): the green part of the first slide's line grows from a third to two thirds to the whole (the other slides' lines are hidden, so there is one bar), the period and the story go up 18px and fade, the next photo fades in over the last one while it settles from a 1.1 zoom, the next period and story come in from 18px below over the second half of the step. Then the pin is released. Scrolling back reverses it. The marker stays at the start of the line (as in the design); only the green part moves: if the owner meant the marker to travel with it, that is a small change.
- **Reduced motion from lg:** no pin, the slides stacked one under the other. **Below lg** (my interpretation: a pinned stage taller than a phone would not fit): a row you swipe sideways, snapping to the slides (86% of the screen wide at most, the next one peeking in), a tab stop (`tabindex=0`, a named group) only while it scrolls, like the news cards and the Journey columns ([14-home-journey.md](14-home-journey.md)).
- A story of one slide is not pinned.
- **Short screens (mine):** a pinned stage has to fit the screen. With the real 2016–2021 text (the longest slide, three paragraphs) the story ran 76 to 104px under the bottom of a 1024 x 768 or a 1280 x 720 laptop screen, so on a screen from lg that is 860px high or less (the `short:` variant, `@custom-variant` in `globals.css`) the stage's padding is 24px, the gap under the heading 20px, the gap above the story 24px and the story's line height 1.4. Measured on the real page afterwards: the longest slide ends 35 to 38px above the bottom of the screen at 1024 x 768, 1100 x 700, 1280 x 720, 1366 x 768, 1440 x 800 and 1536 x 730 (and 178px above it at 1920 x 993, which is not compact). Taller screens are unchanged.

### The crest cards (`<CrestCardsSection content />`)

Cards side by side, each a crest picture with a title over its middle and a paragraph under it. `CrestCardsContent`: `label`, `cards: { image, title, text, design: { titleWidth, textWidth } }[]`. From lg the block is the design (1108px): each card's size scales with the block (container query units, as the other designed blocks); the crest is itself a size container, so **the title's box (132 and 201px of 365px) is a share of the crest at every width** (the design breaks both titles on two lines). The paragraph's width (423 and 365px) is design too; both are per card and live in code (a card added after the second gets `GENERIC_CREST_DESIGN`). Below lg the cards are stacked, the crest at most 365px wide.

### The introduction (`<IntroTextSection content />`)

A few centred paragraphs, at most 1185px wide, 12px apart (18px, navy at 80%). Nothing more: it exists so that an introduction is a component, not markup in a page.

### Changes to shared components (nothing changes for the pages that use them)

- **`PageHero` `roomy`**: the photo look with 60px above and under the rule (above). Ignored without a photo.
- **`MessageSection` `variant="welcome"`**: this page's look (a white band, portrait 859 x 902, a 512px column, the heading on two lines, a crooked 493px rule, a 515px paragraph, the portrait not preloaded); the default `letter` is the Principal's page, unchanged.
- **`PhotoBannerSection`**: the title is optional (neither part: just the photo); its entrance no longer asks GSAP to animate words that are not there.

## The photos

The sources are what Figma renders of each image (so that every crop, stretch and offset of the design is kept), at 1.4x to 2x. Each was converted with the project's tool, **`npm run images:optimize -- <source> --out <file> --size WxH --auto`, to at least 45 dB**:

| Photo | Used as | Size | Weight |
| --- | --- | --- | --- |
| `hero.avif` | the hero (box 1920 x 736) | 1880 x 720 (1x) | 388 KB |
| `choir.avif` | the wide photo (box 1520 x 737) | 1800 x 873 (1.18x) | 344 KB |
| `principal.avif` | the portrait (box 859 x 902) | 1203 x 1263 (1.4x) | 203 KB |
| `story-2008.avif`, `story-2016.avif`, `story-2021.avif` | the story's photos, one per slide (box 840 x 450) | 1260 x 675 (1.5x) | 186, 212 and 163 KB |
| `vision.avif`, `mission.avif` | the crest pictures (box 365 x 313) | 730 x 626 (2x) | 5 KB each |

- **The crest pictures are flat on the page colour (snow)**, with the empty box for the title painted in (236 x 103px and 250 x 103px at 58px from the left, 157px from the top, as the design has them): the design puts a snow rectangle over the green words of the original picture and sets the title over it. The pictures are stretched in the design (1024 x 684 into 365 x 313), and the exports keep that.
- **The wide photo is a very grainy 4096px original**: at 45 dB the 1520px version was 689 KB and the 1300px one 519 KB, so it is cut from a very lightly smoothed (0.8px) version at 1800px, which is 344 KB at the same 45 dB. The hero at 1880 x 720 (the design's box is 1920 x 736) is 388 KB; the 400 KB limit decided it.
- The portrait is the Principal's of the Principal's Welcome page, wider (the design's crop shows more of the room).
- **The image budget of the whole site was raised from 11 to 13 MB** (`scripts/check-images.mjs`): the page's photos are 1.1 MB and the site was at 10.7 MB (11.8 MB with them).

## In the CMS (the "Welcome to LPS page" global, group Pages)

Tabs: **Hero** (pill, heading in two parts, line, photo), **Introduction** (the paragraphs), **Wide photo**, **Vision and Mission** (the cards: crest picture, title, paragraph), **Principal's welcome** (portrait, the two heading lines, the paragraphs, name and role), **Values** (the heading on the band and the values: title and text) and **Story** (the heading in two parts and the slides: photo, period, story), and the **SEO** tab. Drafts, Live Preview, Save draft and Publish work as on the other pages; editors may publish. A published change clears the cache tag `welcome-to-lps`.

- **The lists are flexible**: the paragraphs (1 to 6 and 1 to 4), the crest cards (1 to 4), the values (2 to 8; the first is the active one at the start) and the story's slides (1 to 12; each is a step of the timeline, and the green line is its share of the whole). Each is `required` as well as `minRows`.
- **Design values stay in code**: a crest card's title and paragraph widths (by position, generic after the second), the photos' shapes, where things sit.
- Same rule as the other pages: the defaults are the base, the CMS overrides what an editor wrote, anything it lacks is the default; a card or a slide without a readable photo is left out; `welcomeToLpsDocFromData` (the seed) is proved to give the defaults back.
- The generated type is named `WelcomeToLps` (`typescript.interface`): Payload would have cut the plural "s" and made it `WelcomeToLp`.

**Tested on the dev branch:** the page is served from the CMS after `npm run seed:welcome-to-lps`; the seed round trip, the mapper and the global's rules are unit tests. The throwaway-admin edit test of the Student Council page was **not** repeated (same recipe).

## Text from the design

As written in the design, including "others –friends" in the first value (no space after the dash). The texts of the **other three values** are the current website's (the owner sent them as a screenshot): "dedicate pursue excellence" in the second is how the website has it. **The story's three slides are real.** The first (2008–2016) is the design's; the second ("2016–2021", three paragraphs) and the third ("2021–Onwards", one paragraph) are the owner's text, sent on 2026-11-05 together with their photos (Figma nodes `6983:584`, the 2018 International School Award, and `6983:587`, the award plaque on stage; each is the render of its 840 x 450 box). The periods are written as the owner wrote them ("2021- onwards" became "2021–Onwards", with an en dash like the first one); the one-paragraph slide fits the same layout. An editor can change all of it in the CMS. The accessible names and the photos' descriptions are mine.

## Tests

- **Unit (408 before this page; 54 new):** `IntroTextSection`, `CrestCardsSection` (title and paragraph widths per card, the crest as a size container), `ValuesListSection` (first active, aria states, mouse hover but not a touch, click, focus and the arrow keys, any number of values), `StorySwipeSection` (slides, line breaks, the timeline's steps, the pin only from lg with motion, none for one slide; GSAP is a stand-in), `welcome-to-lps-map.test.ts` (defaults, an empty document, each part's overrides, flexible lists, the seed round trip), `globals/WelcomeToLps.test.ts`, and additions to the `MessageSection` (welcome variant), `PageHero` (roomy) and `PhotoBannerSection` (no title) tests, and the revalidate route's eighth tag.
- **Browser** (`tests/interactions.mjs` section 22, 50 checks): the Figma geometry at 1920 of every part; the values: the first active on the band, hovering one moves the band and the text, leaving keeps it, focus and ArrowDown; the story at rest, the pin (held in the middle of the screen, the second slide in place half way, the third at the end, released after it, scrolling back); at 320, 360, 390, 768, 1024, 1280 and 1536 (reduced motion): no overflow, the arrangements, a tap opening a value below lg, the swipe row below lg and the stack from it, no console warnings; reduced motion at 1920 (nothing pinned or hidden); the menu's "Welcome to LPS" link. `tests/qa.mjs` section 13 (4 checks): title, description, canonical, og:url, one h1, one main, every image with an alt, the eight photos described, the sitemap, axe.
- **Also run on a CI-style production build** (default content, as CI builds it): section 22 (50 of 50), sections 20, 21 and 7 (the pages and scenes that use the shared components I touched) and `qa` sections 11 to 13 all pass.
- **Found by the checks and fixed:** (1) my first expectation of the second paragraph (5 lines) was wrong: it is 4 lines, and the design's 60px gap to the photo is right, not the 35px I had first (the page is 25px shorter than I made it); (2) at 320px the second heading line (`w-max`) made the welcome 6px wider than the screen: it may wrap now; (3) a collapsed value on a phone still showed 12px of padding: the padding moved inside the clipped box; (4) a banner with no title made GSAP warn about a tween with no target.

## Going live

1. **Deploy runs the migration** (`vercel-build` applies `src/migrations`): the tables and enums of this global (5 lists, the page, its versions); no existing table changes.
2. **Production has no content for this page until it is seeded** (`SEED_PRODUCTION=1 npm run seed:welcome-to-lps`, only when the owner says; the recipe is in [10-payload-cms.md](10-payload-cms.md), "Seeding safely"). Until then the live page shows the defaults (the same text, the photos from `/public`).
3. Open: the "others –friends" and "dedicate pursue excellence" wording (the owner may want them corrected); the hero and wide photos are about 1x because of the 400 KB limit.
