import { describe, expect, it } from "vitest";
import { easeOutCubic, SMOOTH_SCROLL } from "./smooth-scroll";

describe("the wheel glide", () => {
  it("goes from 0 to 1 and never backwards (an ease out: it only ever slows down)", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    let previous = 0;
    let previousStep = Infinity;
    for (let i = 1; i <= 100; i++) {
      const value = easeOutCubic(i / 100);
      expect(value).toBeGreaterThanOrEqual(previous);
      expect(value - previous).toBeLessThanOrEqual(previousStep + 1e-12); // each step is no bigger than the one before
      previousStep = value - previous;
      previous = value;
    }
  });

  it("ends within a short time: the last 2% of a 360px scroll (7px) is covered in the last quarter of the glide, not spread over a long tail", () => {
    // at 75% of the time the glide has covered more than 98% of the way (the exponential curve it replaced left a creep of single pixels for much longer)
    expect(easeOutCubic(0.75)).toBeGreaterThan(0.98);
  });

  it("takes one second (the setting the owner picked after trying four)", () => {
    expect(SMOOTH_SCROLL.duration).toBe(1);
    expect(SMOOTH_SCROLL.easing).toBe(easeOutCubic);
  });
});
