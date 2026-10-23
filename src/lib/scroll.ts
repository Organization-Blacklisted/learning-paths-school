import type Lenis from "lenis";

// Holds the smooth-scroll (Lenis) instance so any component can scroll the page programmatically
// without knowing whether smooth scrolling is active (it is off with prefers-reduced-motion).
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Scroll the page to a Y position over `seconds` (linear). Falls back to the browser's own scrolling. */
export function scrollToY(y: number, seconds: number) {
  if (lenis) {
    lenis.scrollTo(y, { duration: seconds, easing: (t) => t, lock: false });
    return;
  }
  window.scrollTo({ top: y, behavior: seconds > 0 ? "smooth" : "auto" });
}
