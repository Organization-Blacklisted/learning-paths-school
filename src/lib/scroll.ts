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

let locks = 0;

/**
 * Stops the page from scrolling (a full-screen menu or dialog is open) and returns the function that lets it scroll again. It stops the
 * smooth scrolling too (Lenis) and sets `overflow: hidden` on the page for the cases where Lenis is off (touch devices, reduced motion).
 * Several locks can be open at once: the page scrolls again when the last one is released.
 */
export function lockScroll(): () => void {
  locks += 1;
  if (locks === 1) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
  };
}
