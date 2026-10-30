"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { refreshOnRealResize } from "@/lib/resize";
import { setLenis, setNormalizer } from "@/lib/scroll";

// Smooth (eased) scrolling for mouse wheels, driven by GSAP's ticker so ScrollTrigger stays in step with it.
// Touch devices keep their native scrolling (Lenis does not take it over by default). Off entirely with
// prefers-reduced-motion. Renders nothing. Mounted once in the (frontend) layout.
export default function SmoothScroll() {
  useEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();

    // Images and fonts change the page height after the first render; pinned scenes must re-measure.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    // A resize of the window (DevTools device mode included) measures the pinned scenes again; a phone’s address bar does not (see lib/resize.ts).
    const stopWatchingResize = refreshOnRealResize(refresh);

    if (prefersReducedMotion()) {
      return () => {
        window.removeEventListener("load", refresh);
        stopWatchingResize();
      };
    }

    // EXPERIMENT (owner reported lag on a real phone in the Journey section, 2026-10-30): with `?scroll=normalize` in the address, a touch
    // screen is scrolled by GSAP instead of by the browser (ScrollTrigger.normalizeScroll), the usual cure for pinned scenes whose content is
    // moved by script while the finger scrolls. Off unless asked for; nothing changes for visitors. See docs/14-home-journey.md.
    const normalize =
      ScrollTrigger.isTouch > 0 && new URLSearchParams(window.location.search).get("scroll") === "normalize"
        ? ScrollTrigger.normalizeScroll({ allowNestedScroll: true, type: "touch" })
        : undefined;
    if (normalize) setNormalizer(normalize);

    const lenis = new Lenis({ autoRaf: false, duration: 1.15 });
    setLenis(lenis);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      window.removeEventListener("load", refresh);
      stopWatchingResize();
      gsap.ticker.remove(onTick);
      if (normalize) {
        setNormalizer(null);
        ScrollTrigger.normalizeScroll(false);
      }
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
