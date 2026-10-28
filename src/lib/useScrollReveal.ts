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

type PlayOptions = {
  /** ScrollTrigger start, "<element edge> <screen edge>". Default "top 75%": when the section's top is 75% down the screen. */
  start?: string;
  /** Play again every time the section comes back into view (default true). false: play once, ever. */
  replay?: boolean;
};

type RevealOptions = PlayOptions & {
  /** Only reveal when this media query matches (default: no "reduce motion"). Use PHONE_MOTION for a phone-only entrance. */
  media?: string;
};

/** The length of every replay: the same animation as the first time, only quicker (never slower than the original). */
export const REPLAY_SECONDS = 0.8;

/**
 * Plays a section's PAUSED entrance timeline when the section scrolls into view, and, unless `replay` is false, again each time it comes
 * back into view (owner, 2026-10-28):
 *  - the FIRST time it plays in full, as designed;
 *  - after that it plays the same timeline at a higher speed, about REPLAY_SECONDS long, so scrolling up and down does not make the
 *    visitor wait for the whole sequence every time;
 *  - the section is put back to its hidden start state ONLY when NOTHING of it can be seen on the screen, never while any part of it is
 *    visible, so nothing ever vanishes in front of the visitor. "Can be seen" is decided by an IntersectionObserver, that is by where the
 *    element REALLY is: a panel of a pinned sideways scene stays on the screen for the whole pan and then slides out SIDEWAYS, which the
 *    scroll position alone cannot tell (the first version used scroll positions and hid the first panel of each scene while it was still
 *    sliding out);
 *  - it plays when the section's top reaches `start` while scrolling down, and it plays again as soon as the element becomes visible again
 *    after it was hidden (from above, from below, or sliding back in from the side).
 * The timeline's own speed (its `timeScale`) at the time of the call is the "full" speed. Returns a function that stops watching (call it
 * when the section goes away); the ScrollTrigger is cleaned up by GSAP's own context or matchMedia.
 */
export function playOnScroll(
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger,
  trigger: Element,
  timeline: gsap.core.Timeline,
  { start = "top 75%", replay = true }: PlayOptions = {},
): () => void {
  const fullSpeed = timeline.timeScale();
  // On from the moment the entrance starts until nothing of the section can be seen any more.
  let shown = false;
  let first = true;

  const play = () => {
    if (shown) return;
    shown = true;
    timeline.timeScale(first ? fullSpeed : Math.max(fullSpeed, timeline.duration() / REPLAY_SECONDS));
    first = false;
    timeline.restart();
  };
  const reset = () => {
    if (!shown) return;
    shown = false;
    timeline.pause(0);
  };

  ScrollTrigger.create({ trigger, start, once: !replay, onEnter: play });
  if (!replay || typeof IntersectionObserver === "undefined") return () => {};

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) reset();
    // Visible again after it was hidden. (Before the very first play this is just the page loading with the section already in view:
    // the ScrollTrigger above plays it, in full.)
    else if (!first) play();
  });
  observer.observe(trigger);
  return () => observer.disconnect();
}

/**
 * The entrance of a section: it plays when the section scrolls into view, in full the first time and as a quick replay each time it comes
 * back into view later (see `playOnScroll`; pass `replay: false` for a one-off).
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
 * ScrollTriggers that play the timeline, and the clean-up. Elements are hidden only by JS, so without it (or before it runs) the
 * section is fully visible. `build` may close over props; it always runs with the latest version, but it is only called when the effect
 * (re)starts, so do not rely on reading changing state inside it. The hidden start state is the state the timeline's tweens start from,
 * so build it with `gsap.set` BEFORE creating the timeline (a replay rewinds the timeline to exactly that state).
 */
export function useScrollReveal(
  rootRef: RefObject<HTMLElement | null>,
  build: (context: RevealContext) => gsap.core.Timeline | void,
  { media = MOTION_OK, start = "top 75%", replay = true }: RevealOptions = {},
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
      // matchMedia calls the function we return when the query stops matching or the section goes away
      return playOnScroll(ScrollTrigger, root, timeline, { start, replay });
    });
    return () => mm.revert();
  }, [rootRef, media, start, replay]);
}
