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
  /** Only reveal when this media query matches (default: no "reduce motion"). For example `${PHONE} and ${MOTION_OK}` (src/lib/motion.ts) for a phone-only entrance. */
  media?: string;
};

/** The length of every replay: the same animation as the first time, only quicker (never slower than the original). */
export const REPLAY_SECONDS = 0.8;

/** The elements a timeline animates, those of the timelines inside it included. */
function targetsOf(timeline: gsap.core.Timeline): HTMLElement[] {
  const found = new Set<HTMLElement>();
  for (const tween of timeline.getChildren(true, true, false)) {
    for (const target of tween.targets()) if (target instanceof HTMLElement) found.add(target);
  }
  return [...found];
}

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
 * SMOOTHNESS (owner, 2026-11-03: "whenever we show anything with a fade the animation shakes a little", the CTA band first): everything the entrance
 * animates gets `will-change: transform, opacity` when the entrance plays. Without it Chrome draws a moving element's text on WHOLE pixels: it rises in
 * steps of 2, 1, 1, 0, 1, 0 px (it stalls and shimmers) and snaps when it stops. Measured on the CTA heading, frame by frame (the position of its pixels in
 * the browser's own frames): whole-pixel steps and a final snap of 0.66px without it, smooth steps (2.08, 2.02, 1.87 ... 0.03, 0.01) with it.
 * `force3D` alone does NOT help (the same steps): it is the will-change that tells the browser the element is moving, so it may place it between pixels.
 *
 * It is NOT taken off when the entrance ends (the first version did, and the owner saw the CTA button "grow a little" when the entrance finished): text on a
 * promoted layer is placed with fractional glyph advances, so it comes out up to 1px narrower than the same text at rest, and dropping the layer made
 * the label jump 1px (measured: 17.7px from the button's edge while promoted, 16.7px after). It is taken off when NOTHING of the section can be seen any
 * more (the reset to the hidden start, where nobody can see the change), or when the section goes away, so layers exist only for the sections on the screen.
 * (A one-off, `replay: false`, has no such moment and keeps it until it goes away.) Found first for the Vision, Mission and Values reveal (docs/12).
 *
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

  // will-change on when the entrance plays (see SMOOTHNESS above), off when the section is put back to its hidden start or goes away
  const moving = targetsOf(timeline);
  const willChange = (value: string) => {
    for (const element of moving) element.style.willChange = value;
  };

  const play = () => {
    if (shown) return;
    shown = true;
    willChange("transform, opacity");
    timeline.timeScale(first ? fullSpeed : Math.max(fullSpeed, timeline.duration() / REPLAY_SECONDS));
    first = false;
    timeline.restart();
  };
  const reset = () => {
    if (!shown) return;
    shown = false;
    timeline.pause(0);
    willChange("auto");
  };

  ScrollTrigger.create({ trigger, start, once: !replay, onEnter: play });
  if (!replay || typeof IntersectionObserver === "undefined") return () => willChange("auto");

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) reset();
    // Visible again after it was hidden. (Before the very first play this is just the page loading with the section already in view:
    // the ScrollTrigger above plays it, in full.)
    else if (!first) play();
  });
  observer.observe(trigger);
  return () => {
    observer.disconnect();
    willChange("auto");
  };
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
