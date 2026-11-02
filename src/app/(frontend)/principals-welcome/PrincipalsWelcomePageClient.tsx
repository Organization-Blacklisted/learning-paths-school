"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import CtaSection from "@/components/sections/shared/CtaSection";
import MarqueeSection from "@/components/sections/shared/MarqueeSection";
import MessageSection from "@/components/sections/shared/MessageSection";
import PageHero from "@/components/sections/shared/PageHero";
import { mapPrincipalsWelcome } from "@/lib/api/principals-welcome-map";
import type { PrincipalsWelcome } from "@/payload-types";

// The Principal's Welcome page's parts, in page order: the text-only hero, the portrait and the letter, the call to action and the photo strip
// (the last two are the site's standard ones, with the 120px between sections that this design draws). A client component for the same reason as
// the home page (HomePageClient): the admin's Live Preview shows the page next to the edit form and `useLivePreview` hands it the data as the
// editor types. The page's colour is snow (#f9f9f9), as on the Contact page.
const EMPTY = {} as PrincipalsWelcome;

export default function PrincipalsWelcomePageClient({ initialData }: { initialData: PrincipalsWelcome | null }) {
  const { data } = useLivePreview<PrincipalsWelcome>({
    initialData: initialData ?? EMPTY,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const content = useMemo(() => mapPrincipalsWelcome(data), [data]);

  return (
    <div className="bg-brand-snow">
      <PageHero content={content.hero} />
      <MessageSection content={content.message} />
      <CtaSection spacing="inner" />
      <MarqueeSection attachToFooter spacing="inner" />
    </div>
  );
}
