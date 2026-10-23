import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registers GSAP's ScrollTrigger plugin once. Import this only from client components and call it
// inside an effect (it needs `window`):
//
//   const { gsap, ScrollTrigger } = registerGsap();
let registered = false;

export function registerGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    // Phone address bars grow and shrink while scrolling. Without this, every pinned scene would re-measure and jump.
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return { gsap, ScrollTrigger };
}
