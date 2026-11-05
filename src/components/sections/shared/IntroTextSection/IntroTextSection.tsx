"use client";

import { useRef } from "react";
import Section from "@/components/layouts/Section";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { IntroTextSectionProps } from "./IntroTextSection.types";

// The reusable intro text section: a few centred paragraphs, at most 1185px wide, 12px apart. Figma "Frame 1618876518" (node 5688:14397) of the Welcome to LPS
// page, under the hero. Any page can use it for an introduction:
//
//   <IntroTextSection content={welcomeToLps.intro} />
//
// The content is `IntroTextContent` (src/types/intro-text.ts), from a page's data file or the CMS. It is a normal <Section> (main container, 120px above it and, last on
// the page, below it); a page can pass its own space above. Type: Plus Jakarta Sans Regular 18px, navy at 80%, line height 1.5, centred.
//
// ANIMATION (nothing in Figma; mine), once when it comes into view (quicker when it comes back): the paragraphs rise in one after the other. Reduced motion: none.
// Everything is only hidden by JS.

export default function IntroTextSection({ content, spacing = "inner", className }: IntroTextSectionProps) {
  const { label, paragraphs } = content;
  const rootRef = useRef<HTMLDivElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const items = q("[data-intro-item]");
      gsap.set(items, { autoAlpha: 0, y: 24 });
      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(items, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0);
    },
    { start: "top 85%" },
  );

  return (
    <Section label={label} spacing={spacing} className={className}>
      <div ref={rootRef} className="mx-auto flex max-w-[1185px] flex-col gap-3 text-center">
        {paragraphs.map((paragraph, index) => (
          <p key={index} data-intro-item className="font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80">
            {paragraph}
          </p>
        ))}
      </div>
    </Section>
  );
}
