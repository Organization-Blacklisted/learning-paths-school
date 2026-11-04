// Puts the CURRENT Student Council page (src/data/student-council.ts, the photos in public/images/student-council) into the CMS, so the first CMS version is
// exactly the page as it is. Run once per database (the twin of scripts/seed-home.ts, seed-contact.ts, seed-principals-welcome.ts and seed-partnerships.ts):
//
//   npm run seed:student-council                     on the branch in .env.local (the local `dev` branch)
//   SEED_PRODUCTION=1 npm run seed:student-council   the same on the Neon `production` branch (only when told to)
//   SEED_OVERWRITE=1 npm run seed:student-council    replace a page that already has content (this DISCARDS what editors wrote: normally never)
//   (PowerShell: $env:SEED_OVERWRITE=1; npm run seed:student-council. Environment variables, because `payload run` does not pass flags on.)
//
// Each photo is stored under a name made from its whole path (student-council-democracy.avif) and reused when it is already in the media library. They are AVIF
// already, and AVIF is stored byte for byte (src/collections/Media.ts). It never prints connection strings or keys.
//
// SAFETY (scripts/seed-guard.ts, rules in src/lib/seed-guard.ts): it refuses in CI and on Vercel, when NEON_BRANCH is not set, when the environment is
// `production` without SEED_PRODUCTION=1 (or SEED_PRODUCTION=1 on another branch), when the pooled and the direct connection point at different
// databases, and an overwrite of production without SEED_CONFIRM=overwrite-production. A production seed runs in migrating mode: no schema push, no "dev" row.
import { guardSeed } from "./seed-guard"; // first: it must run before the config is loaded
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import config from "@payload-config";
import { defaultStudentCouncilSeo } from "../src/data/student-council";
import { studentCouncilDocFromData, studentCouncilPhotoPaths } from "../src/lib/api/student-council-seed";

async function main() {
  const { overwrite } = guardSeed("the Student Council page");

  const payload = await getPayload({ config });

  const current = await payload.findGlobal({ slug: "student-council", draft: false, depth: 0 });
  if (current.hero?.badge && !overwrite) {
    throw new Error(
      "The Student Council page already has content. Nothing was changed. (SEED_OVERWRITE=1 replaces it, discarding the editors' work.)",
    );
  }

  // 1. The photos: upload each once, or reuse the one already in the library.
  const ids = new Map<string, number>();
  for (const { src, alt } of studentCouncilPhotoPaths()) {
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
  const doc = studentCouncilDocFromData((src) => {
    const id = ids.get(src);
    if (id === undefined) throw new Error(`No media for ${src}`);
    return id;
  });
  await payload.updateGlobal({
    slug: "student-council",
    depth: 0,
    data: {
      ...doc,
      meta: { title: defaultStudentCouncilSeo.title, description: defaultStudentCouncilSeo.description, noIndex: false },
      _status: "published",
    } as never,
  });
  console.log(`Done: ${ids.size} photos, Student Council page published.`);
}

// Top-level await: `payload run` exits as soon as the imported script has finished loading, so the work must be awaited here.
try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
