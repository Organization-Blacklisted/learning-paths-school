import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Home } from "@/payload-types";

// Reads the home page from the CMS (Payload global "home"), for the server. Pair of src/lib/api/home-map.ts (the pure mapper).
//
// - Cached with the tag "home": the page is read from the database once, then served as static HTML. Publishing the global (or changing a
//   photo) clears the tag (src/globals/Home.ts, src/collections/Media.ts, POST /api/revalidate), so a change is live within seconds. The
//   one-hour `revalidate` is only a safety net (for example a page built while the database was down).
// - Only the PUBLISHED version (`draft: false`): a draft never reaches the public page. Drafts are seen through the admin's Live Preview.
// - NEVER throws: if the database cannot be read (not configured, down, tables missing) this returns null and the page is built from the
//   default content in src/data (see mapHome). A failure is not cached (the error is caught outside the cache).
const readHome = unstable_cache(
  async (): Promise<Home> => {
    const payload = await getPayload({ config });
    return payload.findGlobal({ slug: "home", draft: false, depth: 1 });
  },
  ["home-page"],
  { tags: ["home"], revalidate: 3600 },
);

export async function getHome(): Promise<Home | null> {
  // No database configured (a build or a test without .env): do not even try.
  if (!process.env.DATABASE_URL) return null;
  try {
    return await readHome();
  } catch (error) {
    console.error(
      "[home] could not read the home page from the CMS, using the default content:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
