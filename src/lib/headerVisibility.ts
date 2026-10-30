// The rule of the "scroll-up header" (owner, 2026-10-28): the header slides away while the visitor scrolls DOWN and comes back the moment
// they scroll UP. A pure function, so it can be tested without a browser: give it the previous state and the new scroll position, it
// returns the new state.
//
//  - Near the top of the page (the first SHOW_NEAR_TOP px, and the negative positions of a touch screen's rubber band) the header is
//    never hidden.
//  - Below that it hides after the visitor has scrolled DIRECTION_DISTANCE px down in one go, and shows after DIRECTION_DISTANCE px up
//    in one go. Smaller wobbles (a trackpad, a finger resting) change nothing, so the header does not flicker.

/** Within this many px of the top of the page the header is always visible. */
export const SHOW_NEAR_TOP = 80;
/** How far (px) the visitor must scroll in one direction before the header reacts. */
export const DIRECTION_DISTANCE = 8;

export type HeaderScrollState = {
  /** The scroll position at the previous call. */
  lastY: number;
  /** The scroll position where the current direction started. */
  anchorY: number;
  goingDown: boolean;
  hidden: boolean;
};

export const initialHeaderScroll = (y = 0): HeaderScrollState => ({ lastY: y, anchorY: y, goingDown: true, hidden: false });

export function nextHeaderScroll(state: HeaderScrollState, y: number): HeaderScrollState {
  if (y <= SHOW_NEAR_TOP) return { lastY: y, anchorY: y, goingDown: true, hidden: false };
  if (y === state.lastY) return state;

  const goingDown = y > state.lastY;
  // When the direction turns, the point where it turned becomes the new anchor.
  const anchorY = goingDown === state.goingDown ? state.anchorY : state.lastY;
  let hidden = state.hidden;
  if (goingDown && y - anchorY >= DIRECTION_DISTANCE) hidden = true;
  if (!goingDown && anchorY - y >= DIRECTION_DISTANCE) hidden = false;
  return { lastY: y, anchorY, goingDown, hidden };
}

/**
 * Is this the home page? `usePathname()` answers "/" in the browser, but on Vercel the prerendered (ISR) HTML of the home page is made for the
 * path "/index" (found 2026-10-30: the page's RSC payload says canonical parts ["", "index"]), so on the server the same page reports "/index".
 * Comparing with "/" only made the server draw the SOLID header (a blue bar in the page flow, which pushed the hero down 74px) while the browser
 * expected the transparent one; React does not repair a mismatch of attributes while hydrating, so the wrong header stayed until the first
 * change of its state.
 */
export const isHomePath = (pathname: string | null): boolean => pathname === "/" || pathname === "/index";
