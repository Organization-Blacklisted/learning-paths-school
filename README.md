# Learning Paths School (LPS)

A 50+ page, heavily animated school website built with Next.js (App Router), React, TypeScript and Tailwind CSS.

## Quick start

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

**Going live:** copy `.env.example` to `.env` and fill it in. `NEXT_PUBLIC_SITE_URL` (the real address) is needed **at build time**; the database variables are needed for `/admin` and `/api`. The checklist and the latest measurements are in [docs/16-production-readiness.md](docs/16-production-readiness.md). To test a production build without touching a running dev server: `NEXT_DIST_DIR=.next-prod npx next build && NEXT_DIST_DIR=.next-prod npx next start -p 3002` (then restore `tsconfig.json` and `next-env.d.ts`, which the build rewrites).

## Documentation

All project knowledge lives in [`docs/`](docs/README.md). Start there.

| Doc | Purpose |
| --- | --- |
| [docs/README.md](docs/README.md) | Index and documentation rules |
| [docs/01-overview.md](docs/01-overview.md) | Goals, audience, scope |
| [docs/02-architecture.md](docs/02-architecture.md) | Stack, folder structure, conventions |
| [docs/03-sitemap.md](docs/03-sitemap.md) | Every page, its route and build status |
| [docs/04-animation-guidelines.md](docs/04-animation-guidelines.md) | Animation approach, tooling, performance and accessibility rules |
| [docs/05-design-system.md](docs/05-design-system.md) | Colors, typography, spacing, components |
| [docs/06-changelog.md](docs/06-changelog.md) | Chronological log of changes |
| [docs/07-decisions.md](docs/07-decisions.md) | Decision log and open questions |
| [docs/08-footer.md](docs/08-footer.md) | Footer: structure, breakpoints, fidelity, open items |
| [docs/09-header.md](docs/09-header.md) | Header: transparent and solid variants, assets, fidelity, open items |
| [docs/10-payload-cms.md](docs/10-payload-cms.md) | Payload CMS: what exists, access rules, env, verification, gotchas |
| [docs/11-home-hero.md](docs/11-home-hero.md) | Home hero slideshow: behaviour, Embla, images, fidelity, open items |
| [docs/12-home-vision-mission-values.md](docs/12-home-vision-mission-values.md) | Home: Vision, Mission and Values section: spec, fidelity, open items |
| [docs/13-home-courage.md](docs/13-home-courage.md) | Home: The Courage To Find Your Path (photo collage) and the sideways scroll scene: spec, images, fidelity, open items |
| [docs/14-home-journey.md](docs/14-home-journey.md) | Home: Our Learning Journey (four stage columns): spec, images, animation, fidelity, open items |
| [docs/15-home-framework.md](docs/15-home-framework.md) | Home: The LPS 360 Framework (PIONEER diagram): spec, layout, animation, fidelity, open items |
| [scripts/README.md](scripts/README.md) | Image tools: how to add a photo (`npm run images:optimize`), the image budget (`images:check`), the settings of every photo on the site |
| [docs/25-deployment-vercel.md](docs/25-deployment-vercel.md) | GitHub + Vercel: how code reaches the site, environment variables per environment, first-deployment checklist, what to verify |
| [docs/24-qa-suite.md](docs/24-qa-suite.md) | Checks, tests and CI: unit tests (`npm test`), the pre-commit hook, GitHub Actions, the browser checks (`qa`, `qa:interact`) and the screenshot comparison (`qa:snapshot`) |
| [docs/23-shared-building-blocks.md](docs/23-shared-building-blocks.md) | Shared hooks and components (`useScrollReveal`, `Photo`, `SectionTitle`, `Accent`, `BodyText`, `TabBar`, `BlockRenderer`...) and how to use them |
| [docs/22-home-campus.md](docs/22-home-campus.md) | Home: campus video box (poster image now): how to add the video later, behaviour, animation, fidelity, open items |
| [docs/21-home-alumni.md](docs/21-home-alumni.md) | Home: alumni section (second panel of scene 2), the fit-to-screen scaling of pinned panels, animation, fidelity, open items |
| [docs/20-home-ecosystem.md](docs/20-home-ecosystem.md) | Home: The Ecosystem Behind LPS 360 (five tabs): placeholder content, tabs, sliding highlight, animation, fidelity, open items |
| [docs/19-home-news.md](docs/19-home-news.md) | Home: What's New At LPS (news cards): layout, animation and hover, images, fidelity, open items |
| [docs/18-marquee-section.md](docs/18-marquee-section.md) | Shared, reusable photo marquee above the footer: usage, how the loop works, fidelity, open items |
| [docs/17-cta-section.md](docs/17-cta-section.md) | Shared, reusable CTA band: how to use it on any page, design, animation, fidelity, open items |
| [docs/16-production-readiness.md](docs/16-production-readiness.md) | Production review: measurements, fixes, what is still needed before launch, how to repeat it |

> This project uses a Next.js version with breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing framework code (see `AGENTS.md`).
