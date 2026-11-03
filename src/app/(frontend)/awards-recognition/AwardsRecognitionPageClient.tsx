"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import AwardsSection from "@/components/sections/shared/AwardsSection";
import PageHero from "@/components/sections/shared/PageHero";
import { mapAwardsRecognition } from "@/lib/api/awards-recognition-map";
import type { AwardsRecognition } from "@/payload-types";

// The Awards & Recognition page's parts, in page order: the text-only hero and the award blocks (the design has no call to action or photo strip here: the
// footer follows). A client component for the same reason as the home page (HomePageClient): the admin's Live Preview shows the page next to the edit form
// and `useLivePreview` hands it the data as the editor types. The page's colour is snow (#f9f9f9), as on the other inner pages.
const EMPTY = {} as AwardsRecognition;

export default function AwardsRecognitionPageClient({ initialData }: { initialData: AwardsRecognition | null }) {
  const { data } = useLivePreview<AwardsRecognition>({
    initialData: initialData ?? EMPTY,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const content = useMemo(() => mapAwardsRecognition(data), [data]);

  return (
    <div className="bg-brand-snow">
      <PageHero content={content.hero} />
      <AwardsSection content={content.awards} />
    </div>
  );
}
