"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import Section from "@/components/layouts/Section";
import Badge from "@/components/ui/Badge";
import ButtonLink from "@/components/ui/ButtonLink";
import { defaultCta } from "@/data/cta";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { CtaSectionProps } from "./CtaSection.types";

// The reusable call-to-action band that closes many pages. Figma "Frame 1618876569" (node 6106:1235), 1520 x 335px.
//
//   <CtaSection />                                  the standard admissions band (src/data/cta.ts)
//   <CtaSection content={{ ...defaultCta, text: "…", button: { label: "…", href: "/…" } }} />
//
// It is a normal <Section> (main container, 200px spacing above, and below when it is the last thing on the page).
// The band: blue gradient (#123b7a to #0a295e, left to right), 15px corners, a soft blue glow and five slanted white
// 3% bars at the right (all anchored to the right edge, so on a narrow screen the decoration stays at the right and is
// clipped), then the content: pill, heading ("LPS Forward" in an accent serif, slanted like the other headings),
// paragraph, and the white button at the bottom right.
//
// The heading box is 65.4px high from xl, like the Figma group (the accent serif sits 8px lower there), so the band
// height and the vertical position of everything match.
// From xl (1280px) it is the design: content left, button bottom right, one line of heading. Below that (my
// interpretation, only desktop exists in Figma) everything stacks and the heading wraps.
//
// ANIMATION (owner: a highly interactive site), once when the band scrolls into view, about 1 second (quick on purpose):
// the bars slide in from the right, the glow swells, then the pill, heading, paragraph and button rise in one after the
// other. Reduced motion: no animation, everything shown. Everything is only hidden by JS, so without it all is visible.

// The five slanted bars, in Figma px. `right` is measured from the band's right edge (Figma left, converted).
const BARS = [
  { right: -431.374, top: -101.77, width: 1021.244, height: 637.957, inner: 437.437 },
  { right: -406.301, top: -98.863, width: 940.381, height: 625.416, inner: 355.608 },
  { right: -417.411, top: -98.543, width: 880.881, height: 616.189, inner: 295.396 },
  { right: -558.143, top: -112.25, width: 943.153, height: 625.846, inner: 358.413 },
  { right: -513.447, top: -125.016, width: 825.377, height: 607.581, inner: 239.229 },
];

export default function CtaSection({ content = defaultCta }: CtaSectionProps) {
  const { label, badge, titleLead, titleAccent, text, button } = content;
  const rootRef = useRef<HTMLDivElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, root, q }) => {
      const bars = q("[data-cta-bar]");
      const glow = root.querySelector("[data-cta-glow]");
      const items = q("[data-cta-item]");

      gsap.set(bars, { autoAlpha: 0, x: 90 });
      gsap.set(glow, { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(items, { autoAlpha: 0, y: 22 });

      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(bars, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.07 }, 0)
        .to(glow, { autoAlpha: 1, scale: 1, duration: 0.9 }, 0.1)
        .to(items, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, 0.1);
    },
    { start: "top 80%" },
  );

  return (
    <Section label={label}>
      <div
        ref={rootRef}
        className="relative overflow-clip rounded-[15px] bg-linear-to-r from-brand-blue to-brand-blue-darker px-6 py-12 md:px-10 xl:flex xl:min-h-[335px] xl:items-center xl:py-0 xl:pr-[57px] xl:pl-[51px]"
      >
        {/* Decoration (aria-hidden): a blurred blue glow and five slanted translucent bars */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* 407.776px box; the Figma SVG is larger (1075.78px, inset -81.91%) because it carries the blur */}
          <div data-cta-glow className="absolute" style={{ right: -172.776, top: 104.469, width: 407.776, height: 407.776 }}>
            <Image
              src="/images/cta/glow.svg"
              alt=""
              width={1076}
              height={1076}
              unoptimized
              className="absolute block max-w-none"
              style={{ inset: "-81.91%", width: "263.82%", height: "263.82%" }}
            />
          </div>
          {BARS.map((bar, i) => (
            <div
              key={i}
              data-cta-bar
              className="absolute flex items-center justify-center"
              style={{ right: bar.right, top: bar.top, width: bar.width, height: bar.height }}
            >
              {/* Same transform as the design: rotate 8.82deg, squash to 80% tall, slant by -37.08deg */}
              <div
                className="flex-none rotate-[8.82deg] scale-y-80 skew-x-[-37.08deg] bg-white/3"
                style={{ width: bar.inner, height: 820.267 } as CSSProperties}
              />
            </div>
          ))}
        </div>

        <div className="relative flex w-full flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex w-full max-w-[809px] flex-col gap-5">
            <Badge size="compact" data-cta-item className="self-start">
              {badge}
            </Badge>
            <h2
              data-cta-item
              className="font-body text-h1 leading-[1.2] font-normal tracking-[-0.01em] text-white xl:min-h-[65.436px] xl:whitespace-nowrap"
            >
              {titleLead}{" "}
              <span className="ml-[0.125em] inline-block font-accent font-normal [transform:skewX(-8deg)_scaleY(0.99)]">{titleAccent}</span>
            </h2>
            <p
              data-cta-item
              className="max-w-[545px] font-body text-body-lg leading-[1.5] tracking-[-0.01em] whitespace-pre-wrap text-white/80"
            >
              {text}
            </p>
          </div>
          <ButtonLink data-cta-item variant="light" href={button.href} className="self-start xl:self-auto">
            {button.label}
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
