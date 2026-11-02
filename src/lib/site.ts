// Site-wide facts used for metadata, robots.txt and sitemap.xml.

type Env = Record<string, string | undefined>;

/**
 * The public address of the site, no trailing slash. In order of preference:
 * 1. NEXT_PUBLIC_SITE_URL (set it for production, see .env.example and docs/25-deployment-vercel.md): the real domain.
 * 2. On Vercel, the address Vercel gives the deployment: the production domain for a production build, the preview address for a preview
 *    (so a preview's canonical and Open Graph links point at the preview, not at localhost or the live site).
 * 3. Local development: http://localhost:3000.
 * Exported as a function so it can be tested; the site uses SITE_URL below.
 */
export function resolveSiteUrl(env: Env): string {
  const vercelHost = env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL : env.VERCEL_URL;
  const url = env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

export const SITE_URL = resolveSiteUrl(process.env);

export const SITE_NAME = "Learning Paths School";

export const SITE_DESCRIPTION =
  "Learning Paths School (LPS), Mohali: a 15-year journey from Pre-Primary to Senior Secondary, built around strong foundations, wider experiences and thoughtful guidance, so every child becomes a Pioneer.";

/**
 * SWITCH (2026-10-21, owner; turned back on 2026-10-22): false hides every section of the home page (they are not rendered at all, so no
 * images, scripts or animations load for them). The header and footer stay, and the header turns solid, because its
 * transparent variant needs the hero behind it. Set to true to bring the whole home page back, nothing else changes.
 */
export const SHOW_HOME_SECTIONS = true;

/**
 * HOW MANY SECTIONS OF THE HOME PAGE ARE SHOWN (owner: the first three on 2026-10-22, the first four on 2026-10-23, the first five and then six on 2026-10-24, and the whole page (null) on 2026-10-28, pushed the same day). The page is the list in src/data/home-page.ts;
 * every block, and every panel of a sideways scene, counts as one section, in page order: 1 hero, 2 vision / mission / values, 3 courage,
 * 4 journey, 5 framework, 6 ecosystem, 7 campus, 8 alumni, 9 news, 10 call to action, 11 photo strip. The sections after the limit are not
 * rendered at all (no images, scripts or animations load for them). The header and the footer always stay.
 *
 * TO BRING THE WHOLE PAGE BACK set this to null (or build with HOME_SECTION_LIMIT=all). The browser checks (`npm run qa:serve`, and so CI)
 * always build with HOME_SECTION_LIMIT=all, so the sections that are hidden for now stay tested.
 */
export const HOME_SECTION_LIMIT: number | null = resolveSectionLimit(process.env.HOME_SECTION_LIMIT, null);

/**
 * HOME SECTIONS HIDDEN FOR NOW (2026-11-02, client: the "The Courage To Find Your Path" section is not wanted yet). A list of section types
 * (the block types of src/data/home-page.ts: hero, vision, courage, journey, framework, ecosystem, campus, alumni, news, cta, marquee). They are not
 * rendered at all (no images, scripts or animations load for them), the rest of the page closes up, and nothing is deleted: the section's code,
 * content and CMS tab stay as they are. TO BRING ONE BACK remove it from this list (empty the list to show everything). The browser checks
 * (`npm run qa:serve`, and so CI) build with HOME_HIDDEN_SECTIONS=none, like HOME_SECTION_LIMIT=all above, so a hidden section stays tested.
 */
export const HIDDEN_HOME_SECTIONS: readonly string[] = resolveHiddenSections(process.env.HOME_HIDDEN_SECTIONS, ["courage"]);

/** "none" means nothing is hidden, a comma-separated list means those types, nothing (or an empty value) means the fallback. Exported for tests. */
export function resolveHiddenSections(value: string | undefined, fallback: readonly string[]): readonly string[] {
  const text = value?.trim().toLowerCase();
  if (!text) return fallback;
  if (text === "none") return [];
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** "all" means no limit, a whole number means that many sections, anything else (or nothing) means the fallback. Exported for tests. */
export function resolveSectionLimit(value: string | undefined, fallback: number | null): number | null {
  const text = value?.trim().toLowerCase();
  if (!text) return fallback;
  if (text === "all") return null;
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}
