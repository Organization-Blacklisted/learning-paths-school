// Puts the CURRENT Principal's Welcome page (src/data/principals-welcome.ts, the portrait in public/images/principal) into the CMS, so the first CMS
// version is exactly the page as it is. Run once per database (the twin of scripts/seed-home.ts and scripts/seed-contact.ts):
//
//   npm run seed:principals-welcome                     on the branch in .env.local (the local `dev` branch)
//   SEED_PRODUCTION=1 npm run seed:principals-welcome   the same on the Neon `production` branch (only when told to)
//   SEED_OVERWRITE=1 npm run seed:principals-welcome    replace a page that already has content (this DISCARDS what editors wrote: normally never)
//   (PowerShell: $env:SEED_OVERWRITE=1; npm run seed:principals-welcome. Environment variables, because `payload run` does not pass flags on.)
//
// The portrait is stored under a name made from its whole path (principal-portrait.avif) and reused when it is already in the media library. It is
// AVIF already, and AVIF is stored byte for byte (src/collections/Media.ts). It never prints connection strings or keys.
//
// SAFETY (scripts/seed-guard.ts, rules in src/lib/seed-guard.ts): it refuses in CI and on Vercel, when NEON_BRANCH is not set, when the environment is
// `production` without SEED_PRODUCTION=1 (or SEED_PRODUCTION=1 on another branch), when the pooled and the direct connection point at different
// databases, and an overwrite of production without SEED_CONFIRM=overwrite-production. A production seed runs in migrating mode: no schema push, no "dev" row.
import { guardSeed } from "./seed-guard"; // first: it must run before the config is loaded
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import config from "@payload-config";
import { defaultPrincipalsWelcomeSeo } from "../src/data/principals-welcome";
import { principalsWelcomeDocFromData, principalsWelcomePhotoPaths } from "../src/lib/api/principals-welcome-seed";

async function main() {
  const { overwrite } = guardSeed("the Principal's Welcome page");

  const payload = await getPayload({ config });

  const current = await payload.findGlobal({ slug: "principals-welcome", draft: false, depth: 0 });
  if (current.hero?.badge && !overwrite) {
    throw new Error(
      "The Principal's Welcome page already has content. Nothing was changed. (SEED_OVERWRITE=1 replaces it, discarding the editors' work.)",
    );
  }

  // 1. The portrait: upload it once, or reuse the one already in the library.
  const ids = new Map<string, number>();
  for (const { src, alt } of principalsWelcomePhotoPaths()) {
    const filename = src.replace(/^\/images\//, "").replace(/\//g, "-");
    const existing = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
    if (existing.docs[0]) {
      ids.set(src, existing.docs[0].id);
      console.log(`  reuse   ${src}`);
      continue;
    }
    const data = await readFile(path.resolve(process.cwd(), "public", src.replace(/^\//, "")));
    const created = await payload.create({
      collection: "media",
      data: { alt },
      file: { data, mimetype: "image/avif", name: filename, size: data.length },
    });
    ids.set(src, created.id);
    console.log(`  upload  ${src}`);
  }

  // 2. The page, published. The search-engine fields start with what the page says today.
  const doc = principalsWelcomeDocFromData((src) => {
    const id = ids.get(src);
    if (id === undefined) throw new Error(`No media for ${src}`);
    return id;
  });
  await payload.updateGlobal({
    slug: "principals-welcome",
    depth: 0,
    data: {
      ...doc,
      meta: { title: defaultPrincipalsWelcomeSeo.title, description: defaultPrincipalsWelcomeSeo.description, noIndex: false },
      _status: "published",
    } as never,
  });
  console.log(`Done: ${ids.size} photo, Principal's Welcome page published.`);
}

// Top-level await: `payload run` exits as soon as the imported script has finished loading, so the work must be awaited here.
try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
