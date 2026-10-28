import type { Metadata } from "next";
import { getHome } from "@/lib/api/home";
import { buildPageMetadata } from "@/lib/metadata";
import { HOME_SECTION_LIMIT, SHOW_HOME_SECTIONS } from "@/lib/site";
import HomePageClient from "./HomePageClient";

// The home page is edited in the CMS (Payload global "home", docs/26-cms-home-plan.md) and stays static HTML: it is read once through a
// tagged cache (src/lib/api/home.ts), publishing clears the tag. If the CMS cannot be read, the default content in src/data is shown.
// `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome();
  return buildPageMetadata(home?.meta, "/");
}

export default async function Home() {
  const home = await getHome();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      {/* The hero slides use display text, so the page's one h1 is kept for screen readers and search engines. */}
      <h1 className="sr-only">Learning Paths School</h1>
      {/* All home sections, in the order of src/data/home-page.ts: switched on and off with SHOW_HOME_SECTIONS in src/lib/site.ts. */}
      {SHOW_HOME_SECTIONS && <HomePageClient initialData={home} sectionLimit={HOME_SECTION_LIMIT} />}
    </main>
  );
}
