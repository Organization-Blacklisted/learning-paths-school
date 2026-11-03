// How the page's smooth (eased) wheel scrolling moves and, above all, how it ENDS (src/components/layouts/SmoothScroll).
//
// Owner, 2026-11-03: "when I scroll on desktop and stop, the whole screen shakes", on every page. It was gone with smooth scrolling off, so it was the
// end of the glide. The first setting (Lenis' default easing over 1.15 s) is an exponential ease-out, which ends in a very long, very slow creep: about
// 20 frames of single pixels. On the owner's screen that looked like shaking, and a headless Chrome shows nothing (the drawn picture follows the scroll
// exactly in every frame), so four other endings were tried on the owner's screen; "ease out cubic over 1 s" stopped cleanly. Its last 2px take about 6
// frames. Do not go back to a long exponential tail without checking on a real screen.

/** Ease out cubic: fast start, a gentle but short end (0 at 0, 1 at 1). */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Lenis' options for the wheel glide (length in seconds, and the curve). */
export const SMOOTH_SCROLL = { duration: 1, easing: easeOutCubic } as const;
