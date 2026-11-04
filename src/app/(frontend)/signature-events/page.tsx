import type { Metadata } from "next";
import { defaultSignatureEventsSeo } from "@/data/signature-events";
import { getSignatureEvents } from "@/lib/api/signature-events";
import { buildPageMetadata } from "@/lib/metadata";
import SignatureEventsPageClient from "./SignatureEventsPageClient";

// The Signature Events page (Figma node 5894:1875), edited in the CMS (Payload global "signature-events", docs/33-signature-events.md) and served
// as static HTML: read once through a tagged cache (src/lib/api/cached-global.ts), publishing clears the tag. If the CMS cannot be read, the default
// content in src/data/signature-events.ts is shown. `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSignatureEvents();
  const meta = page?.meta;
  // What the SEO tab holds wins; a blank field gets this page's own default (not the home page's).
  return buildPageMetadata(
    {
      title: meta?.title?.trim() || defaultSignatureEventsSeo.title,
      description: meta?.description?.trim() || defaultSignatureEventsSeo.description,
      image: meta?.image,
      noIndex: meta?.noIndex,
      canonical: meta?.canonical,
    },
    "/signature-events",
  );
}

export default async function SignatureEventsPage() {
  const page = await getSignatureEvents();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <SignatureEventsPageClient initialData={page} />
    </main>
  );
}
