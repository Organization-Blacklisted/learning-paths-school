"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import CtaSection from "@/components/sections/shared/CtaSection";
import MarqueeSection from "@/components/sections/shared/MarqueeSection";
import PageHero from "@/components/sections/shared/PageHero";
import PartnersSection from "@/components/sections/shared/PartnersSection";
import { mapPartnerships } from "@/lib/api/partnerships-map";
import type { Partnership } from "@/payload-types";

// The Partnerships page's parts, in page order: the text-only hero, the introduction with the partner cards, the call to action and the photo strip (the
// last two are the site's standard ones, with the 120px between sections that this design draws). A client component for the same reason as the home page
// (HomePageClient): the admin's Live Preview shows the page next to the edit form and `useLivePreview` hands it the data as the editor types. The page's
// colour is snow (#f9f9f9), as on the Contact and Principal's Welcome pages.
const EMPTY = {} as Partnership;

export default function PartnershipsPageClient({ initialData }: { initialData: Partnership | null }) {
  const { data } = useLivePreview<Partnership>({
    initialData: initialData ?? EMPTY,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const content = useMemo(() => mapPartnerships(data), [data]);

  return (
    <div className="bg-brand-snow">
      <PageHero content={content.hero} />
      <PartnersSection content={content.partners} />
      <CtaSection spacing="inner" />
      <MarqueeSection attachToFooter spacing="inner" />
    </div>
  );
}
