"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { refreshOnRealResize } from "@/lib/resize";
import { setLenis } from "@/lib/scroll";

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
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
