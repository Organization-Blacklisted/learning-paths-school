# Checks, tests and CI

Three layers, from fast to thorough:

| Layer | Command | Runs | What it proves |
| --- | --- | --- | --- |
| Before every commit | `.githooks/pre-commit` (automatic) | on your machine, about 15 s | lint, formatting, types, the unit tests and the image budget pass |
| On every push and pull request | `.github/workflows/ci.yml` (automatic) | GitHub Actions, about 5 min | the same, plus a production build and the browser checks `qa` and `qa:interact` |
| Around a refactor | `npm run qa:snapshot` (by hand) | your machine, about 10 min | the page still looks pixel-for-pixel the same |

## Unit tests (`npm test`)

Vitest and Testing Library in jsdom: `src/**/*.test.ts(x)`, next to the code they test. They cover **logic**, not layout or animation (those need a real browser, see below). `npm run test:watch` re-runs on every save; `npm run check` runs lint, types and the tests, like the hook.

| File | What is checked |
| --- | --- |
| `lib/useScrollReveal.test.tsx` | the hook's wiring around GSAP (GSAP is replaced by a recording fake): the media query (default and given), one ScrollTrigger that plays the timeline once, `start`, nothing created when the build returns nothing or the query does not match, clean-up on unmount, no restart on re-render, restart with the latest build function when the media query changes |
| `components/blocks/BlockRenderer.test.tsx` | every block type becomes its own section, in order; CTA and marquee get their standard content when none is given; `attachToFooter` passes through; a scene wraps its panels with their width and gap; the real `homePage` data renders the sections of the design in order, ends with the marquee attached to the footer, has unique ids, no scene inside a scene |
| `lib/useIdleReady.test.tsx` | normal policy (load + idle + delay, waits for the window load event, Safari fallback, cleanup) and careful policy (narrow screen, "save data", 2g/3g/slow-2g: not ready by time, ready within two screens, 1800px margin, stops watching, falls back to time when there is nothing to watch or no IntersectionObserver) |
| `lib/resize.test.ts` | the resize watcher: a resize while the page stands still refreshes (also height only), a burst refreshes once, a height change while scrolling (a phone's address bar) is ignored, a width change always refreshes, cleanup |
| `lib/motion.test.ts`, `components/ui/Photo/Photo.test.tsx` | the media queries meet at 1024px; `Photo` renders nothing until ready, then an eager, undraggable, unselectable, un-re-encoded image |

**The tests were checked for teeth:** eight deliberate bugs (margin 1800 to 100px, `saveData` ignored, trigger no longer `once`, no revert on unmount, `attachToFooter` ignored, `gapBefore` dropped, image draggable again, scene panels swapped) were each introduced in turn, and each made the suite fail.

## Formatting (Prettier)

One style for every file, so nobody argues about it and a pull request shows only real changes. `npm run format` fixes everything; `npm run format:check` (in `npm run check`, the hook and CI) fails when a file is not formatted. Settings: `.prettierrc.json` (line width 140, which is what the code already used, so only 29 files changed when it was introduced; `endOfLine: "auto"` so Windows checkouts with `autocrlf` are not flagged). Not formatted (`.prettierignore`): generated files (`src/payload-types.ts`, `src/app/(payload)`), `tsconfig.json` (Next rewrites it on every build), `public`, build output and all Markdown (prose). `.vscode/` turns on format-on-save and recommends the extension.

**It was proven to change nothing:** the production build before and after formatting every file has byte-identical JavaScript and CSS (all 67 files, same names and hashes), and the home page HTML is identical except for Next's random build id.

## The image budget (`npm run images:check`)

`scripts/check-images.mjs` refuses a photo that is not AVIF, over 400 KB, over 2400px wide, or a set of photos over 6 MB (4.1 MB now), and an SVG over 150 KB. Part of `npm run check`, the hook and CI. How to make a photo that passes: [../scripts/README.md](../scripts/README.md).

## CI (`.github/workflows/ci.yml`)

Written for **GitHub Actions** (the code will be on GitHub, hosted on Vercel: see [25-deployment-vercel.md](25-deployment-vercel.md); there is no repository yet). Two jobs, run in parallel on every push and pull request; a new push cancels the run still going on the same branch:

- **quality** (shown as "Lint, format, types, tests, images"): `npm ci`, `npm run lint`, `npm run format:check`, `npx next typegen` then `tsc --noEmit`, `npm test`, `npm run images:check`. The `typegen` step is needed because Next generates the global route types (`LayoutProps`, ...) into `.next/types`, which is not in git: on a developer machine they already exist, on a fresh checkout `tsc` fails without it.
- **browser**: builds the production site and serves it on 3002 (`npm run qa:serve`), then `npm run qa` and `npm run qa:interact` with the Google Chrome that GitHub's Ubuntu runners already have. The build needs no secrets: it gets harmless placeholder values for `NEXT_PUBLIC_SITE_URL`, `PAYLOAD_SECRET` and `DATABASE_URL` (the home page is static; `/admin` and `/api` are not exercised). The Next build cache is kept between runs.

**Not in CI: the screenshot comparison.** Fonts and text rendering differ between operating systems, so a baseline saved on a Windows machine would never match a Linux runner. It stays a local tool around refactors. (If wanted later: a manual workflow that builds the base branch and the new branch on the same runner and compares them.)

**What was checked here:** the workflow's commands were run locally in the same order with the same placeholder environment (`npm ci --dry-run` confirms the lockfile is in step; lint, types, 71 unit tests, a production build with only the placeholders, `qa` and `qa:interact` all pass). The workflow file itself has not run on GitHub yet; the first push will show if the runner needs anything else.

## The pre-commit hook (`.githooks/pre-commit`)

`npm install` sets `core.hooksPath` to `.githooks` (the `prepare` script), so every `git commit` first runs lint, types and the unit tests (about 10 s) and is refused when one fails. It already paid off once: it caught a type error in a test file that Vitest itself does not check. Skip it for one commit with `git commit --no-verify`.

# The browser checks (`tests/`)

The checks used for the production reviews ([16-production-readiness.md](16-production-readiness.md)) live in the repository, so anyone can repeat them. They use Chrome through `playwright-core` (a dev dependency; it uses the Chrome you already have, nothing is downloaded).

| Command | What it does |
| --- | --- |
| `npm run qa:serve` | Builds the production site into `.next-prod` and serves it on port 3002, **without touching `.next`** (the folder of `npm run dev`). `next build` rewrites `tsconfig.json` and `next-env.d.ts` for the other folder, so the script puts them back (`next-env.d.ts` is not in git: on a fresh checkout it is deleted again afterwards). `-- --skip-build` serves what is already built. |
| `npm run qa` | The functional checks (below). Exit code 1 when one fails. |
| `npm run qa:interact` | Behaviour that screenshots cannot show: the Ecosystem tab bar (click, the sliding highlight, arrow/Home/End keys, the phone and tablet auto-scroll), one-off entrances reaching their end state, and the reduced-motion page (nothing pinned, nothing hidden). |
| `npm run qa:snapshot:save` | Takes the **baseline**: screenshots of the whole home page. Run it on a build you trust, before a refactor. With `-- --only=390` it refreshes just that width and keeps the others. |
| `npm run qa:snapshot` | Takes the screenshots again and compares them with the baseline. Differences are written to `.qa/diff/` (red = different). |

`npm run qa:serve` always builds with `HOME_SECTION_LIMIT=all` (since 2026-10-28 the live site shows the whole page too, but the variable keeps the checks independent of any limit set later in `src/lib/site.ts`); the checks and the screenshots still cover the WHOLE page. To test the shipping configuration instead, build without that variable (for example `NEXT_DIST_DIR=.next-prod npx next build`, then `next start -p 3002`) and run a scroll check; the checks that expect every section (tabs, three pinned scenes, ...) are written for the whole page.

URL: `QA_URL` (default `http://localhost:3002`). Set it to test a deployed address, e.g. a Vercel preview: `QA_URL=https://… npm run qa`. The screenshots live in `.qa/` (git-ignored).

## `npm run qa`: functional checks

Head tags (title, description, canonical, Open Graph, Twitter card, theme colour), JSON-LD, one `h1`, `main`, header and footer, the skip link (visible on the first Tab, moves focus to `main`), every image has an `alt`, `robots.txt` and `sitemap.xml`, a real 404 status for unknown URLs, system dark mode leaves the page white, visible keyboard focus, scrolling the whole page with the mouse wheel on a desktop and a phone (no horizontal overflow, no console messages, no failed or 4xx requests, back to the top), resizing 1920 > 390 > 1920 through every breakpoint (the three pinned scenes are rebuilt), and axe (colour contrast is reported but does not fail the run: white on the brand green is an owner decision, see [16-production-readiness.md](16-production-readiness.md)).

## `npm run qa:interact`: behaviour

59 checks, including the five Ecosystem tabs (each one’s own title and photo, the same panel height for all five, the last bullet inside the pinned screen at three sizes), the Courage heading checks for the `"rotate"` option (plain text, the rotating word stays inside the heading at five widths and really changes, first word stays with reduced motion; they are skipped while the typewriter is on),  the sideways scenes on a phone and a tablet (a tablet has 3 pins, a phone 2: below 640px wide the Ecosystem and Alumni scene is an ordinary stack, which is checked too; Vision centred, the last Journey column reached by scrolling down through it, no overflow, reduced motion stacked), the Campus media box opening and closing with the scroll (scrubbed), the tabs (always one row and the highlight exactly on the active tab, at seven window sizes and through resizes) and resizing (DevTools device mode, a docked DevTools, a phone's address bar and rotation: a resized page must lay out exactly like a fresh load, and the hero must never show behind later sections) and: five tabs with roving tabindex and a labelled panel; clicking the third tab slides the highlight through several positions and ends exactly on it; the panel follows; the keys behave (ArrowRight, End, wrap-around, Home, ArrowLeft); on a phone (390) and a tablet (768) choosing a tab brings it fully into view with the highlight on it and the next tab partly showing; the Campus, News and CTA entrances leave nothing invisible; with reduced motion nothing is pinned or hidden; no console messages.

## `npm run qa:snapshot`: visual regression

It walks down the page at **five screen sizes** (1920, 1440, 1024, 768, 390) with the mouse wheel, one half screen at a time, and takes a screenshot after each step (about 150 in all). The pinned sideways scenes are therefore captured at every stage of their animation, and the one-off entrances after they have played.

- It scrolls like a visitor does: `window.scrollTo` fights the smooth scrolling (Lenis) and lands in the wrong place.
- Each screenshot waits 2.3 s (smooth scrolling settles in about 1.2 s, an entrance takes about 1.4 s, photos arrive).
- The marquee photos are hidden by the script (they never stand still); the marquee has its own checks. The first screen of every size (the hero slideshow moves by itself) is compared loosely.
- Both images are shrunk to a quarter before comparing, so a text line moved by one or two pixels (the smooth scroll settles to a sub-pixel) does not count, while a missing, moved or recoloured element does.
- **Phone frames (390px) are compared a little more loosely** (shrunk to a third of the width, up to 0.5% of the pixels may differ, 0.3% at the other widths). Reason, found by measuring: some text on a phone sits exactly on a half pixel (the Vision heading is at y = 690.498), so between two runs the browser draws it one pixel higher or lower, and four frames flipped between two states for no visible reason. A real change (the Courage heading being centred moved 0.8 to 1.5% of the pixels at the old setting) is still far above the limit. If a phone frame fails, run `-- --only=390` again and look at the diff before worrying.
- Sanity check: the unchanged site compared with its own baseline gives **all 152 screenshots matching**.

A full run takes about 10 minutes. Use `-- --only=390` (one width) while working on something specific:  `node tests/snapshot.mjs --only=390`.

## Working method for a refactor

(See also the three layers at the top: the hook and CI catch breakage on every commit; this is the extra step for changes that must not change how the page looks.)

1. `npm run qa:serve` (build + serve), then `npm run qa:snapshot:save`.
2. Change the code. Rebuild (`npm run qa:serve`) and run `npm run qa:snapshot` and `npm run qa`.
3. Anything red is a change in how the page looks: look at `.qa/diff/`, then fix the code or, if the change is wanted, save a new baseline.

If the build fails with an error in `.next/dev/types/…`, the dev server was rewriting its generated types at that moment: run the build again.
