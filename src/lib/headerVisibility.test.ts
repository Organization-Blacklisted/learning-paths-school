import { describe, expect, it } from "vitest";
import { DIRECTION_DISTANCE, SHOW_NEAR_TOP, initialHeaderScroll, nextHeaderScroll, type HeaderScrollState } from "@/lib/headerVisibility";

/** Applies a series of scroll positions one after another and returns the state after each. */
const run = (positions: number[], from: HeaderScrollState = initialHeaderScroll(0)) => {
  const states: HeaderScrollState[] = [];
  let state = from;
  for (const y of positions) {
    state = nextHeaderScroll(state, y);
    states.push(state);
  }
  return states;
};

describe("nextHeaderScroll", () => {
  it("starts visible", () => {
    expect(initialHeaderScroll().hidden).toBe(false);
  });

  it("never hides within the first stretch of the page, however far down it goes there", () => {
    const states = run([10, 40, SHOW_NEAR_TOP]);
    expect(states.every((s) => !s.hidden)).toBe(true);
  });

  it("treats the negative positions of a touch screen's rubber band as the top", () => {
    expect(run([300, 200, -40])[2].hidden).toBe(false);
  });

  it("hides once the visitor has scrolled DIRECTION_DISTANCE px down below the top stretch", () => {
    const start = SHOW_NEAR_TOP + 100;
    // the visitor is already at `start`, then moves down in small steps
    const [a, b] = run([start + DIRECTION_DISTANCE - 1, start + DIRECTION_DISTANCE], initialHeaderScroll(start));
    expect(a.hidden).toBe(false); // not far enough yet
    expect(b.hidden).toBe(true);
  });

  it("shows again as soon as the visitor has scrolled DIRECTION_DISTANCE px up", () => {
    const hiddenAt500 = run([300, 400, 500]).at(-1)!;
    expect(hiddenAt500.hidden).toBe(true);
    const [a, b] = run([500 - DIRECTION_DISTANCE + 1, 500 - DIRECTION_DISTANCE], hiddenAt500);
    expect(a.hidden).toBe(true); // not far enough yet
    expect(b.hidden).toBe(false);
  });

  it("does not flicker on small wobbles: tiny moves back and forth change nothing", () => {
    const hiddenAt500 = run([300, 400, 500]).at(-1)!;
    const wobble = run([497, 501, 498, 502, 499, 503], hiddenAt500);
    expect(wobble.every((s) => s.hidden)).toBe(true);
    const visibleAt200 = run([100, 150, 200].map((y) => y)).at(-1)!;
    expect(visibleAt200.hidden).toBe(true); // 100 -> 200 is a real scroll down
    const calm = run([150, 152, 149, 151], initialHeaderScroll(150));
    expect(calm.every((s) => !s.hidden)).toBe(true);
  });

  it("keeps hiding and showing on every change of direction, not just the first", () => {
    // from a visitor already at 200: down (hide), up (show), down (hide), up (show), down (hide)
    const states = run([300, 250, 400, 350, 500], initialHeaderScroll(200));
    expect(states.map((s) => s.hidden)).toEqual([true, false, true, false, true]);
  });

  it("ignores a scroll event that did not move", () => {
    const before = run([300, 400]).at(-1)!;
    expect(nextHeaderScroll(before, 400)).toBe(before);
  });

  it("is visible again when the visitor scrolls back into the top stretch", () => {
    const hiddenAt800 = run([300, 500, 800]).at(-1)!;
    expect(hiddenAt800.hidden).toBe(true);
    expect(nextHeaderScroll(hiddenAt800, SHOW_NEAR_TOP - 10).hidden).toBe(false);
  });
});
