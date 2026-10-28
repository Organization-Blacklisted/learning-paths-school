"use client";

import { useRef } from "react";
import { useSceneTimeline } from "@/components/layouts/HorizontalScene";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import Photo from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import { registerGsap } from "@/lib/gsap";
import { useIdleReady } from "@/lib/useIdleReady";
import type { AlumniSectionProps } from "./AlumniSection.types";

// Figma: "Frame 1618876383" (node 6282:755), 1520 x 461px, "Their *Paths Continue* Long After They Leave". Left, a 633px block: green
// pill, two-line heading (the blue slanted "Paths Continue" on the first line), two paragraphs 497px wide. Right, two alumni, each a
// 428 x 385px portrait with the name (SemiBold 18px) and the university (Light 18px) centred under it, 16px apart.
//
// It is the SECOND PANEL of the second sideways scene on the home page: the owner placed it to the right of "The Ecosystem Behind
// LPS 360" on the canvas, so after the Ecosystem section the view pans right to this (see <HorizontalScene> on the home page).
//
// LAYOUT. From 1600px (the container is then at least 1440px wide): the design at its exact sizes, text left (633px) and the two
// portraits right (428px each). From 1024px to 1599px (owner, 2026-10-28: "till 1024px don't break it in columns"; my interpretation, only
// desktop exists in Figma) it is still ONE ROW: the text block and the two portraits shrink together, in proportion to their design widths
// (633 : 428 : 428), and the portraits keep their aspect ratio. Below 1024px the text goes above and the two portraits sit side by side
// underneath, at their own aspect ratio, shrinking with the screen.
//
// ANIMATION (nothing specified in Figma; mine). In the sideways scene it is driven by the pan: the pill, heading and paragraphs rise in
// as the text block enters from the right, then each portrait is opened from the bottom with a slight zoom settle and its name and
// university rise in below it. Scrolling back reverses it. Where there is no pan (below 1024px, or reduced motion) it plays once when it
// comes into view; with reduced motion nothing is animated. Everything is only hidden by JS.

const LAST_END = 0.94; // the scene's last animation ends here (0 to 1 over the whole pan), so the end can be looked at

export default function AlumniSection({ content }: AlumniSectionProps) {
  const { label, badge, titleStart, titleAccent, titleSecondLine, paragraphs, people } = content;
  const rootRef = useRef<HTMLElement>(null);
  // The portraits are requested once the page has loaded and the browser is idle (see useIdleReady); their boxes keep their size.
  const photosReady = useIdleReady(800, rootRef);

  const parts = (root: HTMLElement) => ({
    heads: Array.from(root.querySelectorAll<HTMLElement>("[data-alumni-head]")),
    cards: Array.from(root.querySelectorAll<HTMLElement>("[data-alumni-card]")),
  });
  const cardParts = (card: HTMLElement) => ({
    clip: card.querySelector<HTMLElement>("[data-alumni-clip]"),
    photo: card.querySelector<HTMLElement>("[data-alumni-photo]"),
    caption: card.querySelector<HTMLElement>("[data-alumni-caption]"),
  });

  // In the sideways scene: ride the pan.
  useSceneTimeline((tl, { stageWidth, distance, progressAt }) => {
    const { gsap } = registerGsap();
    const root = rootRef.current;
    if (!root) return;
    const { heads, cards } = parts(root);
    // Where each part starts (measured before anything is moved) and how long it takes, as fractions of the pan.
    const headStarts = heads.map((el) => progressAt(el, 0, stageWidth));
    const cardStarts = cards.map((el) => progressAt(el, 0, stageWidth));
    const cardLength = Math.max(0.04, ((cards[0]?.offsetWidth ?? 400) * 0.6) / distance);
    const headLength = cardLength * 0.8;
    const place = (start: number, length: number) => Math.min(LAST_END - length, Math.max(0, start));

    heads.forEach((el, i) => {
      gsap.set(el, { autoAlpha: 0, y: 24 });
      tl.to(el, { autoAlpha: 1, y: 0, duration: headLength, ease: "power2.out" }, place(headStarts[i] + i * 0.004, headLength * 1.1));
    });
    cards.forEach((card, i) => {
      const { clip, photo, caption } = cardParts(card);
      if (!clip || !photo || !caption) return;
      gsap.set(clip, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(photo, { scale: 1.15 });
      gsap.set(caption, { autoAlpha: 0, y: 20 });
      const start = place(cardStarts[i], cardLength * 1.3);
      tl.to(clip, { clipPath: "inset(0% 0% 0% 0%)", duration: cardLength, ease: "power2.out" }, start)
        .to(photo, { scale: 1, duration: cardLength * 1.2, ease: "power2.out" }, start)
        .to(caption, { autoAlpha: 1, y: 0, duration: cardLength * 0.8, ease: "power2.out" }, start + cardLength * 0.5);
    });
  });

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
