import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PartnersSection from "@/components/sections/shared/PartnersSection";
import { defaultPartnerships } from "@/data/partnerships";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultPartnerships.partners;

describe("PartnersSection", () => {
  it("is a region named for the section, with the introduction", () => {
    render(<PartnersSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
    expect(screen.getByText(/we are committed to guiding our students/)).toBeTruthy();
  });

  it("lists every partner in order, each with its logo (described) and its label", () => {
    render(<PartnersSection content={content} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(content.partners.length);
    content.partners.forEach((partner, index) => {
      const item = within(items[index]);
      expect(item.getByRole("img", { name: partner.logo.alt }).getAttribute("src")).toBe(partner.logo.src);
      expect(item.getByText(partner.role)).toBeTruthy();
    });
  });

  it("draws the divider of every card for decoration only (no name, hidden from assistive technology)", () => {
    const { container } = render(<PartnersSection content={content} />);
    const dividers = container.querySelectorAll('img[src$="divider.svg"]');
    expect(dividers).toHaveLength(content.partners.length);
    for (const divider of dividers) {
      expect(divider.getAttribute("alt")).toBe("");
      expect(divider.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("scales every card's sizes with the card itself (container query units of the designed 494px)", () => {
    const { container } = render(<PartnersSection content={content} />);
    const first = container.querySelector("[data-partner-card]")!;
    expect(first.className).toContain("@container");
    // the card's own sizes (next/image adds its own inline style to the logo, which is not one of them)
    const sizes = [...first.querySelectorAll<HTMLElement>("[style*='calc']")].map((el) => el.getAttribute("style") ?? "");
    expect(sizes.length).toBeGreaterThan(3);
    // jsdom writes calc(185.07 * 100cqw / 494) as calc(37.46cqw): the same value, in container units, never in px
    for (const style of sizes) {
      expect(style).toContain("cqw");
      expect(style).not.toMatch(/\d\s*px/);
    }
    // the minimum height of the card is 185.07 of 494 (the designed 187.07 less the 2px border)
    expect(sizes.some((style) => style.includes("min-height: calc(37.46"))).toBe(true);
  });

  it("shows any list of partners (the CMS decides how many)", () => {
    const one = { ...content, partners: [content.partners[0]] };
    render(<PartnersSection content={one} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(1);
  });
});
