// The build command Vercel runs (package.json "vercel-build"; Vercel uses it instead of "build" when it exists).
//
// On a PRODUCTION or PREVIEW deploy it first applies the database migrations that are not applied yet (`payload migrate`, over Neon's direct
// connection), then builds the site. If a migration fails, the build stops and the deploy fails: the site that is live keeps running on the old
// code and the old database. A build without the database variables (CI, a local `npm run build`) skips the migration step.
// Production and Preview have DIFFERENT databases (Vercel's Production variables point at the Neon branch `production`, the Preview ones at the
// branch `preview`), so a preview never changes the production database. Keep it that way: never put the production URL in the Preview variables.
//
// The migration files are in src/migrations. After changing a collection or global: `npm run payload -- migrate:create <name>`, commit the
// new files, and the next production deploy applies them. See docs/26-cms-home-plan.md (step H) and docs/10-payload-cms.md.
import { spawnSync } from "node:child_process";

function run(command, extraEnv = {}) {
  const result = spawnSync(command, { stdio: "inherit", shell: true, env: { ...process.env, ...extraEnv } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const target = process.env.VERCEL_ENV; // "production", "preview" or "development" (undefined outside Vercel)
const hasDatabase = Boolean(process.env.DATABASE_URL_UNPOOLED);

if ((target === "production" || target === "preview") && hasDatabase) {
  console.log(`vercel-build: ${target} deploy, applying pending database migrations`);
  run("npx payload migrate", { PAYLOAD_MIGRATING: "true" });
} else {
  console.log(`vercel-build: not migrating (${hasDatabase ? "not a production or preview deploy" : "no DATABASE_URL_UNPOOLED"})`);
}

run("npx next build");
