import type { Metadata } from "next";
import { defaultPartnershipsSeo } from "@/data/partnerships";
import { getPartnerships } from "@/lib/api/partnerships";
import { buildPageMetadata } from "@/lib/metadata";
import PartnershipsPageClient from "./PartnershipsPageClient";

// The Partnerships page (Figma node 5748:505), edited in the CMS (Payload global "partnerships", docs/30-partnerships.md) and served as static HTML: read
// once through a tagged cache (src/lib/api/cached-global.ts), publishing clears the tag. If the CMS cannot be read, the default content in
// src/data/partnerships.ts is shown. `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPartnerships();
  const meta = page?.meta;
  // What the SEO tab holds wins; a blank field gets this page's own default (not the home page's).
  return buildPageMetadata(
    {
      title: meta?.title?.trim() || defaultPartnershipsSeo.title,
      description: meta?.description?.trim() || defaultPartnershipsSeo.description,
      image: meta?.image,
      noIndex: meta?.noIndex,
      canonical: meta?.canonical,
    },
    "/partnerships",
  );
}

export default async function PartnershipsPage() {
  const page = await getPartnerships();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <PartnershipsPageClient initialData={page} />
    </main>
  );
}
