// Puts the CURRENT Contact page (src/data/contact.ts, the photo in public/images/contact) into the CMS, so the first CMS version is exactly the
// page as it is. Run once per database (it is the Contact page's twin of scripts/seed-home.ts):
//
//   npm run seed:contact                    on the branch in .env.local (the local `dev` branch)
//   SEED_PRODUCTION=1 npm run seed:contact  the same on the Neon `production` branch (only when told to)
//   SEED_OVERWRITE=1 npm run seed:contact   replace a Contact page that already has content (this DISCARDS what editors wrote: normally never)
//   (PowerShell: $env:SEED_OVERWRITE=1; npm run seed:contact. Environment variables, because `payload run` does not pass flags on to the script.)
//
// The photo is stored under a name made from its whole path (contact-hero.avif) and reused when it is already in the media library. It is AVIF
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
import { contactDocFromData, contactPhotoPaths } from "../src/lib/api/contact-seed";
import { defaultContactSeo } from "../src/data/contact";

async function main() {
  const { overwrite } = guardSeed("the contact page");

  const payload = await getPayload({ config });

  const current = await payload.findGlobal({ slug: "contact", draft: false, depth: 0 });
  if (current.hero?.badge && !overwrite) {
    throw new Error(
      "The contact page already has content. Nothing was changed. (SEED_OVERWRITE=1 replaces it, discarding the editors' work.)",
    );
  }

  // 1. The photo: upload it once, or reuse the one already in the library.
  const ids = new Map<string, number>();
  for (const { src, alt } of contactPhotoPaths()) {
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

  // 2. The contact page, published. The search-engine fields start with what the page says today.
  const doc = contactDocFromData((src) => {
    const id = ids.get(src);
    if (id === undefined) throw new Error(`No media for ${src}`);
    return id;
  });
  await payload.updateGlobal({
    slug: "contact",
    depth: 0,
    data: {
      ...doc,
      meta: { title: defaultContactSeo.title, description: defaultContactSeo.description, noIndex: false },
      _status: "published",
    } as never,
  });
  console.log(`Done: ${ids.size} photo, contact page published.`);
}

// Top-level await: `payload run` exits as soon as the imported script has finished loading, so the work must be awaited here.
try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
