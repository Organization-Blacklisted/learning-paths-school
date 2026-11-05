"use client";

import Image from "next/image";
import { useRef } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { PhotoBannerSectionProps } from "./PhotoBannerSection.types";

// The reusable "photo banner" section: one wide photo, 1520px in the design, with a two-tone title (the first words blue and slanted, the rest grey) and,
// when there is one, a paragraph (or, with no title and no paragraph, only the photo: the Welcome to LPS page). Figma "Frame 1618876665" (node 5896:2257: the photo, then the title and a paragraph under it) and "Frame 1618876660" (node
// 5896:2252: the title, then the photo) of the Student Council page. Any page can use it for a group photo, a campus view, a ceremony:
//
//   <PhotoBannerSection content={studentCouncil.intro} priority />                    title and paragraph under the photo
//   <PhotoBannerSection content={studentCouncil.gallery} />                           title above the photo
//
// The content is `PhotoBannerContent` (src/types/photo-banner.ts), from a page's data file or the CMS (the fields are in src/globals/StudentCouncil.ts).
// It is a normal <Section> (main container, 120px above it and, last on the page, below it); a page's first section passes its own space above.
//
// LAYOUT. The photo fills the width of the container and keeps the shape of its design box (`photoHeight` in Figma pixels at 1520px: 723 and 782 on the
// Student Council page); a photo of another shape is cropped at its middle (object-cover). The title is one line of the h2 size (40px from 1280px: the
// fluid token) that wraps and stays centred on a narrow screen; the paragraph is at most 1221px wide, 18px, navy at 80%, centred, 16px under the title.
// The title is 60px away from the photo when it is under it (as the design has it) and 29px when it is above.
//
// ANIMATION (nothing in Figma; mine, like the other sections), once per entry into view (quicker when it comes back): the photo is opened from the left
// while it settles from a slight zoom, then the title and the paragraph rise in. Reduced motion: none of it. Everything is only hidden by JS.

export default function PhotoBannerSection({ content, spacing = "inner", className = "", priority = false }: PhotoBannerSectionProps) {
  const { label, image, titleAccent, titleRest, text, titlePosition, photoHeight } = content;
  const rootRef = useRef<HTMLDivElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const photo = q("[data-banner-photo]");
      const photoImage = q("[data-banner-photo] img");
      const words = q("[data-banner-text]");
      gsap.set(photo, { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(photoImage, { scale: 1.12 });
      // a photo with no title and no paragraph has no words to move (GSAP warns about a tween with no target)
      if (words.length) gsap.set(words, { autoAlpha: 0, y: 24 });
      const timeline = gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(photo, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: "power3.inOut" }, 0)
        .to(photoImage, { scale: 1, duration: 1.4 }, 0);
      if (words.length) timeline.to(words, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.6);
      return timeline;
    },
    { start: "top 78%" },
  );

  const photoBox = (
    <div data-banner-photo className="relative w-full overflow-hidden bg-brand-mist" style={{ aspectRatio: `1520 / ${photoHeight}` }}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1600px) 1520px, 100vw"
        priority={priority}
        unoptimized
        draggable={false}
        className="object-cover select-none"
      />
    </div>
  );

  // The title is optional: with neither part there is only the photo (the Welcome to LPS page's wide photo).
  const title =
    titleAccent || titleRest ? (
      <SectionTitle data-banner-text className="text-center capitalize">
        <Accent className="tracking-[-0.01em]">{titleAccent}</Accent> {titleRest}
      </SectionTitle>
    ) : null;

  return (
    <Section label={label} spacing={spacing} className={className}>
      {titlePosition === "above" ? (
        <div ref={rootRef} className="flex flex-col items-center gap-[clamp(16px,1.5104vw,29px)]">
          {title}
          {photoBox}
        </div>
      ) : (
        <div ref={rootRef} className="flex flex-col items-center gap-[clamp(24px,3.125vw,60px)]">
          {photoBox}
          {title || text ? (
            <div className="flex w-full max-w-[1221px] flex-col items-center gap-[clamp(12px,0.8333vw,16px)]">
              {title}
              {text && (
                <p data-banner-text className="text-center font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80">
                  {text}
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </Section>
  );
}
