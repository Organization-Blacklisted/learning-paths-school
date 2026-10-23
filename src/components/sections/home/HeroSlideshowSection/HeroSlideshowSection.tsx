"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Container, { CONTAINER_WIDTH } from "@/components/layouts/Container";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useIdleReady } from "@/lib/useIdleReady";
import { scrollToY } from "@/lib/scroll";
import type { HeroSlide } from "@/types/home";
import type { HeroSlideshowSectionProps } from "./HeroSlideshowSection.types";

// Homepage hero. Figma: component "Component 2" (node 6282:929), three variants.
//
// SCROLL-CONTROLLED (like the ESPN feature the owner referenced):
//  - The hero is pinned to the screen. Scrolling moves a "progress" value from slide 1 to slide 3
//    (one screen of scroll per slide). That one value drives everything: the image track slides, the texts
//    cross-dissolve and the pagination pill glides. After slide 3 the hero is released and the page moves on.
//  - On landing it autoplays (3.5s per slide, 0.4s change, from the Figma prototype). Autoplay is done by
//    scrolling the page to the next slide's position, so scroll position stays the single source of truth.
//    The first time the user scrolls, touches or presses a navigation key, autoplay stops; it comes back
//    only if they return to the top and leave it idle.
//  - With prefers-reduced-motion nothing is pinned and nothing autoplays: slide 1 shows and the dots switch slides.
//
// Why not Embla (used in the previous version): Embla is a drag/swipe carousel; it cannot be driven by the
// scroll position. Embla stays installed for ordinary carousels.

const DOT = { active: 56, inactive: 12 }; // px, from the Figma pagination
const DOT_COLOR = { active: "#ffffff", inactive: "#464949" };
const IDLE_BEFORE_RESUME = 5; // seconds at the top of the page before autoplay comes back

// Static class strings (Tailwind needs them whole). Positions are Figma values at 1920x993:
// compact = first slide, large = the other two. Below md the block sits higher to clear the dots.
const scaleClasses: Record<HeroSlide["scale"], { block: string; title: string; lead: string; quote: string; gap: string }> = {
  compact: {
    block: "bottom-24 md:bottom-[58.2px]",
    title: "text-hero-72",
    lead: "text-hero-28",
    quote: "text-hero-64",
    gap: "mt-1 md:mt-0",
  },
  large: {
    block: "bottom-24 md:bottom-[49.3px]",
    title: "text-hero-80",
    lead: "text-hero-32",
    quote: "text-hero-72",
    gap: "mt-1 md:mt-[9px]",
  },
};

const titleShadow = "text-shadow-[0_4.623px_50.851px_#000]";
const leadShadow = "text-shadow-[0_1.978px_21.762px_#000,0_4.623px_50.851px_#000]";
const NAV_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];

export default function HeroSlideshowSection({ content }: HeroSlideshowSectionProps) {
  const { slides, slideSeconds, transitionSeconds, label } = content;
  const count = slides.length;

  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const goToRef = useRef<(index: number) => void>(() => {});
  const armRef = useRef<() => void>(() => {});
  const [selected, setSelected] = useState(0);
  // Slides 2 and 3 are only requested once the page has loaded and the browser is idle (see useIdleReady): on a slow
  // connection they otherwise delay slide 1, the first thing the visitor sees. Autoplay waits until they are loaded.
  const restReady = useIdleReady();

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const { gsap, ScrollTrigger } = registerGsap();
    const reduced = prefersReducedMotion();
    const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
    const dots = dotRefs.current.filter(Boolean) as HTMLButtonElement[];
    let shown = 0;

    // Draw the hero for a progress value p, from 0 (slide 1) to count - 1 (last slide). Fractions are in-between.
    const render = (p: number) => {
      gsap.set(track, { xPercent: -(100 / count) * p });
      // Each text is visible only within half a slide of its own slide, so the outgoing text is gone before
      // the next appears. A plain cross-dissolve (both at 50%) overlaps into unreadable text when the user
      // stops scrolling half way between two slides.
      texts.forEach((el, i) => gsap.set(el, { autoAlpha: Math.max(0, 1 - Math.abs(p - i) * 2) }));
      dots.forEach((dot, i) => {
        const w = Math.max(0, 1 - Math.abs(p - i)); // 1 on the active dot, fading to 0 one slide away
        gsap.set(dot, {
          width: DOT.inactive + (DOT.active - DOT.inactive) * w,
          height: DOT.inactive - (DOT.inactive - 8) * w,
          backgroundColor: gsap.utils.interpolate(DOT_COLOR.inactive, DOT_COLOR.active, w),
        });
      });
      const index = Math.round(p);
      if (index !== shown) {
        shown = index;
        setSelected(index);
      }
    };

    // Pin the hero and map one screen of scroll to each slide change.
    const trigger = reduced
      ? undefined
      : ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: () => `+=${(count - 1) * window.innerHeight}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress * (count - 1)),
          onRefresh: (self) => render(self.progress * (count - 1)),
        });
    render(trigger ? trigger.progress * (count - 1) : 0);

    const goTo = (index: number) => {
      if (!trigger) {
        render(index);
        return;
      }
      scrollToY(trigger.start + (trigger.end - trigger.start) * (index / (count - 1)), transitionSeconds);
    };
    goToRef.current = goTo;

    // Autoplay = scrolling to the next slide's position.
    let userScrolled = window.scrollY > 4; // reloaded half way down the page: do not autoplay
    let timer: gsap.core.Tween | undefined;
    let resume: gsap.core.Tween | undefined;
    const stopTimer = () => {
      timer?.kill();
      timer = undefined;
    };
    const arm = () => {
      stopTimer();
      if (reduced || userScrolled) return;
      timer = gsap.delayedCall(slideSeconds, () => {
        // Do not slide to a photo that has not arrived yet (it would be a blank slide): try again a slide-time later.
        const next = (shown + 1) % count;
        const nextImage = root.querySelectorAll<HTMLImageElement>("[data-slide-image]")[next];
        if (nextImage?.complete && nextImage.naturalWidth > 0) goTo(next);
        arm();
      });
    };
    const maybeResume = () => {
      if (window.scrollY < 2) {
        userScrolled = false;
        arm();
      } else {
        resume = gsap.delayedCall(IDLE_BEFORE_RESUME, maybeResume);
      }
    };
    const onUser = () => {
      userScrolled = true;
      stopTimer();
      resume?.kill();
      resume = gsap.delayedCall(IDLE_BEFORE_RESUME, maybeResume);
    };
    const onKey = (e: KeyboardEvent) => {
      if (NAV_KEYS.includes(e.key)) onUser();
    };
    window.addEventListener("wheel", onUser, { passive: true });
    window.addEventListener("touchmove", onUser, { passive: true });
    window.addEventListener("keydown", onKey);
    armRef.current = arm;
    arm();

    return () => {
      stopTimer();
      resume?.kill();
      window.removeEventListener("wheel", onUser);
      window.removeEventListener("touchmove", onUser);
      window.removeEventListener("keydown", onKey);
      trigger?.kill();
      gsap.killTweensOf([track, ...texts, ...dots]);
    };
  }, [count, slideSeconds, transitionSeconds]);

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={label}
      className="relative h-svh min-h-[600px] overflow-hidden bg-brand-navy"
    >
      {/* Image track: slides side by side, moved sideways by the scroll progress */}
      <div ref={trackRef} className="absolute inset-0 flex h-full" style={{ width: `${count * 100}%` }}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="relative h-full grow basis-0"
          >
            {(i === 0 || restReady) && (
              <Image
                data-slide-image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                sizes="100vw"
                // Slide 1 is the LCP image (preloaded). Slides 2 and 3 are rendered after the page has loaded (restReady
                // above), eagerly: they are off screen on the track, so lazy loading would show a blank slide at the first change.
                priority={i === 0}
                loading={i === 0 ? undefined : "eager"}
                // Served exactly as the file in /public. The files are already compressed once (AVIF q92,
                // about 47 dB). Letting next/image re-encode them would add a second lossy pass at its
                // default quality 75 and visibly soften them.
                unoptimized
                draggable={false}
                className="object-cover select-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* Text and pagination, on the 1740px content column (90px margins at 1920px) */}
      <div className="pointer-events-none absolute inset-0">
        <Container contentWidth={CONTAINER_WIDTH.wide} className="h-full">
          {/* Positioned wrapper inside the Container, so left/right/bottom are measured from the content edges, not the gutters */}
          <div className="relative h-full">
            {slides.map((slide, i) => {
              const s = scaleClasses[slide.scale];
              return (
                <div
                  key={slide.id}
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                  aria-hidden={selected !== i}
                  inert={selected !== i}
                  className={`absolute left-0 text-white ${s.block} ${i === 0 ? "" : "invisible opacity-0"}`}
                >
                  <p className={`font-heading font-semibold capitalize ${s.title} ${titleShadow}`}>{slide.title}</p>
                  <div className={`flex flex-wrap items-start gap-x-3 md:grid md:grid-cols-[81.97px_auto] md:gap-x-0 ${s.gap}`}>
                    <span className={`ml-[5px] font-heading font-semibold ${s.lead} ${leadShadow}`}>{slide.lead}</span>
                    <span
                      className={`block origin-top-left font-heading font-medium text-brand-amber [transform:matrix(1,0,-0.13917,0.99027,0,0)] ${s.quote} ${titleShadow}`}
                    >
                      {slide.quote}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="pointer-events-auto absolute right-0 bottom-8 flex items-center gap-[7px] md:bottom-[50px]">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  type="button"
                  aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                  aria-current={selected === i ? "true" : undefined}
                  onClick={(e) => {
                    goToRef.current(i);
                    armRef.current();
                    // A mouse click leaves focus on the dot; release it so only real keyboard focus holds on to it.
                    if (e.detail > 0) e.currentTarget.blur();
                  }}
                  className="relative shrink-0 rounded-full before:absolute before:-inset-2 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  style={
                    i === 0
                      ? { width: DOT.active, height: 8, backgroundColor: DOT_COLOR.active }
                      : { width: DOT.inactive, height: DOT.inactive, backgroundColor: DOT_COLOR.inactive }
                  }
                />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
