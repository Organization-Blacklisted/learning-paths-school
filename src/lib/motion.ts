// The media queries that decide HOW a part of the page moves, in one place (they used to be written out in every section, and the
// 1024px breakpoint lived separately in CSS and in JavaScript).
//
// 1024px is Tailwind's `lg`. Keep these in step with it: from DESKTOP up the page has the sideways pinned scenes, below it
// (PHONE) a section plays its entrance once when it comes into view. MOTION_OK is false with "reduce motion" on: then nothing
// moves and everything is simply shown.
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";
export const DESKTOP = "(min-width: 1024px)";
export const PHONE = "(max-width: 1023px)";

/** Desktop width with motion: the sideways scenes run. */
export const DESKTOP_MOTION = `${DESKTOP} and ${MOTION_OK}`;
/** Below desktop width with motion: no sideways pan, so a section plays once when it comes into view. */
export const PHONE_MOTION = `${PHONE} and ${MOTION_OK}`;

/** True when the visitor asked for reduced motion. Client only (call it inside an effect or an event handler). */
export const prefersReducedMotion = () => window.matchMedia(MOTION_REDUCED).matches;
