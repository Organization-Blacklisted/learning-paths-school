"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import type { VisionMissionValuesSectionProps } from "./VisionMissionValuesSection.types";

// Figma: "Frame 1618876728" (node 6507:183), a 715px centred column. A shield with a short line,
// then Our Vision, Our Mission and Our Values with a 33px connector line between them.
//
// A panel of the home page's <HorizontalScene> (the container, spacing and the sideways movement come from there).
//
// STAGGERED REVEAL (owner's change, replaces the first pinned and scrubbed version): the section is not pinned
// and scroll does not drive it. When the column comes into view, one timeline plays once on its own: the shield
// appears and its line draws, then Our Vision, the connector, Our Mission, the connector and Our Values follow
// one after another, each overlapping the one before. Only opacity, transform and clip-path are animated, so the
// layout (and the 715 x 685.6 Figma frame) never changes. With prefers-reduced-motion everything is simply shown.
//
// The connector lines are CSS (1px wide, 33px tall, brand blue at 40%): the Figma export is a plain line.
// The shield file already contains its own short line below the shield, so that line is "drawn" by revealing
// the SVG with a clip-path instead of changing the asset.

// How much of the shield SVG (55.8 x 86) is the shield itself: it is 34px tall, the line starts at 54px.
const SHIELD_ONLY_CLIP = "inset(0 0 58% 0)";
// The reveal plays this many times faster than the durations below (they add up to about 2.8 s; at 1.8 it takes about 1.6 s).
const REVEAL_SPEED = 1.8;

export default function VisionMissionValuesSection({ content }: VisionMissionValuesSectionProps) {
  const { label, shield, items } = content;
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const column = columnRef.current;
    if (!column || prefersReducedMotion()) return;

    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      const shieldImg = column.querySelector<HTMLElement>("[data-shield]");
      const blocks = gsap.utils.toArray<HTMLElement>("[data-block]", column);
      const connectors = gsap.utils.toArray<HTMLElement>("[data-connector]", column);
      if (!shieldImg) return;

      // force3D + will-change keep the moving parts on their own GPU layer for the whole reveal. Without it the
      // text is repainted on the main thread and drawn on whole pixels while it rises (it steps and shimmers), and
      // GSAP's default drops back to a 2D transform at the end, which makes the text snap by a pixel.
      gsap.set(shieldImg, { clipPath: SHIELD_ONLY_CLIP, willChange: "clip-path" });
      gsap.set(blocks, { autoAlpha: 0, y: 24, force3D: true, willChange: "transform, opacity" });
      gsap.set(connectors, { scaleY: 0, transformOrigin: "top center", force3D: true, willChange: "transform" });

      // Plays once when the top of the column reaches 75% of the screen height.
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out", force3D: true },
        onComplete: () => gsap.set([shieldImg, ...blocks, ...connectors], { willChange: "auto" }),
      });
      tl.to(shieldImg, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power2.inOut" })
        .to(blocks[0], { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.3")
        .to(connectors[0], { scaleY: 1, duration: 0.5, ease: "power1.inOut" }, "-=0.3")
        .to(blocks[1], { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.2")
        .to(connectors[1], { scaleY: 1, duration: 0.5, ease: "power1.inOut" }, "-=0.3")
        .to(blocks[2], { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.2");
      tl.timeScale(REVEAL_SPEED);

      const trigger = ScrollTrigger.create({
        trigger: column,
        start: "top 75%",
        once: true,
        onEnter: () => tl.play(),
      });
      // Page reloaded below the section: nothing to wait for, show it finished.
      if (trigger.progress === 1) tl.progress(1);
    }, column);

    return () => ctx.revert();
  }, []);

  return (
    <section aria-label={label}>
      <div ref={columnRef} className="mx-auto flex max-w-[715px] flex-col items-center gap-[37px]">
        {/* The SVG's own size is 55.8156 x 86 (shield 28 x 34 at the top, then the line) */}
        <Image
          data-shield
          src={shield.src}
          alt=""
          width={shield.width}
          height={shield.height}
          className="h-[86px] w-[55.8156px] max-w-none"
        />

        <div className="flex w-full flex-col items-center gap-6">
          {items.map((item, i) => (
            <div key={item.id} className="flex w-full flex-col items-center gap-6">
              {/* -translate-x-[0.5px]: in Figma all three lines (the one inside the shield SVG and the two
                  connectors) sit half a pixel left of the column centre, so they render as the same soft 2px line.
                  (Tailwind's translate uses the separate `translate` property, so it does not clash with GSAP's scaleY.) */}
              {i > 0 && <span aria-hidden="true" data-connector className="h-[33px] w-px -translate-x-[0.5px] bg-brand-blue/40" />}
              <div data-block className="flex w-full flex-col items-center gap-[14px]">
                {/* skewX(-8deg) + scaleY(0.99): the italic look from the design (the font has no italic).
                    The wrapper is the 47.53px box Figma measures (40px x 1.2 x 0.99), so the layout heights add up. */}
                <div className="flex h-[47.533px] w-full items-center justify-center">
                  <h2 className="font-heading text-h2 font-normal tracking-[-0.01em] whitespace-nowrap text-brand-blue [transform:skewX(-8deg)_scaleY(0.99)]">
                    {item.title}
                  </h2>
                </div>
                <p
                  className="w-full text-center font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-graphite"
                  style={{ maxWidth: item.textWidth }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
