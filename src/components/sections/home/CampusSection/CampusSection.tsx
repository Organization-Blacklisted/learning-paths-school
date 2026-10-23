"use client";

import Image from "next/image";
import { useRef } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import BodyText from "@/components/ui/BodyText";
import Photo from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import { useIdleReady } from "@/lib/useIdleReady";
import { useParallax } from "@/lib/useParallax";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useViewportVideo } from "@/lib/useViewportVideo";
import type { CampusSectionProps } from "./CampusSection.types";

// Figma: "Frame 1618876520" (node 6282:783), 1520 x 830px, "A *Campus* Built Around Possibility". Centred: green pill, heading
// (the blue slanted "Campus" inside "A ... Built Around Possibility"), an 818px paragraph, then a 1200 x 594px media box with the label
// "In-vision 360" and a small icon at its bottom right. 40px between the text and the media.
//
// THE MEDIA BOX IS A VIDEO IN THE DESIGN, which does not exist yet: it shows a poster image (the video's frame in Figma). When a video is
// added (`media.video` in src/data/home-campus.ts) the same box plays it: muted, looping, inline, and only while the section is on screen
// (it pauses when scrolled away, and does not start with prefers-reduced-motion, where the poster stays). When a video is playing a
// small pause button appears at the bottom left (WCAG 2.2.2: moving content longer than 5 seconds needs a way to stop it).
//
// It sits below the alumni scene on the home page, above What's New. It is a normal <Section>.
//
// ANIMATION (nothing in Figma; mine):
// - Entrance, once, when it scrolls into view (about 1.3 s): the pill, heading and paragraph rise in, then the media opens up from a
//   smaller rounded window to its full size while the image settles from a zoom, and the label rises in.
// - Parallax: while the section passes through the screen the image drifts up and down inside the box by a few percent (scrubbed by
//   scroll), which gives the still poster some depth (and the video too).
// - Reduced motion: no animation and no parallax, everything shown. Everything is only hidden by JS.

export default function CampusSection({ content }: CampusSectionProps) {
  const { label, badge, titleStart, titleAccent, titleEnd, intro, media } = content;
  const rootRef = useRef<HTMLDivElement>(null);
  // The video (when there is one): plays while at least 35% of the box is on screen, pauses otherwise, never with reduced motion.
  const { videoRef, paused, toggle, handlers } = useViewportVideo(Boolean(media.video));
  // The poster is requested once the page has loaded and the browser is idle (see useIdleReady); its box keeps its size.
  const posterReady = useIdleReady(800, rootRef);

  // Entrance, once.
  useScrollReveal(rootRef, ({ gsap, q }) => {
    const heads = q("[data-campus-head]");
    const frame = q("[data-campus-frame]");
    const zoom = q("[data-campus-zoom]");
    const tag = q("[data-campus-tag]");

    gsap.set(heads, { autoAlpha: 0, y: 24 });
    gsap.set(frame, { clipPath: "inset(10% 8% 10% 8% round 24px)" });
    gsap.set(zoom, { scale: 1.12 });
    gsap.set(tag, { autoAlpha: 0, y: 14 });

    return gsap
      .timeline({ paused: true, defaults: { ease: "power2.out" } })
      .to(heads, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0)
      .to(frame, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.1, ease: "power3.inOut" }, 0.3)
      .to(zoom, { scale: 1, duration: 1.4 }, 0.3)
      .to(tag, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.1);
  });

  // Parallax: the image sits 12% taller than its box and drifts from -5% to +5% while the section crosses the screen.
  useParallax(rootRef, "[data-campus-drift]", 5);

  return (
    <Section label={label}>
      <div ref={rootRef} className="flex flex-col items-center gap-10">
        <div className="flex w-full max-w-[818px] flex-col items-center gap-4">
          <Badge data-campus-head>{badge}</Badge>
          {/* "A", the blue slanted "Campus" (Lexend Medium), "Built Around Possibility" (Lexend Regular), centred */}
          <SectionTitle data-campus-head className="text-center tracking-normal text-balance">
            {titleStart} <Accent className="mx-[0.1em] tracking-[-0.01em]">{titleAccent}</Accent> {titleEnd}
          </SectionTitle>
          <BodyText data-campus-head className="text-center text-brand-graphite">
            {intro}
          </BodyText>
        </div>

        {/* Media: 1200 x 594. The frame opens (clip), the zoom box settles, the drift box moves with scroll (12% taller than the frame). */}
        <div data-campus-frame className="relative aspect-[1200/594] w-full max-w-[1200px] overflow-hidden bg-brand-navy">
          <div data-campus-zoom className="absolute inset-0">
            <div data-campus-drift className="absolute inset-x-0 -top-[6%] h-[112%]">
              <Photo
                ready={posterReady}
                src={media.poster}
                alt={media.video ? "" : media.alt}
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
              {media.video && (
                <video
                  ref={videoRef}
                  className="absolute inset-0 size-full object-cover"
                  poster={media.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  {...handlers}
                  aria-label={media.alt}
                >
                  <source src={media.video.src} type={media.video.type} />
                </video>
              )}
            </div>
          </div>

          {/* "In-vision 360" and its icon: white, bottom right (32px from the right edge, 19px from the bottom at the design size) */}
          <div
            data-campus-tag
            className="absolute right-4 bottom-3 flex items-center gap-3 font-body text-px-16 leading-[1.5] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)] sm:right-8 sm:bottom-[19px] sm:gap-4 sm:text-px-18"
          >
            <span>{media.tag}</span>
            <Image
              src="/images/home/campus/in-vision-360.svg"
              alt=""
              width={32}
              height={32}
              unoptimized
              aria-hidden="true"
              className="size-6 sm:size-8"
            />
          </div>

          {media.video && (
            <button
              type="button"
              onClick={toggle}
              aria-label={paused ? "Play the campus video" : "Pause the campus video"}
              className="absolute bottom-3 left-4 rounded-full bg-black/45 px-4 py-2 font-body text-px-14 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-[19px] sm:left-8"
            >
              {paused ? "Play" : "Pause"}
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}
