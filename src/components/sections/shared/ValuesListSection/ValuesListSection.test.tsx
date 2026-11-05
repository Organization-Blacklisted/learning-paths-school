import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ValuesListSection from "@/components/sections/shared/ValuesListSection";
import { defaultWelcomeToLps } from "@/data/welcome-to-lps";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultWelcomeToLps.values;

// jsdom has neither of these: the section measures where to put the navy band (a real browser checks that), and a hover needs the pointer's kind.
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  class FakePointerEvent extends MouseEvent {
    pointerType: string;
    constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "";
    }
  }
  vi.stubGlobal("PointerEvent", FakePointerEvent);
});

const buttons = () => screen.getAllByRole("button");
const texts = () =>
  content.items.map((item) => document.getElementById(buttons()[content.items.indexOf(item)].getAttribute("aria-controls")!)!);

describe("ValuesListSection", () => {
  it("is a region named for the section, with the heading on the band", () => {
    render(<ValuesListSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(content.title);
  });

  it("lists every value as a button, in order, in the blue slanted style", () => {
    render(<ValuesListSection content={content} />);
    expect(buttons().map((button) => button.textContent)).toEqual(content.items.map((item) => item.title));
    expect(buttons()[0].firstElementChild?.className).toContain("skewX(-8deg)");
  });

  it("has the FIRST value active at the start: its text is shown, the others are hidden from assistive technology", () => {
    render(<ValuesListSection content={content} />);
    expect(buttons().map((button) => button.getAttribute("aria-expanded"))).toEqual(["true", "false", "false", "false"]);
    expect(texts().map((text) => text.getAttribute("aria-hidden"))).toEqual(["false", "true", "true", "true"]);
    expect(texts()[0].textContent).toBe(content.items[0].text);
    expect(texts()[0].className).toContain("opacity-100");
    expect(texts()[1].className).toContain("opacity-0");
  });

  it("makes a value active when a mouse moves over its row (and keeps it when the pointer leaves)", () => {
    const { container } = render(<ValuesListSection content={content} />);
    const rows = container.querySelectorAll("li");
    fireEvent.pointerEnter(rows[2], { pointerType: "mouse" });
    expect(buttons().map((button) => button.getAttribute("aria-expanded"))).toEqual(["false", "false", "true", "false"]);
    expect(texts()[2].getAttribute("aria-hidden")).toBe("false");
    expect(texts()[0].getAttribute("aria-hidden")).toBe("true");
    fireEvent.pointerLeave(rows[2], { pointerType: "mouse" });
    expect(buttons()[2].getAttribute("aria-expanded")).toBe("true");
  });

  it("does not let a touch that only passes over a row change the active value (a tap does, through the click)", () => {
    const { container } = render(<ValuesListSection content={content} />);
    fireEvent.pointerEnter(container.querySelectorAll("li")[1], { pointerType: "touch" });
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(buttons()[1]);
    expect(buttons()[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("makes a value active when its button gets the keyboard focus, and ArrowDown and ArrowUp move between the buttons (wrapping)", () => {
    render(<ValuesListSection content={content} />);
    buttons()[0].focus();
    fireEvent.keyDown(buttons()[0], { key: "ArrowDown" });
    expect(document.activeElement).toBe(buttons()[1]);
    fireEvent.focus(buttons()[1]);
    expect(buttons()[1].getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(buttons()[1], { key: "ArrowUp" });
    fireEvent.keyDown(buttons()[0], { key: "ArrowUp" });
    expect(document.activeElement).toBe(buttons()[buttons().length - 1]);
  });

  it("draws a thin line under every row, decoration only, and the band behind the active one", () => {
    const { container } = render(<ValuesListSection content={content} />);
    expect(container.querySelectorAll("li > span[aria-hidden='true']")).toHaveLength(content.items.length);
    expect(container.querySelector(".bg-brand-navy")).toBeTruthy();
  });

  it("takes any list of values (the CMS decides how many)", () => {
    render(<ValuesListSection content={{ ...content, items: content.items.slice(0, 2) }} />);
    expect(buttons()).toHaveLength(2);
  });
});
