import type { Metadata } from "next";
import { defaultPrincipalsWelcomeSeo } from "@/data/principals-welcome";
import { getPrincipalsWelcome } from "@/lib/api/principals-welcome";
import { buildPageMetadata } from "@/lib/metadata";
import PrincipalsWelcomePageClient from "./PrincipalsWelcomePageClient";

// The Principal's Welcome page (Figma node 5748:2), edited in the CMS (Payload global "principals-welcome", docs/29-principals-welcome.md) and served as
// static HTML: read once through a tagged cache (src/lib/api/cached-global.ts), publishing clears the tag. If the CMS cannot be read, the default
// content in src/data/principals-welcome.ts is shown. `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPrincipalsWelcome();
  const meta = page?.meta;
  // What the SEO tab holds wins; a blank field gets this page's own default (not the home page's).
  return buildPageMetadata(
    {
      title: meta?.title?.trim() || defaultPrincipalsWelcomeSeo.title,
      description: meta?.description?.trim() || defaultPrincipalsWelcomeSeo.description,
      image: meta?.image,
      noIndex: meta?.noIndex,
      canonical: meta?.canonical,
    },
    "/principals-welcome",
  );
}

export default async function PrincipalsWelcomePage() {
  const page = await getPrincipalsWelcome();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <PrincipalsWelcomePageClient initialData={page} />
    </main>
  );
}
