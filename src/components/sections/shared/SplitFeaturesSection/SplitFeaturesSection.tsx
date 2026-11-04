"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { SplitFeature } from "@/types/split-features";
import type { SplitFeaturesSectionProps } from "./SplitFeaturesSection.types";

// The reusable "split features" section: rows of a photo on the left and, on the right, a blue slanted heading, a thin rule and a paragraph. Figma "Frame
// 1618876664" (node 5896:2256) of the Student Council page: three rows, 60px apart, in a block 1437px wide. Any page can use it for a list of points that
// each deserve a photo (how a council works, the stages of admission, the pillars of a programme):
//
//   <SplitFeaturesSection content={studentCouncil.features} />
//
// The content is `SplitFeaturesContent` (src/types/split-features.ts), from a page's data file or the CMS (the fields are in src/globals/StudentCouncil.ts).
// It is a normal <Section> (main container, 120px above it and, last on the page, below it).
//
// LAYOUT. From lg (1024px) a row is the design: the photo 777 x 565 (a photo of another shape is cropped at its middle) and the column of text beside it,
// centred on the photo's height. The author placed the text column by hand (532px wide 81px from the photo in the first two rows, 572px and 88px in the third), so each row
// carries its own `design` values (src/data/student-council.ts), written in Figma pixels of the 1437px block and scaled with the block (container query units,
// `u`): at any width a row is the same picture. The text keeps its size (the h2 size for the heading, 18px for the paragraph) and may wrap more on a
// narrower screen. Below lg (my interpretation, only desktop is designed) the photo is on top, as wide as the column, and the text under it.
// The heading's box is two lines high (95px at 40px) and the heading is centred in it, so a one-line heading sits where a two-line one does.
//
// ANIMATION (nothing in Figma; mine), once per row when it comes into view (quicker when it comes back): the photo is opened from the left while it settles
// from a slight zoom, then the heading, the rule and the paragraph rise in. Reduced motion: none of it. Everything is only hidden by JS.

/** The designed width of the block, in px: the unit of every design value. */
const BLOCK_WIDTH = 1437;
/** `n` Figma pixels, in the current scale of the block (each row is a size container as wide as the block). */
const u = (n: number) => `calc(${n} * 100cqw / ${BLOCK_WIDTH})`;
/** The photo's width and the rule's width in the design. */
const PHOTO_WIDTH = 777;
const RULE_WIDTH = 517.097;

function Row({ row }: { row: SplitFeature }) {
  const { image, title, text, design } = row;
  const rootRef = useRef<HTMLElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const photo = q("[data-feature-photo]");
      const photoImage = q("[data-feature-photo] img");
      const words = q("[data-feature-text]");
      gsap.set(photo, { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(photoImage, { scale: 1.12 });
      gsap.set(words, { autoAlpha: 0, y: 24 });
      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(photo, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: "power3.inOut" }, 0)
        .to(photoImage, { scale: 1, duration: 1.4 }, 0)
        .to(words, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.5);
    },
    { start: "top 80%" },
  );

  return (
    <article ref={rootRef} className="@container w-full">
      <div
        className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-x-(--row-gap)"
        style={
          {
            "--row-gap": u(design.gap),
            "--photo-w": u(PHOTO_WIDTH),
            "--text-w": u(design.textWidth),
            "--rule-w": u(RULE_WIDTH),
          } as CSSProperties
        }
      >
        <div data-feature-photo className="relative aspect-[777/565] w-full shrink-0 overflow-hidden bg-brand-mist lg:w-(--photo-w)">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1520px) 777px, (min-width: 1024px) 54vw, 100vw"
            unoptimized
            draggable={false}
            className="object-cover select-none"
          />
        </div>
        <div className="flex w-full flex-col gap-[clamp(20px,2.3611vw,34px)] lg:w-(--text-w) lg:shrink-0">
          <SectionTitle data-feature-text className="flex min-h-[2.3766em] items-center capitalize">
            <Accent className="block tracking-[-0.01em]">{title}</Accent>
          </SectionTitle>
          {/* The thin rule: a box of the scaled width with the image filling it (an <Image> given a width and a height of its own that CSS then resizes warns) */}
          <span data-feature-text aria-hidden="true" className="relative block h-px w-full max-w-[517.097px] lg:w-(--rule-w) lg:max-w-none">
            <Image src="/images/student-council/divider.svg" alt="" fill sizes="520px" unoptimized className="max-w-none" />
          </span>
          <p data-feature-text className="font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function SplitFeaturesSection({ content, spacing = "inner" }: SplitFeaturesSectionProps) {
  const { label, rows } = content;
  return (
    <Section label={label} spacing={spacing}>
      <div className="mx-auto flex w-full max-w-[1437px] flex-col gap-[clamp(40px,4.1667vw,60px)]">
        {rows.map((row, index) => (
          <Row key={`${row.image.src}-${index}`} row={row} />
        ))}
      </div>
    </Section>
  );
}
