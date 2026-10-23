"use client";

import { useEffect, useRef, type RefObject } from "react";
import { registerGsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

type RevealContext = {
  gsap: typeof import("gsap").default;
  /** The section's own element (the one `rootRef` points to). */
  root: HTMLElement;
  /** The elements inside `scope` (default: the section) that match a selector, as an array. */
  q: (selector: string, scope?: ParentNode) => HTMLElement[];
};

type RevealOptions = {
  /** Only reveal when this media query matches (default: no "reduce motion"). Use PHONE_MOTION for a phone-only entrance. */
  media?: string;
  /** ScrollTrigger start, "<element edge> <screen edge>". Default "top 75%": when the section's top is 75% down the screen. */
  start?: string;
};

/**
 * The one-off entrance of a section: it plays once, when the section scrolls into view.
 *
 *   const rootRef = useRef<HTMLDivElement>(null);
 *   useScrollReveal(rootRef, ({ gsap, q }) => {
 *     const heads = q("[data-news-intro]");
 *     gsap.set(heads, { autoAlpha: 0, y: 24 });                         // the hidden state, set by JS only
 *     return gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
 *       .to(heads, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0);   // return the PAUSED timeline
 *   });
 *
 * The hook takes care of everything around it: the media query (no entrance with reduced motion, so everything just shows), the
 * ScrollTrigger that plays the timeline once, and the clean-up. Elements are hidden only by JS, so without it (or before it runs) the
 * section is fully visible. `build` may close over props; it always runs with the latest version, but it is only called when the effect
 * (re)starts, so do not rely on reading changing state inside it.
 */
export function useScrollReveal(
  rootRef: RefObject<HTMLElement | null>,
  build: (context: RevealContext) => gsap.core.Timeline | void,
  { media = MOTION_OK, start = "top 75%" }: RevealOptions = {},
) {
  const buildRef = useRef(build);
  useEffect(() => {
    buildRef.current = build;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(media, () => {
      const q = (selector: string, scope: ParentNode = root) => gsap.utils.toArray<HTMLElement>(selector, scope);
      const timeline = buildRef.current({ gsap, root, q });
      if (!timeline) return;
      ScrollTrigger.create({ trigger: root, start, once: true, onEnter: () => timeline.play() });
    });
    return () => mm.revert();
  }, [rootRef, media, start]);
}
