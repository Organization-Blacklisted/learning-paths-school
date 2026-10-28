import { render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOTION_OK, PHONE_MOTION } from "@/lib/motion";
import { useScrollReveal } from "@/lib/useScrollReveal";

// GSAP itself is replaced by a recording fake: these tests are about what the hook does around the animation (media query,
// ScrollTrigger, clean-up), not about GSAP.
const fake = vi.hoisted(() => {
  const matchMediaContext = { add: vi.fn(), revert: vi.fn() };
  return {
    matchMediaContext,
    ScrollTrigger: { create: vi.fn() },
    gsap: {
      matchMedia: vi.fn(() => matchMediaContext),
      utils: { toArray: (selector: string, scope: ParentNode) => Array.from(scope.querySelectorAll(selector)) },
    },
  };
});
vi.mock("@/lib/gsap", () => ({ registerGsap: () => ({ gsap: fake.gsap, ScrollTrigger: fake.ScrollTrigger }) }));

// The browser's IntersectionObserver (it tells whether ANY part of an element can be seen on the screen) is replaced by a fake whose
// "is it visible" answer the test gives with emit(true / false).
class FakeObserver {
  static instances: FakeObserver[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {
    FakeObserver.instances.push(this);
  }
  emit(isIntersecting: boolean) {
    this.callback([{ isIntersecting }]);
  }
}

type Build = Parameters<typeof useScrollReveal>[1];
type Options = Parameters<typeof useScrollReveal>[2];

function Harness({ build, options }: { build: Build; options?: Options }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, build, options);
  return (
    <div ref={ref} data-testid="root">
      <p data-item>one</p>
      <p data-item>two</p>
    </div>
  );
}

// A fake timeline that remembers its speed: timeScale() reads it, timeScale(x) sets it.
type FakeTimeline = gsap.core.Timeline & { speed: number };
const timeline = ({ speed = 1, duration = 2.4 } = {}) => {
  const tl = { speed, restart: vi.fn(), pause: vi.fn(), duration: vi.fn(() => duration) } as unknown as FakeTimeline &
    Record<string, unknown>;
  tl.timeScale = vi.fn((value?: number) => {
    if (value === undefined) return tl.speed;
    tl.speed = value;
    return tl;
  }) as unknown as FakeTimeline["timeScale"];
  return tl as FakeTimeline;
};

beforeEach(() => {
  // matchMedia().add(query, fn) runs fn straight away, as if the query matched
  fake.matchMediaContext.add.mockImplementation((_query: string, fn: () => void) => fn());
  fake.gsap.matchMedia.mockImplementation(() => fake.matchMediaContext);
  FakeObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useScrollReveal", () => {
  it("runs the build function for 'motion is fine' by default, with the section element and a selector helper", () => {
    const build = vi.fn<Build>(() => timeline());
    const { getByTestId } = render(<Harness build={build} />);

    expect(fake.matchMediaContext.add).toHaveBeenCalledWith(MOTION_OK, expect.any(Function));
    expect(build).toHaveBeenCalledTimes(1);
    const context = build.mock.calls[0][0];
    expect(context.root).toBe(getByTestId("root"));
    expect(context.q("[data-item]")).toHaveLength(2);
    expect(context.gsap).toBe(fake.gsap);
  });

  it("q() finds elements inside another scope when one is given", () => {
    const build = vi.fn<Build>(() => timeline());
    const { getByTestId } = render(<Harness build={build} />);
    const first = getByTestId("root").querySelector("p")!;
    expect(build.mock.calls[0][0].q("[data-item]", first)).toHaveLength(0);
    expect(build.mock.calls[0][0].q("[data-item]", getByTestId("root"))).toHaveLength(2);
  });

  it("creates a ScrollTrigger that plays the timeline from 'top 75%' by default, and watches the section's visibility for the replays", () => {
    const tl = timeline();
    const { getByTestId } = render(<Harness build={() => tl} />);

    expect(fake.ScrollTrigger.create).toHaveBeenCalledTimes(1);
    expect(fake.ScrollTrigger.create.mock.calls[0][0]).toMatchObject({ trigger: getByTestId("root"), start: "top 75%", once: false });
    expect(FakeObserver.instances).toHaveLength(1);
    expect(FakeObserver.instances[0].observe).toHaveBeenCalledWith(getByTestId("root"));
    expect(tl.restart).not.toHaveBeenCalled();
    fake.ScrollTrigger.create.mock.calls[0][0].onEnter();
    expect(tl.restart).toHaveBeenCalledTimes(1);
  });

  it("with replay: false it is a one-off: ONE ScrollTrigger, once, and nothing is watched", () => {
    const tl = timeline();
    render(<Harness build={() => tl} options={{ replay: false }} />);

    expect(fake.ScrollTrigger.create).toHaveBeenCalledTimes(1);
    expect(fake.ScrollTrigger.create.mock.calls[0][0]).toMatchObject({ start: "top 75%", once: true });
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("uses the media query and start given in the options (a phone-only entrance)", () => {
    render(<Harness build={() => timeline()} options={{ media: PHONE_MOTION, start: "top 70%" }} />);
    expect(fake.matchMediaContext.add).toHaveBeenCalledWith(PHONE_MOTION, expect.any(Function));
    expect(fake.ScrollTrigger.create.mock.calls[0][0].start).toBe("top 70%");
  });

  it("does not create a ScrollTrigger when the build function returns nothing", () => {
    render(<Harness build={() => undefined} />);
    expect(fake.ScrollTrigger.create).not.toHaveBeenCalled();
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("does nothing outside the media query (add() never calls back, as with reduced motion)", () => {
    fake.matchMediaContext.add.mockImplementation(() => undefined);
    const build = vi.fn<Build>(() => timeline());
    render(<Harness build={build} />);
    expect(build).not.toHaveBeenCalled();
    expect(fake.ScrollTrigger.create).not.toHaveBeenCalled();
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("reverts everything it did when the section unmounts", () => {
    const { unmount } = render(<Harness build={() => timeline()} />);
    expect(fake.matchMediaContext.revert).not.toHaveBeenCalled();
    unmount();
    expect(fake.matchMediaContext.revert).toHaveBeenCalledTimes(1);
  });

  it("does not start over when the component re-renders with a new (inline) build function", () => {
    const first = vi.fn<Build>(() => timeline());
    const { rerender } = render(<Harness build={first} />);
    rerender(<Harness build={() => timeline()} />);
    rerender(<Harness build={() => timeline()} />);
    expect(first).toHaveBeenCalledTimes(1);
    expect(fake.ScrollTrigger.create).toHaveBeenCalledTimes(1);
    expect(FakeObserver.instances).toHaveLength(1);
    expect(fake.matchMediaContext.revert).not.toHaveBeenCalled();
  });

  it("starts again, with the LATEST build function, when the media query changes", () => {
    const first = vi.fn<Build>(() => timeline());
    const second = vi.fn<Build>(() => timeline());
    const { rerender } = render(<Harness build={first} options={{ media: MOTION_OK }} />);
    rerender(<Harness build={second} options={{ media: PHONE_MOTION }} />);

    expect(fake.matchMediaContext.revert).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  describe("replay", () => {
    /** Renders the hook with a fake timeline; returns the timeline, the play ScrollTrigger config and the visibility observer. */
    const setup = (tl: FakeTimeline = timeline()) => {
      render(<Harness build={() => tl} />);
      return { tl, play: fake.ScrollTrigger.create.mock.calls[0][0], seen: FakeObserver.instances[0] };
    };

    it("plays the FIRST time in full, at the timeline's own speed", () => {
      const { tl, play } = setup(timeline({ speed: 1.8, duration: 2.8 }));
      play.onEnter();
      expect(tl.timeScale).toHaveBeenLastCalledWith(1.8);
      expect(tl.restart).toHaveBeenCalledTimes(1);
    });

    it("plays every LATER time quicker: the same animation squeezed into about 0.8 s", () => {
      const { tl, play, seen } = setup(timeline({ speed: 1, duration: 2.4 }));
      play.onEnter();
      seen.emit(false); // nothing of it can be seen any more
      play.onEnter();
      expect(tl.speed).toBeCloseTo(3); // 2.4 s of animation in 0.8 s
      expect(tl.restart).toHaveBeenCalledTimes(2);
    });

    it("never plays a replay SLOWER than the original (a short or already fast timeline keeps its speed)", () => {
      const { tl, play, seen } = setup(timeline({ speed: 4, duration: 1 }));
      play.onEnter();
      seen.emit(false);
      play.onEnter();
      expect(tl.timeScale).toHaveBeenLastCalledWith(4);
    });

    it("puts the section back to its hidden start only when NOTHING of it can be seen", () => {
      const { tl, play, seen } = setup();
      play.onEnter();
      seen.emit(true); // still (partly) visible: never reset
      expect(tl.pause).not.toHaveBeenCalled();
      seen.emit(false);
      expect(tl.pause).toHaveBeenLastCalledWith(0);
    });

    it("does not reset a section that was never shown, and does not play twice in a row", () => {
      const { tl, play, seen } = setup();
      seen.emit(false); // nothing shown yet, nothing to reset
      expect(tl.pause).not.toHaveBeenCalled();
      play.onEnter();
      play.onEnter(); // the same section entering again without having been hidden
      seen.emit(true);
      expect(tl.restart).toHaveBeenCalledTimes(1);
    });

    it("plays again as soon as it becomes visible after it was hidden: from above, below, or sliding in from the side of a pinned scene", () => {
      const { tl, play, seen } = setup();
      play.onEnter();
      seen.emit(false); // e.g. a panel that slid out to the left, or scrolled out of the screen
      expect(tl.restart).toHaveBeenCalledTimes(1);
      seen.emit(true); // visible again, however it came back
      expect(tl.restart).toHaveBeenCalledTimes(2);
    });

    it("ignores the very first 'visible' report (the page loaded with the section in view): the ScrollTrigger plays it, in full", () => {
      const { tl, play, seen } = setup(timeline({ speed: 1, duration: 2.4 }));
      seen.emit(true); // before anything has played
      expect(tl.restart).not.toHaveBeenCalled();
      play.onEnter();
      expect(tl.speed).toBe(1); // in full, not the quick replay
      expect(tl.restart).toHaveBeenCalledTimes(1);
    });

    it("stops watching when the section goes away (matchMedia calls the function the hook returned)", () => {
      const { seen } = setup();
      const cleanup = fake.matchMediaContext.add.mock.results[0] && fake.matchMediaContext.add.mock.calls[0][1]();
      // the hook returns playOnScroll's stop function from the matchMedia callback
      expect(typeof cleanup).toBe("function");
      expect(seen.disconnect).not.toHaveBeenCalled();
      (cleanup as () => void)();
      expect(FakeObserver.instances[FakeObserver.instances.length - 1].disconnect).toHaveBeenCalled();
    });

    it("without IntersectionObserver (an old browser) the first entrance still plays and nothing else breaks", () => {
      vi.stubGlobal("IntersectionObserver", undefined);
      const tl = timeline();
      render(<Harness build={() => tl} />);
      expect(FakeObserver.instances).toHaveLength(0);
      fake.ScrollTrigger.create.mock.calls[0][0].onEnter();
      expect(tl.restart).toHaveBeenCalledTimes(1);
    });
  });
});
