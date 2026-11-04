"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import PageHero from "@/components/sections/shared/PageHero";
import PhotoBannerSection from "@/components/sections/shared/PhotoBannerSection";
import SplitFeaturesSection from "@/components/sections/shared/SplitFeaturesSection";
import { mapStudentCouncil } from "@/lib/api/student-council-map";
import type { StudentCouncil } from "@/payload-types";

// The Student Council page's parts, in page order: the text-only hero, the wide photo with its title and paragraph, the three rows, and the title with the
// group photo (the design has no call to action or photo strip here: the footer follows). A client component for the same reason as the home page
// (HomePageClient): the admin's Live Preview shows the page next to the edit form and `useLivePreview` hands it the data as the editor types. The page's
// colour is snow (#f9f9f9), as on the other inner pages.
const EMPTY = {} as StudentCouncil;

export default function StudentCouncilPageClient({ initialData }: { initialData: StudentCouncil | null }) {
  const { data } = useLivePreview<StudentCouncil>({
    initialData: initialData ?? EMPTY,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const content = useMemo(() => mapStudentCouncil(data), [data]);

  return (
    <div className="bg-brand-snow">
      <PageHero content={content.hero} />
      {/* 60px under the hero's rule in the design (the other sections are 120px apart): the hero brings about 30px of its own, so 30px here */}
      <PhotoBannerSection content={content.intro} spacing="none" className="pt-[clamp(12px,1.5625vw,30px)]" priority />
      <SplitFeaturesSection content={content.features} />
      <PhotoBannerSection content={content.gallery} />
    </div>
  );
}
