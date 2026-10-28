"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import BodyText from "@/components/ui/BodyText";
import Photo from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import { registerGsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
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
// - Text: the pill, heading and paragraph rise in when the section scrolls into view (timed, replays quickly).
// - Media opening (owner, 2026-10-28: "more premium"): SCRUBBED by the scroll, not timed. As the box rises from the bottom of the screen
//   to 40% down it opens from a smaller rounded window to the full square box while the image settles from a 1.16 zoom, and the glass
//   label comes in at the end. It follows the visitor's hand and runs backwards when scrolling up.
// - Pointer depth (mouse only): the image drifts a few pixels against the pointer and a soft light follows it.
// - Parallax: while the section passes through the screen the image drifts up and down inside the box by a few percent (scrubbed by
//   scroll), which gives the still poster some depth (and the video too).
// - Reduced motion (and touch for the pointer part): none of it, everything shown. Everything is only hidden by JS.

export default function CampusSection({ content }: CampusSectionProps) {
  const { label, badge, titleStart, titleAccent, titleEnd, intro, media } = content;
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // The video (when there is one): plays while at least 35% of the box is on screen, pauses otherwise, never with reduced motion.
  const { videoRef, paused, toggle, handlers } = useViewportVideo(Boolean(media.video));
  // The poster is requested once the page has loaded and the browser is idle (see useIdleReady); its box keeps its size.
  const posterReady = useIdleReady(800, rootRef);

  // The text rises in, once per visit (timed).
  useScrollReveal(rootRef, ({ gsap, q }) => {
    const heads = q("[data-campus-head]");
    gsap.set(heads, { autoAlpha: 0, y: 24 });
    return gsap
      .timeline({ paused: true, defaults: { ease: "power2.out" } })
      .to(heads, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0);
  });

  // The media is opened BY THE SCROLL (scrubbed, so it follows the visitor's hand and runs backwards going up): from a smaller rounded
  // window to the full box while the image settles from a zoom, and the label comes in at the end.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const inside = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, frame);
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: frame, start: "top 92%", end: "top 40%", scrub: 0.6 },
        })
        .fromTo(
          frame,
          { clipPath: "inset(9% 11% 9% 11% round 28px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.out", duration: 1 },
          0,
        )
        .fromTo(inside("[data-campus-zoom]"), { scale: 1.16 }, { scale: 1, ease: "power2.out", duration: 1 }, 0)
        .fromTo(inside("[data-campus-tag]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.7);
    });
    return () => mm.revert();
  }, []);

  // Depth under a mouse: the image drifts a few pixels against the pointer and a soft light follows it. Only with a real pointer
  // (not touch) and motion allowed; the layers are transforms only.
  useEffect(() => {
    const frame = frameRef.current;
    const tilt = frame?.querySelector<HTMLElement>("[data-campus-tilt]");
    const glow = frame?.querySelector<HTMLElement>("[data-campus-glow]");
    if (!frame || !tilt || !glow) return;
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
      const move = {
        x: gsap.quickTo(tilt, "x", { duration: 1, ease: "power3.out" }),
        y: gsap.quickTo(tilt, "y", { duration: 1, ease: "power3.out" }),
      };
      const light = {
        x: gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" }),
        y: gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" }),
        alpha: gsap.quickTo(glow, "opacity", { duration: 0.5 }),
      };
      const onMove = (event: PointerEvent) => {
        const box = frame.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        move.x((0.5 - x / box.width) * 20);
        move.y((0.5 - y / box.height) * 14);
        light.x(x);
        light.y(y);
        light.alpha(1);
      };
      const onLeave = () => {
        move.x(0);
        move.y(0);
        light.alpha(0);
      };
      frame.addEventListener("pointermove", onMove);
      frame.addEventListener("pointerleave", onLeave);
      return () => {
        frame.removeEventListener("pointermove", onMove);
        frame.removeEventListener("pointerleave", onLeave);
      };
    });
    return () => mm.revert();
  }, []);

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

        {/* Media: 1200 x 594. The frame opens (clip, scrubbed by the scroll), the tilt box follows a mouse (12px bigger on every side so no
            edge shows), the zoom box settles, the drift box moves with scroll (12% taller than the frame). */}
        <div ref={frameRef} data-campus-frame className="relative aspect-[1200/594] w-full max-w-[1200px] overflow-hidden bg-brand-navy">
          <div data-campus-tilt className="absolute -inset-3">
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
          </div>

          {/* A soft light that follows a mouse (hidden until the pointer is over the box; never on touch) */}
          <div
            data-campus-glow
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 size-[560px] opacity-0 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,255,255,0.2),transparent)] mix-blend-soft-light"
          />

          {/* "In-vision 360" and its icon: white, bottom right, on a glass pill (blurred dark glass with a hairline edge) */}
          <div
            data-campus-tag
            className="absolute right-4 bottom-4 flex items-center gap-3 rounded-full border border-white/25 bg-black/25 py-2 pr-3 pl-5 font-body text-px-16 leading-[1.5] text-white backdrop-blur-md sm:right-6 sm:bottom-6 sm:gap-4 sm:py-2.5 sm:pr-4 sm:pl-6 sm:text-px-18"
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
              className="absolute bottom-4 left-4 rounded-full bg-black/45 px-4 py-2 font-body text-px-14 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-6 sm:left-6"
            >
              {paused ? "Play" : "Pause"}
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}
