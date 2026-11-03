// Puts the CURRENT Partnerships page (src/data/partnerships.ts, the logos in public/images/partnerships) into the CMS, so the first CMS version is
// exactly the page as it is. Run once per database (the twin of scripts/seed-home.ts, seed-contact.ts and seed-principals-welcome.ts):
//
//   npm run seed:partnerships                     on the branch in .env.local (the local `dev` branch)
//   SEED_PRODUCTION=1 npm run seed:partnerships   the same on the Neon `production` branch (only when told to)
//   SEED_OVERWRITE=1 npm run seed:partnerships    replace a page that already has content (this DISCARDS what editors wrote: normally never)
//   (PowerShell: $env:SEED_OVERWRITE=1; npm run seed:partnerships. Environment variables, because `payload run` does not pass flags on.)
//
// Each logo is stored under a name made from its whole path (partnerships-macmillan.avif) and reused when it is already in the media library. They are
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
import { defaultPartnershipsSeo } from "../src/data/partnerships";
import { partnershipsDocFromData, partnershipsPhotoPaths } from "../src/lib/api/partnerships-seed";

async function main() {
  const { overwrite } = guardSeed("the Partnerships page");

  const payload = await getPayload({ config });

  const current = await payload.findGlobal({ slug: "partnerships", draft: false, depth: 0 });
  if (current.hero?.badge && !overwrite) {
    throw new Error(
      "The Partnerships page already has content. Nothing was changed. (SEED_OVERWRITE=1 replaces it, discarding the editors' work.)",
    );
  }

  // 1. The logos: upload each once, or reuse the one already in the library.
  const ids = new Map<string, number>();
  for (const { src, alt } of partnershipsPhotoPaths()) {
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
  const doc = partnershipsDocFromData((src) => {
    const id = ids.get(src);
    if (id === undefined) throw new Error(`No media for ${src}`);
    return id;
  });
  await payload.updateGlobal({
    slug: "partnerships",
    depth: 0,
    data: {
      ...doc,
      meta: { title: defaultPartnershipsSeo.title, description: defaultPartnershipsSeo.description, noIndex: false },
      _status: "published",
    } as never,
  });
  console.log(`Done: ${ids.size} logos, Partnerships page published.`);
}

// Top-level await: `payload run` exits as soon as the imported script has finished loading, so the work must be awaited here.
try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
