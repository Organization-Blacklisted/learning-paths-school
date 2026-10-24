# Changelog

Newest first.

## 2026-10-24

### Footer fix: the call to action text and button were 14px too high from 1200px up (local only, not pushed)
- **Found by** the screenshot comparison after the Ecosystem work: the footer frames at 1920 and 1440px differed by 2 to 3%, in the right column of the call to action row only. The baseline (from 22 October, when the footer matched Figma) has the description and the button 14px lower.
- **Cause (my change of 2026-10-24, "Footer: desktop design from 1200px"):** I made the tablet classes apply only below 1200px. The desktop row had been inheriting `align-items: end` from the tablet class `md:items-end` (the row is bottom-aligned in Figma), so removing the overlap removed the alignment too. I had checked widths, overflow and overlap, not the vertical position, and wrote that nothing moved from 1400px up; that was wrong.
- **Fix:** `min-[1200px]:items-end` on the row in `Footer.tsx`. Verified: after the rebuild the footer frames at 1920 and 1440px no longer differ in the screenshot comparison (21 of 158 frames still differ, all explained: the Ecosystem frames because the baseline predates the new tab copy, the 1024 frames because of the text row change, the 390 and 768 footer frames because the bottom bar is now centred). The corrected statement is in [08-footer.md](08-footer.md).

### Ecosystem was shrunk on phones (and on laptops): a one-panel scene is now an ordinary section (local only, not pushed)
- **Owner report:** on a phone the Ecosystem section looked shrunk, with wide side margins.
- **Cause:** `HorizontalScene` scales any panel that is taller than the screen so a whole panel fits while the scene is pinned. Since the sixth section was shown (Alumni still hidden) the Ecosystem scene has only ONE panel, so it never pins, yet it was still squeezed into a screen-high, clipped stage and scaled down. Measured before the fix: scale 0.82 at 390x844, **0.59 at 360x640** (content 189px on a 360px screen, last bullet cut by 12px), 0.90 at 1440x900 and at 1920x945 (content 1365px instead of 1520px).
- **Fix 1** (`HorizontalScene.tsx`): a scene with one panel (`sideways` is false) skips the pin, the row layout, the clipped stage and the scaling: the panel is an ordinary section at its natural size. Scenes with two or more panels are unchanged (including Ecosystem + Alumni once Alumni is shown; there the scaling to fit while pinned is still by design, and on a small phone it still shrinks the panel, which may need a separate decision later).
- **Fix 2** (`EcosystemSection.tsx`, found while checking Fix 1): the text row (two columns of 648px and 485px) made its grid column 1165px wide, so below about 1245px the row stuck out on the right (horizontal page overflow of up to 181px at 1024px). The old clipped stage hid it and, in the pinned scene, cut off the right edge of the bullet column at 1024 to 1244px. The grid column is now `minmax(0,1fr)`: the two text columns shrink and wrap. From about 1245px nothing changes. This is a visible change at 1024 to 1244px in every configuration, so the 1100px screenshot baseline of the Ecosystem needs re-saving.
- **After:** at 360, 390, 768, 1024, 1100, 1200, 1244, 1280, 1440 and 1920px (and 1920x1200): no scaling, full-width content (350 of 390px on a phone, 1520px on desktop), no horizontal overflow. Checked by eye on a phone and at 1100px.

### Ecosystem photo: cross-fade with a slight zoom on a tab change (local only, not pushed)
- **Owner request:** on a tab switch the photo should fade, with a gentle zoom, for a premium feel (it wiped open from the left before; the owner had said on 2026-10-22 that the wipe was not good). Local only: not committed or pushed until the owner says.
- **What it does now** (`EcosystemSection.tsx`): the new tab's photo is preloaded (at most a 2 s wait), then it fades in over the old one (0.9 s) while it eases from a 1.08 zoom to normal size (1.4 s). The old photo stays fully visible underneath until the fade ends, so there is never a blank frame; then one layer is left. Several quick clicks stack and settle on the last tab. Reduced motion: an instant swap. The first entrance (wipe when the section scrolls into view) is unchanged. Only transform and opacity animate. Details in [20-home-ecosystem.md](20-home-ecosystem.md).
- **How:** the photo box became a stack of layers (the top one has `data-eco-photo`, the ones under it `data-eco-photo-old`), animated in one GSAP context; no other file changed except the tests.
- **Tests:** section 10 of `tests/interactions.mjs` samples every animation frame after a click (two layers for about 0.9 s, opacity 0 to 1 and zoom 1.08 to 1 one way only, the old photo opaque underneath, one layer afterwards, no wipe, three quick clicks, reduced motion, no console messages). Also checked by eye on frames at 150, 350, 550 and 800 ms.

### Sixth home section shown (Ecosystem)
- **Owner request (2026-10-24):** "make the 6th one visible". `HOME_SECTION_LIMIT` in `src/lib/site.ts` went from 5 to 6, so the page now shows 1 hero, 2 Vision / Mission / Values, 3 The Courage To Find Your Path, 4 Our Learning Journey, 5 Framework and **6 The Ecosystem Behind LPS 360**. Alumni, Campus, What's New, the CTA band and the photo marquee stay hidden. The Ecosystem and Alumni panels are one sideways scene; with the limit at 6 the scene has just its first panel (Ecosystem), so there is no sideways pan and no pin until Alumni is shown: Ecosystem is then an ordinary section. Checked on a production build (1920, laptop 1366 and phone 390): the six sections are on the page, Alumni, Campus and News are not, it scrolls to the footer, no horizontal overflow, no console messages or failed requests. Set the limit to `null` for the whole page.
- Everything else from this day (Neon, footer, fifth section) is in the entries below.

### Neon set up (database and object storage), proven end to end
- **Owner action:** created the Neon project "Learning Paths School" (AWS US East 1) with Postgres and a private bucket `lps-media`. Then ran `neon init` and `neon deploy` in this folder.
- **Added:** `neon.ts` (declares the `lps-media` bucket, private, `auth: false`; the branch `dev` has no expiry, any other new branch expires after 7 days), `.neon` (the project link, gitignored), `.env.local` (gitignored: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, the four `AWS_*` storage variables, plus a local `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL`). `.gitignore` got `.neon`. `src/payload-types.ts` was regenerated (the S3 plugin adds an `_objectKey` field). The `TODO` about the bucket name in `payload.config.ts` is resolved; `.env.example` points at the right doc. **No application code changed**: the config already read these variables.
- **Proof** (details in [10-payload-cms.md](10-payload-cms.md#neon-set-up-and-verified-2026-10-24)): production build passes; Postgres works through the pooled and the direct URL; the bucket round-trips and refuses anonymous reads; on a disposable `dev` branch Payload created its tables, created the first admin, stored an uploaded image and its thumbnail in the bucket, served it to an anonymous visitor byte for byte, and removed the files again on delete (15 of 15 checks; test data deleted).
- **`dev` is permanent (owner request):** it was created with a 7-day expiry (2026-10-31). `neon.ts` now returns no ttl for the branch named `dev`, and the existing expiry was removed with `neon branches set-expiration dev`. Checked: `neon branches list` shows no expiry on either branch, and `neon config plan` is clean for both.
- **Open:** the production branch has no tables yet (production never creates them: `payload migrate:create`, commit, `payload migrate` with the direct URL); Vercel variables are not set; production needs its own `PAYLOAD_SECRET`.
- **Side effects of `neon init` outside this folder** (it is a global tool): it created an account-wide Neon API key (id 3461572) and stored it in `~/.copilot/mcp-config.json`; it enabled the "Neon" plugin for Claude Code in `~/.claude/settings.json`, installed Neon skills and plugin files for Cursor, Codex and a shared `~/.agents` folder. Nothing in the repository depends on any of them. `neon api-keys revoke 3461572` removes the key.

### Footer: the desktop design from 1200px (was 1400px)
- **Owner request:** laptops should get the same footer as desktops down to 1200px; it used to change below 1400px (the three info columns stacked), so a 1360px laptop saw the stacked version.
- `src/components/layouts/Footer/Footer.tsx`: the info row (three columns, dividers, top rule) and the call to action row (heading left, text and button right) now switch at **1200px**. The gap between the columns now starts at 40px instead of 64px (the side columns are 246px at 1200px, enough for the email address); the formula is unchanged from 1400px up. The CTA text column takes the room left of the 528px heading column (up to the 619px Figma width), so it fits at 1200px.
- Fixed on the way: the two ranges are exclusive (`md:max-[1200px]:` for the tablet classes), because a `min-[1200px]:` class did not reliably override a plain `md:` one, and the width ranges no longer miss 1649px (`max-[1650px]:`).
- **Bottom bar centred below 1024px (owner request):** the copyright line and the Privacy Policy | Terms & Conditions links are centred when they are stacked (below 1024px); from 1024px they stay on one row, copyright left and links right. Checked at 360, 390, 768, 1000 and 1023px (both lines centred to the pixel, no overflow) and at 1024, 1100, 1440 and 1920px (unchanged).
- Measured on a production build at 15 widths from 390 to 1920px: no overflow, nothing sticking out of its column, and no width changed from 1400px up (but see the correction below: the CTA text and button had moved 14px up). At 1200 to about 1290px the address wraps after "Pin-" (narrow column). Details in [08-footer.md](08-footer.md).

### Fifth home section shown (Framework)
- **Owner request (2026-10-24):** "unhide the 5th section". `HOME_SECTION_LIMIT` in `src/lib/site.ts` went from 4 to 5, so the page now shows 1 the hero, 2 Vision / Mission / Values, 3 The Courage To Find Your Path, 4 Our Learning Journey and **5 the Framework section**. Ecosystem, Alumni, Campus, What's New, the CTA band and the photo marquee stay hidden. Set it to `null` for the whole page.
- Not pushed to git at the owner's request (local only until they say so). The browser checks still build with `HOME_SECTION_LIMIT=all`, so nothing in them changes.

## 2026-10-23

### CI fixed: both jobs of the first run failed on a fresh checkout
- The first GitHub Actions run (commit `d16d500`) failed in both jobs. Both causes are files that exist on a developer machine but are not in git, so nothing showed locally. Reproduced from a clean clone of the pushed commit.
- **quality:** `tsc --noEmit` stopped with `Cannot find name 'LayoutProps'`. Next generates that global type into `.next/types`. Fix: the job runs `npx next typegen` before `tsc` (`.github/workflows/ci.yml`).
- **browser:** `npm run qa:serve` crashed with `ENOENT` copying `next-env.d.ts` (gitignored, so missing on a runner) before the build. Fix: `tests/serve-prod.mjs` backs up and restores only the files that exist, and deletes `next-env.d.ts` again afterwards if it did not exist before.
- Documented in [24-qa-suite.md](24-qa-suite.md).

## 2026-10-22

### Courage heading centred on phones
- Owner request: on a phone the heading ("The Courage To Find / Your Path") is now **centred**, like the rest of the section (it was left-aligned). Below 768px only (`text-center`, with `md:text-left` so the desktop and tablet collage keep the Figma layout). Checked at 390, 360 and 600px: both lines are centred on the frame within 1px, and the typing builds up inside its centred box without moving. The three Courage screenshots at 390px changed (only the heading, confirmed on the diff image) and were re-baselined; 768px and wider are unchanged.

### Courage heading: back to the typewriter (the client changed their mind)
- **Client request:** go back to the typewriter, as it was originally. Done by one setting: `headingEffect: "typewriter"` in `src/data/home-courage.ts` (the code path is the original one, untouched; the rotating-word alternative below stays available with `"rotate"`).
- **Proof it is the same as before:** the tablet (768px) screenshots, whose baseline was taken when the typewriter was original and was not touched since, all match (28 of 28), including the frames where the heading is half typed. The baselines of the other four widths had been refreshed for the rotating heading a few minutes earlier, so they were taken again from the typewriter build (a final full comparison follows).
- `RotatingWord` and its tests stay in the code (small, not shown while the typewriter is on).

### Courage heading: no typewriter, a rotating word like boltonschool.org (typewriter kept)
*(Built, then reversed by the entry above. Kept here as a record and as the alternative.)*
- **Client request:** no typewriter effect; the text fully visible, with an effect like https://www.boltonschool.org/ (see [13-home-courage.md](13-home-courage.md) for what that effect is, measured on their page: the strapline stays visible and one word swaps with a 0.5 s crossfade and a 10% slide, every few seconds).
- **New:** `<RotatingWord>` (`src/components/ui/RotatingWord`, 8 unit tests): all words in one grid cell (the slot is as wide as the longest, nothing moves), rotates only while on screen, pauses under the pointer, off with reduced motion, hidden from screen readers. The Courage heading is plain visible text and its last word ("Path") rotates. `headingEffect: "rotate" | "typewriter"` and `rotatingWords` in `src/data/home-courage.ts`: **the typewriter code is kept and comes back with one word**.
- **The alternate words are placeholders** ("Way", "Goal", "Gift"); the client has to supply the real ones. They must be about as short as "Path" (measured in the heading font: Path 224px, room for about 28px more); wider ones ("Voice", "Dream") ran out of the frame, which I found by measuring and which a new test now guards at five widths.
- **Tests:** 8 new unit tests (99 in all); the old "heading is fully typed" assertions now accept either effect; 9 new checks in `npm run qa:interact`: the heading is plain text, the longest word stays in the heading's box at 1920, 1440, 1100, 768 and 390px, the word really changes while the heading is on screen, the first word stays with reduced motion. The screenshot tool hides the rotating word (it changes by itself); the Courage frames were re-baselined.

### Sideways scenes on tablets and phones (the same scroll effect as desktop)
- **Owner request (the client):** the scroll effect "down, then left and right, then down" must work on tablets and phones too, not only from 1024px up. Before, below 1024px the panels were an ordinary vertical stack and each section played a short entrance once.
- **What changed.** `HorizontalScene` now builds the pinned row at EVERY screen width (only "reduce motion" turns it off; then the panels stack, nothing is pinned, everything is shown). The phone-only entrances of the Courage, Journey and Alumni sections were removed (the scene drives their animations now, exactly as on desktop: the Courage heading types itself and its photos pop as the view pans to them). The stage is exactly one screen high (`svh`, so a phone's address bar cannot cut it) and clips what is outside it.
- **A slower pan on narrow screens.** The pan on a phone is only one panel wide (about 390px), which would fly by in under half a screen of scrolling. The scrolling length is stretched below 1024px (about 1100px for the whole pan, at most 2.5 times slower than the panning); from 1024px up it is 1 to 1 as before.
- **Down through a tall panel (the "down" of the owner's wording).** A panel that cannot be shrunk to fit the screen (the Journey section on a phone: its four columns stack to about 2400px) is no longer shrunk to an unreadable size or cut off. It keeps its normal size, starts at the top of the screen, and once the sideways pan has reached it the pinned view scrolls DOWN through it, one pixel per pixel, and then the pin ends and the page goes on. Other panels are fitted to the screen as before (the Ecosystem panel is shown at 84% on a phone).
- **Photos load sideways too.** `useIdleReady`'s look-ahead (1800px) now applies on all four sides of the screen, because on a phone the panels wait to the left and right.
- **Verified on a phone (390x844) and a tablet (768x1024), touch emulation:** the hero pin plus two scenes (3 pins) with stages exactly one screen high; the Vision panel centred at the start of scene 1; at its end the Courage heading is fully typed and the LAST Journey column is on screen; no horizontal overflow; the page then continues with the next section and the hero does not show behind it; no console errors; reduced motion on a phone shows everything stacked and unpinned. 9 new checks in `npm run qa:interact`. Screenshots at 390 and 768px were re-baselined (they show the scenes now). At 1024px and 1440px a few frames of scene 1 moved by about a pixel at the edges of photos (0.3 to 0.9% of the pixels: the stage is now a fixed screen height and the track fills it, so centring rounds differently), and were re-baselined too; 1920px is unchanged.
- **Known, to decide with the client:** (1) on a phone the Journey section's four columns all start their reveal together when the panel arrives, so the ones below the first are already shown when the view scrolls down to them (the staggered reveal only happens horizontally). (2) The Ecosystem panel at 84% on a phone has smaller text than the other sections. Both are choices that need a design, see [07-decisions.md](07-decisions.md).

### Ecosystem tab names
- Owner decision: use the school's names from the text they supplied: "Academic Framework", "Overall Well-Being Ecosystem", "Social Impact and Initiatives" (Figma had "Academic Excellence Framework", "Sports and Well-Being Ecosystem", "Social Impact and Advocacy Initiatives"). The other two names were the same. A one-line change per tab in `src/data/home-ecosystem.ts`.

### Ecosystem tabs: real text and the new photos
- **Photos (owner: "Figma now has images for the tabs, use them after compression"):** the four Figma frames for tabs 2 to 5 (1520 x 531 each) exported at 2x and compressed to AVIF 1900 x 664 with `npm run images:optimize --auto`: 173, 382, 263 and 223 KB at 45.1 to 45.5 dB. Image budget still OK (5.1 of 6 MB).
- **Text (owner pasted the school's content):** title, paragraph and bullets of all five tabs, exactly as written (`src/data/home-ecosystem.ts`). Tab labels kept as in Figma; three differ in the school's text, to confirm (see [20-home-ecosystem.md](20-home-ecosystem.md)).
- **Fix found by testing the real text:** the tabs' texts differ in length (Capstone is 27px taller), so on a short screen its last bullet would have been cut off (about 25px at 1440 x 900, 20px on a phone) and the panel would have jumped in height between tabs. All five texts now sit stacked in one grid cell, only the chosen one visible (the rest inert and hidden from screen readers), so the panel is always as tall as the tallest tab.
- **Tests:** 6 new checks in `npm run qa:interact` (each tab's own title and photo, the same panel height for all five, the last bullet inside the pinned screen, at 1920, 1440 and 390px); the reduced-motion check ignores the intentionally inert texts.

### Home page: the fourth section (Our Learning Journey) is shown too
- **Owner request (2026-10-23):** "show the 4th section". `HOME_SECTION_LIMIT` in `src/lib/site.ts` went from 3 to 4, so the page now shows **1 the hero, 2 Vision / Mission / Values, 3 The Courage To Find Your Path, 4 Our Learning Journey** (the same sideways scene now has all three of its panels); Framework, Ecosystem, Alumni, Campus, What's New, the CTA band and the photo marquee stay hidden. Set it to `null` for the whole page, or to another number.
- **Verified in the shipping configuration** (a production build with no overrides, on desktop 1920 and a phone 390): exactly those four sections are on the page, it scrolls to the footer, no horizontal overflow, no console messages or failed requests, no broken images, and the hidden sections are not in the HTML at all. On a phone the Journey section is the tall panel the scene scrolls DOWN through (see "Sideways scenes on tablets and phones" below).

### Home page: only the first three sections are shown for now
- **Owner request:** hide every section of the home page except the first three. Shown: **1 the hero slideshow, 2 Vision / Mission / Values, 3 The Courage To Find Your Path.** Hidden (not rendered at all, so none of their images, scripts or animations load, and none of their HTML is sent): Journey, Framework, Ecosystem, Alumni, Campus, What's New, the CTA band and the photo marquee. The header and footer stay.
- **How:** `HOME_SECTION_LIMIT` in `src/lib/site.ts` (now 3) and `takeFirstSections` (`src/lib/blocks.ts`, tested): every block, and every panel of a sideways scene, counts as one section in page order, and `src/data/home-page.ts` exports the full list (`homePageAll`) and the visible part (`homePage`). Nothing was deleted: **to bring everything back, set the limit to `null`** (or build with `HOME_SECTION_LIMIT=all`; any whole number shows that many). The scene that held Vision, Courage and Journey now pans between the first two only.
- **The browser checks still test the whole page.** `npm run qa:serve` (and so CI) always builds with `HOME_SECTION_LIMIT=all`, so the hidden sections stay tested and the screenshot baseline stays valid. A build WITHOUT that variable is the shipping configuration: verified by itself on desktop and phone (only those three sections, scrolls to the footer, no overflow, no console messages, no broken images, the hidden sections absent from the HTML). The page is 6,588px tall instead of 15,575px.
- 11 new unit tests (91 in all).

### Ecosystem tabs: 8px gap between them
- Owner request: the active tab and a hovered neighbour touched. The tabs are now 8px apart at every width (`gap-2` on the bar). From 1600px each Figma width is trimmed by 6.4px, so the five tabs plus four gaps still add up to the design's 1483px and the row stays centred; the highlight is measured from the real tab rectangles, so it follows without changes. Details: [20-home-ecosystem.md](20-home-ecosystem.md).

### Fix: Ecosystem tabs always on one row, and the blue highlight always exactly on the active tab
- **Reported by the owner (two screenshots):** between about 1024 and 1600px the five tabs wrapped onto a second row, and in another case the blue highlight was narrower than its tab and overlapped the next one.
- **One row at every width.** `TabBar` no longer wraps: the tabs are centred when they fit and otherwise the bar scrolls sideways, exactly like on a phone (the "choose a tab and it slides to the left edge, showing the next one" behaviour now applies at every width). The bar has no scrollbar, so a soft fade at an end shows where more tabs are hidden (it appears only on an end that has hidden tabs). From 1024 to 1599px the tab padding is 16px (was 25px) so more of them fit: all five fit from about 1450px wide. Below 1024px and from 1600px the look is unchanged.
- **The highlight bug had a different cause: scaling.** The sideways scene shrinks a panel taller than the window to fit it (the Ecosystem panel is about 1026px high, so on any window shorter than that, such as a laptop or DevTools at 672px). The highlight was measured in screen pixels (scaled) but placed in the bar's own pixels (unscaled), so it came out smaller than its tab and off to one side (up to about 18px at 1500px wide, worse in a shorter window). It is now measured in the bar's own pixels. A scale within 0.2% of 1 is treated as rounding, so a normal window is exactly as before.
- **Re-placement.** The highlight is placed again when the bar OR any single tab changes size (a font arriving, the fixed widths from 1600px switching on), not only the bar. It is not re-placed on tab changes (that would cancel the slide: a regression my own new test caught and I fixed before finishing) or on scrolling (it scrolls with the tabs).
- **Verified:** at 12 widths from 390 to 1920px, fresh and after resizing through them, the tabs are on one row and the highlight is within 1px of the active tab (first, second and last tab); the slide still shows several positions on the way. 8 new checks in `npm run qa:interact` (30 in all). Details: [20-home-ecosystem.md](20-home-ecosystem.md).

### Fix: the page broke when resizing in DevTools (pinned scenes kept the old size)
- **Reported by the owner:** with DevTools open, resizing the window (device mode) made the site break: the hero slideshow stayed visible behind later sections (Journey, Ecosystem), because the pinned scenes were still measured for the old size.
- **Cause 1 (the one the owner saw):** GSAP's `ignoreMobileResize` (turned on in `src/lib/gsap.ts` so a phone's address bar sliding in and out does not make the pinned scenes jump) ignores any height-only resize under 25% on ANY touch device, and DevTools device mode is one. Docking DevTools at the bottom is about an 18% change, so the pins were never measured again.
- **Cause 2 (found while testing the first fix):** GSAP sends `refreshInit` BEFORE it unpins the scenes, so `HorizontalScene`'s `fit()` measured the panels inside the old, still-pinned width. One refresh after a big width change could settle on slightly wrong panel scales and pin heights (a second refresh happened to fix it in a normal window, but not with touch emulation).
- **Cause 3:** the panels' own animation tweens are placed on the pan once, as fractions worked out for the stage width at build time, so after a resize they started too early or too late (the last Journey column finished about 30% of a step early).
- **Fixes:** `src/lib/resize.ts` (`refreshOnRealResize`, used by `SmoothScroll`): a resize while the page is NOT being scrolled always measures again, a height-only change within 600 ms of scrolling (an address bar) never does, a width change (rotation) always does; a burst of resize events refreshes once. `HorizontalScene`: after every refresh it measures the panels again in the real layout and refreshes once more if the scales differ, and builds the scene again when the stage width changed (all capped, so nothing can loop).
- **Verified, not assumed:** a resized page now has exactly the pin positions and heights of a fresh load at the final size (mouse and touch emulation, three resize patterns), the scene animations are at the same positions as after a fresh load, the hero never shows once its pin is over (31 positions walked), and the phone behaviour is kept (address bar while scrolling ignored, same change while standing still measured, rotation measured). 9 unit tests for the watcher (80 in all); the browser checks are in `npm run qa:interact`. The earlier resize test only looked for errors and overflow, which is why it missed this.

### Error pages, image scripts, Prettier
- **Error pages** (`src/app/(frontend)/error.tsx`, `src/app/global-error.tsx`): before, a crash in a section showed Next's bare default error screen. Now a page error shows a branded screen *inside* the layout (header and footer stay) with "Try again" (`retry`, the name Next 16.4 uses) and "Back to the home page"; a failure of the root layout shows a stand-alone last-resort screen. The error message is never shown to the visitor; the server's digest is shown as a reference to quote. The error is written to the browser console (a place to plug in an error reporting service later). Copy and layout are mine. Tested for real, not only with unit tests: a throwaway copy of the site with failures switched on was built and driven in Chrome (server error in the page, client error after a click with "Try again" bringing the page back, error in the root layout): all behave, status 500 where it should be, nothing leaks. 10 unit tests (71 in all). Docs: [16-production-readiness.md](16-production-readiness.md).
- **`scripts/`**: `optimize-image.mjs` (the recipe every photo was made with: crop, resize, AVIF 4:4:4 effort 6, measures fidelity in dB, `--auto` finds the lowest quality that keeps 45 dB; it reproduces the documented campus poster exactly, 281 KB and 46.0 dB), `check-images.mjs` (image budget, `npm run images:check`, in `check`, the hook and CI), `svgo.config.cjs`, and `scripts/README.md` (how to add a photo, the settings of every photo of the site). The image scripts used to exist only in my working folder.
- **Prettier**: `.prettierrc.json`, `.prettierignore`, `npm run format` / `format:check`, editor settings in `.vscode/`; in `check`, the hook and CI. 29 files were reformatted; proven to change nothing (identical bundle). Details: [24-qa-suite.md](24-qa-suite.md).
- New dev dependency: `prettier`.

### Hosting decided: GitHub and Vercel
- Owner: the code goes on GitHub, hosting is Vercel. Plan, environment variables per environment and the first-deployment checklist: [25-deployment-vercel.md](25-deployment-vercel.md).
- `SITE_URL` (`src/lib/site.ts`) now falls back to the address Vercel gives the deployment when `NEXT_PUBLIC_SITE_URL` is empty (the production domain for a production build, the preview address for a preview), so a preview's canonical, Open Graph, `robots.txt` and sitemap never point at localhost or the live site. Behaviour is unchanged locally and when the variable is set. New function `resolveSiteUrl`, 6 unit tests (61 tests in all).
- `package.json`: `"engines": { "node": "22.x" }` (Vercel picks the Node version from it; same as CI and local). `.env.example` comment updated.

### CI, unit tests and a pre-commit hook
- **CI:** `.github/workflows/ci.yml` (GitHub Actions): on every push and pull request, `quality` (lint, types, unit tests) and `browser` (production build, `npm run qa`, `npm run qa:interact`). Needs no secrets. The screenshot comparison stays local (screenshots differ between operating systems). Details: [24-qa-suite.md](24-qa-suite.md).
- **Unit tests:** Vitest + Testing Library + jsdom, `npm test` (55 tests, 5 files): `useScrollReveal`, `BlockRenderer` (with the real home page data), `useIdleReady` (both policies), `motion`, `Photo`. Proven to catch eight deliberate bugs. New dev dependencies: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`; `@types/node` raised from 20 to 22 (the runtime is Node 22, and Vitest 5 requires it).
- **Pre-commit hook:** `.githooks/pre-commit` runs lint, types and the unit tests (about 10 s) before every commit; switched on by `npm install`. `npm run check` runs the same by hand.
- Project rule added to `CLAUDE.md`: a new shared hook or component comes with a test.

### Structure refactor: shared building blocks, pages as data, QA suite in the repo
- Everything repeated across the home sections is now shared; **the page is unchanged** (verified against screenshots before and after at five screen sizes). Details, usage and what was deliberately not done: [23-shared-building-blocks.md](23-shared-building-blocks.md).
- New hooks (`src/lib/`): `useScrollReveal` (the one-off entrance, replaces about 15 copied lines in each of seven sections), `useViewportVideo` (play only while on screen, pause button state), `useParallax`. New `src/lib/motion.ts` with the media queries (`MOTION_OK`, `PHONE`, `DESKTOP`, `PHONE_MOTION`, `DESKTOP_MOTION`) and `prefersReducedMotion()`: no more query strings written out in every section.
- New components (`src/components/ui/`): `Photo` (the deferred AVIF photo), `SectionTitle`, `Accent`, `BodyText`, `TabBar` (extracted from the Ecosystem section: sliding highlight, phone auto-scroll, keyboard).
- New type-size tokens `text-px-12/14/16/17/18/20` replace 20 arbitrary `text-[Npx]` values.
- `types/home.ts` split into `types/home/` (one file per section; the import path is unchanged).
- The home page is now data: `src/data/home-page.ts` (a list of blocks) rendered by `<BlockRenderer>` (`src/components/blocks`); block types in `src/types/page.ts`. The shape matches Payload blocks, ready for the CMS. `page.tsx` shrank to a few lines.
- The checks of the production reviews moved into the repository: `tests/` and `npm run qa:serve | qa | qa:interact | qa:snapshot:save | qa:snapshot` ([24-qa-suite.md](24-qa-suite.md)). `playwright-core` added as a dev dependency.
- Measured and decided against splitting sections into server and client parts: all section code is 14 KB gzipped of about 330 KB.

## 2026-10-21

### Production review #2 of the finished home page
- Full pass on a production build: QA suite, axe, Lighthouse and throttled phone runs. Results and numbers: [16-production-readiness.md](16-production-readiness.md).
- `useIdleReady(extraDelayMs, nearRef?)`: on phone-width screens, "save data" and 2G/3G, photos are requested only when their section is within about two screens of the viewport (before: everything after load and idle). A phone now loads 5 images (1.6 MB) at the start instead of the whole page's photos, with no blank photo while scrolling. Desktop behaviour is unchanged. All eight below-the-fold image sections pass their root element.
- No other code changes were needed; stale comment about a removed `<IdlePreload>` corrected.

### Home: A Campus Built Around Possibility (video box with a poster)
- Built Figma node `6282:783`: `src/components/sections/home/CampusSection/`, content in `src/data/home-campus.ts`, types in `src/types/home.ts`, poster and icon in `public/images/home/campus/`. Placed below the alumni scene and above What's New. Details and "how to add the video": [22-home-campus.md](22-home-campus.md).
- **A poster image stands in for the video (the owner's instruction).** The video support is built and tested already: set `media.video` in the data file and it plays muted and looping while on screen, pauses off screen, stays paused with reduced motion, and shows a Pause / Play button.
- Poster: the Figma node's 2x export compressed to AVIF 1800 x 891, 281 KB, 46 dB. The 360 icon is the Figma SVG, unmodified.
- Animation (mine): entrance (text rises, the media opens from a smaller rounded window with a zoom settle, the label rises) and a scroll parallax of the image inside the box. Reduced motion: none.
- Verified in Chrome: Figma geometry within 3px at 1920 x 1080, five widths, the video path with a temporary test clip (deleted), reduced motion, no console messages. Lint and `tsc` pass.
- Open: the video itself, whether "In-vision 360" means a real 360 viewer.

### Home: alumni section, second sideways scene, panels fitted to the screen
- Built Figma node `6282:755` ("Their Paths Continue Long After They Leave"): `src/components/sections/home/AlumniSection/`, content in `src/data/home-alumni.ts`, types in `src/types/home.ts`, two portraits in `public/images/home/alumni/`. Details: [21-home-alumni.md](21-home-alumni.md).
- Placed as the owner's canvas shows it: **to the right of The Ecosystem Behind LPS 360**. `page.tsx` now has a second `HorizontalScene`: Ecosystem (panel 1), alumni (panel 2, gap 200px). `EcosystemSection` lost its own `Section` wrapper (the scene supplies container and spacing).
- **`HorizontalScene` now scales panels taller than the window down to fit** (about the top centre, min 50%, scaled box height, applied on `refreshInit`). Found while testing: at 1440 x 800 the pinned Ecosystem stage was 1041px high, so its bottom was cut off during the whole pan; now it is 800px. (A first idea, shrinking only the Ecosystem photo, was dropped in favour of this general fix, which also protects scene 1 on short screens.)
- Animation (mine): driven by the pan in the scene (text rises in, each portrait opens from the bottom with a zoom settle, names rise), once on view below 1024px, none with reduced motion.
- Photos: both portraits cropped to their slots at 2x and compressed (172 and 188 KB, 47.5 dB).
- Verified in Chrome: Figma geometry within 2px at 1920 x 1080, pan start / half way / end / back, fits at 1080, 950 and 800px screen heights, scene 1 and the other sections unaffected, a full-page scroll with no overflow or console messages. Lint and `tsc` pass.
- Open: the real alumni list (design only has two), the 200px gap (by eye), scaled panels on short screens.

### Ecosystem tabs: auto-scroll of the swipeable tab bar
- Owner (on a phone): choosing a tab should shift the bar so the next tab's title shows (choosing the second reveals the third). Below 1024px the chosen tab now slides smoothly to the left edge of the tab bar (`scrollTo`, smooth; instant with reduced motion), for clicks and keys alike. The first render does not scroll. The sliding highlight is unaffected (it is measured relative to the scrolled content).
- First tried centring the chosen tab, but on a 390px phone the tabs are about as wide as the bar, so only 7% of the next one showed. Left-aligning plus a smaller phone tab text (14px, 16px padding below 640px) shows 33% to 73% of the next tab.
- Verified in Chrome at 390 and 768px: every tab click ends with the tab fully visible, the highlight exactly on it, and the next tab showing; the bar stops at its ends. No console messages.

### Home sections switched back on
- Owner: "make all visible now". `SHOW_HOME_SECTIONS` in `src/lib/site.ts` is `true` again: the hero, the sideways scene (Vision/Mission/Values, Courage, Journey), the LPS 360 Framework, the Ecosystem section, What's New, the CTA band and the photo marquee are all rendered, and the header is transparent over the hero again. The switch stays for the next time (set it to `false` to hide them).
- Checked by scrolling the whole page on the dev server (1920px): nine sections, no horizontal overflow, reaches the footer.
- Cleaned two dev-only image warnings found on the way: the news photo's `fill` image had a parent without `position` (the wrapper is now `relative`), and the Framework's thin line images had a rounded-away height (now given their real height of 0.881px). The console is clean.

### Home: The Ecosystem Behind LPS 360 (after the LPS 360 Framework)
- Built Figma node `6282:975`: `src/components/sections/home/EcosystemSection/`, content in `src/data/home-ecosystem.ts`, types in `src/types/home.ts`, photo in `public/images/home/ecosystem/`. Added between the Framework and What's New in `page.tsx` (inside the `SHOW_HOME_SECTIONS` block, so it is hidden with the others for now). Details: [20-home-ecosystem.md](20-home-ecosystem.md).
- **Placeholder content, as the owner asked:** Figma designs only the first tab, so all five tabs show the same dummy photo, title, text and bullets until the school sends theirs.
- Working tabs (click, arrows, Home, End; roving tabindex, `tablist` / `tab` / `tabpanel`), a blue highlight that slides between tabs, a photo wipe and text rise on every tab change, and an entrance animation (about 1.5 s). Reduced motion: none of it.
- Layout: the design from 1600px; tabs wrap onto two rows from 1024 to 1599px; a swipeable tab row and a 16:9 photo below 1024px.
- Photo: cropped to its slot at 1.25x and compressed to 359 KB (AVIF q85, 39 dB: it is a noisy placeholder).
- Corrected "PLS" to "LPS" in the intro (probable Figma typo, to confirm).
- Found and fixed while testing: fixed Figma tab widths (1483px) overflowed the page between 1024 and 1599px (now wrap), the bullet list's margin overflowed the page on a phone, the highlight was 0.5px off (offsetLeft rounds), and the tab-change animation also ran on mount under React Strict Mode in development (now keyed on the tab really changing).
- Verified in Chrome on a temporary test page (deleted): Figma geometry within 1.5px at 1920px, tabs, keyboard, sliding highlight, five widths, reduced motion, entrance; no console messages. Lint and `tsc` pass.
- Open: real content and photos for the tabs, the placeholder photo's compression, "PLS" typo.

### Home sections switched off (temporary)
- Owner: hide all sections of the home page for now. One switch, **`SHOW_HOME_SECTIONS` in `src/lib/site.ts`**, set to `false`. The sections are **not rendered at all** (rather than hidden with CSS), so nothing for them loads or runs: no photos, no GSAP scenes, no pinning. What stays: header, footer and the page's hidden `h1`. The header turns **solid** while the switch is off, because its transparent variant is white text meant for the hero and would be invisible on the white page. Set the switch to `true` to get the whole home page back; no other change is needed (the section code and data are untouched).
- Found and fixed while checking: **a short page left a white gap under the footer.** Lenis sets `html { height: auto }`, which collapsed the body's `min-h-full` (a percentage). The body now uses `min-h-dvh` (also on the 404 page). Every inner page with little content would have shown this.
- Verified in Chrome at 1440 and 390px: zero sections, one `h1`, solid header, footer touching the bottom of the screen, only the header, footer and icon images requested, no overflow, no console messages.

### Home: What's New At LPS (above the CTA)
- Built Figma node `6282:899`: `src/components/sections/home/NewsSection/`, content in `src/data/home-news.ts` (placeholder cards), types in `src/types/home.ts`, photos and arrow in `public/images/home/news/`. Added between the LPS 360 Framework and the CTA band. Details: [19-home-news.md](19-home-news.md).
- Animation (mine): the intro and then the cards rise in one after another, each photo settles from a zoom and each arrow draws itself; on hover/focus a card lifts with a shadow, the photo zooms, the title turns blue and the arrow slides right. Reduced motion: nothing moves.
- Layout: design from 1600px (intro beside three cards); intro above and three equal cards from 1024px; swipeable row below. Photos cropped to their slots and compressed (92 and 101 KB), requested after load and idle.
- Added the Plus Jakarta Sans Light (300) font file (the excerpt) and two colour tokens (`brand-paper` `#fbfbfb`, `brand-cloud` `#f6f6f6`).
- Found and fixed while testing: GSAP sets `translate: none` inline on what it animates, which silently cancelled the arrow's CSS hover slide; the arrow is now two nested boxes. The side-by-side layout from 1280px squeezed the cards to 209px (text clipped): it now starts at 1600px.
- Verified in Chrome: geometry within 1.5px at 1920px, hover, six widths, reduced motion, no console errors. Lint and `tsc` pass.
- Open: real news from the CMS, card widths 310 vs 318, the swipe row below 1024px is mine.

### Marquee: position independent
- Owner: the strip is reused on many pages and is not always the last thing on a page. It is now a normal `Section` (200px above, 200px below only when last) that works anywhere; the new `attachToFooter` option removes the space below for the home page, where it touches the footer. The docs no longer say "put it last" (also corrected in the CTA doc). Verified on a production build with a temporary page (middle, last, and home). The dev server had served a stale server bundle of the component (a dev-only hydration warning) until restarted.

### Shared photo marquee (reusable section, above the footer)
- Built Figma node `6282:891` as a reusable infinite marquee: `src/components/sections/shared/MarqueeSection/`, default photos in `src/data/marquee.ts`, type in `src/types/marquee.ts`, six square AVIF photos (974 KB) in `public/images/marquee/`. Added at the end of the home page, directly above the footer. Details and usage: [18-marquee-section.md](18-marquee-section.md).
- Seamless loop (the list four times in one track, moved by one list width with GSAP), constant 60 px/s, eases to a stop on hover, pauses off screen, rebuilt on resize, still with reduced motion. Tile = 1/6 of the screen width (160 to 320px), so 1920px is exactly the design. Photos load after the page has loaded and the browser is idle.
- Verified in Chrome: tiles at the Figma positions, directly above the footer, 31.4 dB against the Figma render, 60.5 px/s, hover stop and resume, off-screen pause, no overflow and enough copies from 390 to 3840px wide. Lint and `tsc` pass.
- **Not built, needs the designer:** Figma's soft dark "Ellipse 38" on top of the strip (stationary spot, meaningless on a moving strip).
- Open: the ellipse, a visible pause control (WCAG 2.2.2), alt texts.

### Shared CTA band (reusable section)
- Built Figma node `6106:1235` as a reusable section: `src/components/sections/shared/CtaSection/`, default copy in `src/data/cta.ts`, type in `src/types/cta.ts`, assets in `public/images/cta/`. Pages use `<CtaSection />` or pass their own `content`. Added to the end of the home page. Details and usage: [17-cta-section.md](17-cta-section.md).
- New shared UI: `ui/ButtonLink` (green "primary" and white "light" with the external-link icon) and a `size="compact"` variant of `ui/Badge` (the pill height is now a minimum so it can wrap on narrow screens).
- New tokens: `--color-brand-blue-darker: #0a295e` and `--font-accent` (the accent serif; Scaver, falling back to a system serif until the font is supplied).
- Animation (mine, nothing in Figma): once on entering view, about 1 second: bars slide in, glow swells, then the content rises in one after another. Reduced motion shows everything.
- Verified in Chrome: layout within about 1px of Figma at 1920px (band 1520 x 335, pill, heading, paragraph, button), correct stacked layout below 1280px, no overflow at 1440, 1280, 1100, 768, 390px, reduced motion, no console errors. Lint and `tsc` pass.
- Found and fixed while checking: on a phone the pill's long text wrapped onto two lines and ran out of its fixed-height pill, so the height is now a minimum.
- Open: Scaver font, Proxima Nova (button text), the bluer glow in Figma's render, link target.

### Production readiness review: optimised and hardened
- Full review of the work so far, measured on a production build. Report, numbers and the launch checklist: [16-production-readiness.md](16-production-readiness.md).
- **Fixed a real bug: system dark mode turned the page black** (leftover generator block in `globals.css`). Removed; `color-scheme: light`.
- Fonts trimmed from 23 files (775 KB) to the 7 the design uses (234 KB). Images below the fold (hero slides 2 and 3, collage, journey, framework photo) now load after the page has loaded and the browser is idle (`src/lib/useIdleReady.ts`); hero autoplay waits for the next photo. Phone, throttled: load event 16.4 s to 5.3 s; Lighthouse mobile performance 72 to 75 (LCP 9.2 to 5.5 s), accessibility 93 to 96; desktop performance 97.
- Metadata, Open Graph, Twitter card, JSON-LD, `robots.txt`, `sitemap.xml`, `NEXT_PUBLIC_SITE_URL` (`src/lib/site.ts`, `.env.example`). Skip link and `id="main-content"`. Branded 404 page (`global-not-found.tsx`). Security headers, no `X-Powered-By`, one-week cache for `/images`. Logo 219 KB to 130 KB. Footer year follows the build year.
- New `NEXT_DIST_DIR` switch in `next.config.ts` for production builds that do not disturb the dev server; `.next-*` ignored by git and ESLint.
- Open: Neon + `.env`, the site address, an Open Graph image, link targets, white-on-green contrast 4.42:1, the stretched chess photo (flagged by Lighthouse), CSP and HSTS.

### Home: The LPS 360 Framework (fifth section, after the sideways scene)
- Built Figma node `6529:1879`: `src/components/sections/home/FrameworkSection/`, content and geometry in `src/data/home-framework.ts`, types in `src/types/home.ts`, assets in `public/images/home/framework/`. Details in [15-home-framework.md](15-home-framework.md). It comes down after the Journey section: a normal `Section` after `HorizontalScene` (200px spacing).
- Diagram (ring, photo, seven PIONEER pills with lines, dots and descriptions) positioned like the design from lg (1024px) and scaled as one piece with a `--u` unit (one Figma pixel); a stacked list below 1024px (my interpretation).
- New shared `Badge` component (`src/components/ui/Badge/`): the green pill, now used by this section and the Journey section. New colour tokens `--color-brand-blue-deep: #0e2f61`, `--color-brand-blue-night: #0b2349`.
- Photo: the Figma ellipse PNG (0.9 MB) to AVIF quality 95 with alpha, 170 KB. The Figma SVGs (ring, lines, dots, letter circle) are used unmodified.
- Animation (mine, nothing in Figma): plays once on entering view, about 2.5 seconds; header rises in, ring grows, photo pops, then the seven pills fly in from their sides one after another with their line drawing, dot popping and description rising. Reduced motion shows everything.
- Found and fixed while comparing with the Figma render: the right-hand groups (and the bottom Novel group) are mirror images of the left-hand ones, so their dot and line are on the ring side of the pill; the first build had them on the far side. The vertical Novel line was also displaced because the animation's transform origin overrode its rotation; the animated part is now an inner element.
- Verified in Chrome at 1920px: every part within 0.02px of the design, 26.0 dB against the Figma render; 1440, 1280, 1024, 800 and 390px without overflow or overlaps; reduced motion. No console errors. Lint and `tsc` pass.
- Open: text weight, the two extra blues, below-1024px layout, alt text.

### Home: Our Learning Journey (fourth section, third panel of the sideways scene)
- Built Figma node `6547:5798`: `src/components/sections/home/JourneySection/`, content in `src/data/home-journey.ts`, types in `src/types/home.ts`, photos in `public/images/home/journey/`. Details in [14-home-journey.md](14-home-journey.md). The pan continues from the Courage collage to this section (one continuous scroll over three panels).
- `HorizontalScene`: per-panel `gapBefore` (360px before this panel, measured from the overview), a `progressAt` helper in `useSceneTimeline` (when something enters the screen, as a scroll progress), and the **row layout now starts at 1024px** (was 768px: the Journey section is too tall for a pinned tablet screen in its 2 x 2 form). Below 1024px the scene is a vertical stack with no pin.
- `CourageSection` animation is now placed where the collage itself comes into view (measured with `progressAt`), not at the start of the whole pan; its once-on-view fallback now covers everything below 1024px.
- New colour tokens: `--color-brand-steel-dark: #a0b1ca`, `--color-brand-slate: #416295`.
- Photos: four 1.9 to 2.9 MB JPEGs cropped to their visible slot at 2x and compressed to AVIF quality 95, about 90 KB each, 46 dB or better.
- Animation (mine, nothing in Figma): the pill, heading and paragraph rise in; each column's colour grows up from the bottom, its content rises in and its photo settles from a 1.15 zoom; scroll-driven on desktop, once on view below 1024px.
- Verified in Chrome: geometry within 1px of Figma at 1920px (columns, photos, heading, paragraph, in-column positions within 0.6px), Journey centred at the end of the pan and fully revealed at 1920, 1440, 1280 and 1024px, columns reveal in order, scroll back hides, no overflow, panel fits the screen height; phone, tablet and reduced motion checked. No console errors. Lint and `tsc` pass.
- Open: text weight differs slightly from the Figma render (possibly Proxima Nova); the 360px gap; alt texts; md and phone layouts are my interpretation.

### Courage collage: typewriter heading and popping photos (scroll-driven)
- Owner: the heading must type itself as the user scrolls, and the photo grid must pop in. Details in [13-home-courage.md](13-home-courage.md#animation-typewriter-heading-and-popping-photos).
- `HorizontalScene` now owns one scrubbed timeline (duration 1) and lets panels add tweens to it: new `scene-context.ts` with `useSceneTimeline` (exported from the `HorizontalScene` folder). The pan itself is a tween on that timeline.
- `CourageSection` is now a client component: heading split into character spans (typewriter with a thin caret), photos pop (scale 0.4 to 1, `back.out(2)`, staggered by where they enter the screen). Desktop: scrubbed by scroll, reversible. Phone: plays once on entering. Reduced motion: nothing hidden.
- Verified in Chrome at 1920px: typed count and caret at 9 points of the pan, photos hidden until they enter the screen, full heading and all photos at scale 1 at the end, scrolling back to the start hides everything again, screen reader heading is the full text; phone plays once in about 3 s; reduced motion (phone and desktop) shows everything with no pin. No console errors. Lint and `tsc` pass.

### Sideways scroll: Vision/Mission/Values pans right to The Courage To Find Your Path
- Owner, with the Figma "Homepage Version 2" canvas: hero on top, scroll down to Vision/Mission/Values, then as the user scrolls the view goes right to the third section. Built as the new `HorizontalScene` layout component (`src/components/layouts/HorizontalScene/`): pinned stage, panels in a row, vertical scroll moves the track left 1:1 until the last panel is centred. Details in [13-home-courage.md](13-home-courage.md#sideways-scroll-scene).
- `VisionMissionValuesSection` and `CourageSection` no longer wrap themselves in `<Section>`; they render one `<section aria-label>` each and are the two panels in `page.tsx`. The container, 200px spacing and (from 768px, no reduced motion) the pin come from `HorizontalScene`. Phones and reduced motion keep a plain vertical stack.
- Courage photos now load eagerly at low priority (lazy loading made them pop in during the pan).
- Verified in Chrome at 1920, 1280, 1024 and 768px: VMV centred at the pin start, exact half-way movement, collage centred at the end, all photos loaded, normal scroll afterwards, scroll back restores, no horizontal overflow, no console errors. Lint and `tsc` pass.
- Open: pan speed and a pause before it; the header scrolls away while pinned.

### Home: The Courage To Find Your Path (third section)
- Built Figma node `6529:1750`: `src/components/sections/home/CourageSection/`, content in `src/data/home-courage.ts`, types in `src/types/home.ts`, photos in `public/images/home/courage/`. Rendered after Vision/Mission/Values. Details in [13-home-courage.md](13-home-courage.md).
- Desktop: heading and eight photos positioned in percent of the 1548 x 747.865 Figma frame, which scales as one piece in the 1520px main container; heading size in container query units. Phone (below 768px): wrapped heading plus a two column photo grid (my interpretation).
- Photos: 64 MB of Figma originals resized and compressed to AVIF quality 95, 0.85 MB in total, all at 45 dB or better.
- New colour token `--color-brand-ghost: #e8e8e8`.
- Verified in Chrome: photo boxes within 0.02px of Figma times 1520/1548, heading size and position, layer order, no overflow from 360 to 2560px, no console errors.
- Open: the chess photo is stretched in Figma (built as designed, flagged); alt texts are mine; no animation specified.

### Vision/Mission/Values reveal: smoother
- Owner: the reveal felt shaky. Headless Chrome showed no dropped frames, so the fix targets the likely causes: the moving parts now stay on a GPU layer (`force3D`, `will-change`, cleared at the end) so text is not repainted on whole pixels or snapped when GSAP drops to a 2D transform, and the rise is 24px instead of 40px. Final positions identical; 16.7 ms frames, also at 4x CPU slowdown. Not confirmed on the owner's machine.

### Vision/Mission/Values: staggered reveal instead of a pinned scene
- Owner feedback (screenshot): while pinned, the section showed only the shield with a large empty screen. Wanted: when the section is reached, reveal everything in a staggered manner, not driven by scroll.
- `VisionMissionValuesSection` no longer pins or scrubs. One paused GSAP timeline plays once when the column top reaches 75% of the screen: shield and line draw (0.9 s), then Vision, connector, Mission, connector, Values, each overlapping the previous (3 s in total). Reload below the section shows it finished. Reduced motion shows the finished column.
- Verified in Chrome on the dev server: nothing visible before the trigger line; opacities and clip progress follow the order above; no pin spacer for this section; no console errors. Lint and `tsc` pass.
- Docs: [12-home-vision-mission-values.md](12-home-vision-mission-values.md) (new "Staggered reveal" section replaces "Scroll animation"), [04-animation-guidelines.md](04-animation-guidelines.md) (rule of thumb and pattern 9).
- The hero stays scroll-controlled. The entries below that describe a pinned Vision/Mission/Values scene are superseded by this one.

### Scroll-controlled home: pinned hero, pinned Vision/Mission/Values, Lenis
- Direction chosen by the owner and team: the animation follows the scroll amount (like the ESPN F1 feature). Hero: autoplays on landing, then scroll drives slide 2, slide 3 and moves on to the Vision/Mission/Values section. Vision/Mission/Values: pinned, step by step. Smooth scrolling with Lenis. Details in [11-home-hero.md](11-home-hero.md), [12-home-vision-mission-values.md](12-home-vision-mission-values.md) and the patterns in [04-animation-guidelines.md](04-animation-guidelines.md#how-a-scroll-scene-is-built-patterns-from-the-first-two-scenes).
- New: `lenis` 1.3.27, `src/lib/gsap.ts`, `src/lib/scroll.ts`, `src/components/layouts/SmoothScroll/` (mounted in the `(frontend)` layout; also refreshes ScrollTrigger after the window load and `document.fonts.ready`).
- **Hero rewritten** (`HeroSlideshowSection`): pinned with ScrollTrigger, one screen of scroll per slide change (pin spacer 3 screens tall); one `render(progress)` writes the track position, text opacities and dot sizes. Autoplay (3.5 s per slide, 0.4 s change) now works by scrolling the page, stops on the first wheel, touch or navigation key, resumes only back at the top after 5 s idle, and does not start if the page loads already scrolled. Embla is no longer used by the hero (it cannot follow the scroll position); swipe and hover-pause were dropped with it.
- **Text visibility rule:** each text is visible only within half a slide of its slide (`opacity = 1 - |progress - i| * 2`). A plain cross-dissolve overlapped into unreadable text when scrolling stopped half way.
- **Vision/Mission/Values rewritten as a pinned scene:** the column is pinned for 3 screens of scroll while one scrubbed timeline reveals the shield and line (clip-path), then Vision, connector, Mission, connector, Values. Reduced motion shows the finished column, unpinned.
- Reduced motion: no pin, no Lenis, no autoplay anywhere.
- Verified in Chrome (production build, then a smoke test on the owner's dev server): hero pin spacer 3 screens (2979px at 993px height); exact text opacities and track positions at 0, 0.25, 0.5, 0.75, 1, 1.5 and 2 screens of scroll; autoplay steps of 3.4 to 3.5 s; a wheel scroll stops autoplay; reduced motion; no horizontal overflow and no console errors at 390, 768, 1280, 1920 and 2560px; Vision/Mission/Values timeline states at 0 to 100% of the scene. Lint, `tsc` and build pass.
- Found and fixed while verifying: the half-way text overlap (above); a wheel tick followed by `window.scrollTo` being pulled back by Lenis (a test artefact, not a page bug: the page code uses `lenis.scrollTo`); the end-of-pin position reading `relative` instead of `fixed` (expected after release).
- Open: the header scrolls away while the hero is pinned; no visible pause control for autoplay; scroll distance per slide and whether to snap are feel settings for the owner; the combined "Courage To Find Your Path" scene is not built.

### Section spacing corrected to 200px above and below
- Owner screenshot: the section sat flush against the hero and the footer. Two causes. (1) The running dev server never picked up the new `spacing.css` file (its stylesheet had no `--spacing-section` and no `.py-section-half` rule, although the class was on the element), the same stale-cache problem as with the colours file; a dev server restart fixes it. (2) Even working, the first version padded only half (100px) on each side. The owner expects the full 200px.
- `Section` now uses `pt-section last:pb-section`: 200px above every section (after the hero and between sections) and 200px below the last section (before the footer). Between two sections there is exactly one gap.
- Removed the unused `--spacing-section-half` token.
- Verified in Chrome against the production build at 1920, 1536, 1280, 1024, 768, 390 and 360px: the gap above the first section, below the last section and between two sections is exactly the token each time (200px at 1280px and wider, 167px at 1024px, 133px at 768px, 80px at 360px).

### Reusable layout: main container and section spacing
- From the brief: main content container 1520px, section-to-section spacing 200px (desktop). Both are now shared and reusable. Details in [05-design-system.md](05-design-system.md#spacing-and-layout).
- `CONTAINER_WIDTH` (`main` 1520, `wide` 1740) in `src/components/layouts/Container/Container.constants.ts`. `Container`'s default width is now **1520** (it was 1530, which only the footer used). Header and hero use the named constants with the same values as before.
- **The footer now uses the standard 1520px container** (owner: the 10px difference from Figma's 1530 is not worth a special width). Its left and right edges move 5px inward at 1920px; the middle and right columns, all vertical positions and the 745px height are unchanged. Footer check re-run: 0 elements off, no overflow 360 to 2560px. The `footer: 1530` constant was removed.
- New token `--spacing-section` (200px desktop, fluid down to 80px) and `--spacing-section-half` in `src/styles/spacing.css`, giving utilities such as `gap-section`, `pt-section`, `py-section-half`.
- New `Section` component (`src/components/layouts/Section/`): the standard page section with the main container and half-section padding on top and bottom, so adjacent sections are exactly 200px apart.
- The Vision/Mission/Values section now uses `Section`. Its spacing around it changed from 96/64px to the section token (100px each side at desktop).
- Verified in Chrome: container content 1520px at 1920px; token 200 / 167 / 133 / 80px at 1280 / 1024 / 768 / 360px; two adjacent sections exactly one token apart at every width. Hero, footer and Vision/Mission/Values checks re-run and unchanged. The solid header variant could not be re-run in a browser (no second page exists to render it); the only change there was `1520` becoming `CONTAINER_WIDTH.main`.

### Home: Vision, Mission and Values section
- Built Figma node `6507:183`: `src/components/sections/home/VisionMissionValuesSection/`, content in `src/data/home-vision.ts`, types in `src/types/home.ts`, shield in `public/images/home/vision/shield.svg` (unmodified). Rendered below the hero on the home page (temporary placement). Details in [12-home-vision-mission-values.md](12-home-vision-mission-values.md).
- Added color token `--color-brand-graphite: #474747` (paragraph text; not in the brief's palette).
- Verified in Chrome against the production build: frame 715 x 685.6 as in Figma, every title, paragraph and line within 0.1px of its Figma position at 1920px, paragraph wraps match (3, 2, 3 lines), title glyphs within 0 to 1px, about 1% pixel difference (text anti-aliasing), no overflow from 360px to 2560px.
- Found and fixed while verifying: the title layout box was 48px instead of Figma's 47.53px (added 1.4px over the frame), and the connector lines rendered as one crisp dark pixel while Figma's render as a soft 2px line like the shield's (half-pixel shift).
- Open: mobile layout and the combined scene with "The Courage To Find Your Path" are not designed.

### Home hero images replaced (higher quality)
- Replaced the three hero images with the PNGs supplied by the owner. The first set had been exported from Figma and compressed to WebP quality 82, which was too lossy (about 41 dB, visibly soft).
- New files are **AVIF quality 92** at the native 1920 x 993: `slide-1.avif` 212 KB, `slide-2.avif` 229 KB, `slide-3.avif` 245 KB (about 90% smaller than the PNGs, 47 to 48 dB, under 0.25% of values off by more than 4). Old `.webp` files deleted.
- The hero images are now served as-is (`unoptimized`). `next/image` would otherwise re-encode them at quality 75 and undo the compression. Verified: served bytes are identical to the files, and the page no longer uses `/_next/image`.
- Verified in Chrome: the live slides match the original PNGs to under 0.9/255 mean difference in the photo area. All hero checks still pass (positions, 3.50 s autoplay, swipe, pause, reduced motion, no overflow).
- Details and measurements in [11-home-hero.md](11-home-hero.md#images).

### Home hero
- Built the homepage hero slideshow from Figma component "Component 2" (three variants): `src/components/sections/home/HeroSlideshowSection/`, content in `src/data/home-hero.ts`, types in `src/types/home.ts`. The home page now renders the hero (the dark placeholder is gone). Details in [11-home-hero.md](11-home-hero.md).
- Behaviour from the Figma prototype: 3.5 s per slide, 0.4 s sliding change, text cross-dissolve, gliding pagination pill, loop. Added swipe/drag, clickable dots, hover pause, reduced-motion handling and screen-reader handling.
- **Uses Embla** (`embla-carousel-react`, `embla-carousel-autoplay` 8.6.0, newly installed) instead of custom GSAP code. A first GSAP version worked but was about twice the code.
- Images: three Figma `Homepage` frame exports compressed from 2.2 to 2.4 MB PNG to 71 to 86 KB WebP in `public/images/home/hero/`.
- Added fluid text tokens `text-hero-80/72/64/32/28` to `src/styles/typography.css`.
- Verified in Chrome against the production build: text and dot positions within about 1px of Figma on all three slides, autoplay exactly 3.50 s, swipe, hover pause, reduced motion, no overflow or overlap from 360px to 2560px, bottom-area pixel diff about 1%.
- Found and fixed while verifying: lazy-loaded off-screen slides (slide 3 never loaded), native image drag cancelling swipes, autoplay restarting after the reduced-motion re-init, and absolute positioning inside `Container` ignoring its gutters.
- Open: Figma source photos are low resolution (1536px wide, upscaled), alt texts are mine, no pause button for autoplay.

## 2026-10-19

### Payload CMS: route groups and config (build plan steps 1 and 2)
- Moved the public site into `src/app/(frontend)/` (`layout.tsx`, `page.tsx`, `globals.css`; CSS imports now `../../styles/...`). `favicon.ico` stays at the `app/` root.
- Added `src/app/(payload)/` (admin, REST, GraphQL, playground; generated pattern from Payload 3.91) and `src/payload.config.ts`, `src/collections/Users.ts`, `src/collections/Media.ts`.
- `next.config.ts` wrapped in `withPayload()`. `tsconfig.json` got the `@payload-config` alias. `package.json` got `"type": "module"` and the `payload`, `generate:types`, `generate:importmap` scripts.
- Generated `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js`.
- Added `.env.example` (names only) and `.gitignore` entries (`!.env.example`, `/media`).
- **Removed `cacheComponents` and `partialPrefetching` from `next.config.ts`.** With them on, every `/admin` request logged a `new Date()` prerender error from Payload's `authenticate`. Off, the log is clean and the public site is unchanged.
- Users: roles (admin/editor), access rules, field-level role lock, and a hook that makes the very first user an admin.
- Verified against a throwaway real Postgres (nothing real touched, all test data and the temporary script deleted): 6/6 access-rule checks via Payload's API, 14/14 end-to-end checks in Chrome (admin first-user flow, login, Users/Media/Account screens, REST and GraphQL, public site). Details and limits in [10-payload-cms.md](10-payload-cms.md).
- Known gap: unknown public URLs now show Next.js's plain 404 without the header and footer (two root layouts). Needs `global-not-found` with the real 404 design.
- Not started: Neon project and `.env` (needs the owner), data layer, page globals.

### Packages
- Installed, exact-pinned to 3.91.0: `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`, `@payloadcms/live-preview-react`.
- Installed: `gsap` ^3.15.0, `@neon/config` ^1.9.2, `@neon/env` ^1.6.3, `sharp` ^0.35.5. `graphql` came in automatically as a Payload peer dependency.
- Nothing is configured yet (no `payload.config.ts`, `withPayload`, `neon.ts` or `.env`). Existing code does not import any of them.
- Verified: peer ranges satisfied (`@payloadcms/next` needs Next `>=16.3.3 <17`; we have 16.4.2). Lint, typecheck and production build pass, and the site output is unchanged.
- `npm audit` reports 20 findings (5 already existed). All come from `braces` in build/tooling dependencies. `npm audit fix --force` proposes a broken downgrade and was not run. Logged in [decisions](07-decisions.md).

### Header
- Built the header with two variants, `transparent` and `solid`, from Figma nodes `6282:929` and `5688:14371`: `src/components/layouts/Header/`, content in `src/data/header.ts`, types in `src/types/header.ts`. Rendered from `src/app/layout.tsx`. Details in [09-header.md](09-header.md).
- `Container` gained a `contentWidth` prop (default 1530, so the footer is unchanged). The transparent header uses 1740, the solid header 1520.
- Added `public/images/header/`: `logo.svg` (Figma export with the three ancestor-background elements removed), `menu-light.svg`, `menu-green.svg`.
- The placeholder home page now has a dark navy background so the transparent header is visible.
- Verified in Chrome against the production build: both variants within 0px of Figma at 1920px for all 4 elements, no overflow from 360px to 2560px, solid sticks on scroll and transparent scrolls away, footer re-checked and unchanged, no console errors.
- Offcanvas menu intentionally not built (not designed): the menu button has no action yet.
- Known differences: "Admissions Open" is DM Sans in Figma (not supplied); the logo's tagline is cropped in the Figma design itself.

### Footer
- Built the footer from Figma node `6282:795`: `src/components/layouts/Footer/`, content in `src/data/footer.ts`, types in `src/types/footer.ts`. Rendered from `src/app/layout.tsx`. Details in [08-footer.md](08-footer.md).
- Added a reusable `Container` layout component (`src/components/layouts/Container/`): 1530px content column, 20px / 40px gutters.
- Added the 4 social icon SVGs to `public/images/footer/`.
- Added color token `--color-brand-green-light: #4da44b` (the "Lead" highlight; not in the brief's palette).
- Verified in Chrome against the production build: footer is 745px tall at 1920px as in Figma, all 18 measured elements within 0px of their Figma positions, no horizontal overflow from 360px to 2560px, no console errors.
- Found and fixed while verifying: eyebrow height (Tailwind's `leading-normal` is 1.5, not CSS `normal`), CTA row minimum height (150px), a 2px overflow at 1610px, and a Tailwind variant-ordering issue (an arbitrary `min-[1650px]` variant did not override `xl:`; used `xl:max-[1649px]` instead).
- Known differences from Figma: Proxima Nova text rendered in Plus Jakarta Sans (font not supplied), ClearType vs grayscale antialiasing. Tablet and mobile layouts are my interpretation (Figma has desktop only).

### Fluid type scale
- Added `clamp()`-based font sizes to `src/styles/typography.css`: `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-body-sm`, from the brief's desktop sizes (48 / 40 / 20 / 18 / 16 / 14px).
- Sizes scale linearly between a 360px and a 1280px viewport. Mobile minimums and line heights are provisional (the brief says to confirm against Figma).
- Homepage hero H1 intentionally not defined (brief says "Varies").
- Placeholder homepage `<h1>` now uses `text-h1`.
- Verified in Chrome against the production build at 360 / 768 / 1280 / 1920px: all computed sizes match the expected values. Lint and build pass.

### Colors
- Added the 7-colour brand palette from the project brief in `src/styles/colors.css` (`--color-brand-amber`, `-green`, `-navy`, `-blue`, `-blue-mid`, `-steel`, `-mist`), imported from `globals.css`.
- Verified: lint and build pass, 7 variables present in the compiled CSS, and `bg-/text-/border-brand-*` utilities generate.
- Hex values come from the palette image labels and still need checking against Figma.
- Gotcha seen: after adding the new CSS file, an incremental build did **not** emit the tokens. Deleting `.next` and rebuilding fixed it. Cause not determined. If a new style file seems ignored, clear `.next` first.

### Fonts
- Wired the uploaded fonts (Lexend Deca, Plus Jakarta Sans) via `next/font/local` in `src/fonts/index.ts`, `.woff2` only.
- Added `src/styles/typography.css` with semantic tokens `--font-heading` / `--font-body` (and `--font-sans`), imported from `globals.css`.
- Replaced the Geist Google fonts in `layout.tsx`, so the build no longer needs to fetch fonts from Google.
- Base styles: `body` uses the body font, `h1` to `h6` use the heading font.
- Verified: lint and build pass, 23 `.woff2` files emitted, tokens resolve in the compiled CSS.
- Deleted the 23 unused `.woff` files from `src/fonts/`. Only `.woff2` remains.
- Browser-verified (Playwright + Chrome, dev and production build): `h1` renders in Lexend Deca 600, `body` resolves to Plus Jakarta Sans, all font requests return 200, zero console errors.
- Found: all 23 `.woff2` files (about 765 KB) are preloaded on every page. Logged in [decisions](07-decisions.md) to trim weights once the design is known.

### Folder structure
- Moved `app/` to `src/app/`.
- Created the basic skeleton in `src/` following the Torque Pharma and Giada layout: `components/{layouts,sections,ui}`, `data`, `fonts`, `lib/{actions,api}`, `styles`, `types`. Empty folders hold `.gitkeep`.
- Updated the `@/*` alias in `tsconfig.json` from `./*` to `./src/*`.

### Cleanup
- Removed `create-next-app` boilerplate from `app/page.tsx` (replaced with a minimal placeholder).
- Deleted unused default SVGs from `public/` (`file`, `globe`, `next`, `vercel`, `window`).
- Set real site title and description in `app/layout.tsx`.
- `app/globals.css`: body now uses the Geist font variable instead of the hard-coded Arial fallback.
- Replaced the generic `README.md` with a project README.

### Documentation
- Created the `docs/` folder (overview, architecture, sitemap, animation guidelines, design system, changelog, decisions).
- Added `CLAUDE.md` with the rule that every change is documented.
