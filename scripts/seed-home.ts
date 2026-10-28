// Puts the CURRENT home page (the files in src/data, the photos in public/images) into the CMS, so the first CMS version is exactly the site as
// it is. Run once per database:
//
//   npm run seed:home                 on the branch in .env.local (the local `dev` branch)
//   SEED_PRODUCTION=1 npm run seed:home   the same on the Neon `production` branch (only when told to, docs/26-cms-home-plan.md step H)
//   SEED_OVERWRITE=1 npm run seed:home    replace a home page that already has content (this DISCARDS what editors wrote: normally never)
//   (PowerShell: $env:SEED_OVERWRITE=1; npm run seed:home. Environment variables, because `payload run` does not pass flags on to the script.)
//
// Each photo is stored under a name made from its whole path (/images/home/courage/chess.avif becomes home-courage-chess.avif): different
// folders hold different photos with the same file name (courage/skating.avif and marquee/skating.avif are not the same picture).
// Photos that are already in the media library (same stored name) are reused, so a second run does not upload them again. The photos are AVIF
// already, and AVIF is stored byte for byte (src/collections/Media.ts), so they keep the quality they were made with.
//
// It never prints connection strings or keys.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import config from "@payload-config";
import { homeDocFromData, homePhotoPaths } from "../src/lib/api/home-seed";
import { SITE_DESCRIPTION, SITE_NAME } from "../src/lib/site";

const overwrite = process.env.SEED_OVERWRITE === "1";
const production = process.env.SEED_PRODUCTION === "1";
const branch = process.env.NEON_BRANCH ?? "(unknown branch)";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set (run `neon checkout dev`, or fill .env.local).");
  if (branch === "production" && !production) {
    throw new Error("The Neon branch is `production`. Set SEED_PRODUCTION=1 to seed it on purpose.");
  }
  console.log(`Seeding the home page on Neon branch: ${branch}`);

  const payload = await getPayload({ config });

  const current = await payload.findGlobal({ slug: "home", draft: false, depth: 0 });
  if (current.hero?.slides?.length && !overwrite) {
    throw new Error(
      "The home page already has content. Nothing was changed. (SEED_OVERWRITE=1 replaces it, discarding the editors' work.)",
    );
  }

  // 1. The photos: upload each once, or reuse the one already in the library.
  const ids = new Map<string, number>();
  for (const { src, alt } of homePhotoPaths()) {
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

  // 2. The home page, published. The search-engine fields start with what the site says today.
  const doc = homeDocFromData((src) => {
    const id = ids.get(src);
    if (id === undefined) throw new Error(`No media for ${src}`);
    return id;
  });
  await payload.updateGlobal({
    slug: "home",
    depth: 0,
    data: {
      ...doc,
      meta: { title: SITE_NAME, description: SITE_DESCRIPTION, noIndex: false },
      _status: "published",
    } as never,
  });
  console.log(`Done: ${ids.size} photos, home page published.`);
}

// Top-level await: `payload run` exits as soon as the imported script has finished loading, so the work must be awaited here.
try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
