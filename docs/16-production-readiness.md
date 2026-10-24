# Production readiness review (2026-10-21)

A full review of everything built so far (the home page, header, footer, the sideways scene, Payload set-up), measured on a **production build**, not the dev server. This page records what was checked, what was found, what was fixed and what still needs a decision or an input from the owner before launch.

## How it was measured

- **Safe production build.** `NEXT_DIST_DIR=.next-prod npx next build` then `NEXT_DIST_DIR=.next-prod npx next start -p 3002`. The `NEXT_DIST_DIR` switch (`next.config.ts`) sends the build to its own folder, so the running dev server's `.next` is never touched. After a build, `tsconfig.json` and `next-env.d.ts` get rewritten for that folder: restore them (git checkout, or the saved copy). `.next-*` is in `.gitignore` and in the ESLint ignores.
- **Playwright + Chrome** (scripted): network by type, fonts, LCP, CLS, long tasks, CPU 4x and "fast 3G" (1.6 Mbit/s, 150 ms) throttling for the phone run; a wheel-scroll through the whole page on desktop and phone; resizing across every breakpoint; keyboard; system dark mode; head tags; robots and sitemap; 404 handling.
- **Lighthouse 12** (mobile and desktop presets) and **axe-core 4.10** (WCAG 2 A/AA and best practices).
- Caveat: on the machine used, antivirus software injects a 180 KB script (`main.js?attr=...`, from a `kaspersky-labs.com` address) and some XHR calls into every page. They show up in the totals and in Lighthouse's "unused / unminified / uncompressed JavaScript" findings, but they are **not part of the site**. The site's own JavaScript is about 205 KB (framework, React, GSAP with ScrollTrigger, Lenis).

## Results

| Measure (production build) | Before | After |
| --- | --- | --- |
| Fonts on first load | 23 files, 775 KB | 7 files, 234 KB |
| Data on first load, phone, 4x CPU + fast 3G, until the load event | 3.2 MB, load event at **16.4 s** | 1.5 MB, load event at **5.3 s** |
| Hero photo 1 finished (phone, throttled) | 10.4 s (slide 1 was the last of the three hero images to land) | ahead of everything else below the fold |
| Lighthouse mobile: performance / accessibility / best practices / SEO | 72 / 93 / 82 / 100 | 75 / 96 / 82 / 100 |
| Lighthouse mobile LCP | 9.2 s | 5.5 s |
| Lighthouse desktop performance | not run | 97 (FCP 0.5 s, LCP 1.2 s, TBT 0, CLS 0) |
| Layout shift (CLS), blocking time (TBT, phone) | 0 / 100 ms | 0 / 130 ms |
| Console errors or warnings, failed requests | 0 | 0 |
| Logo file | 219 KB | 130 KB (the same drawing, 51.7 dB when rendered at 4x) |
| Cache lifetime of everything in `/images` | `max-age=0` (revalidated on every visit) | 1 week, then revalidate in the background |

Lighthouse's best-practices score of 82 is only "does not use HTTPS" (the test runs on `http://localhost`); on the live site over HTTPS it is 100 apart from the finding in the list below. The remaining mobile performance gap is network weight (JavaScript, fonts and the first hero photo all share a slow connection) and is expected to be lower on the real host with a CDN and HTTP/2 or 3.

## What was wrong, and what was changed

1. **Dark mode broke the site.** `globals.css` still had the generator's `prefers-color-scheme: dark` block, which turned the page background black (`#0a0a0a`) and left sections transparent with dark text on it. Every visitor whose phone or computer is in dark mode would have seen an unreadable page. Removed, and `color-scheme: light` added. Checked: with the system in dark mode the page is white. (The design has no dark mode.)
2. **Fonts.** Next.js preloads every declared font file on every page; all 23 were declared. Now only the ones the design uses: 7 files (Lexend Deca 400, 500, 600; Plus Jakarta Sans 400, 500, 600, 700); an eighth (Plus Jakarta Sans 300, for the news cards) was added later. The other files stay in `src/fonts/`: adding a weight is one line (see the comment in `src/fonts/index.ts`). **Rule:** declare a weight only when the design uses it.
3. **Image loading order** (the biggest win). Everything was requested at the start and shared the bandwidth, so on a slow connection the first hero photo arrived last. New hook `src/lib/useIdleReady.ts`: hero slides 2 and 3, the collage, the journey photos and the framework photo are requested only **after the page has loaded and the browser is idle** (the lower photos 0.8 s later). Their boxes already have their size (no layout shift), the scroll animations do not depend on the photos having arrived, and the hero's autoplay waits until the next slide's photo is loaded, so there is never a blank slide. Native `loading="lazy"` was not enough: it still loads anything within about 1250px of the screen, which on a phone's vertical layout is a lot.
4. **Search and sharing.** Real `<title>` and description, canonical, Open Graph, Twitter card, theme colour, `EducationalOrganization` JSON-LD (name, phone, e-mail, address from the footer), `robots.txt` (blocks `/admin` and `/api`), `sitemap.xml`. The site address comes from `NEXT_PUBLIC_SITE_URL` (see below).
5. **Accessibility.** "Skip to main content" link (first Tab stop, visible on focus, moves focus to `<main>`); `color-scheme`; one `h1`, a sensible heading order, every image has an `alt`; visible focus rings on every control; reduced motion respected everywhere. axe-core: no serious or critical findings except the two below.
6. **A branded 404 page** (`src/app/global-not-found.tsx`, enabled by `experimental.globalNotFound`): Next's plain 404 had no header or footer because the app has two root layouts. It returns a real 404 status and `noindex`. The copy is mine.
7. **Hardening headers** on every page (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`), the framework header removed (`poweredByHeader: false`), and week-long caching for `/images`.
8. **Logo** optimised with svgo (path precision 2 decimals, same drawing). **Footer year** now follows the build year (the Figma text said 2025).
9. **Housekeeping:** shared `Badge` component for the green pills; `NEXT_DIST_DIR` for safe production builds; ESLint ignores `.next-*`.
10. **Branded error screens** (added 2026-10-22): `src/app/(frontend)/error.tsx` for a failing page (header and footer stay, "Try again" and a link home) and `src/app/global-error.tsx` for a failing root layout. The visitor never sees the error text, only a reference. Verified in a real build with failures forced (see [06-changelog.md](06-changelog.md)).

## Verified on the production build

- `/` is **static** (prerendered), so it needs no database. `robots.txt` and `sitemap.xml` are static too. Lint and `tsc` pass.
- Scrolling the whole page with the wheel on desktop (1920) and on a phone (390): reaches the footer, **no horizontal overflow at any point**, no console messages, no failed requests, back to the top again.
- Resizing 1920 > 1280 > 1024 > 900 > 600 > 390 > 900 > 1280 > 1920 > 1100 > 1920 on a live page: no errors, no overflow, the pinned scenes are rebuilt each time the layout changes.
- Keyboard: skip link first; hero dots, footer links and buttons all show a 2px outline.
- Reduced motion: no pinning, no smooth scrolling, no autoplay, everything visible (checked on desktop and phone in every section).

## What still needs a decision or an input before launch

**Blocking for the CMS (not for the public home page):**
- **Neon project and `.env`.** Until `DATABASE_URL` and `PAYLOAD_SECRET` exist, `/admin` and `/api/*` answer 500 in production (they cannot connect). The public pages are unaffected. Details in [10-payload-cms.md](10-payload-cms.md).
- **`NEXT_PUBLIC_SITE_URL`** must be set to the real address **before the build** (it is read at build time). Without it the canonical, Open Graph and sitemap links point at `http://localhost:3000`. The contact e-mail suggests `learningpaths.in`, but the domain is the owner's to confirm.

**Content and design (owner):**
- An Open Graph image (1200 x 630, JPG or PNG, not AVIF): without it shared links show no picture.
- **Launch scope:** only the first five home sections are shown (`HOME_SECTION_LIMIT`, [06-changelog.md](06-changelog.md)); the numbers measured in this document are for the whole page, so the live page is lighter. Re-measure on the host.
- **Hosting:** GitHub + Vercel (decided 2026-10-22). Environment variables, the first-deployment checklist and what still has to be verified on Vercel: [25-deployment-vercel.md](25-deployment-vercel.md).
- All link targets are `#` placeholders (header, footer, CTA buttons, social profiles) until the page list and profile URLs exist.
- **White text on the brand green `#338845` is 4.42:1** (needs 4.5:1 for 18px regular text): the footer button and the green pills. The closest passing green is about `#2f8141`. A brand-colour decision, left as designed.
- **The chess photo is stretched in the Figma design** (64% too wide). Lighthouse flags it ("image displayed with incorrect aspect ratio"). Recommended: change `fit: "stretch"` to `"cover"` for that photo in `src/data/home-courage.ts`.
- The 404 copy, the page description and the alt texts are mine.
- Hero photos are low resolution in the Figma source (1536px wide upscaled): ask the school for the originals.
- Pagination dots in the hero are 12px with 7px gaps (WCAG 2.2 target size). They have a 28px invisible hit area for fingers, and scrolling is the equivalent way to move; making the visible spacing 24px would change the design.

**Technical, later:**
- **Content-Security-Policy and HSTS.** HSTS belongs on the host (HTTPS only). A strict CSP needs a nonce set-up that also works with Payload's admin.
- `experimental.globalNotFound` is marked experimental in Next 16.4. Fall back to the plain 404 if a future upgrade changes it.
- Optional size savings, deliberately not done: subsetting the fonts to Latin (about 100 KB less, but loses accented or extended characters the CMS might bring), and removing the installed-but-unused Embla packages.
- `npm audit` has 20 findings in build tooling (see [07-decisions.md](07-decisions.md)); none ship to the browser.
- The header scrolls away while a scene is pinned (open question in [07-decisions.md](07-decisions.md)).

## Second review: the finished home page (2026-10-22)

Everything was switched on and rebuilt (`next build` into `.next-prod`, served on 3002). `/`, `robots.txt` and `sitemap.xml` are static; lint and `tsc` pass.

**One change:** `useIdleReady(extraDelayMs, nearRef?)` now has two policies. On a desktop-width screen with a good connection it behaves as before (after the page has loaded and the browser is idle). On a **phone-width screen, with "save data" on, or on 2G/3G**, and when the section passes its own `rootRef`, the photos are requested only when the section is within about two screens (1800px) of the viewport. Reason: on a phone the page is one long column and the lower half may never be reached, so there is no point in downloading all 4 MB at the start. All eight below-the-fold image sections pass their root.

| Measurement (Chrome, production build) | Result |
| --- | --- |
| Desktop 1920: load event / LCP / CLS | 0.23 to 0.30 s / 0.5 to 0.6 s / 0 |
| Desktop: total transferred after idle | about 5 MB (30 photos 4.3 MB, fonts 269 KB, JS about 210 KB of our own) |
| Phone (4x CPU, slow 3G): load event / LCP | 5.7 s / 4.2 s |
| Phone: images requested at the start | 5 (1.6 MB in total); 0 blank photos while scrolling the whole page; 41 images after a full scroll |
| Lighthouse mobile | performance 71, accessibility 96, best practices 82, SEO 100 (LCP 6.3 s simulated, TBT 220 ms, CLS 0) |
| Lighthouse desktop | performance 97, accessibility 96, best practices 78, SEO 100 (LCP 1.3 s, TBT 40 ms, CLS 0) |

About the mobile score: the simulated LCP is dominated by `main.js` (180 KB, 1.7 s of render blocking), which is **injected by the antivirus on the test machine**, not part of the site (it is not in the build output). Without it the phone numbers are better than shown; they should be re-measured on the real host.

**QA suite, all passed:** head tags (title, description, canonical, Open Graph, Twitter, theme colour), JSON-LD, one `h1`, skip link moves focus to `main`, every image has an `alt`, unknown URLs return a real 404, system dark mode leaves the page white, keyboard focus indicators, scrolling the whole page on desktop and a phone (no horizontal overflow, no console messages, no failed or 4xx requests), and resizing 1920 > 390 > 1920 through every breakpoint (the three pinned scenes are rebuilt).

**axe:** only colour contrast (white on the brand green, see the owner list above) and one false positive (the hero's amber quote over a photo, where axe cannot read the background).

**Still the owner's:** the same list as above. New since the first review: the placeholder content of the Ecosystem tabs, the news cards and the campus video, and the animation review the owner planned once the home page was complete.

## Repeat the review

```bash
# production build into its own folder, served on 3002 (does not disturb `npm run dev`)
NEXT_DIST_DIR=.next-prod npx next build
NEXT_DIST_DIR=.next-prod npx next start -p 3002
# then restore tsconfig.json and next-env.d.ts (the build rewrites them), e.g. with git checkout
npx -y lighthouse@12 http://localhost:3002/ --only-categories=performance,accessibility,best-practices,seo
```
