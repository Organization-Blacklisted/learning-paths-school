import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IntroTextSection from "@/components/sections/shared/IntroTextSection";
import { defaultWelcomeToLps } from "@/data/welcome-to-lps";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultWelcomeToLps.intro;

describe("IntroTextSection", () => {
  it("is a region named for the section", () => {
    render(<IntroTextSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
  });

  it("shows every paragraph, in order, centred", () => {
    const { container } = render(<IntroTextSection content={content} />);
    const shown = [...container.querySelectorAll("p")];
    expect(shown.map((p) => p.textContent)).toEqual(content.paragraphs);
    expect(container.querySelector("p")?.parentElement?.className).toContain("text-center");
  });

  it("is at most 1185px wide, the width of the design's text", () => {
    const { container } = render(<IntroTextSection content={content} />);
    expect(container.querySelector("p")?.parentElement?.className).toContain("max-w-[1185px]");
  });

  it("takes any list of paragraphs (the CMS decides how many)", () => {
    const { container } = render(<IntroTextSection content={{ label: "x", paragraphs: ["One", "Two", "Three"] }} />);
    expect(container.querySelectorAll("p")).toHaveLength(3);
  });

  it("takes the space above from the page (a class of its own on the section)", () => {
    render(<IntroTextSection content={content} spacing="none" className="pt-[10px]" />);
    expect(screen.getByRole("region", { name: content.label }).className).toContain("pt-[10px]");
  });
});
