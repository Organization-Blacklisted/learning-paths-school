# Deployment: GitHub and Vercel

Decided 2026-10-22 (owner): the code lives on **GitHub**, the site is hosted on **Vercel**. Nothing is deployed yet (no repository, no Neon project); this is the plan and the checklist for the first deployment. Items marked **verify** are what I know of Vercel in general and have not been able to check against this project.

## How code gets to the site

```
branch / pull request ──> GitHub Actions CI (lint, types, unit tests, build, browser checks)   [.github/workflows/ci.yml]
        │                 Vercel Preview deployment (its own URL, per branch and pull request)
        ▼ merge into main
   Vercel Production deployment (the real domain)
```

- **Vercel** builds every push itself (`next build`, the Next.js preset is detected; no `vercel.json` is needed). **GitHub Actions** runs the checks in parallel. They do not depend on each other, so protect `main` in GitHub (Settings, Branches): require the two CI jobs (**Lint, format, types, tests, images** and **Build and browser checks**) and, if wanted, the Vercel check, before a pull request can merge.
- **Node 22.** `package.json` has `"engines": { "node": "22.x" }`, which is what Vercel uses to pick the Node version (same as CI and local). **verify** in Project Settings, General, Node.js Version.
- The `prepare` script (turns on the pre-commit hook) is harmless on Vercel: it ends with `|| true`.
- **Never set `NEXT_DIST_DIR` on Vercel.** It only exists to test a production build next to `npm run dev`; Vercel expects the build in `.next`.

## Environment variables (Project Settings, Environment Variables)

| Variable | Production | Preview | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **the real domain**, e.g. `https://www.…` | leave empty | Canonical links, Open Graph, `robots.txt`, `sitemap.xml`. When empty on Vercel, the site uses the address Vercel gives the deployment (`src/lib/site.ts`, tested), so previews never point at localhost or at the live site. |
| `PAYLOAD_SECRET` | required | required | Signs admin logins. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. A different value per environment. |
| `DATABASE_URL` | Neon **pooled** connection | a **Neon branch**, not the production database | Needed at runtime by `/admin` and `/api`. The home page does not touch the database (it is static). Previews must not share the live database (Payload changes the schema when it starts in development; see [07-decisions.md](07-decisions.md)). |
| `DATABASE_URL_UNPOOLED` | optional | optional | For migrations. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` | **required before the admin is used** | required if uploads are tried | **Vercel's file system is read-only and temporary.** Without these, Payload stores uploads in a local `/media` folder, which does not work on Vercel (uploads fail or vanish). The Neon bucket is not created yet (see [02-architecture.md](02-architecture.md)). |
| `REVALIDATE_SECRET` | not used yet | | |

Vercel also provides **system variables** (`VERCEL_ENV`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`) when "Automatically expose System Environment Variables" is on (the default; **verify**). The site reads them only for the address fallback above.

## First deployment checklist

1. Create the Neon project and bucket, fill in the variables above for Production and Preview.
2. Import the GitHub repository in Vercel. Check the first build is green (the CI already proves the build works with placeholder values, so a red build here means a missing or wrong variable).
3. **Run the browser checks against the real preview, not just against CI's own build:**
   `QA_URL=https://<the-preview-address> npm run qa` and `npm run qa:interact` (the suite takes the address from `QA_URL`). This tests what the host actually serves: headers, caching, compression, fonts, the 404.
4. Look at the canonical, `robots.txt` and `sitemap.xml` of the **production** deployment: they must show the real domain.
5. Run Lighthouse on the live preview (mobile and desktop). The numbers in [16-production-readiness.md](16-production-readiness.md) were measured on a developer machine with an antivirus injecting scripts; the host numbers are the real ones.
6. Add the custom domain in Vercel (DNS), choose the main address (www or the bare domain) and redirect the other to it, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
7. Open `/admin`, create the first user, upload a test image (it must land in the Neon bucket).

## What to know

- **Images cost no Vercel image-optimization quota.** Every photo is a pre-compressed AVIF served as it is from `/public` (`unoptimized`), and the remaining `next/image` uses are SVGs, which Next serves as they are. So nothing goes through `/_next/image`. `/images/*` gets `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` from `next.config.ts`; Vercel's CDN honours it.
- **HSTS and the Content-Security-Policy** are still open ([07-decisions.md](07-decisions.md)). Check which security headers Vercel adds on the final domain (**verify**), and add `Strict-Transport-Security` in `next.config.ts` only if it is missing. A CSP needs a nonce set-up that also works with Payload's admin.
- **Preview deployments** are public URLs by default. Vercel marks them `noindex` (**verify**), but if the unfinished site must not be seen, turn on Deployment Protection (Project Settings) so previews ask for a login.
- **Payload on Vercel** runs as serverless functions (`/admin`, `/api`). It has not been deployed yet: watch the first cold start and the function size after connecting Neon.
- **Do not set `NEXT_PUBLIC_SITE_URL` to a preview address** in Production: the `NEXT_PUBLIC_` prefix means it is baked into the build.

## Later, if wanted

- Run the browser checks automatically against each preview deployment (a workflow triggered by Vercel's deployment event), so a pull request shows how the hosted page behaves, not only the CI build.
- Vercel Analytics or Speed Insights for real-visitor numbers (none installed; adds a script).
