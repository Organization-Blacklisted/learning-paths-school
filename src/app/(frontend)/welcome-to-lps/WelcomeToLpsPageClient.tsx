"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import CrestCardsSection from "@/components/sections/shared/CrestCardsSection";
import CtaSection from "@/components/sections/shared/CtaSection";
import IntroTextSection from "@/components/sections/shared/IntroTextSection";
import MarqueeSection from "@/components/sections/shared/MarqueeSection";
import MessageSection from "@/components/sections/shared/MessageSection";
import PageHero from "@/components/sections/shared/PageHero";
import PhotoBannerSection from "@/components/sections/shared/PhotoBannerSection";
import StorySwipeSection from "@/components/sections/shared/StorySwipeSection";
import ValuesListSection from "@/components/sections/shared/ValuesListSection";
import { mapWelcomeToLps } from "@/lib/api/welcome-to-lps-map";
import type { WelcomeToLps } from "@/payload-types";

// The Welcome to LPS page's parts, in page order: the hero with its photo, the two paragraphs, the wide photo, Our Vision and Our Mission, the Principal's welcome on a
// white band, the values on their navy band, the pinned story, and the site's standard call to action and photo strip. A client component for the same reason as the
// home page (HomePageClient): the admin's Live Preview shows the page next to the edit form and `useLivePreview` hands it the data as the editor types. The page's
// colour is snow (#f9f9f9), as on the other inner pages. The spaces between the parts are the design's (120px, except where written next to the part).
const EMPTY = {} as WelcomeToLps;

export default function WelcomeToLpsPageClient({ initialData }: { initialData: WelcomeToLps | null }) {
  const { data } = useLivePreview<WelcomeToLps>({
    initialData: initialData ?? EMPTY,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const content = useMemo(() => mapWelcomeToLps(data), [data]);

  return (
    <div className="bg-brand-snow">
      <PageHero content={content.hero} roomy />
      {/* 60px under the hero's card, and 60px between the text and the wide photo */}
      <IntroTextSection content={content.intro} spacing="none" className="pt-[clamp(28px,3.125vw,60px)]" />
      <PhotoBannerSection content={content.banner} spacing="none" className="pt-[clamp(28px,3.125vw,60px)]" />
      <CrestCardsSection content={content.crests} />
      {/* The white band has 120px above it (outside it) and 120px of its own above and below the Principal's welcome; the navy band follows it directly */}
      <div className="mt-inner">
        <MessageSection content={content.welcome} variant="welcome" />
      </div>
      <ValuesListSection content={content.values} />
      <div className="mt-inner">
        <StorySwipeSection content={content.story} />
      </div>
      <CtaSection spacing="inner" />
      <MarqueeSection attachToFooter spacing="inner" />
    </div>
  );
}
