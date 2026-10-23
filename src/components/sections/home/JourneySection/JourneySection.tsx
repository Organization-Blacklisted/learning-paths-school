"use client";

import { useRef } from "react";
import { useSceneTimeline } from "@/components/layouts/HorizontalScene";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import BodyText from "@/components/ui/BodyText";
import Photo from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import { registerGsap } from "@/lib/gsap";
import { useIdleReady } from "@/lib/useIdleReady";
import type { JourneyStage } from "@/types/home";
import type { JourneySectionProps } from "./JourneySection.types";

// Figma: "Frame 1618876734" (node 6547:5798), 1520 x 746px. A green pill "The 15-Year Journey", the heading
// "Our Learning Journey" with an intro paragraph on the right, and four columns (330px wide, 590px high), one per
// stage of schooling, in four blues. Each column: level, class range, a 171 x 343 photo and "The Path of ...".
// Content is 1320px wide, centred in the 1520px frame (100px margins).
//
// It is the third panel of the home page's <HorizontalScene>: the view keeps panning right from the Courage
// collage to this section.
//
// LAYOUT. From lg (1024px) the four columns sit in a row, exactly as in the design. The column height follows the
// screen height (590px, shrinking down to 520px on short screens) so the whole panel fits in the pinned scene.
// Below lg the design has no version, so this is my interpretation: two columns from md, one on a phone.
//
// ANIMATION (owner: a highly interactive homepage). Desktop: scroll-driven on the scene's timeline. The pill, heading
// and paragraph rise and fade in as they come into view, then each column in turn: its colour grows up from the
// bottom, its content rises in, and its photo settles from a slight zoom (1.15 to 1). Scrolling back reverses it.
// Below lg: the same, played once as each part scrolls into view. Reduced motion: no animation, all shown.
// Everything is only hidden by JS, so without it the section is fully visible.

const TONES: Record<JourneyStage["tone"], { bg: string; text: string }> = {
  mist: { bg: "bg-brand-mist", text: "text-brand-navy" },
  steel: { bg: "bg-brand-steel-dark", text: "text-brand-navy" },
  slate: { bg: "bg-brand-slate", text: "text-white" },
  blue: { bg: "bg-brand-blue", text: "text-white" },
};

const COLUMN_SELECTOR = "[data-col]";
// The last animation of the scene ends here (0 to 1 over the whole pan).
const LAST_END = 0.94;

export default function JourneySection({ content }: JourneySectionProps) {
  const { label, badge, titleLead, titleAccent, intro, stages } = content;
  const rootRef = useRef<HTMLElement>(null);
  // The photos are requested once the page has loaded and the browser is idle (see useIdleReady); each box keeps its size.
  const photosReady = useIdleReady(800, rootRef);

  // Desktop: ride the sideways scroll. Each part starts as it comes into view from the right edge of the screen.
  useSceneTimeline((tl, { stageWidth, distance, progressAt }) => {
    const { gsap } = registerGsap();
    const root = rootRef.current;
    if (!root) return;

    const heads = gsap.utils.toArray<HTMLElement>("[data-head]", root);
    const cols = gsap.utils.toArray<HTMLElement>(COLUMN_SELECTOR, root);
    // Where each part starts (measured before anything is moved), and how long a part takes (in scene progress):
    // a column takes about 60% of its own width of scroll.
    const headStarts = heads.map((el) => progressAt(el, 0, stageWidth));
    const colStarts = cols.map((el) => progressAt(el, 0, stageWidth));
    const colLength = Math.max(0.03, (cols[0].offsetWidth * 0.6) / distance);
    const headLength = colLength * 0.8;

    // Keep every tween inside the scene's 0 to 1 (a tween past 1 would lengthen the timeline and slow the pan), and finished
    // a little before the end so the last column can be looked at before the pan stops.
    const place = (start: number, length: number) => Math.min(LAST_END - length, Math.max(0, start));

    heads.forEach((el, i) => {
      gsap.set(el, { autoAlpha: 0, y: 24 });
      tl.to(el, { autoAlpha: 1, y: 0, duration: headLength, ease: "power2.out" }, place(headStarts[i] + i * 0.004, headLength * 1.1));
    });

    cols.forEach((col, i) => {
      const bg = col.querySelector<HTMLElement>("[data-col-bg]");
      const content = col.querySelector<HTMLElement>("[data-col-content]");
      const photo = col.querySelector<HTMLElement>("[data-col-photo]");
      if (!bg || !content || !photo) return;
      gsap.set(bg, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(content, { autoAlpha: 0, y: 40 });
      gsap.set(photo, { scale: 1.15 });
      const start = place(colStarts[i], colLength * 1.3);
      tl.to(bg, { clipPath: "inset(0% 0% 0% 0%)", duration: colLength, ease: "power2.out" }, start);
      tl.to(content, { autoAlpha: 1, y: 0, duration: colLength, ease: "power2.out" }, start + colLength * 0.3);
      tl.to(photo, { scale: 1, duration: colLength, ease: "power2.out" }, start + colLength * 0.3);
    });
  });

  return (
    <section ref={rootRef} aria-label={label}>
      <div className="mx-auto max-w-[1320px]">
        {/* The pill is 2px in from the content edge in the design. */}
        <Badge data-head className="ml-[2px]">
          {badge}
        </Badge>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Grey "Our Learning" (Lexend Regular) and the blue skewed "Journey" (Lexend Medium), as in the design.
              The 51.5px box is the Figma group: 48px line plus the 4px the italic word sits lower. */}
          <SectionTitle data-head className="relative tracking-normal whitespace-nowrap capitalize lg:h-[51.533px]">
            {titleLead} <Accent className="-ml-[0.118em] translate-y-[0.1em] tracking-[-0.01em]">{titleAccent}</Accent>
          </SectionTitle>
          <BodyText data-head className="tracking-[-0.01em] text-brand-navy/80 lg:w-[612px] lg:shrink">
            {intro}
          </BodyText>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[330fr_330fr_330fr_329fr]">
          {stages.map((stage) => {
            const tone = TONES[stage.tone];
            return (
              <div
                key={stage.id}
                data-col
                className={`relative flex items-center justify-center overflow-clip py-10 lg:h-[clamp(520px,calc(100svh-220px),590px)] lg:py-0 ${tone.text}`}
              >
                <div data-col-bg className={`absolute inset-0 ${tone.bg}`} />
                {/* 171px wide, centred (0.5px left of centre in the design). Its own `translate` does not clash with
                    GSAP's transform. */}
                <div data-col-content className="relative flex w-[171px] -translate-x-[0.5px] flex-col items-center gap-[14px]">
                  <div className="flex flex-col items-center gap-1">
                    <p className="font-body text-px-20 leading-[normal] font-medium tracking-[0.02em] whitespace-nowrap capitalize">
                      {stage.level}
                    </p>
                    <p className="font-body text-px-14 leading-[1.13] font-semibold whitespace-nowrap uppercase">{stage.range}</p>
                  </div>
                  <div className="flex w-full flex-col items-center gap-6">
                    <div className="relative h-[343px] w-full overflow-clip">
                      {/* data-col-photo is the box the animation zooms (it always exists, so the animation does not depend on
                          the photo having arrived). unoptimized: already cropped and compressed (AVIF); next/image would
                          re-encode it. The image itself is requested after the page has loaded (photosReady). */}
                      <div data-col-photo className="size-full">
                        <Photo
                          ready={photosReady}
                          src={stage.photo.src}
                          alt={stage.photo.alt}
                          width={342}
                          height={686}
                          className="size-full max-w-none object-cover"
                        />
                      </div>
                    </div>
                    <p
                      className="min-h-[43px] text-center text-[0px] leading-[0] font-semibold tracking-[-0.18px]"
                      style={{ width: stage.captionWidth }}
                    >
                      {stage.smallLastPrefixLetter ? (
                        <>
                          <span className="font-body text-px-14 leading-[1.2] tracking-[0.28em] uppercase">
                            {stage.pathPrefix.slice(0, -1)}
                          </span>
                          <span className="font-body text-px-12 leading-[1.2] tracking-[0.28em] uppercase">
                            {stage.pathPrefix.slice(-1)}{" "}
                          </span>
                        </>
                      ) : (
                        <span className="font-body text-px-14 leading-[1.2] tracking-[0.28em] uppercase">{stage.pathPrefix} </span>
                      )}
                      <span className="font-body text-px-20 leading-[1.2] font-medium">{stage.path}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
