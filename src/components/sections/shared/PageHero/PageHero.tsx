"use client";

import Image from "next/image";
import { useRef } from "react";
import Container from "@/components/layouts/Container";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { PageHeroProps } from "./PageHero.types";

// The reusable hero that opens an inner page, in TWO looks that share one component (and one set of CMS fields, src/globals/shared/page-hero.ts):
//
//   <PageHero content={contactPage.hero} />        with a photo (`content.image`): Figma "Group 169" of the Contact page (node 5644:9646)
//   <PageHero content={principalPage.hero} />      without one: the text-only look of the Principal's Welcome page (node 5748:20 and 5748:28)
//
// The content (src/types/page-hero.ts) comes from a page's data file or from the CMS. The heading is the page's <h1>.
//
// WITH A PHOTO (1920px; it all scales down with the screen, and stays at these values from 1920px up):
//  - the photo is 736px high (it follows the width: 38.33vw, never under 300px);
//  - the card is the 1520px main container, its top 139px above the photo's bottom edge (the card has the page's own colour, snow, so it only
//    shows where it covers the photo); inside it 60px of room, the pill (33px), 15px, the heading (58px), 11px, the line of text (28px), 45px, the rule with the
//    crest (46px) and 51px under it, 347px in all.
// WITHOUT A PHOTO: the card starts 32px under the header, with the same 60px of room, pill, heading and line of text, then 66px (not 45) to the
//    rule with the crest and 30px (not 51) under it, 347px in all. The pill is SemiBold here (Bold with a photo): that is how the two designs draw it.
//  - the crest is the Figma vector, kept at its own proportions between two CSS rules (the exported rule + crest SVG stretches).
// Neither look is a slideshow or pinned: the page scrolls through them like any other.
//
// ANIMATION (owner: a highly interactive site), once, when the card comes into view (right away on landing): the pill, the heading, the line of
// text and the rule rise in one after the other, and a photo settles from a slight zoom. Reduced motion: nothing moves, all is shown.
// Everything is only hidden by JS, so without it all is visible.

export default function PageHero({ content }: PageHeroProps) {
  const { label, badge, titleLead, titleAccent, subtitle, image } = content;
  const withPhoto = Boolean(image);
  const rootRef = useRef<HTMLElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, root, q }) => {
      const photo = root.querySelector("[data-hero-photo]");
      const items = q("[data-hero-item]");
      if (photo) gsap.set(photo, { scale: 1.06, transformOrigin: "50% 40%" });
      gsap.set(items, { autoAlpha: 0, y: 22 });
      const timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      if (photo) timeline.to(photo, { scale: 1, duration: 1.4 }, 0);
      return timeline.to(items, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.15);
    },
    { start: "top 90%", replay: false },
  );

  return (
    <section ref={rootRef} aria-label={label} className={withPhoto ? "" : "pt-[clamp(16px,1.6667vw,32px)]"}>
      {image ? (
        <div className="relative h-[clamp(300px,38.3333vw,736px)] overflow-hidden bg-brand-navy">
          <div data-hero-photo className="absolute inset-0">
            {/* The first thing on the page: the LCP image, so it is preloaded. Served as the file in /public (already AVIF, 45 dB). */}
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority
              unoptimized
              draggable={false}
              sizes="100vw"
              className="size-full object-cover select-none"
            />
          </div>
        </div>
      ) : null}

      <Container className={withPhoto ? "relative -mt-[clamp(72px,7.2396vw,139px)]" : ""}>
        <div
          className={`flex flex-col items-center bg-brand-snow pt-[clamp(32px,3.125vw,60px)] text-center ${
            withPhoto ? "pb-[clamp(32px,2.65625vw,51px)]" : "pb-[clamp(20px,1.5625vw,30px)]"
          }`}
        >
          <Badge size={withPhoto ? "eyebrow" : "eyebrow-semibold"} data-hero-item>
            {badge}
          </Badge>
          <h1
            data-hero-item
            className="mt-[15px] font-heading text-h1 leading-[1.2] font-normal tracking-[-0.01em] text-balance text-brand-graphite capitalize"
          >
            {titleLead} <Accent className="translate-y-[0.1em] -ml-[0.04em] tracking-[-0.01em]">{titleAccent}</Accent>
          </h1>
          <p
            data-hero-item
            className="mt-[11px] max-w-[706px] font-body text-body-lg leading-[1.5556] font-semibold text-balance text-brand-graphite"
          >
            {subtitle}
          </p>

          {/* The rule with the crest in the middle: 21px between each line and the crest */}
          <div
            data-hero-item
            aria-hidden="true"
            className={`flex h-[46px] w-full items-center gap-[21px] ${
              withPhoto ? "mt-[clamp(28px,2.34vw,45px)]" : "mt-[clamp(40px,3.4375vw,66px)]"
            }`}
          >
            <span className="h-px flex-1 bg-brand-blue" />
            <Image src="/images/page-hero/crest.svg" alt="" width={38} height={46} className="h-[46px] w-[38px] shrink-0" />
            <span className="h-px flex-1 bg-brand-blue" />
          </div>
        </div>
      </Container>
    </section>
  );
}
