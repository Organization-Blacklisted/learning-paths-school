import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import RotatingWord from "@/components/ui/RotatingWord";
import { MOTION_REDUCED } from "@/lib/motion";

// The browser pieces it relies on are fakes: IntersectionObserver (so the test decides when the word is on screen), the media query for
// reduced motion, and the clock.
let observed: { callback: IntersectionObserverCallback; disconnect: Mock<() => void> }[] = [];
const show = (isIntersecting: boolean) =>
  act(() => observed[0].callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
function setReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn((query: string) => ({ matches: query === MOTION_REDUCED && reduced })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  vi.useFakeTimers();
  observed = [];
  setReducedMotion(false);
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      entry: (typeof observed)[number];
      constructor(callback: IntersectionObserverCallback) {
        this.entry = { callback, disconnect: vi.fn<() => void>() };
        observed.push(this.entry);
      }
      observe() {}
      disconnect() {
        this.entry.disconnect();
      }
    },
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const states = (container: HTMLElement) =>
  [...container.querySelectorAll("[data-rotating-word]")].map((el) => el.getAttribute("data-state"));
const WORDS = ["Path", "Purpose", "Voice"];

describe("RotatingWord", () => {
  it("renders every word (the slot is as wide as the widest) with only the first one shown", () => {
    const { container } = render(<RotatingWord words={WORDS} />);
    expect([...container.querySelectorAll("[data-rotating-word]")].map((e) => e.textContent)).toEqual(WORDS);
    expect(states(container)).toEqual(["active", "idle", "idle"]);
  });

  it("is hidden from screen readers (the sentence they read comes from the page)", () => {
    const { container } = render(<RotatingWord words={WORDS} />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("does not rotate while it is off screen", () => {
    const { container } = render(<RotatingWord words={WORDS} interval={1000} />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(states(container)).toEqual(["active", "idle", "idle"]);
  });

  it("rotates every interval while on screen, the previous word leaving as old, and wraps around", () => {
    const { container } = render(<RotatingWord words={WORDS} interval={1000} />);
    show(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(states(container)).toEqual(["old", "active", "idle"]);
    act(() => vi.advanceTimersByTime(1000));
    expect(states(container)).toEqual(["idle", "old", "active"]);
    act(() => vi.advanceTimersByTime(1000));
    expect(states(container)).toEqual(["active", "idle", "old"]);
  });

  it("stops when it leaves the screen and starts again when it comes back", () => {
    const { container } = render(<RotatingWord words={WORDS} interval={1000} />);
    show(true);
    act(() => vi.advanceTimersByTime(1000));
    show(false);
    act(() => vi.advanceTimersByTime(10_000));
    expect(states(container)).toEqual(["old", "active", "idle"]);
    show(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(states(container)).toEqual(["idle", "old", "active"]);
  });

  it("holds still while the pointer is over it", () => {
    const { container } = render(<RotatingWord words={WORDS} interval={1000} />);
    show(true);
    fireEvent.mouseEnter(container.firstElementChild!);
    act(() => vi.advanceTimersByTime(5000));
    expect(states(container)).toEqual(["active", "idle", "idle"]);
    fireEvent.mouseLeave(container.firstElementChild!);
    act(() => vi.advanceTimersByTime(1000));
    expect(states(container)).toEqual(["old", "active", "idle"]);
  });

  it("does not rotate at all with reduced motion, or with a single word, and watches nothing then", () => {
    setReducedMotion(true);
    const reduced = render(<RotatingWord words={WORDS} interval={1000} />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(states(reduced.container)).toEqual(["active", "idle", "idle"]);
    expect(observed).toHaveLength(0);
    reduced.unmount();

    setReducedMotion(false);
    render(<RotatingWord words={["Path"]} />);
    expect(observed).toHaveLength(0);
  });

  it("cleans up its observer and timer when it unmounts", () => {
    const { unmount } = render(<RotatingWord words={WORDS} interval={1000} />);
    show(true);
    unmount();
    expect(observed[0].disconnect).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
