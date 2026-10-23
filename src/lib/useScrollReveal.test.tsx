import { render } from "@testing-library/react";
import { useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

const timeline = () => ({ play: vi.fn() }) as unknown as gsap.core.Timeline;

beforeEach(() => {
  // matchMedia().add(query, fn) runs fn straight away, as if the query matched
  fake.matchMediaContext.add.mockImplementation((_query: string, fn: () => void) => fn());
  fake.gsap.matchMedia.mockImplementation(() => fake.matchMediaContext);
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

  it("creates ONE ScrollTrigger that plays the timeline once, starting at 'top 75%' by default", () => {
    const tl = timeline();
    const { getByTestId } = render(<Harness build={() => tl} />);

    expect(fake.ScrollTrigger.create).toHaveBeenCalledTimes(1);
    const config = fake.ScrollTrigger.create.mock.calls[0][0];
    expect(config).toMatchObject({ trigger: getByTestId("root"), start: "top 75%", once: true });
    expect(tl.play).not.toHaveBeenCalled();
    config.onEnter();
    expect(tl.play).toHaveBeenCalledTimes(1);
  });

  it("uses the media query and start given in the options (a phone-only entrance)", () => {
    render(<Harness build={() => timeline()} options={{ media: PHONE_MOTION, start: "top 70%" }} />);
    expect(fake.matchMediaContext.add).toHaveBeenCalledWith(PHONE_MOTION, expect.any(Function));
    expect(fake.ScrollTrigger.create.mock.calls[0][0].start).toBe("top 70%");
  });

  it("does not create a ScrollTrigger when the build function returns nothing", () => {
    render(<Harness build={() => undefined} />);
    expect(fake.ScrollTrigger.create).not.toHaveBeenCalled();
  });

  it("does nothing outside the media query (add() never calls back, as with reduced motion)", () => {
    fake.matchMediaContext.add.mockImplementation(() => undefined);
    const build = vi.fn<Build>(() => timeline());
    render(<Harness build={build} />);
    expect(build).not.toHaveBeenCalled();
    expect(fake.ScrollTrigger.create).not.toHaveBeenCalled();
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
});
