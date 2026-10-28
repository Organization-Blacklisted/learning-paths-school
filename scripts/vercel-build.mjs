// The build command Vercel runs (package.json "vercel-build"; Vercel uses it instead of "build" when it exists).
//
// On a PRODUCTION deploy it first applies the database migrations that are not applied yet (`payload migrate`, over Neon's direct connection),
// then builds the site. If a migration fails, the build stops and the deploy fails: the site that is live keeps running on the old code and
// the old database. Previews, and any build without the database variables (CI, a local `npm run build`), skip the migration step: a preview
// must never change the production database (the database variables are only set for the Production environment in Vercel).
//
// The migration files are in src/migrations. After changing a collection or global: `npm run payload -- migrate:create <name>`, commit the
// new files, and the next production deploy applies them. See docs/26-cms-home-plan.md (step H) and docs/10-payload-cms.md.
import { spawnSync } from "node:child_process";

function run(command, extraEnv = {}) {
  const result = spawnSync(command, { stdio: "inherit", shell: true, env: { ...process.env, ...extraEnv } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const production = process.env.VERCEL_ENV === "production";
const hasDatabase = Boolean(process.env.DATABASE_URL_UNPOOLED);

if (production && hasDatabase) {
  console.log("vercel-build: production deploy, applying pending database migrations");
  run("npx payload migrate", { PAYLOAD_MIGRATING: "true" });
} else {
  console.log(`vercel-build: not migrating (${production ? "no DATABASE_URL_UNPOOLED" : "not a production deploy"})`);
}

run("npx next build");
