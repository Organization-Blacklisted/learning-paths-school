# Plan: the home page editable in Payload

Status: **all steps A to H done on 2026-10-28: the home page is editable in Payload on the live site** (committed and deployed; the first admin account was created by the owner). Background: [10-payload-cms.md](10-payload-cms.md) (what exists), [02-architecture.md](02-architecture.md#payload--neon-status-and-plan) (the original steps 4 and 5 that this plan fills in), [07-decisions.md](07-decisions.md).

## What the owner asked for

"Wire up Payload and make the full homepage editable like we have in Giada, with an SEO tab etc."

## What Giada does (surveyed read-only, 2026-10-28)

- **A page is a singleton Global** (Home, FAQ, Contact, ...), not a document in a Pages collection. Its fields are an outer `tabs` field (Content, SEO); inside Content each section is a named `group` or `array`. There is **no blocks field**: the order of the sections is written in the code.
- **SEO tab: hand-written** (`seo` group: `metaTitle`, `metaDescription`, `ogImage`, `noIndex`), not the SEO plugin. A shared `buildPageMetadata()` turns it into title, description, canonical, Open Graph, Twitter and robots.
- Drafts (`versions: { drafts: true }`), **Live Preview** (375, 768 and 1440 widths) on every page global, and an `afterChange` hook that calls `revalidateTag` (only when published). A POST `/api/revalidate` webhook protected by a secret.
- Content is read with the **Local API** wrapped in `unstable_cache` with a tag (`lib/api/<page>.ts`), then a **pure mapper** (`<page>-map.ts`, no Payload imports) so Client Components can use it. The page is a thin server component that passes the raw data to a client component that calls `useLivePreview`.
- Header, footer and site settings are **not** in the CMS in Giada. There is no seed script and no fallback if the database fails. Roles: `admin` / `editor` (same as our `Users`).
- Giada runs `payload migrate && next build` and keeps migrations in `src/migrations`.

## Decisions (owner, 2026-10-28)

1. **The home page is a Global** (like Giada), not a Pages collection with blocks. Reasons: the home page is a designed sequence with pinned sideways scenes, exact widths and a fixed order, so an editor reordering or deleting sections can only break it; and the other pages are not designed yet, so a general page builder now would be guesswork. A Pages collection with blocks comes later, for the ordinary pages.
2. **The SEO tab uses `@payloadcms/plugin-seo`** (not hand-written fields like Giada): length counters, a Google-style preview, generate buttons and an image picker. Pinned to the same exact version as the other Payload packages. We add what the plugin lacks through its `fields` option: a "hide from search engines" checkbox and an optional canonical URL.

3. **Header and footer stay in the codebase** (`src/data/header.ts`, `src/data/footer.ts`), not in the CMS. The shared CTA band and photo strip are sections of the home page, so they ARE in the Home Global.
4. **Editor uploads are converted to AVIF** (and served with long cache headers, unique file names), so the speed work survives uploads.
5. **Editors can publish**, as in Giada (any signed-in user can edit and publish content; only admins manage users).
6. **Order of work (my call, 2026-10-28):** build everything on the `dev` Neon branch first; the production migration and the Vercel variables come LAST ("Go live"), when the schema is stable (one clean migration, not one per change) and the fallback keeps the live site working in the meantime. Nothing is pushed or deployed without the owner saying so.

## Principles

- **The page stays fast static HTML.** Content is read once and cached with a tag; publishing clears the tag. It must never become a database call on every visit.
- **Components do not change.** A mapper turns the Payload document into the content types the sections already use (`src/types/home`, `PageBlock`); design values are merged in from code.
- **Content, not design, is editable.** Text, lists, links and photos (with alt text) are fields. Not editable: the Framework diagram geometry, scene panel widths and gaps (`contentWidth`, `gapBefore`, `stackOnPhones`), the hero text `scale`, animation timings, section order. Titles and card texts get `maxLength` and a description, because a long title would break a fixed layout.
- **Reusable section modules.** Each section's fields are written as their own module (`src/globals/home/<section>.ts` or similar), so the shared ones (CTA, photo strip, News, ...) can become blocks of a Pages collection later without a rewrite.
- **A safe fallback.** If the database cannot be read (or the Global is empty), the page renders from the content files `src/data/home-*.ts`, so it never goes blank. A seed script loads those files into Payload, so the first CMS version equals today's site.
- **Proof of no change.** The page built from the CMS must match the page built from the files: a unit test of the mapper against `src/data` and the screenshot comparison ([24-qa-suite.md](24-qa-suite.md)).

## Images (the main risk)

Today every photo is a pre-compressed AVIF in `public/images`, served from Vercel's CDN with a 7-day cache, and the repository forbids JPG/PNG/WebP photos. An editor upload goes to the private Neon bucket and is served through the app (`/api/media/file/...`), which is slower and uses function invocations, and a JPG upload bypasses the AVIF budget. Proposed: convert uploads to AVIF with Payload's `sharp` on upload (`formatOptions`), set long cache headers on the media route, and give each upload a unique file name (the 7-day cache problem of 2026-10-28). **Decided 2026-10-28: yes, convert.**

## Todo (work order; tick as done)

**A. Setup** (done 2026-10-28)
- [x] Install `@payloadcms/plugin-seo` at 3.91.0 (exact), run `generate:importmap`.

**B. Schema** (done) (`src/globals/home/`, one module per section so they can become blocks later)
- [x] Section field modules: hero, vision/mission/values, courage, journey, framework, ecosystem, alumni, campus, news, call to action, photo strip (editable: text, lists, links, photos with alt; `maxLength` and descriptions; no design values).
- [x] `Home` Global: tabs Content (a sub-tab per section) and SEO, admin group "Pages", drafts, Live Preview at 375 / 768 / 1440.
- [x] SEO plugin on `Home` (title, description, image) plus a noindex checkbox and an optional canonical URL.
- [x] `Media`: AVIF conversion on upload, unique file names, long cache headers on the media route.

**C. Data layer** (done)
- [x] `lib/api/home.ts` (Local API, `unstable_cache`, tag `home`, `draft: false`) and `lib/api/home-map.ts` (pure mapper to the existing content types, design values merged from code).
- [x] Fallback to `src/data/home-*.ts` when the database fails or the Global is empty.
- [x] `app/(frontend)/page.tsx` reads through them; a client wrapper with `useLivePreview`.
- [x] Unit test: the mapped page equals the page built from the data files.

**D. Seed** (done on `dev`; production is step H)
- [x] Script that uploads the existing photos (`public/images`, already AVIF) to Media and creates the Home document from `src/data`, so the first CMS version equals today's site. Run on `dev` only.

**E. SEO in the page** (done)
- [x] `generateMetadata` from the plugin's `meta` (title, description, image, noindex, canonical) through a shared `buildPageMetadata()`; school JSON-LD; sitemap.

**F. Publishing** (done)
- [x] `afterChange` on Home and Media: `revalidateTag("home")` only when published; `/api/revalidate` webhook with `REVALIDATE_SECRET`.
- [x] Access: editors can edit and publish; admins manage users (as Giada).

**G. Verify** (done)
- [x] `npm run check` (16 files, 145 tests); the page must not change: two production builds (database on and off) compared in Chrome: head, all text, 77 images, section heights and document height identical, full-page screenshots differ by at most 1/255 on any channel (the project's `qa:snapshot` suite was NOT run); the admin in Chrome as an admin and as an editor; a draft is not visible to the public; the fallback with the database off.

**H. Go live** (done 2026-10-28, with the owner's go)
- [x] `payload migrate:create` from the stable schema (`src/migrations/20261028_111608_initial`: 35 tables, 3 types), committed; rehearsed on a throwaway Neon branch of production (`rehearsal-h`: migrate, seed, row counts checked, branch deleted), then applied to `production`.
- [x] Vercel variables, Production only, all sensitive: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` (from `neon env pull --branch production` into a scratch file, never into `.env.local`), plus a new random `PAYLOAD_SECRET` and `REVALIDATE_SECRET` (generated in the script, never printed or stored). `scripts/vercel-build.mjs` (`vercel-build`) applies pending migrations on production deploys. Functions region against Neon: not checked.
- [x] Production seeded (`SEED_PRODUCTION=1`, 32 photos and the Home page published), then `npx vercel --prod`.
- [x] The owner created the first admin on the live `/admin` right after the deploy (the first-user screen is open to anyone until that account exists, so the deploy and the sign-up were done back to back). The live `/admin` now shows the login, and `/admin/create-first-user` redirects to `/admin`.

### Preview deployments (done 2026-10-28)
Previews have their own CMS: the Neon branch `preview` (a long-lived copy of `production` made on 2026-10-28, so it holds the schema, the migration record, the seeded page, the 32 photos in its own copy of the bucket, and a copy of the owner's admin account). The Vercel **Preview** variables point at it (eight, all sensitive, with their own `PAYLOAD_SECRET` and `REVALIDATE_SECRET`), the Production ones at `production`: editing on a preview never changes the live site. `vercel-build` also migrates on preview deploys (the `preview` branch). Checked with a real preview deployment: the build log shows the migration step, the preview serves the CMS-driven home page (64 CMS image URLs), the dark admin login and an image from its bucket copy. Previews are behind Vercel's login (deployment protection), so the first-user screen is not public there. The `preview` branch is a snapshot: content and users added on production later are not copied; to refresh it, `neon branches reset preview --parent` (it discards the preview's own edits) and pull its variables again only if the connection details change.

### How to change the database later
1. Change a collection or global (and run `npm run generate:types`).
2. `npm run payload -- migrate:create <name>` (on the dev branch; commit the new files in `src/migrations`).
3. Deploy: on a production or preview deploy `vercel-build` runs `payload migrate` first (on that environment's own database), then the build. If the migration fails the deploy fails and the live site stays as it was. Rehearse a risky migration on a throwaway Neon branch first (`neon branches create --name x --parent production`, `neon env pull --branch x --file <ignored file>`, run with `PAYLOAD_MIGRATING=true`).
- A dev database that was set up by "push" (the default in development) and the migration files describe the same schema now; do not run `payload migrate` against the dev branch without resetting it first.
- `REVALIDATE_SECRET` is stored as a Vercel secret and cannot be read back: to use `POST /api/revalidate` by hand, set a new one (`npx vercel env add REVALIDATE_SECRET --environment production --sensitive --force`) and redeploy.

**Later:** a Pages collection with blocks for the ordinary pages, when the next page is designed (the section modules become blocks).

## What was built (2026-10-28)

| Piece | File |
| --- | --- |
| The Global: Content tab (a sub-tab per section) and SEO tab, drafts, Live Preview at 375 / 768 / 1440, admin group "Pages" | `src/globals/Home.ts` |
| One field module per section (reusable as blocks later) and shared helpers | `src/globals/home/*.ts`, `src/globals/home/fields.ts` |
| Admin row titles ("02 · Our Mission") | `src/components/admin/RowLabel.tsx` |
| SEO plugin (title, description, share image, plus noindex and canonical) | `src/payload.config.ts` |
| Media: AVIF conversion, 1200 x 630 JPEG "social" size, admin group "Library", cache tag | `src/collections/Media.ts` |
| Pure mapper: defaults + the CMS's editable fields | `src/lib/api/home-map.ts` (+ `.test.ts`) |
| Cached read with fallback (tag `home`) | `src/lib/api/home.ts` |
| Today's content as a CMS document (used by the seed and the tests) | `src/lib/api/home-seed.ts` |
| Page content as a function of the sections' content | `src/data/home-page.ts` (`buildHomePage`, `defaultHomeSections`) |
| The page, its metadata, Live Preview wrapper | `src/app/(frontend)/page.tsx`, `HomePageClient.tsx`, `src/lib/metadata.ts` |
| Manual cache clearing | `src/app/(frontend)/api/revalidate/route.ts` |
| Seed script (`npm run seed:home`) | `scripts/seed-home.ts` |

**How a section gets its content.** The files in `src/data` are the base and the fallback. The CMS overrides only what an editor can change; fixed lists (3 statements, 8 collage photos, 4 stages, 7 outcomes, 5 tabs, 2 alumni) are matched row by row, so every design value (positions, widths, tones, ids) keeps coming from code. A field left empty, or the whole global missing, falls back to the default for that field. Text that only differs in spacing from the default is replaced by the default, because the design has deliberate double spaces and spaces at the ends of heading parts.

**Lessons from testing (each is now covered by a test or a note):**
- **Drafts leaked.** With `read: () => true`, anyone could read the unpublished text with `GET /api/globals/home?draft=true`. The read rule now limits a signed-out visitor to `_status: published` (`Home.test.ts`).
- **Photo sizes mean two things.** In the defaults, `width`/`height` of the hero and Courage photos are the size of the image file, but the Framework centre photo's are the size of its BOX in the diagram. Taking the file's size for the Framework photo made it several times too big. Only a pixel comparison of the CMS build against the default build caught it (text, image lists and heights were identical). The mapper takes the file's size only where asked (`home-map.test.ts`).
- **Same file name, different photos.** `courage/skating.avif` and `marquee/skating.avif` are different pictures; the seed stores each photo under a name made from its whole path.
- **Social networks do not read AVIF.** The SEO share image is read from a 1200 x 630 JPEG size of the media document, never from the AVIF original.
- **`payload run` exits when the script has loaded.** A script that starts its work without awaiting it is killed at once (and exits 0, printing nothing); the seed awaits at the top level. `payload run` also does not pass flags on, so the seed's switches are environment variables.
- A corrupt image upload now answers 400 with a clear message instead of a bare 500.

**Limits to know.**
- The hero photos carry the dark shading behind the text as part of the picture; a replacement photo needs the same shading (a CSS shading is a possible later change).
- The Courage collage crops are tuned to the original photos; a replacement must have the same shape.
- There is no video field yet (the campus box shows its photo; a video is added in code first).
- The header and the footer are in code, by decision.

## Open items

- **SEO values (found in the final test, 2026-10-30):** the SEO tab shows 0/3 checks passing: title 21 characters (wants 50 to 60), description 202 characters (wants 100 to 150), no share image. Content for the owner to decide; the editors can change all three in the SEO tab.
- **`npm audit`:** 22 findings in the Payload dependency tree, see the changelog of 2026-10-30; waits for a Payload release.
- **A new editor gets no email** when an admin adds them (no email adapter, see [07-decisions.md](07-decisions.md)): the admin passes on the address and the password.
- Neon API key (minted by `neon init`) still to be revoked or kept: see [07-decisions.md](07-decisions.md).
- Whether a published change may go live without a second pair of eyes (Giada: yes; drafts are available if the school wants a review step later).
