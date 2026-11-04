"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import AlternatingRowsSection from "@/components/sections/shared/AlternatingRowsSection";
import PageHero from "@/components/sections/shared/PageHero";
import { mapSignatureEvents } from "@/lib/api/signature-events-map";
import type { SignatureEvent } from "@/payload-types";

// The Signature Events page's parts, in page order: the text-only hero and the nine events (the design has no call to action or photo strip here: the footer
// follows). A client component for the same reason as the home page (HomePageClient): the admin's Live Preview shows the page next to the edit form and
// `useLivePreview` hands it the data as the editor types. The page's colour is snow (#f9f9f9), as on the other inner pages.
const EMPTY = {} as SignatureEvent;

export default function SignatureEventsPageClient({ initialData }: { initialData: SignatureEvent | null }) {
  const { data } = useLivePreview<SignatureEvent>({
    initialData: initialData ?? EMPTY,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const content = useMemo(() => mapSignatureEvents(data), [data]);

  return (
    <div className="bg-brand-snow">
      <PageHero content={content.hero} />
      {/* 100px under the hero's rule in the design (the other sections are 120px apart): the hero brings about 30px of its own, so 70px here; and 127px
          above the footer, as drawn */}
      <AlternatingRowsSection
        content={content.events}
        spacing="none"
        priority
        className="pt-[clamp(28px,3.6458vw,70px)] last:pb-[clamp(48px,6.6146vw,127px)]"
      />
    </div>
  );
}
