/**
 * Tells ScrollTrigger to measure the page again after a REAL resize of the window, and not after a phone's address bar sliding in or out.
 *
 * Why this exists: GSAP can ignore resizes on a touch device (`ignoreMobileResize`, set in src/lib/gsap.ts), because on a phone the address
 * bar grows and shrinks while you scroll, and measuring every pinned scene each time would make the page jump. But GSAP ignores any
 * height-only change under 25% of the window on ANY touch device, including a desktop browser in DevTools device mode (docking DevTools at the
 * bottom is such a change). The pinned scenes then keep the measurements of the old size, and the hero (still pinned) shows behind the
 * sections that follow.
 *
 * The difference between the two cases: an address bar only changes while the visitor is scrolling; a window resize, a DevTools resize
 * and a phone being rotated happen while the page is still. So:
 * - a resize while the page is NOT being scrolled always refreshes;
 * - a resize that starts within `quietMs` of a scroll refreshes only when the WIDTH changed (a rotation), never for height alone.
 * A burst of resize events (dragging the window edge) refreshes once, `debounceMs` after the last one. Returns a function that stops watching.
 */
export function refreshOnRealResize(refresh: () => void, { quietMs = 600, debounceMs = 250 } = {}): () => void {
  let lastScrollAt = Number.NEGATIVE_INFINITY;
  let baseWidth = window.innerWidth;
  let timer: number | undefined;
  let burstStartedWhileScrolling = false;
  let inBurst = false;

  const onScroll = () => {
    lastScrollAt = performance.now();
  };

  const onResize = () => {
    if (!inBurst) {
      inBurst = true;
      burstStartedWhileScrolling = performance.now() - lastScrollAt < quietMs;
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      inBurst = false;
      const widthChanged = window.innerWidth !== baseWidth;
      if (widthChanged || !burstStartedWhileScrolling) {
        baseWidth = window.innerWidth;
        refresh();
      }
    }, debounceMs);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.clearTimeout(timer);
  };
}
