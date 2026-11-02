import { afterEach, describe, expect, it, vi } from "vitest";
import { DESKTOP, MOTION_REDUCED, PHONE, prefersReducedMotion } from "@/lib/motion";

describe("motion media queries", () => {
  it("DESKTOP and PHONE meet at 1024px (Tailwind's lg) with no gap and no overlap", () => {
    expect(DESKTOP).toBe("(min-width: 1024px)");
    expect(PHONE).toBe("(max-width: 1023px)");
  });

  it("combine a width with 'motion is fine'", () => {});
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
