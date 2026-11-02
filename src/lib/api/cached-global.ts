import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Config } from "@/payload-types";

type GlobalSlug = keyof Config["globals"];

/**
 * The reader of a page's global (Payload), for the server: one function per page (src/lib/api/contact.ts, principals-welcome.ts) instead of a copy
 * of the same code.
 *
 *   export const getContact = globalReader("contact", "contact");
 *
 * - Cached with the tag: the page is read from the database once, then served as static HTML. Publishing the global (or changing a photo) clears
 *   the tag (src/globals/shared/page-global.ts, src/collections/Media.ts, POST /api/revalidate). The one-hour `revalidate` is only a safety net
 *   (for example a page built while the database was down).
 * - Only the PUBLISHED version (`draft: false`): a draft never reaches the public page. Drafts are seen through the admin's Live Preview.
 * - NEVER throws: if the database cannot be read (not configured, down, tables missing) it returns null and the page is built from its default
 *   content in src/data. A failure is not cached (the error is caught outside the cache).
 */
export function globalReader<S extends GlobalSlug>(slug: S, tag: string) {
  const read = unstable_cache(
    async (): Promise<Config["globals"][S]> => {
      const payload = await getPayload({ config });
      return (await payload.findGlobal({ slug, draft: false, depth: 1 })) as Config["globals"][S];
    },
    [`${slug}-page`],
    { tags: [tag], revalidate: 3600 },
  );

  return async function getGlobal(): Promise<Config["globals"][S] | null> {
    // No database configured (a build or a test without .env): do not even try.
    if (!process.env.DATABASE_URL) return null;
    try {
      return await read();
    } catch (error) {
      console.error(
        `[${slug}] could not read the page from the CMS, using the default content:`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  };
}
