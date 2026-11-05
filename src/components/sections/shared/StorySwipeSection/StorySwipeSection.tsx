"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Accent from "@/components/ui/Accent";
import SectionTitle from "@/components/ui/SectionTitle";
import { registerGsap } from "@/lib/gsap";
import { DESKTOP, MOTION_OK } from "@/lib/motion";
import type { StorySwipeSectionProps } from "./StorySwipeSection.types";

// The reusable story swipe section: a heading and slides of a photo and a story along a timeline. From lg the section is PINNED while the page scrolls: the stage stays
// where it is and the content changes: the photo and the story of the next period take the place of the last one, the green part of the timeline grows a step further with
// each slide, then the pin is released and the page goes on. Figma "Group 251" (node 6855:592) of the Welcome to LPS page: a white band 798px high (120px of room above and below), the heading
// "A Story That Keeps Growing" and the first slide (photo 840 x 450, 54px, the story column with the timeline). The pinned change of slide is the owner's brief (2026-11-04, made precise on 2026-11-05): the
// design shows only the first slide. Any page can use it for a history or a process told in steps:
//
//   <StorySwipeSection content={welcomeToLps.story} />
//
// The content is `StorySwipeContent` (src/types/story-swipe.ts), from a page's data file or the CMS (the fields are in src/globals/WelcomeToLps.ts).
//
// LAYOUT, from lg (1024px), the design at 1920px: the slide starts at the left edge of the 1520px container and runs to the right edge of the SCREEN (the design's text
// column and its timeline go out of the frame at the right): the photo is 840px (55.26% of the container), 54px from the story column, the bottom edges level.
// In the column: the timeline (a thin grey line with a green part, a round marker 10px in, 25px wide), under it the period in green (40px Lexend Medium, 50px from
// the top of the timeline) and, 107px under that, the story (18px, navy at 80%, at most 760px wide, a 66px margin on its right). The green part of a slide's line is
// its step of the whole story: 1 of 3 (285px of 848px in the design) for the first of three slides. Everything scales with the container (--content), like the
// other designed blocks. The heading is centred over the slide (the design centres it in its 1742px frame, 11px right of the screen's centre), not over the page.
// MODES (CSS decides, JS only adds the pin and the change of slide): lg and above with motion allowed: the slides lie on top of each other in one place (a grid cell, the
// cell as high as the tallest slide) and the pin holds that place; lg and above with REDUCED MOTION: the slides are stacked one under the other, no pin; below lg (my
// interpretation, only desktop is designed): a row you swipe sideways (snapping to the slides, 86% of the screen wide at most, like the news cards), the row a tab stop
// while it scrolls. A pinned stage taller than the phone would not fit.
//
// SHORT SCREENS (mine): a pinned stage has to fit the screen, and a long story in the narrow column of a laptop (1024x768, 1280x720) ran 80-100px under it. On a screen
// from lg that is 860px high or less (the `short:` variant, globals.css) the padding, the heading's gap, the gap above the story and the story's line height are smaller.
//
// ANIMATION (the owner's brief, 2026-11-05: "the section is fixed, only the content and the images change and the progress bar's active state moves"), scrubbed by the
// scroll while pinned: nothing moves sideways. For each step the green part of the timeline grows to the next step (the first slide's line is the one that shows), the
// story of the period (the period and the text) goes up and fades, the next photo fades in over the last one while it settles from a slight zoom, and the next story
// comes in from below. One step takes 90% of the screen's height of scrolling. Scrolling back reverses it. In the pinned layout the photos' bottom edges are level at the
// bottom of the tallest slide and the stories start at the same place (the first slide's timeline), so a shorter story ends higher up. Only the later slides are hidden
// (by CSS, until GSAP shows them in turn).

const DESIGN_CONTENT = 1520;

export default function StorySwipeSection({ content, className = "" }: StorySwipeSectionProps) {
  const { label, titleLead, titleAccent, slides } = content;
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  // Below lg the row is a scrollable region: a tab stop only while it really scrolls, so a keyboard user can move it with the arrow keys.
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const query = window.matchMedia(DESKTOP);
    const measure = () => setScrolls(!query.matches && viewport.scrollWidth > viewport.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    query.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", measure);
    };
  }, []);

  // The pin and the change of slide: from lg, with motion allowed. The stage stays where it is: the slides lie on top of each other and, as the page scrolls, the photo
  // and the story of the next period take the place of the last one while the green part of the timeline grows to the next step.
  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track || slides.length < 2) return;
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-slide]", track);
      const steps = items.length - 1;
      const scrollPerSlide = () => window.innerHeight * 0.9;
      const parts = (slide: HTMLElement) => ({
        photo: slide.querySelector<HTMLElement>("[data-slide-photo]"),
        image: slide.querySelector<HTMLElement>("[data-slide-photo] img"),
        words: [...slide.querySelectorAll<HTMLElement>("[data-slide-period], [data-slide-body]")],
      });
      // The one timeline that shows is the first slide's: its green part grows (the other slides' lines are hidden by CSS).
      const fill = items[0].querySelector<HTMLElement>("[data-slide-fill]");

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          // A stage shorter than the screen is held in the middle of it; a taller one at the top.
          start: () => (stage.offsetHeight < window.innerHeight ? "center center" : "top top"),
          end: () => `+=${scrollPerSlide() * steps}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const span = 1 / steps;
      for (let index = 0; index < steps; index += 1) {
        const at = index * span;
        const now = parts(items[index]);
        const next = parts(items[index + 1]);
        // the green part of the line grows from this step to the next (it is one third of the line for the first of three slides)
        if (fill) timeline.to(fill, { scaleX: index + 2, duration: span }, at);
        // the story of this period leaves (up and fading), the next one comes in (from below, fading) over the second half of the step
        timeline.to(now.words, { autoAlpha: 0, y: -18, duration: span * 0.35 }, at);
        timeline.fromTo(next.words, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: span * 0.35 }, at + span * 0.5);
        // the next photo fades in over this one and settles from a slight zoom; this one is switched off when the next is all there
        if (next.photo) timeline.fromTo(next.photo, { autoAlpha: 0 }, { autoAlpha: 1, duration: span * 0.5 }, at);
        if (next.image) timeline.fromTo(next.image, { scale: 1.1 }, { scale: 1, duration: span }, at);
        if (now.photo) timeline.to(now.photo, { autoAlpha: 0, duration: 0.001 }, at + span * 0.5);
      }
    });
    return () => mm.revert();
  }, [slides.length]);

  const stageVars = {
    // The container's own width (what <Container> gives the content): at most 1520px, a gutter of the page on each side.
    "--content": `min(${DESIGN_CONTENT}px, calc(100cqw - 2 * var(--spacing-gutter)))`,
    // Where the first slide starts (the container's left edge) and how wide a slide is (to the right edge of the screen).
    "--left": "calc((100cqw - var(--content)) / 2)",
    "--slide-w": "calc(100cqw - var(--left))",
    "--img-w": `calc(840 * var(--content) / ${DESIGN_CONTENT})`,
    "--slide-gap": `calc(54 * var(--content) / ${DESIGN_CONTENT})`,
  } as CSSProperties;

  return (
    <section aria-label={label} className={`@container bg-white ${className}`}>
      <div ref={stageRef} className="py-[clamp(48px,6.25vw,120px)] motion-safe:short:py-6" style={stageVars}>
        <SectionTitle className="mx-auto px-gutter text-center capitalize motion-safe:lg:mx-0 motion-safe:lg:ml-(--left) motion-safe:lg:w-(--slide-w) motion-safe:lg:px-0">
          {titleLead} <Accent className="tracking-[-0.01em]">{titleAccent}</Accent>
        </SectionTitle>

        <div
          ref={viewportRef}
          {...(scrolls ? { tabIndex: 0, role: "group", "aria-label": `${label}, swipe sideways` } : {})}
          className="mt-[clamp(32px,3.125vw,60px)] motion-safe:short:mt-5 snap-x snap-mandatory scroll-px-gutter overflow-x-auto [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue lg:snap-none lg:overflow-clip [&::-webkit-scrollbar]:hidden"
        >
          <ul
            ref={trackRef}
            className="flex w-max gap-4 px-gutter lg:w-auto lg:flex-col lg:gap-[clamp(64px,6.25vw,120px)] lg:pr-(--left) lg:pl-(--left) motion-safe:lg:grid motion-safe:lg:w-auto motion-safe:lg:gap-0 motion-safe:lg:pr-0"
          >
            {slides.map((slide, index) => {
              const share = ((index + 1) / slides.length) * 100;
              // Pinned (from lg with motion), the slides lie on top of each other and only the first shows at the start: GSAP shows the others in turn.
              const later = index > 0 ? "motion-safe:lg:invisible" : "";
              return (
                <li
                  key={`${slide.period}-${index}`}
                  data-slide
                  className="w-[min(86vw,560px)] shrink-0 snap-start lg:w-full motion-safe:lg:col-start-1 motion-safe:lg:row-start-1 motion-safe:lg:flex motion-safe:lg:w-(--slide-w)"
                >
                  <div className="grid gap-6 lg:grid-cols-[var(--img-w)_1fr] lg:items-end lg:gap-x-(--slide-gap) motion-safe:lg:min-w-0 motion-safe:lg:flex-1 motion-safe:lg:items-start">
                    <div
                      data-slide-photo
                      className={`relative aspect-[840/450] w-full overflow-hidden bg-brand-mist motion-safe:lg:self-end ${later}`}
                    >
                      <Image
                        src={slide.image.src}
                        alt={slide.image.alt}
                        fill
                        sizes="(min-width: 1520px) 840px, (min-width: 1024px) 55vw, 86vw"
                        unoptimized
                        draggable={false}
                        className="object-cover select-none"
                      />
                    </div>

                    <div
                      data-slide-text
                      className="flex min-w-0 flex-col gap-[clamp(24px,5.5729vw,107px)] motion-safe:lg:self-start motion-safe:short:gap-6"
                    >
                      {/* The timeline: a grey line to the edge, the green step of the story over it, a round marker and the period */}
                      <div className="relative h-[98px]">
                        <span aria-hidden="true" className={`absolute inset-x-0 top-[11px] h-[2px] bg-brand-fog/40 ${later}`} />
                        <span
                          aria-hidden="true"
                          data-slide-fill
                          className={`absolute top-[11px] left-0 h-[2px] origin-left bg-brand-green ${later}`}
                          style={{ width: `${share}%` }}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute top-0 left-[10px] size-[25px] rounded-full border border-brand-green bg-white after:absolute after:inset-[5px] after:rounded-full after:bg-brand-green ${later}`}
                        />
                        <h3
                          data-slide-period
                          className={`absolute top-[50px] left-[10px] font-heading text-h2 leading-[1.2] font-medium tracking-[-0.01em] whitespace-nowrap text-brand-green ${later}`}
                        >
                          {slide.period}
                        </h3>
                      </div>
                      <p
                        data-slide-body
                        className={`font-body text-body-lg leading-[1.5] tracking-[-0.01em] whitespace-pre-line text-brand-navy/80 motion-safe:short:leading-[1.4] lg:max-w-[760px] lg:pr-[3.4375vw] ${later}`}
                      >
                        {slide.text}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
