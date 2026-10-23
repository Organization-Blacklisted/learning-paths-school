import { afterEach, describe, expect, it, vi } from "vitest";
import { DESKTOP, DESKTOP_MOTION, MOTION_OK, MOTION_REDUCED, PHONE, PHONE_MOTION, prefersReducedMotion } from "@/lib/motion";

describe("motion media queries", () => {
  it("DESKTOP and PHONE meet at 1024px (Tailwind's lg) with no gap and no overlap", () => {
    expect(DESKTOP).toBe("(min-width: 1024px)");
    expect(PHONE).toBe("(max-width: 1023px)");
  });

  it("combine a width with 'motion is fine'", () => {
    expect(DESKTOP_MOTION).toBe(`${DESKTOP} and ${MOTION_OK}`);
    expect(PHONE_MOTION).toBe(`${PHONE} and ${MOTION_OK}`);
  });
});

describe("prefersReducedMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([true, false])("reads the browser's setting (%s)", (reduced) => {
    const matchMedia = vi.fn((query: string) => ({ matches: query === MOTION_REDUCED && reduced }));
    vi.stubGlobal("matchMedia", matchMedia);
    window.matchMedia = matchMedia as unknown as typeof window.matchMedia;
    expect(prefersReducedMotion()).toBe(reduced);
  });
});
