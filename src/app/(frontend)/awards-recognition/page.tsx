import type { Metadata } from "next";
import { defaultAwardsRecognitionSeo } from "@/data/awards-recognition";
import { getAwardsRecognition } from "@/lib/api/awards-recognition";
import { buildPageMetadata } from "@/lib/metadata";
import AwardsRecognitionPageClient from "./AwardsRecognitionPageClient";

// The Awards & Recognition page (Figma node 5893:1651), edited in the CMS (Payload global "awards-recognition", docs/31-awards-recognition.md) and served
// as static HTML: read once through a tagged cache (src/lib/api/cached-global.ts), publishing clears the tag. If the CMS cannot be read, the default
// content in src/data/awards-recognition.ts is shown. `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAwardsRecognition();
  const meta = page?.meta;
  // What the SEO tab holds wins; a blank field gets this page's own default (not the home page's).
  return buildPageMetadata(
    {
      title: meta?.title?.trim() || defaultAwardsRecognitionSeo.title,
      description: meta?.description?.trim() || defaultAwardsRecognitionSeo.description,
      image: meta?.image,
      noIndex: meta?.noIndex,
      canonical: meta?.canonical,
    },
    "/awards-recognition",
  );
}

export default async function AwardsRecognitionPage() {
  const page = await getAwardsRecognition();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <AwardsRecognitionPageClient initialData={page} />
    </main>
  );
}
