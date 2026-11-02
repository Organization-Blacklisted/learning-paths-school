"use client";

import { useRef } from "react";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import Photo from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import { useIdleReady } from "@/lib/useIdleReady";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { AlumniSectionProps } from "./AlumniSection.types";

// Figma: "Frame 1618876383" (node 6282:755), 1520 x 461px, "Their *Paths Continue* Long After They Leave". Left, a 633px block: green
// pill, two-line heading (the blue slanted "Paths Continue" on the first line), two paragraphs 497px wide. Right, two alumni, each a
// 428 x 385px portrait with the name (SemiBold 18px) and the university (Light 18px) centred under it, 16px apart.
//
// It is an ordinary section on the home page, below the sideways scene of the Ecosystem and the campus video and above What's New (owner,
// 2026-11-02: the campus video and "Beyond the school gate" swapped places; before that it was the second panel of the Ecosystem scene). The page
// puts it in a container with the section spacing (BlockRenderer).
//
// LAYOUT. From 1600px (the container is then at least 1440px wide): the design at its exact sizes, text left (633px) and the two
// portraits right (428px each). From 1024px to 1599px (owner, 2026-10-28: "till 1024px don't break it in columns"; my interpretation, only
// desktop exists in Figma) it is still ONE ROW: the text block and the two portraits shrink together, in proportion to their design widths
// (633 : 428 : 428), and the portraits keep their aspect ratio. Below 1024px the text goes above and the two portraits sit side by side
// underneath, at their own aspect ratio, shrinking with the screen.
//
// ANIMATION (nothing specified in Figma; mine). When it scrolls into view the pill, heading and paragraphs rise in, then each portrait is opened
// from the bottom with a slight zoom settle and its name and university rise in below it; it plays again, quicker, when it comes back into view
// (useScrollReveal). With reduced motion nothing is animated. Everything is only hidden by JS.

export default function AlumniSection({ content }: AlumniSectionProps) {
  const { label, badge, titleStart, titleAccent, titleSecondLine, paragraphs, people } = content;
  const rootRef = useRef<HTMLElement>(null);
  // The portraits are requested once the page has loaded and the browser is idle (see useIdleReady); their boxes keep their size.
  const photosReady = useIdleReady(800, rootRef);

  // Entrance, when the section scrolls into view (and, faster, every time it comes back): the pill, heading and paragraphs rise in, then each
  // portrait is opened from the bottom with a slight zoom settle and its name and university rise in below it.
  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const heads = q("[data-alumni-head]");
      const cards = q("[data-alumni-card]");
      const timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

      gsap.set(heads, { autoAlpha: 0, y: 24 });
      timeline.to(heads, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0);

      cards.forEach((card, i) => {
        const clip = card.querySelector<HTMLElement>("[data-alumni-clip]");
        const photo = card.querySelector<HTMLElement>("[data-alumni-photo]");
        const caption = card.querySelector<HTMLElement>("[data-alumni-caption]");
        if (!clip || !photo || !caption) return;
        gsap.set(clip, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(photo, { scale: 1.15 });
        gsap.set(caption, { autoAlpha: 0, y: 20 });
        const start = 0.35 + i * 0.18;
        timeline
          .to(clip, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut" }, start)
          .to(photo, { scale: 1, duration: 1.2 }, start)
          .to(caption, { autoAlpha: 1, y: 0, duration: 0.5 }, start + 0.5);
      });
      return timeline;
    },
    { start: "top 75%" },
  );

  return (
    <section ref={rootRef} aria-label={label}>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-[15px]">
        {/* Text: pill, two-line heading, two paragraphs. From lg: 633px at the design size, shrinking with the portraits below 1600px. */}
        <div className="flex w-full flex-col gap-[27px] lg:w-[633px] lg:min-w-0 lg:shrink min-[1600px]:shrink-0">
          <div className="flex flex-col items-start gap-[17px]">
            <Badge data-alumni-head>{badge}</Badge>
            {/* Grey "Their" and "Long After They Leave" (Lexend Regular), the blue slanted "Paths Continue" (Lexend Medium) */}
            {/* From lg the column is only 381px wide at 1024px, and "Long After They Leave" (about 11 times the font size) needs a little less than the
                global h2 size to stay on one line down to 1024px; at 1280px and up this is the normal 40px. */}
            <SectionTitle
              data-alumni-head
              className="tracking-normal lg:text-[length:clamp(1.75rem,3.3vw,2.5rem)] min-[1600px]:whitespace-nowrap"
            >
              {titleStart} <Accent className="-ml-[0.118em] tracking-[-0.01em]">{titleAccent}</Accent>
              <br />
              {titleSecondLine}
            </SectionTitle>
          </div>
          <div data-alumni-head className="flex max-w-[497px] flex-col gap-4 font-body text-body-lg leading-[1.5] text-brand-graphite">
            {paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>

        {/* The two alumni, 16px apart */}
        <ul className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:flex lg:w-auto lg:min-w-0 lg:shrink min-[1600px]:shrink-0">
          {people.map((person) => (
            <li
              key={person.id}
              data-alumni-card
              className="flex min-w-0 flex-col items-center gap-[20.751px] lg:w-[428px] lg:shrink min-[1600px]:min-h-[461px]"
            >
              {/* Portrait: 428 x 385.18 at the design size; the clip wipes it open, the inner box zooms, the image fills it */}
              <div data-alumni-clip className="relative aspect-[428/385.18] w-full overflow-hidden">
                <div data-alumni-photo className="absolute inset-0">
                  <Photo
                    ready={photosReady}
                    src={person.photo.src}
                    alt={person.photo.alt}
                    fill
                    sizes="(min-width: 1600px) 428px, (min-width: 1024px) 30vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Name and university, centred. text-box-trim cuts the empty space above and below the lines, like the design. */}
              <div
                data-alumni-caption
                className="flex w-full flex-col items-center gap-[8.662px] text-center font-body text-px-16 leading-[1.5] sm:text-px-18 min-[1600px]:w-[217.645px] min-[1600px]:whitespace-nowrap"
              >
                <p className="font-semibold text-brand-navy [text-box:trim-both_cap_alphabetic]">{person.name}</p>
                <p className="font-light text-brand-navy/80">{person.institution}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
