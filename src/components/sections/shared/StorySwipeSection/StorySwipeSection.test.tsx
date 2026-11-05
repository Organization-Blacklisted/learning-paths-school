import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StorySwipeSection from "@/components/sections/shared/StorySwipeSection";
import { defaultWelcomeToLps } from "@/data/welcome-to-lps";

// The pin and the movement (GSAP, ScrollTrigger) are checked in a real browser: here GSAP is a stand-in that only records what it was asked for.
const add = vi.fn();
const revert = vi.fn();
vi.mock("@/lib/gsap", () => ({
  registerGsap: () => ({ gsap: { matchMedia: () => ({ add, revert }), utils: { toArray: () => [] } }, ScrollTrigger: {} }),
}));

const content = defaultWelcomeToLps.story;

beforeEach(() => {
  add.mockClear();
  revert.mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
});

describe("StorySwipeSection", () => {
  it("is a region named for the section, with the two-part heading as an h2 (the second part blue and slanted)", () => {
    render(<StorySwipeSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe(`${content.titleLead} ${content.titleAccent}`);
    expect(heading.firstElementChild?.className).toContain("text-brand-blue");
  });

  it("shows every slide in order: its photo (described), its period as an h3 and its story", () => {
    render(<StorySwipeSection content={content} />);
    const slides = screen.getAllByRole("listitem");
    expect(slides).toHaveLength(content.slides.length);
    content.slides.forEach((slide, index) => {
      const block = within(slides[index]);
      expect(block.getByRole("img", { name: slide.image.alt }).getAttribute("src")).toBe(slide.image.src);
      expect(block.getByRole("heading", { level: 3 }).textContent).toBe(slide.period);
      expect(block.getByText(slide.text.split("\n")[0], { exact: false })).toBeTruthy();
    });
  });

  it("keeps the line breaks of a story (a new line without the space between paragraphs)", () => {
    const { container } = render(<StorySwipeSection content={content} />);
    const story = container.querySelector("[data-slide-text] p");
    expect(story?.className).toContain("whitespace-pre-line");
    expect(story?.textContent).toBe(content.slides[0].text);
  });

  it("draws each slide's green step of the timeline: its share of the whole (a third, two thirds, the whole)", () => {
    const { container } = render(<StorySwipeSection content={content} />);
    const widths = [...container.querySelectorAll<HTMLElement>("[data-slide-fill]")].map((fill) => Number.parseFloat(fill.style.width));
    expect(widths).toHaveLength(3);
    expect(widths[0]).toBeCloseTo(33.33, 1);
    expect(widths[1]).toBeCloseTo(66.67, 1);
    expect(widths[2]).toBeCloseTo(100, 1);
  });

  it("draws the timeline and its marker for decoration only (hidden from assistive technology)", () => {
    const { container } = render(<StorySwipeSection content={content} />);
    const decoration = container.querySelectorAll("[data-slide-text] span[aria-hidden='true']");
    expect(decoration).toHaveLength(content.slides.length * 3);
  });

  it("lays the later slides over the first, hidden at the start (only from lg with motion: CSS), and the first one not hidden", () => {
    const { container } = render(<StorySwipeSection content={content} />);
    const slides = [...container.querySelectorAll<HTMLElement>("[data-slide]")];
    const hidden = (slide: HTMLElement) =>
      [...slide.querySelectorAll("[data-slide-photo], [data-slide-period], [data-slide-body], [data-slide-fill]")].map((el) =>
        el.className.includes("motion-safe:lg:invisible"),
      );
    expect(hidden(slides[0]).every((value) => !value)).toBe(true);
    expect(hidden(slides[1]).every(Boolean)).toBe(true);
    expect(hidden(slides[2]).every(Boolean)).toBe(true);
    expect(slides.every((slide) => slide.className.includes("motion-safe:lg:col-start-1"))).toBe(true);
  });

  it("pins and changes the slides only from lg with motion allowed (a media query of GSAP), and gives the pin back when it goes away", () => {
    const { unmount } = render(<StorySwipeSection content={content} />);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add.mock.calls[0][0]).toBe("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    unmount();
    expect(revert).toHaveBeenCalled();
  });

  it("does not pin a story of one slide (there is nothing to move to)", () => {
    render(<StorySwipeSection content={{ ...content, slides: [content.slides[0]] }} />);
    expect(add).not.toHaveBeenCalled();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("is not a tab stop while nothing scrolls (jsdom has no layout), so there is no group role either", () => {
    const { container } = render(<StorySwipeSection content={content} />);
    expect(container.querySelector("[tabindex='0']")).toBeNull();
    expect(container.querySelector("[role='group']")).toBeNull();
  });
});
