import type { GlobalAfterChangeHook, GlobalConfig } from "payload";
import { revalidateTag } from "next/cache";

// The three things every page's global (src/globals/Contact.ts, PrincipalsWelcome.ts, and the pages to come) has in common, in one place so that a
// new page cannot forget one of them. (Home.ts has its own copy of the same rules and could use these too.)
//
//   export const AboutUs: GlobalConfig = {
//     slug: "about-us",
//     admin: { group: "Pages", livePreview: livePreviewAt("/about-us") },
//     access: publishedOnlyAccess,
//     versions: { drafts: true, max: 50 },
//     hooks: { afterChange: [revalidateOnPublish("about-us")] },
//     ...
//   };

/**
 * Anyone reads the PUBLISHED page; only signed-in users read drafts and versions. The constraint matters: with a plain `read: () => true` anyone could
 * add ?draft=true to /api/globals/<slug> and read the unpublished text (found in testing, 2026-10-28, see Home.test.ts).
 */
export const publishedOnlyAccess: NonNullable<GlobalConfig["access"]> = {
  read: ({ req: { user } }) => (user ? true : { _status: { equals: "published" } }),
  readVersions: ({ req: { user } }) => Boolean(user),
};

/**
 * Clears the page's cache tag when a version is PUBLISHED (a draft changes nothing public), so the change is live within seconds. The tag is read
 * by the page's reader (src/lib/api/cached-global.ts). Outside a Next request (a script, the seed) there is nothing to clear: the page refreshes on
 * its own schedule.
 */
export const revalidateOnPublish =
  (tag: string): GlobalAfterChangeHook =>
  ({ doc }) => {
    if (doc._status !== "published") return doc;
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // not inside a Next request
    }
    return doc;
  };

/** The Live Preview of a page: the real page next to the edit form, built from the request's host (localhost, a preview deployment or the live site). */
export const livePreviewAt = (path: string): NonNullable<NonNullable<GlobalConfig["admin"]>["livePreview"]> => ({
  url: ({ req }) => {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${host}${path}`;
  },
  breakpoints: [
    { name: "mobile", label: "Mobile", width: 375, height: 667 },
    { name: "tablet", label: "Tablet", width: 768, height: 1024 },
    { name: "desktop", label: "Desktop", width: 1440, height: 900 },
  ],
});
