# Deployment: GitHub and Vercel

Decided 2026-10-22 (owner): the code lives on **GitHub**, the site is hosted on **Vercel**. **Status (2026-10-27):** the site has been deployed on Vercel since 2026-10-24 (team `blacklisted`, project `learning-paths-school`, production from `main`, `learning-paths-school.vercel.app`), the GitHub repository is `Organization-Blacklisted/learning-paths-school`, and the Neon project exists. **Automatic deployments from a `git push` are currently blocked, see "Known issue" below; until it is fixed the site is deployed from a terminal with `npx vercel --prod`.** The rest of this page is the original plan and checklist. Items marked **verify** are what I know of Vercel in general and have not been able to check against this project.

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
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` | **required before the admin is used** | required if uploads are tried | **Vercel's file system is read-only and temporary.** Without these, Payload stores uploads in a local `/media` folder, which does not work on Vercel (uploads fail or vanish). The bucket `lps-media` (private) exists on the Neon production branch; the values come from `neon deploy` / `neon env pull` (see [10-payload-cms.md](10-payload-cms.md#neon-set-up-and-verified-2026-10-24)). |
| `REVALIDATE_SECRET` | not used yet | | |

Vercel also provides **system variables** (`VERCEL_ENV`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`) when "Automatically expose System Environment Variables" is on (the default; **verify**). The site reads them only for the address fallback above.

## First deployment checklist

1. The Neon project and bucket exist (2026-10-24). Fill in the variables above for Production and Preview, and **migrate the production database first** (it has no tables: `payload migrate:create`, commit, then `payload migrate` with the direct URL), otherwise `/admin` and `/api` fail.
2. Import the GitHub repository in Vercel. Check the first build is green (the CI already proves the build works with placeholder values, so a red build here means a missing or wrong variable).
3. **Run the browser checks against the real preview, not just against CI's own build:**
   `QA_URL=https://<the-preview-address> npm run qa` and `npm run qa:interact` (the suite takes the address from `QA_URL`). This tests what the host actually serves: headers, caching, compression, fonts, the 404.
4. Look at the canonical, `robots.txt` and `sitemap.xml` of the **production** deployment: they must show the real domain.
5. Run Lighthouse on the live preview (mobile and desktop). The numbers in [16-production-readiness.md](16-production-readiness.md) were measured on a developer machine with an antivirus injecting scripts; the host numbers are the real ones.
6. Add the custom domain in Vercel (DNS), choose the main address (www or the bare domain) and redirect the other to it, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
7. Open `/admin`, create the first user, upload a test image (it must land in the Neon bucket).

## Known issue (2026-10-27): automatic deployments from `git push` are blocked

**Symptom.** A push reaches GitHub (and the GitHub checks pass) but Vercel refuses it: the commit gets the status `Vercel: failure, Deployment failed.` **one second after the push**, no build runs, no deployment appears in the Deployments list and nothing appears in the project's Activity log. The status link points to Vercel's "team members and roles" documentation (`vercel.com/docs/accounts/team-members-and-roles`).

**Timeline (IST).**
- 13:09 the PIONEER commit `8eadb6e` was pushed and deployed normally (Ready in about a minute). Vercel's Activity log has, at the same time: "Automatically updated build machine from Basic to Elastic on project learning-paths-school because your team's plan changed."
- 16:39 `e51519c` (Figma match) was pushed: blocked at once. 16:47 an empty commit `9d5ffdf` was pushed to test whether it was a one-off: blocked again within about 20 seconds. So the block is persistent, not random.
- GitHub checks (quality job and the browser job) passed for both commits, so the code is not the problem.

**What is known.**
- Every commit is authored by the GitHub user `Abhay-Blacklisted` (git identity `Abhay-Blacklisted <blacklisted.web16@gmail.com>`), the only contributor of the repository, and the repository is public, under the organisation `Organization-Blacklisted`.
- The Vercel team is `blacklisted` (Pro). The Vercel member is `dev-blacklisted`. The GitHub account `dev-blacklisted` is **suspended** (the GitHub API answers 404 for it), according to the owner.

**Probable cause (not confirmed: Vercel's side cannot be inspected from here).** After the team's plan changed (about 13:10), Vercel applies its team rule: the author of a commit must be a member of the team (with a seat). The commit author `Abhay-Blacklisted` is not linked to any Vercel member, and the GitHub login that the Vercel member used (`dev-blacklisted`) is suspended.

**Workaround in use.** From the project folder, in a terminal:

```
cd "C:\Learning Paths School\lps"
npx vercel --prod
```

It deploys the current files under the Vercel login, not under the commit author, so the block does not apply. Set up on 2026-10-27: `npx vercel login`, then `npx vercel link` (team `blacklisted`, project `learning-paths-school`, "linked by git"), which creates the local `.vercel` folder (git-ignored). It does not upload `.env.local` or `.neon` (git-ignored), and the build uses the environment variables saved in the Vercel project. Checked after the first run: the live page had the new code. **The CLI appends duplicate lines (`.vercel`, `.env*`) to `.gitignore`: restore it with `git checkout -- .gitignore` (both are already ignored).**

**Ways to get automatic deploys back (decision open, see [07-decisions.md](07-decisions.md)).**
1. **Link a working GitHub account to the Vercel member (cleanest).** In Vercel: Account Settings, Authentication: first make sure you can sign in without GitHub (add an email login or a passkey), then under Login Connections replace the suspended GitHub login with `Abhay-Blacklisted`. Also check, in GitHub, the organisation's Installed GitHub Apps: Vercel must be installed with access to this repository (if the suspended account installed it, an organisation owner can reconfigure it), and if it still does not connect, disconnect and reconnect the repository in Project Settings, Git. Alternative: add `Abhay-Blacklisted` as a separate team member (takes a paid seat).
2. **Deploy from GitHub Actions with a Vercel token** (does not depend on the commit author): a workflow that runs `vercel deploy --prod` after a push to `main`. It needs three repository secrets, created by the owner in GitHub (never pasted into a chat): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (the ids are in `.vercel/repo.json`). Not built yet.
3. **A Vercel Deploy Hook** (Project Settings, Git, Deploy Hooks): opening its URL builds the latest `main`; the URL is a secret.
4. **Appeal the suspension** with GitHub Support if it was a mistake. Do not create replacement accounts to get around a suspension.

**To check that it is fixed:** push a small commit (an empty one is enough: `git commit --allow-empty -m "test"`) and look at the commit's statuses on GitHub: `Vercel: success` and a new row in the Deployments list mean it works.

## What to know

- **Images cost no Vercel image-optimization quota.** Every photo is a pre-compressed AVIF served as it is from `/public` (`unoptimized`), and the remaining `next/image` uses are SVGs, which Next serves as they are. So nothing goes through `/_next/image`. `/images/*` gets `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` from `next.config.ts`; Vercel's CDN honours it.
- **HSTS and the Content-Security-Policy** are still open ([07-decisions.md](07-decisions.md)). Check which security headers Vercel adds on the final domain (**verify**), and add `Strict-Transport-Security` in `next.config.ts` only if it is missing. A CSP needs a nonce set-up that also works with Payload's admin.
- **Preview deployments** are public URLs by default. Vercel marks them `noindex` (**verify**), but if the unfinished site must not be seen, turn on Deployment Protection (Project Settings) so previews ask for a login.
- **Payload on Vercel** runs as serverless functions (`/admin`, `/api`). It has not been deployed yet: watch the first cold start and the function size after connecting Neon.
- **Do not set `NEXT_PUBLIC_SITE_URL` to a preview address** in Production: the `NEXT_PUBLIC_` prefix means it is baked into the build.

## Later, if wanted

- Run the browser checks automatically against each preview deployment (a workflow triggered by Vercel's deployment event), so a pull request shows how the hosted page behaves, not only the CI build.
- Vercel Analytics or Speed Insights for real-visitor numbers (none installed; adds a script).
