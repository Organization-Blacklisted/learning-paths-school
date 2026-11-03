"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import Container from "@/components/layouts/Container";
import Accent from "@/components/ui/Accent";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { AwardBlock } from "@/types/awards";
import type { AwardsSectionProps } from "./AwardsSection.types";

// The reusable "awards" section: blocks of a wide photo with a laurel-framed title and paragraph under it. Figma "Frame 1618876655" of the Awards &
// Recognition page (node 5894:1874), 924px wide: three blocks, 60px apart; in each a 924 x 585 photo, 62px under it the blue slanted title (Lexend Medium
// 40px), 31px under that the paragraph (18px, navy at 80%, centred, 642 to 659px wide) and, framing the two, a laurel on each side (78 x 216px, 32px in
// from the edges; the right one is the left one mirrored).
//
//   <AwardsSection content={awardsRecognition.awards} />
//
// Content is `AwardsContent` (src/types/awards.ts), from a page's data file or the CMS (the fields are in src/globals/AwardsRecognition.ts). The section
// brings no space of its own (spacing none): the page puts it where its design has it (90px under the hero's card, 111px above the footer).
//
// LAYOUT. The author nudged every block's text and laurels by hand, so each block carries its `design` values (src/data/awards-recognition.ts), written
// in Figma pixels of the 924px block and scaled with the block (container query units, `u`). From 640px the laurels frame the text as designed; the
// column of text is at most its designed width and never reaches the laurels. Below 640px the laurels are left out and the text takes the whole width
// (on a phone they would leave a column too narrow to read). The photo always keeps its 924 : 585 shape and fills it (a photo of another shape is cropped
// at its middle). The text keeps its size (16 to 18px for the paragraph, the fluid h2 size for the title), only the spacing scales.
//
// ANIMATION (nothing in Figma; mine), once per block when it comes into view (and quicker when it comes back): the photo is opened from the bottom while
// it settles from a slight zoom, the laurels drift in from the sides, then the title and the paragraph rise in. Reduced motion: none of it. Everything is
// only hidden by JS.

/** The designed block width, in px: the unit of every design value. */
const BLOCK_WIDTH = 924;
/** `n` Figma pixels, in the current scale of the block (the group under the photo is a size container as wide as the block). */
const u = (n: number) => `calc(${n} * 100cqw / ${BLOCK_WIDTH})`;
/** Where the laurels sit in the design: 32px in from the edge of the block, 78 x 216px. */
const LAUREL = { inset: 32, width: 78, height: 216 };
/** The column of text is centred 7.5px to the right of the block's middle in the design (437.5 of 860, the laurels' box). */
const TEXT_SHIFT = 7.5;

function Block({ award, priority }: { award: AwardBlock; priority: boolean }) {
  const { image, title, text, design } = award;
  const rootRef = useRef<HTMLElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const photo = q("[data-award-photo]");
      const photoImage = q("[data-award-photo] img");
      const laurels = q("[data-award-laurel]");
      const words = q("[data-award-text]");
      gsap.set(photo, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(photoImage, { scale: 1.12 });
      gsap.set(laurels, { autoAlpha: 0 });
      gsap.set(q("[data-award-laurel='left']"), { x: -24 });
      gsap.set(q("[data-award-laurel='right']"), { x: 24 });
      gsap.set(words, { autoAlpha: 0, y: 24 });
      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(photo, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: "power3.inOut" }, 0)
        .to(photoImage, { scale: 1, duration: 1.4 }, 0)
        .to(laurels, { autoAlpha: 1, x: 0, duration: 0.9 }, 0.55)
        .to(words, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.7);
    },
    { start: "top 78%" },
  );

  return (
    <article ref={rootRef} className="flex flex-col items-center gap-[clamp(24px,3.23vw,62px)]">
      <div data-award-photo className="relative aspect-[924/585] w-full overflow-hidden bg-brand-mist">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1280px) 924px, 90vw"
          priority={priority}
          unoptimized
          draggable={false}
          className="object-cover select-none"
        />
      </div>

      {/* The group under the photo: a size container as wide as the block, so the design values scale with it */}
      <div className="@container w-full">
        <div
          className="relative flex flex-col items-center sm:min-h-(--group-h)"
          style={{ "--group-h": u(design.laurelTop + LAUREL.height) } as CSSProperties}
        >
          {(["left", "right"] as const).map((side) => (
            // A box of the scaled size with the image filling it: the size is a fraction of a pixel most of the time, which an <Image> with
            // width and height attributes of its own warns about
            <span
              key={side}
              data-award-laurel={side}
              aria-hidden="true"
              className={`absolute hidden sm:block ${side === "right" ? "-scale-x-100" : ""}`}
              style={{ top: u(design.laurelTop), [side]: u(LAUREL.inset), width: u(LAUREL.width), height: u(LAUREL.height) }}
            >
              <Image
                src="/images/awards/laurel.avif"
                alt=""
                fill
                sizes="78px"
                unoptimized
                draggable={false}
                className="max-w-none object-fill select-none"
              />
            </span>
          ))}
          <div
            className="relative w-full sm:w-(--text-w)"
            style={
              {
                "--text-w": `min(${u(design.textWidth)}, calc(100% - 2 * ${u(LAUREL.inset + LAUREL.width + 8)}))`,
                "--text-top": u(design.textTop),
                "--text-shift": u(TEXT_SHIFT),
              } as CSSProperties
            }
          >
            <div className="sm:relative sm:top-(--text-top) sm:left-(--text-shift)">
              <SectionTitle data-award-text className="text-center tracking-[-0.01em] text-balance">
                <Accent>{title}</Accent>
              </SectionTitle>
              <p
                data-award-text
                className="mt-[clamp(16px,1.61vw,31px)] text-center font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80"
              >
                {text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AwardsSection({ content }: AwardsSectionProps) {
  const { label, awards } = content;
  return (
    <section aria-label={label} className="pt-[clamp(32px,4.6875vw,90px)] pb-[clamp(56px,5.78vw,111px)]">
      <Container contentWidth={BLOCK_WIDTH}>
        <div className="flex flex-col gap-[clamp(40px,3.125vw,60px)]">
          {awards.map((award, index) => (
            <Block key={`${award.image.src}-${index}`} award={award} priority={index === 0} />
          ))}
        </div>
      </Container>
    </section>
  );
}
