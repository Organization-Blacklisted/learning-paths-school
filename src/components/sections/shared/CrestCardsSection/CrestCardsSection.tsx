"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { CrestCardsSectionProps } from "./CrestCardsSection.types";

// The reusable crest cards section: cards side by side, each a crest picture (a shield between two laurel branches, 365 x 313px) with a blue slanted title over its
// empty middle and a paragraph under it. Figma "Frame 1618876434" (node 5699:14739) of the Welcome to LPS page: Our Vision and Our Mission, 1108px wide, the cards
// 485px each and 138px apart. Any page can use it for a pair (or three or four) of statements:
//
//   <CrestCardsSection content={welcomeToLps.crests} />
//
// The content is `CrestCardsContent` (src/types/crest-cards.ts), from a page's data file or the CMS (the fields are in src/globals/WelcomeToLps.ts).
//
// LAYOUT. From lg (1024px) the block is the design: the cards in a row, each column as wide as its share of the 1108px block, the crest 365 of its 485px
// (a size container, so the title box scales with the crest), the paragraph 24px under it. Each card carries its own `design`: the width of the title box (the
// design breaks "Our Vision" on two lines and keeps "Our Mission" on one) and of the paragraph (423 and 365px). Below lg (my interpretation, only desktop is
// designed) the cards are stacked, the crest at most 365px wide.
// The crest picture already has the design's empty space for the title (the picture is flat on the page colour, snow, with the box the title sits in painted in).
//
// ANIMATION (nothing in Figma; mine), once when it comes into view (quicker when it comes back): the crests rise and settle from a slight zoom, then the title
// and the paragraph rise in. Reduced motion: none. Everything is only hidden by JS.

/** The designed width of the block, in px: the unit of the columns. */
const BLOCK_WIDTH = 1108;
/** The crest's designed width, and the unit of the title's width. */
const CREST_WIDTH = 365;
const u = (n: number) => `calc(${n} * 100cqw / ${BLOCK_WIDTH})`;

export default function CrestCardsSection({ content, spacing = "inner", className }: CrestCardsSectionProps) {
  const { label, cards } = content;
  const rootRef = useRef<HTMLDivElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const crests = q("[data-crest]");
      const images = q("[data-crest] img");
      const words = q("[data-crest-text]");
      gsap.set(crests, { autoAlpha: 0, y: 26 });
      gsap.set(images, { scale: 1.08 });
      gsap.set(words, { autoAlpha: 0, y: 22 });
      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(crests, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0)
        .to(images, { scale: 1, duration: 1.2, stagger: 0.15 }, 0)
        .to(words, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.4);
    },
    { start: "top 80%" },
  );

  return (
    <Section label={label} spacing={spacing} className={className}>
      <div ref={rootRef} className="@container mx-auto w-full" style={{ maxWidth: BLOCK_WIDTH }}>
        <ul
          className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-x-(--card-gap)"
          style={{ "--card-gap": u(138) } as CSSProperties}
        >
          {cards.map((card, index) => (
            <li
              key={`${card.image.src}-${index}`}
              className="flex w-full flex-col items-center gap-6 lg:w-(--card-w) lg:shrink-0"
              style={{ "--card-w": u(485), "--crest-w": u(CREST_WIDTH) } as CSSProperties}
            >
              {/* The crest is a size container: the title box is a share of it, so it follows the crest at every width */}
              <div data-crest className="@container relative aspect-[365/313] w-[min(365px,86%)] lg:w-(--crest-w)">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  sizes="(min-width: 1520px) 365px, (min-width: 1024px) 24vw, 86vw"
                  unoptimized
                  draggable={false}
                  className="select-none"
                />
                <SectionTitle
                  data-crest-text
                  className="absolute top-[61.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center leading-[1.2] capitalize"
                  style={{ width: `calc(${card.design.titleWidth} * 100cqw / ${CREST_WIDTH})` }}
                >
                  <Accent className="tracking-[-0.01em]">{card.title}</Accent>
                </SectionTitle>
              </div>
              <p
                data-crest-text
                className="text-center font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80 max-lg:max-w-[423px] lg:w-(--text-w)"
                style={{ "--text-w": u(card.design.textWidth) } as CSSProperties}
              >
                {card.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
