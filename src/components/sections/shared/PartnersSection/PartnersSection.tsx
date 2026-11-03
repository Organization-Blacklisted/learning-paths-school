"use client";

import Image from "next/image";
import { useRef } from "react";
import Section from "@/components/layouts/Section";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { PartnersSectionProps } from "./PartnersSection.types";

// The reusable "partners" section: an introduction and a grid of logo cards. Figma "Frame 1618876568" of the Partnerships page (node 5751:769), 1520 x
// 790px: a centred paragraph, 60px under it three rows of cards (3, 3 and 2: the last row is centred), 494 x 187px each, 18px apart across and 44px
// down, white with a 1px border at 12% black and 6px corners.
//
//   <PartnersSection content={partnerships.partners} />
//
// Content is `PartnersContent` (src/types/partners.ts), from a page's data file or the CMS (the fields are in src/globals/Partnerships.ts).
//
// A CARD holds a logo, a thin divider line with a dot and a label ("Curriculum Partner"), all centred. The author of the design placed every logo by hand,
// so the offsets differ from card to card (`design` of each card, src/data/partnerships.ts). Every size and offset of a card is written in Figma pixels
// of the 494px card and scaled with the card itself (`u`, container query units), so a card is the same picture at any width. The text keeps its size
// (16 to 18px) and may wrap on a narrow card, which only makes that card taller (the 187px is a minimum).
//
// GRID. Three cards a row from 1024px (as designed), two from 640px, one below. `flex-wrap` with `justify-center`, so a last row with fewer cards is
// centred, as in the design. Spacing: 36px under the hero's card at 1920px (it is "spacing none": the page puts it where its design has it), 11px of
// space under the cards, because the design has 131px (not 120px) between the cards and the call to action.
//
// ANIMATION (nothing in Figma; mine), once, when the section comes into view (and quicker when it comes back): the paragraph rises in, then the cards rise
// in one after another (the list item is what GSAP moves: it writes `translate: none` inline on what it animates, which would beat the hover lift, so the
// lift is on the card inside it). A card lifts a little under the pointer. Reduced motion: none of it, everything shown. Everything is only hidden by JS.

/** The designed card width, in px: the unit of every design value. */
const CARD_WIDTH = 494;
/** `n` Figma pixels, in the current scale of the card (the card is a size container). */
const u = (n: number) => `calc(${n} * 100cqw / ${CARD_WIDTH})`;

export default function PartnersSection({ content }: PartnersSectionProps) {
  const { label, intro, partners } = content;
  const rootRef = useRef<HTMLDivElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const paragraph = q("[data-partners-intro]");
      const cards = q("[data-partner]");
      gsap.set(paragraph, { autoAlpha: 0, y: 24 });
      gsap.set(cards, { autoAlpha: 0, y: 32 });
      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(paragraph, { autoAlpha: 1, y: 0, duration: 0.6 }, 0)
        .to(cards, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.2);
    },
    { start: "top 80%" },
  );

  return (
    <Section label={label} spacing="none" className="pt-[clamp(24px,1.875vw,36px)] pb-[clamp(0px,0.573vw,11px)]">
      <div ref={rootRef} className="flex flex-col items-center gap-[clamp(32px,3.125vw,60px)]">
        <p
          data-partners-intro
          className="max-w-full text-center font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80"
        >
          {intro}
        </p>

        <ul className="flex w-full flex-wrap justify-center gap-x-[18px] gap-y-[clamp(16px,2.29vw,44px)]">
          {partners.map(({ logo, role, design }, index) => (
            <li data-partner key={`${logo.src}-${index}`} className="w-full sm:w-[calc((100%-18px)/2)] lg:w-[calc((100%-36px)/3)]">
              <div
                data-partner-card
                className="@container rounded-[6px] border border-black/12 bg-white motion-safe:transition-[translate,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_12px_32px_rgba(18,59,122,0.12)]"
              >
                {/* The 1px border is in the Figma offsets, hence the 1px less above and 2px less in the minimum height. */}
                <div
                  className="flex flex-col items-center"
                  style={{ minHeight: u(185.07), paddingTop: u(design.top - 1), paddingBottom: u(20) }}
                >
                  <div className="relative shrink-0" style={{ width: u(design.logoWidth), height: u(design.logoHeight) }}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      sizes="(min-width: 1024px) 280px, 50vw"
                      unoptimized
                      draggable={false}
                      className="object-contain select-none"
                    />
                  </div>
                  <Image
                    src="/images/partnerships/divider.svg"
                    alt=""
                    aria-hidden="true"
                    width={182}
                    height={17}
                    unoptimized
                    draggable={false}
                    className="h-auto max-w-none shrink-0 select-none"
                    style={{ width: u(design.dividerWidth), marginTop: u(design.gap) }}
                  />
                  <p
                    className="max-w-full px-3 text-center font-body text-px-18 leading-[28px] text-brand-graphite"
                    style={{ marginTop: u(design.labelGap) }}
                  >
                    {role}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
