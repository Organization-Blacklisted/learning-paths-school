"use client";

import { useEffect, type RefObject } from "react";
import { registerGsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

/**
 * Scroll parallax: while the section crosses the screen, the elements matching `selector` drift from -`percent`% to +`percent`% of their
 * own height, scrubbed by the scroll (it follows the scrollbar exactly, and runs backwards when scrolling up). Give the moving layer a bit
 * more height than its box (a 5% drift needs about 12% extra) so no edge shows. No parallax with reduced motion.
 *
 *   useParallax(rootRef, "[data-campus-drift]", 5);
 */
export function useParallax(rootRef: RefObject<HTMLElement | null>, selector: string, percent = 5) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>(selector, root),
        { yPercent: -percent },
        { yPercent: percent, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
    return () => mm.revert();
  }, [rootRef, selector, percent]);
}
