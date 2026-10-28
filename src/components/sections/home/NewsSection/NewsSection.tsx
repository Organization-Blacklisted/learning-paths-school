"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import BodyText from "@/components/ui/BodyText";
import Photo from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import { useIdleReady } from "@/lib/useIdleReady";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { NewsSectionProps } from "./NewsSection.types";

// Figma: "Frame 1618876584" (node 6282:899), 1520 x 506px, "What's New At LPS". Left: a 502px block (green pill, heading with the
// slanted blue "At LPS", a 471px paragraph) centred vertically. Right: three news cards, 24px apart, 506px high. Each card has a
// text panel on top (303px: date in green, title, up to five lines of text, a green arrow) and a 203px photo below. It sits above
// the CTA band on the home page.
//
// LAYOUT. From 1600px (the container is then the full 1520px): the design, intro left and three equal cards in the 994px column (the Figma
// cards are 318, 318 and 310px wide; equal widths of 315px are used, the 8px difference looks like a slip in the design). Below 1600px (my
// interpretation, only desktop exists in Figma) the intro goes above and the three cards sit in a row of equal columns from 1024px; below 1024px
// the cards become a row you swipe sideways, each 318px (80% of the screen at most), snapping to the card edges.
//
// ANIMATION (owner: "as you think will suit it"), once when the section scrolls into view, about 1.4 s: the pill, heading
// and paragraph rise in; then the cards grow up from the bottom one after another (a clip wipe, like the Alumni portraits and the
// Journey columns) while each photo settles from a slight zoom (1.15 to 1), the date, title and text of the card follow, and the
// green arrow draws itself. On hover (or keyboard focus) a card lifts, its
// photo zooms a little, the title turns blue and the arrow slides right and lengthens. Reduced motion: nothing moves, all shown.
// Everything is only hidden by JS, so without it the section is fully visible.

export default function NewsSection({ content }: NewsSectionProps) {
  const { label, badge, titleLead, titleAccent, intro, items } = content;
  const rootRef = useRef<HTMLDivElement>(null);
  // The photos are requested once the page has loaded and the browser is idle (see useIdleReady); their boxes keep their size.
  const photosReady = useIdleReady(800, rootRef);

  useScrollReveal(rootRef, ({ gsap, q }) => {
    const intros = q("[data-news-intro]");
    const cards = q("[data-news-card]");

    gsap.set(intros, { autoAlpha: 0, y: 24 });
    cards.forEach((card) => {
      gsap.set(card, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(q("[data-news-photo]", card), { scale: 1.15 });
      gsap.set(q("[data-news-text]", card), { autoAlpha: 0, y: 16 });
      gsap.set(q("[data-news-arrow]", card), { scaleX: 0, transformOrigin: "0% 50%" });
    });

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    tl.to(intros, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0);
    cards.forEach((card, i) => {
      const at = 0.25 + i * 0.14;
      // The card grows up from the bottom (a clip wipe, as the Alumni portraits and the Journey columns). The clip is removed when it is
      // open: a clip would cut off the hover lift and shadow of the card.
      tl.to(card, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, clearProps: "clipPath" }, at)
        .to(q("[data-news-photo]", card), { scale: 1, duration: 1.1 }, at)
        .to(q("[data-news-text]", card), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, at + 0.35)
        .to(q("[data-news-arrow]", card), { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, at + 0.7);
    });
    return tl;
  });

  return (
    <Section label={label}>
      <div ref={rootRef} className="flex flex-col gap-10 min-[1600px]:flex-row min-[1600px]:items-center min-[1600px]:gap-6">
        {/* Intro: 502px wide, vertically centred against the cards */}
        <div className="flex w-full flex-col gap-[27px] min-[1600px]:w-[502px] min-[1600px]:shrink-0">
          <div className="flex flex-col items-start gap-[17px]">
            <Badge data-news-intro>{badge}</Badge>
            {/* Grey "What's New" (Lexend Regular) and the blue slanted "At LPS" (Lexend Medium), like "Our Learning Journey" */}
            <SectionTitle data-news-intro className="tracking-normal whitespace-nowrap capitalize">
              {titleLead} <Accent className="-ml-[0.118em] tracking-[-0.01em]">{titleAccent}</Accent>
            </SectionTitle>
          </div>
          <BodyText data-news-intro className="max-w-[471px] text-brand-graphite">
            {intro}
          </BodyText>
        </div>

        {/* The cards: a row to swipe below xl (the list bleeds to the screen edges), three equal columns from xl */}
        <ul className="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-6 overflow-x-auto px-gutter pb-3 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:scroll-px-0 lg:overflow-visible lg:px-0 lg:pb-0 min-[1600px]:flex-1 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li key={item.id} data-news-card className="w-[min(318px,80vw)] shrink-0 snap-start lg:w-auto">
              <Link
                href={item.href}
                aria-label={`${item.title}, ${item.date}`}
                className="group relative block h-[506px] overflow-clip bg-brand-cloud transition-[translate,box-shadow] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue motion-safe:hover:-translate-y-1.5 motion-safe:hover:shadow-[0_22px_40px_-22px_rgba(6,25,57,0.4)] motion-safe:focus-visible:-translate-y-1.5"
              >
                {/* Text panel: 303px, 18px left padding, content starts 21px down */}
                <div className="relative h-[303px] bg-brand-paper px-[18px] pt-[21.22px]">
                  <p data-news-text className="font-body text-px-16 leading-[normal] font-medium text-brand-green-light">
                    {item.date}
                  </p>
                  <h3
                    data-news-text
                    className="mt-3 font-body text-px-18 leading-[normal] font-semibold text-brand-navy transition-colors duration-300 group-hover:text-brand-blue"
                  >
                    {item.title}
                  </h3>
                  <p
                    data-news-text
                    className="mt-4 line-clamp-5 w-full max-w-[261px] font-body text-px-18 leading-[1.5] font-light text-brand-navy/80"
                  >
                    {item.excerpt}
                  </p>
                  {/* Arrow: the Figma line. The outer box slides right on hover (CSS); the inner one is drawn in by the
                      animation (GSAP writes its own transform, which would cancel a CSS hover on the same element). Box = Figma inset. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-[258.86px] left-[17px] block h-[14.73px] w-[27px] origin-left transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-2 motion-safe:group-hover:scale-x-[1.15]"
                  >
                    <span data-news-arrow className="block size-full">
                      <Image
                        src="/images/home/news/arrow.svg"
                        alt=""
                        width={27}
                        height={15}
                        unoptimized
                        className="block size-full max-w-none"
                      />
                    </span>
                  </span>
                </div>

                {/* Photo: 203px at the bottom of the card; the image zooms inside, the box does not move */}
                <div className="absolute inset-x-0 bottom-0 h-[203px] overflow-hidden">
                  <div data-news-photo className="relative size-full">
                    <Photo
                      ready={photosReady}
                      src={item.photo}
                      alt=""
                      fill
                      sizes="(min-width: 1600px) 330px, (min-width: 1024px) 33vw, 318px"
                      className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.06]"
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
