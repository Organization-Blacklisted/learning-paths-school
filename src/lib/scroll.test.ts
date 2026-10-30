import { afterEach, describe, expect, it, vi } from "vitest";
import type Lenis from "lenis";
import { lockScroll, setLenis, setNormalizer } from "./scroll";

describe("lockScroll", () => {
  afterEach(() => {
    setLenis(null);
    setNormalizer(null);
    document.documentElement.style.overflow = "";
  });

  it("stops the page from scrolling and lets it scroll again when released", () => {
    const unlock = lockScroll();
    expect(document.documentElement.style.overflow).toBe("hidden");
    unlock();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("stops and restarts the smooth scrolling (Lenis) too", () => {
    const lenis = { stop: vi.fn(), start: vi.fn() } as unknown as Lenis;
    setLenis(lenis);
    const unlock = lockScroll();
    expect(lenis.stop).toHaveBeenCalledTimes(1);
    unlock();
    expect(lenis.start).toHaveBeenCalledTimes(1);
  });

  it("keeps the page locked until the LAST lock is released, and ignores a second release of the same lock", () => {
    const first = lockScroll();
    const second = lockScroll();
    first();
    first();
    expect(document.documentElement.style.overflow).toBe("hidden");
    second();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("pauses the touch scroll normalizer while locked and starts it again when released", () => {
    const normalizer = { enable: vi.fn(), disable: vi.fn() };
    setNormalizer(normalizer);
    const unlock = lockScroll();
    expect(normalizer.disable).toHaveBeenCalledTimes(1);
    expect(normalizer.enable).not.toHaveBeenCalled();
    unlock();
    expect(normalizer.enable).toHaveBeenCalledTimes(1);
  });
});
