import type { Metadata } from "next";
import { defaultWelcomeToLpsSeo } from "@/data/welcome-to-lps";
import { getWelcomeToLps } from "@/lib/api/welcome-to-lps";
import { buildPageMetadata } from "@/lib/metadata";
import WelcomeToLpsPageClient from "./WelcomeToLpsPageClient";

// The Welcome to LPS page (Figma node 5688:14367), edited in the CMS (Payload global "welcome-to-lps", docs/34-welcome-to-lps.md) and served as static HTML: read once
// through a tagged cache (src/lib/api/cached-global.ts), publishing clears the tag. If the CMS cannot be read, the default content in src/data/welcome-to-lps.ts is
// shown. `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWelcomeToLps();
  const meta = page?.meta;
  // What the SEO tab holds wins; a blank field gets this page's own default (not the home page's).
  return buildPageMetadata(
    {
      title: meta?.title?.trim() || defaultWelcomeToLpsSeo.title,
      description: meta?.description?.trim() || defaultWelcomeToLpsSeo.description,
      image: meta?.image,
      noIndex: meta?.noIndex,
      canonical: meta?.canonical,
    },
    "/welcome-to-lps",
  );
}

export default async function WelcomeToLpsPage() {
  const page = await getWelcomeToLps();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <WelcomeToLpsPageClient initialData={page} />
    </main>
  );
}
