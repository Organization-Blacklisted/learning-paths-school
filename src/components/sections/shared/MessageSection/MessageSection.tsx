"use client";

import Image from "next/image";
import { useRef } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import SectionTitle from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { MessageSectionProps } from "./MessageSection.types";

// The two designs of the section, as classes. "letter": Principal's Welcome (node 5748:475). "welcome": Welcome to LPS (node 5688:14549): the portrait is 859 x 902,
// 147px from a 512px column (1920px; both scale down with the screen), the section is a white band of its own with 120px above and below its content, the heading is
// on two lines (13px apart), the rule is 493px and drawn a little crooked (rotated -0.35 degrees, as in the design), 47px from the heading and from the text,
// the paragraph is 515px wide.
const LOOKS = {
  letter: {
    section: "pt-[clamp(48px,4.4271vw,85px)]",
    grid: "lg:grid-cols-[777fr_706fr] lg:gap-x-[37px]",
    photo: "aspect-[777/816]",
    sizes: "(min-width: 1024px) 52vw, 100vw",
    column: "gap-4",
    rule: "block h-px w-full max-w-[551px] bg-brand-blue",
    text: "max-w-[697px]",
  },
  welcome: {
    section: "bg-white py-inner",
    grid: "lg:grid-cols-[859fr_512fr] lg:gap-x-[clamp(48px,7.6563vw,147px)]",
    photo: "aspect-[859/902]",
    sizes: "(min-width: 1024px) 56vw, 100vw",
    column: "gap-[clamp(28px,2.4479vw,47px)]",
    rule: "block h-px w-full max-w-[493px] -rotate-[0.35deg] bg-brand-blue",
    text: "max-w-[515px]",
  },
} as const;

// The reusable "message" section: a portrait on the left and a letter on the right. Figma "Frame 1618876556" of the Principal's Welcome page
// (node 5748:475), 1520 x 816px. Any page can use it for a message from a person (the Principal, the Chairperson, a founder):
//
//   <MessageSection content={principalsWelcome.message} />
//
// The content is `MessageContent` (src/types/message.ts), from a page's data file or from the CMS (the fields are in
// src/globals/PrincipalsWelcome.ts). The section brings no space of its own: the page puts it where its design has it (the Principal's page: 85px under
// the hero), like the hero it is "spacing none".
//
// LAYOUT. From lg (1024px) the portrait takes 777 and the letter 706 of the 1520px, 37px apart, centred on each other (at 1920px: exactly
// the design; below that both columns shrink in proportion). Below lg (my interpretation, only desktop is designed) the portrait is on top, as
// wide as the column up to 560px, and the letter under it.
//  - The portrait has 8px corners and is served as the file in /public (already AVIF, 45 dB). It is the biggest thing on the first screen of the
//    page, so it is preloaded (`priority`).
//  - The heading is the h2 size (40px at 1280px and up): grey, with the last part blue and slanted (`<Accent>`), capitalised as the design shows.
//  - Under it a 551px blue rule, then the paragraphs (18px, navy at 80%, 16px apart, at most 697px wide: the width of the design’s text boxes, so the lines break where the design’s do), then, 35px lower, the name in bold italic and the role.
//  - A paragraph may contain a line break: it starts a new line inside the same paragraph (the design's last paragraph does that).
//
// VARIANT `welcome` (the Welcome to LPS page, node 5688:14549): a white band with the portrait 859 x 902 (same shape), 147px from a 512px column whose heading is on
// two lines, with a 493px crooked rule 47px from the heading and from the text and a 515px paragraph; not preloaded (it is down the page).
//
// ANIMATION (owner: a highly interactive site), once, when the section comes into view: the portrait settles from a slight zoom, and the
// heading, the rule, the paragraphs and the signature rise in one after the other. Reduced motion: nothing moves. Everything is only hidden by
// JS, so without it all is visible.

export default function MessageSection({ content, variant = "letter" }: MessageSectionProps) {
  const { label, image, titleLead, titleAccent, paragraphs, signatory } = content;
  const look = LOOKS[variant];
  // The portrait of the letter is the biggest thing on the first screen (preloaded); the welcome band is further down the page.
  const first = variant === "letter";
  const rootRef = useRef<HTMLDivElement>(null);

  useScrollReveal(
    rootRef,
    ({ gsap, root, q }) => {
      const photo = root.querySelector("[data-message-photo]");
      const items = q("[data-message-item]");
      gsap.set(photo, { autoAlpha: 0, y: 26 });
      gsap.set(items, { autoAlpha: 0, y: 22 });
      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(photo, { autoAlpha: 1, y: 0, duration: 0.8 }, 0)
        .to(items, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.15);
    },
    { start: "top 80%" },
  );

  return (
    <Section label={label} spacing="none" className={look.section}>
      <div ref={rootRef} className={`grid items-center gap-10 ${look.grid}`}>
        <div
          data-message-photo
          className={`relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[8px] bg-brand-mist lg:mx-0 lg:max-w-none ${look.photo}`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={first}
            unoptimized
            draggable={false}
            sizes={look.sizes}
            className="size-full object-cover select-none"
          />
        </div>

        <div className={`flex flex-col ${look.column}`}>
          <SectionTitle data-message-item className="leading-[1.2] capitalize">
            {titleLead}{" "}
            <Accent className={variant === "welcome" ? "mt-[13px] block tracking-[-0.01em]" : "tracking-[-0.01em]"}>{titleAccent}</Accent>
          </SectionTitle>
          <span data-message-item aria-hidden="true" className={look.rule} />

          <div className="flex flex-col gap-[clamp(24px,1.82vw,35px)]">
            <div className={`flex flex-col gap-4 ${look.text}`}>
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  data-message-item
                  className="font-body text-body-lg leading-[1.5] tracking-[-0.01em] whitespace-pre-line text-brand-navy/80"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div data-message-item className="flex flex-col font-body text-body-lg leading-[1.5]">
              {/* Bold Italic is its own font file (loaded only on a page that shows it, src/fonts/index.ts). */}
              <p
                className="font-bold text-brand-azure italic"
                style={{ fontFamily: "var(--font-plus-jakarta-italic), var(--font-plus-jakarta-sans), sans-serif" }}
              >
                {signatory.name}
              </p>
              <p className="font-medium tracking-[-0.01em] text-brand-graphite capitalize">{signatory.role}</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
