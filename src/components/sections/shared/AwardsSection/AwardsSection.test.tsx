import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AwardsSection from "@/components/sections/shared/AwardsSection";
import { defaultAwardsRecognition } from "@/data/awards-recognition";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultAwardsRecognition.awards;

describe("AwardsSection", () => {
  it("is a region named for the section", () => {
    render(<AwardsSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
  });

  it("shows every award in order: its photo (described), its title as a heading and its paragraph", () => {
    render(<AwardsSection content={content} />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(content.awards.length);
    content.awards.forEach((award, index) => {
      const block = within(articles[index]);
      expect(block.getByRole("img", { name: award.image.alt }).getAttribute("src")).toBe(award.image.src);
      expect(block.getByRole("heading", { level: 2 }).textContent).toBe(award.title);
      expect(block.getByText(award.text)).toBeTruthy();
    });
  });

  it("frames each block with two laurels that are decoration only (no name, hidden from assistive technology), the right one mirrored", () => {
    const { container } = render(<AwardsSection content={content} />);
    const laurels = container.querySelectorAll("[data-award-laurel]");
    expect(laurels).toHaveLength(content.awards.length * 2);
    for (const laurel of laurels) {
      expect(laurel.getAttribute("aria-hidden")).toBe("true");
      expect(laurel.querySelector("img")?.getAttribute("alt")).toBe("");
    }
    expect(container.querySelectorAll("[data-award-laurel='right']")[0].className).toContain("-scale-x-100");
    expect(container.querySelectorAll("[data-award-laurel='left']")[0].className).not.toContain("-scale-x-100");
  });

  it("keeps the photo in its 924 : 585 shape", () => {
    const { container } = render(<AwardsSection content={content} />);
    for (const photo of container.querySelectorAll("[data-award-photo]")) expect(photo.className).toContain("aspect-[924/585]");
  });

  it("scales the designed offsets with the block (container query units of the designed 924px, never px)", () => {
    const { container } = render(<AwardsSection content={content} />);
    const styles = [...container.querySelectorAll<HTMLElement>("article [style*='calc'], article [style*='cqw']")].map(
      (el) => el.getAttribute("style") ?? "",
    );
    expect(styles.length).toBeGreaterThan(6);
    for (const style of styles) {
      expect(style).toContain("cqw");
      expect(style).not.toMatch(/\d\s*px/);
    }
  });

  it("shows any list of awards (the CMS decides how many)", () => {
    render(<AwardsSection content={{ ...content, awards: [content.awards[0]] }} />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });
});
