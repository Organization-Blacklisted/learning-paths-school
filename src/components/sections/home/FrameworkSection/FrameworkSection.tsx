"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import Section from "@/components/layouts/Section";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import BodyText from "@/components/ui/BodyText";
import Photo from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import { useIdleReady } from "@/lib/useIdleReady";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { FrameworkItem } from "@/types/home";
import type { FrameworkSectionProps } from "./FrameworkSection.types";

// Figma: "Frame 1618876729" (node 6529:1879). A green pill "The LPS 360 Framework", the heading "By the end of 15
// years at LPS, your child becomes a Pioneer", an intro paragraph, and a diagram (1319 x 773px; it was 1228 until the 2026-10-27 design, which widened it for the Resilient text): a ring with a photo
// of two students in the middle, and seven pills around it that spell PIONEER (Proficient, Inclusive, Open-minded,
// Novel, Enterprising, Ethical, Resilient), each joined to the ring by a short line and a dot, with a description.
//
// It comes after the sideways scene: when the Journey section is centred and the pan ends, the page continues down to this.
//
// LAYOUT. From lg (1024px) the diagram is positioned like the design and scales as one piece: `--u` is one Figma
// pixel (the diagram width / 1319, never more than 1px), and every size and position is `calc(N * var(--u))`, so
// text wraps exactly like the design at any width. Below lg the diagram would be too small to read, so (my
// interpretation, the design only exists for desktop) it becomes a list: the photo, then each pill with its description.
//
// ANIMATION (owner: a highly interactive homepage), played once when the section scrolls into view, about 2.5 seconds:
// the heading parts rise in, the ring grows in, the photo pops, then the seven pills fly in from their sides one after
// another (left pills from the left, right pills from the right, "Novel" from below) with their line drawing out and their
// dot popping, and each description rises in. Reduced motion: no animation, everything shown. Everything is only hidden by
// JS, so without it the section is fully visible.

const TONE_BG: Record<FrameworkItem["tone"], string> = { blue: "bg-brand-blue", deep: "bg-brand-blue-deep" };
const TONE_TEXT: Record<FrameworkItem["labelTone"], string> = {
  blue: "text-brand-blue",
  deep: "text-brand-blue-deep",
  night: "text-brand-blue-night",
};

/** N Figma pixels, in the current scale of the diagram. */
const u = (n: number) => `calc(${n} * var(--u))`;
/** Absolute position from lg up: the CSS variables are read by `lg:left-(--x) lg:top-(--y)`. */
const at = (x: number, y: number) => ({ "--x": u(x), "--y": u(y) }) as CSSProperties;

export default function FrameworkSection({ content }: FrameworkSectionProps) {
  const { label, badge, titleLead, titleAccent, intro, stage, ring, photo, centreLabel, items } = content;
  const rootRef = useRef<HTMLDivElement>(null);
  // The photo is requested once the page has loaded and the browser is idle (see useIdleReady); its box keeps its size.
  const photoReady = useIdleReady(800, rootRef);

  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const heads = q("[data-fw-head]");
      const ringEl = q("[data-fw-ring]");
      const photoEl = q("[data-fw-photo]");
      const centre = q("[data-fw-centre]");

      gsap.set(heads, { autoAlpha: 0, y: 24 });
      gsap.set(ringEl, { autoAlpha: 0, scale: 0.85, transformOrigin: "50% 50%" });
      gsap.set(photoEl, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
      gsap.set(centre, { autoAlpha: 0, y: -12 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.to(heads, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0)
        .to(ringEl, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.inOut" }, 0.35)
        .to(photoEl, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, 0.55)
        .to(centre, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.9);

      // The seven pills, one after another: each flies in, its line draws out, its dot pops, its description rises in.
      items.forEach((item, i) => {
        const at0 = 1.0 + i * 0.16;
        const pill = q(`[data-fw-pill="${item.id}"]`);
        const line = q(`[data-fw-line="${item.id}"]`);
        const dot = q(`[data-fw-dot="${item.id}"]`);
        const text = q(`[data-fw-text="${item.id}"]`);
        const side = item.id === "novel" ? { y: 36 } : { x: item.mirrored ? -48 : 48 };
        gsap.set(pill, { autoAlpha: 0, ...side });
        // The line draws out from the pill towards the ring (the pill is on its left for left pills, on its right for the others).
        gsap.set(line, { scaleX: 0, transformOrigin: item.mirrored ? "0% 50%" : "100% 50%" });
        gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(text, { autoAlpha: 0, y: 20 });
        tl.to(pill, { autoAlpha: 1, x: 0, y: 0, duration: 0.7 }, at0)
          .to(line, { scaleX: 1, duration: 0.4, ease: "power1.inOut" }, at0 + 0.35)
          .to(dot, { scale: 1, duration: 0.45, ease: "back.out(3)" }, at0 + 0.6)
          .to(text, { autoAlpha: 1, y: 0, duration: 0.6 }, at0 + 0.3);
      });

      return tl;
    },
    { start: "top 65%" },
  );

  return (
    <Section label={label}>
      <div ref={rootRef} className="@container flex flex-col items-center">
        {/* Header: pill, heading (grey + blue skewed, like "Our Learning Journey"), intro. 16px between them. */}
        <div className="flex w-full max-w-[1150px] flex-col items-center gap-4">
          <Badge data-fw-head>{badge}</Badge>
          {/* `capitalize`: the Figma heading is set in Title Case ("By The End Of 15 Years At LPS, Your Child Becomes A Pioneer"); the text itself stays as written. */}
          <SectionTitle data-fw-head className="pt-px text-center tracking-[-0.01em] text-balance capitalize xl:whitespace-nowrap">
            {titleLead} <Accent className="-ml-[0.068em] mr-[0.15em] -translate-y-px">{titleAccent}</Accent>
          </SectionTitle>
          <BodyText data-fw-head className="max-w-[842px] text-center whitespace-pre-wrap text-brand-graphite">
            {intro}
          </BodyText>
        </div>

        {/* The diagram. --u: one Figma pixel (1px below lg, where it is a list). Stage 1319 x 773 from lg up. */}
        <div className="mt-12 flex w-full flex-col items-center gap-6 [--u:1px] lg:relative lg:mt-[60px] lg:mx-auto lg:block lg:w-[min(100%,1319px)] lg:gap-0 lg:[--u:calc(min(100cqw,1319px)/1319)]">
          <div className="hidden lg:block" style={{ height: u(stage.height) }} aria-hidden="true" />

          {/* Ring (decorative) */}
          <Image
            data-fw-ring
            src={ring.src}
            alt=""
            width={ring.width}
            height={ring.height}
            unoptimized
            className="pointer-events-none hidden max-w-none lg:absolute lg:top-(--y) lg:left-(--x) lg:block lg:h-(--h) lg:w-(--w)"
            style={{ ...at(ring.x, ring.y), "--w": u(ring.width), "--h": u(ring.height) } as CSSProperties}
          />

          {/* "LPS 360" above the ring */}
          <p
            data-fw-centre
            className="text-center font-body text-px-20 leading-[1.2] font-bold tracking-[-0.01em] text-brand-blue lg:absolute lg:top-(--y) lg:left-(--x) lg:w-(--w) lg:text-(length:--fs)"
            style={{ ...at(centreLabel.x, centreLabel.y), "--w": u(centreLabel.width), "--fs": u(20) } as CSSProperties}
          >
            {centreLabel.text}
          </p>

          {/* Photo in the ellipse */}
          <div
            data-fw-photo
            className="aspect-[755/927] w-[min(260px,70%)] lg:absolute lg:top-(--y) lg:left-(--x) lg:aspect-auto lg:h-(--h) lg:w-(--w)"
            style={{ ...at(photo.x, photo.y), "--w": u(photo.width), "--h": u(photo.height) } as CSSProperties}
          >
            <Photo ready={photoReady} src={photo.src} alt={photo.alt} width={755} height={927} className="size-full max-w-none" />
          </div>

          {items.map((item) => (
            <div key={item.id} className="flex w-full flex-col items-center gap-3 lg:contents">
              {/* Line and dot (decorative, desktop only). The outer box only positions (and rotates, for the vertical line);
                  the inner one is what the animation scales, so the rotation is not disturbed. */}
              <div
                className="pointer-events-none hidden lg:absolute lg:top-(--y) lg:left-(--x) lg:block lg:h-(--h) lg:w-(--w)"
                style={
                  {
                    ...at(item.line.x, item.line.y),
                    "--w": u(item.line.width),
                    "--h": u(0.881),
                    ...(item.line.vertical ? { transform: "rotate(90deg)", transformOrigin: "0 0" } : {}),
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                <div data-fw-line={item.id} className="size-full">
                  <Image
                    src={item.line.src}
                    alt=""
                    width={item.line.width}
                    height={0.881}
                    unoptimized
                    className="block size-full max-w-none"
                  />
                </div>
              </div>
              <Image
                data-fw-dot={item.id}
                src={item.dot.src}
                alt=""
                width={12}
                height={12}
                unoptimized
                aria-hidden="true"
                className="pointer-events-none hidden max-w-none lg:absolute lg:top-(--y) lg:left-(--x) lg:block lg:size-(--s)"
                style={{ ...at(item.dot.x, item.dot.y), "--s": u(12) } as CSSProperties}
              />

              {/* The pill. Left pills are the right pill mirrored (the text is mirrored back). */}
              <div
                data-fw-pill={item.id}
                className="relative shrink-0 lg:absolute lg:top-(--y) lg:left-(--x)"
                style={{ ...at(item.pill.x, item.pill.y), width: u(item.pill.width), height: u(item.pill.height) }}
              >
                <div className={`absolute inset-0 ${item.mirrored ? "-scale-x-100" : ""}`}>
                  <div className={`absolute inset-0 ${TONE_BG[item.tone]}`} style={{ borderRadius: u(102) }} />
                  <Image
                    src="/images/home/framework/circle.svg"
                    alt=""
                    width={41}
                    height={41}
                    unoptimized
                    aria-hidden="true"
                    className="absolute max-w-none"
                    style={{ left: u(8.71), top: u(7.01), width: u(40.619), height: u(40.619) }}
                  />
                  <span
                    className={`absolute -translate-x-1/2 font-body font-bold leading-[1.2] tracking-[-0.01em] whitespace-nowrap text-white ${item.mirrored ? "-scale-x-100" : ""}`}
                    style={{ left: u(item.letterX), top: u(item.letterTop), fontSize: u(20) }}
                    aria-hidden="true"
                  >
                    {item.letter}
                  </span>
                  <div
                    className="absolute bg-white"
                    style={{
                      left: u(70.04),
                      top: u(7.01),
                      width: u(171.41),
                      height: u(40.619),
                      borderRadius: u(52.877),
                      boxShadow: `0 ${u(3.525)} ${u(7.932)} 0 rgba(0,0,0,0.19)`,
                    }}
                  />
                  <div className="absolute bg-white" style={{ left: u(47.32), top: u(26), width: u(31), height: u(2.644) }} />
                  <span
                    className={`absolute -translate-x-1/2 font-body font-bold leading-[1.2] tracking-[-0.01em] whitespace-nowrap ${TONE_TEXT[item.labelTone]} ${item.mirrored ? "-scale-x-100" : ""}`}
                    style={{ left: u(item.labelX), top: u(item.labelTop), fontSize: u(20) }}
                  >
                    {item.label}
                  </span>
                </div>
              </div>

              <p
                data-fw-text={item.id}
                className={`max-w-[420px] text-center font-body text-body-lg leading-[1.5] text-brand-graphite lg:absolute lg:top-(--y) lg:left-(--x) lg:w-(--w) lg:max-w-none lg:text-(length:--fs) ${
                  item.text.align === "right" ? "lg:text-right" : item.text.align === "left" ? "lg:text-left" : "lg:text-center"
                }`}
                style={{ ...at(item.text.x, item.text.y), "--w": u(item.text.width), "--fs": u(18) } as CSSProperties}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
