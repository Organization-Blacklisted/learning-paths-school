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
    // A count of how many times the page was measured again, on <html data-measured>. Only the browser checks read it (tests/interactions.mjs): the
    // height of a pinned scene's spacer is no proof that it was measured again (a scene's pan length makes up for its stage height).
    ScrollTrigger.addEventListener("refresh", () => {
      const root = document.documentElement;
      root.dataset.measured = String(Number(root.dataset.measured ?? 0) + 1);
    });
    registered = true;
  }
  return { gsap, ScrollTrigger };
}
