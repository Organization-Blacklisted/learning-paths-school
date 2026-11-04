"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { AlternatingRow } from "@/types/alternating-rows";
import type { AlternatingRowsSectionProps } from "./AlternatingRowsSection.types";

// The reusable "alternating rows" section: rows of a big photo and a column of text (a blue slanted heading and a paragraph), the text on the LEFT in the
// first row, on the RIGHT in the second, and so on, the rows touching each other. Figma "Frame 1618876636" (node 5894:2001) of the Signature Events page:
// nine rows, each 523px high, in a block 1520px wide. Any page can use it for a list of things that each deserve a photo (events, programmes, houses,
// facilities):
//
//   <AlternatingRowsSection content={signatureEvents.events} />
//
// The content is `AlternatingRowsContent` (src/types/alternating-rows.ts), from a page's data file or the CMS (the fields are in src/globals/SignatureEvents.ts).
// It is a normal <Section> (main container, 120px above it and, last on the page, below it).
//
// LAYOUT. From lg (1024px) a row is the design: the photo 818 x 523 (a photo of another shape is cropped at its middle), 138px from the text column (564px
// wide), the column centred on the photo's height. Each row is a size container and every size is `calc(N * 100cqw / 1520)`, so at any width a row is the same
// picture. The text keeps its size (the h2 size for the heading, 18px for the paragraph) and may wrap more on a narrower screen. The author set the width of
// some headings by hand so that they break where drawn ("Primary School / Annual Show" is on two lines although one would fit), so each row carries its
// `design.titleWidth`. Below lg (my interpretation, only desktop is designed) the photo is on top, as wide as the column, and the text under it, the rows
// 40px apart.
//
// The first row’s photo is loaded right away when the page says `priority` (it is the biggest thing on the first screen).
//
// ANIMATION (nothing in Figma; mine), once per row when it comes into view (quicker when it comes back): the photo is opened from the edge of the page it
// sits on while it settles from a slight zoom, then the heading and the paragraph rise in. Reduced motion: none of it. Everything is only hidden by JS.

/** The designed width of the block, in px: the unit of every design value. */
const BLOCK_WIDTH = 1520;
/** `n` Figma pixels, in the current scale of the block (each row is a size container as wide as the block). */
const u = (n: number) => `calc(${n} * 100cqw / ${BLOCK_WIDTH})`;
/** The photo's width, the space between the photo and the text, and the text column's width in the design. */
const PHOTO_WIDTH = 818;
const ROW_GAP = 138;
const TEXT_WIDTH = 564;

function Row({ row, index, priority }: { row: AlternatingRow; index: number; priority: boolean }) {
  const { image, title, text, design } = row;
  const rootRef = useRef<HTMLElement>(null);
  // The first row has its text on the left and its photo on the right.
  const photoRight = index % 2 === 0;

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const photo = q("[data-row-photo]");
      const photoImage = q("[data-row-photo] img");
      const words = q("[data-row-text]");
      gsap.set(photo, { clipPath: photoRight ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" });
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
        className={`flex flex-col gap-6 lg:items-center lg:gap-x-(--row-gap) ${photoRight ? "lg:flex-row-reverse" : "lg:flex-row"}`}
        style={
          {
            "--row-gap": u(ROW_GAP),
            "--photo-w": u(PHOTO_WIDTH),
            "--text-w": u(TEXT_WIDTH),
            "--title-w": u(design.titleWidth),
          } as CSSProperties
        }
      >
        <div data-row-photo className="relative aspect-[818/523] w-full shrink-0 overflow-hidden bg-brand-mist lg:w-(--photo-w)">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1520px) 818px, (min-width: 1024px) 54vw, 100vw"
            unoptimized
            draggable={false}
            className="object-cover select-none"
          />
        </div>
        <div className="flex w-full flex-col gap-[clamp(14px,1.1458vw,22px)] lg:w-(--text-w) lg:shrink-0">
          <SectionTitle data-row-text className="capitalize lg:w-(--title-w) lg:max-w-none">
            <Accent className="block tracking-[-0.01em]">{title}</Accent>
          </SectionTitle>
          <p data-row-text className="font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AlternatingRowsSection({ content, spacing = "inner", className, priority = false }: AlternatingRowsSectionProps) {
  const { label, rows } = content;
  return (
    <Section label={label} spacing={spacing} className={className}>
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-10 lg:gap-0">
        {rows.map((row, index) => (
          <Row key={`${row.image.src}-${index}`} row={row} index={index} priority={priority && index === 0} />
        ))}
      </div>
    </Section>
  );
}
