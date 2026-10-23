@AGENTS.md

# Project rules

- Every change must be documented in `docs/`. Update the relevant doc in the same piece of work as the code.
- Add an entry to `docs/06-changelog.md` for each meaningful change.
- When a page is added or its status changes, update `docs/03-sitemap.md`.
- Record decisions (and why) in `docs/07-decisions.md`. Don't leave open questions only in chat.
- New photos are made with `npm run images:optimize` (see `scripts/README.md`): AVIF, at least 45 dB against the source. Never add a JPG, PNG or WebP photo to `public/images`.
- Animation work must follow `docs/04-animation-guidelines.md`, including `prefers-reduced-motion`.
- A new shared hook or component comes with a unit test next to it (`*.test.ts(x)`, run with `npm test`). Before finishing work run `npm run check` (lint, formatting, types, tests, image budget; `npm run format` fixes formatting); for changes that must not change how a page looks, also the screenshot comparison (see `docs/24-qa-suite.md`).
