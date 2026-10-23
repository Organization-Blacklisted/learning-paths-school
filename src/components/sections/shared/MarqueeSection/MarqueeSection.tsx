"use client";

import { useEffect, useRef } from "react";
import Section from "@/components/layouts/Section";
import Photo from "@/components/ui/Photo";
import { defaultMarquee } from "@/data/marquee";
import { registerGsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { useIdleReady } from "@/lib/useIdleReady";
import type { MarqueeSectionProps } from "./MarqueeSection.types";

// The reusable, endlessly scrolling photo strip that sits above the footer on many pages. Figma "Group 143" (node
// 6282:891): six square photos in a row, 320px each, 1920 x 320 in total, with no gaps.
//
//   <MarqueeSection />                                  the standard strip (src/data/marquee.ts), anywhere on a page
//   <MarqueeSection attachToFooter />                    as the last thing before the footer: touches it (home page)
//   <MarqueeSection content={{ label: "…", images: [...] }} />
//
// It is a normal <Section> (200px above it; 200px below too if it is the last section), so it can be placed anywhere
// in the page, between any two sections. Full width (not inside the container). The tile size is 1/6 of the screen width, between 160 and 320px, so at 1920px it
// is exactly the design (six tiles fill the screen) and on a phone about 2.4 tiles show.
//
// HOW IT LOOPS: the list of photos is rendered four times side by side in one track. The track moves left by exactly
// the width of one list, over and over, so the jump back to the start is invisible. Four copies are enough to fill
// screens up to 5760px wide; the copies after the first are hidden from assistive technology (`aria-hidden`, `inert`).
// The speed is the same in pixels per second at every screen size (SPEED), so it is calm on a phone too.
//
// BEHAVIOUR: it eases to a stop while the pointer is over it and eases back on leaving (so a photo can be looked
// at), it pauses while it is off screen (no work for the browser), and it is rebuilt when the width changes. With
// prefers-reduced-motion it does not move: the first photos are shown, still.
//
// Photos are requested after the page has loaded and the browser is idle (useIdleReady): the strip is at the bottom of
// the page. Each tile keeps its size meanwhile.
//
// Figma also has a soft dark blurred ellipse (Ellipse 38, 145 x 50px at x 887, y 141) on top of the strip. It is not
// built: it is fixed to one spot of the 1920px composition, which has no meaning on a strip that scrolls (and it is
// almost invisible in the render). See docs/18-marquee-section.md.

const COPIES = 4;
/** Pixels per second. */
const SPEED = 60;

export default function MarqueeSection({ content = defaultMarquee, attachToFooter = false }: MarqueeSectionProps) {
  const { label, images } = content;
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const photosReady = useIdleReady(1000, rootRef);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const firstList = track.querySelector<HTMLElement>("[data-marquee-list]");
      if (!firstList) return;

      let tween: gsap.core.Tween | undefined;
      let onScreen = true;

      const build = () => {
        const progress = tween ? tween.progress() : 0;
        tween?.kill();
        const listWidth = firstList.getBoundingClientRect().width;
        if (!listWidth) return;
        gsap.set(track, { x: 0 });
        tween = gsap.to(track, { x: -listWidth, duration: listWidth / SPEED, ease: "none", repeat: -1 });
        tween.progress(progress);
        if (!onScreen) tween.pause();
      };
      build();

      // The list changes width with the screen: rebuild, keeping the position in the loop.
      const resize = new ResizeObserver(build);
      resize.observe(firstList);

      // Only move while on screen.
      const visibility = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen) tween?.resume();
          else tween?.pause();
        },
        { rootMargin: "100px" },
      );
      visibility.observe(root);

      // Ease to a stop under the pointer, and back up to speed when it leaves.
      const slow = () => tween && gsap.to(tween, { timeScale: 0, duration: 0.6, ease: "power2.out", overwrite: true });
      const fast = () => tween && gsap.to(tween, { timeScale: 1, duration: 0.8, ease: "power2.inOut", overwrite: true });
      root.addEventListener("pointerenter", slow);
      root.addEventListener("pointerleave", fast);

      return () => {
        root.removeEventListener("pointerenter", slow);
        root.removeEventListener("pointerleave", fast);
        resize.disconnect();
        visibility.disconnect();
        tween?.kill();
        gsap.set(track, { clearProps: "transform" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    // Normal section spacing (200px above; also 200px below when it is the last section), so it can sit anywhere on a page.
    // attachToFooter: no space below, so the strip touches the footer (home page).
    <Section label={label} contained={false} {...(attachToFooter ? { spacing: "none" as const, className: "pt-section" } : {})}>
      {/* --tile: one photo. 1/6 of the screen, 160px at least, 320px at most (320 at 1920px, as designed). */}
      <div ref={rootRef} className="relative h-(--tile) overflow-hidden [--tile:clamp(160px,16.6667vw,320px)]">
        <div ref={trackRef} className="flex h-full w-max will-change-transform">
          {Array.from({ length: COPIES }, (_, copy) => (
            <ul
              key={copy}
              data-marquee-list
              // Only the first list is for assistive technology; the others are copies for the loop.
              {...(copy > 0 ? { "aria-hidden": true, inert: true } : {})}
              className="flex h-full shrink-0"
            >
              {images.map((image) => (
                <li key={image.id} className="relative size-(--tile) shrink-0">
                  <Photo
                    ready={photosReady}
                    src={image.src}
                    alt={copy === 0 ? image.alt : ""}
                    fill
                    sizes="(min-width: 1920px) 320px, 17vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </Section>
  );
}
