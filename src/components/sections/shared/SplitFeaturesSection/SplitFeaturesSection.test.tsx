import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SplitFeaturesSection from "@/components/sections/shared/SplitFeaturesSection";
import { defaultStudentCouncil } from "@/data/student-council";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultStudentCouncil.features;

describe("SplitFeaturesSection", () => {
  it("is a region named for the section", () => {
    render(<SplitFeaturesSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
  });

  it("shows every row in order: its photo (described), its heading as an h2 and its paragraph", () => {
    render(<SplitFeaturesSection content={content} />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(content.rows.length);
    content.rows.forEach((row, index) => {
      const block = within(articles[index]);
      expect(block.getByRole("img", { name: row.image.alt }).getAttribute("src")).toBe(row.image.src);
      expect(block.getByRole("heading", { level: 2 }).textContent).toBe(row.title);
      expect(block.getByText(row.text)).toBeTruthy();
    });
  });

  it("sets the heading in the blue slanted style, in a box two lines high", () => {
    render(<SplitFeaturesSection content={content} />);
    const heading = screen.getAllByRole("heading", { level: 2 })[0];
    expect(heading.firstElementChild?.className).toContain("text-brand-blue");
    expect(heading.className).toContain("min-h-[2.3766em]");
  });

  it("puts a thin rule, decoration only (hidden from assistive technology, no name), between the heading and the paragraph", () => {
    const { container } = render(<SplitFeaturesSection content={content} />);
    const rules = container.querySelectorAll("span[aria-hidden='true']");
    expect(rules).toHaveLength(content.rows.length);
    expect(rules[0].querySelector("img")?.getAttribute("alt")).toBe("");
    const row = container.querySelector("article")!;
    const heading = row.querySelector("h2")!;
    const paragraph = row.querySelector("p")!;
    expect(heading.compareDocumentPosition(rules[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(rules[0].compareDocumentPosition(paragraph) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps the photo in its 777 : 565 shape", () => {
    const { container } = render(<SplitFeaturesSection content={content} />);
    for (const photo of container.querySelectorAll("[data-feature-photo]")) expect(photo.className).toContain("aspect-[777/565]");
  });

  it("scales the designed offsets with the block (container query units of the designed 1437px, never px)", () => {
    const { container } = render(<SplitFeaturesSection content={content} />);
    const styles = [...container.querySelectorAll<HTMLElement>("article > div[style]")].map((el) => el.getAttribute("style") ?? "");
    expect(styles.length).toBeGreaterThanOrEqual(content.rows.length);
    for (const style of styles) {
      expect(style).toContain("cqw");
      expect(style).not.toMatch(/\d\s*px/);
    }
  });

  it("gives each row its own designed column: the first two 532px at 81px, the third 572px at 88px", () => {
    const { container } = render(<SplitFeaturesSection content={content} />);
    const styles = [...container.querySelectorAll<HTMLElement>("article > div")].map((el) => el.getAttribute("style") ?? "");
    expect(styles[0]).toContain("532 * 100cqw / 1437");
    expect(styles[0]).toContain("81 * 100cqw / 1437");
    expect(styles[2]).toContain("572 * 100cqw / 1437");
    expect(styles[2]).toContain("88 * 100cqw / 1437");
  });

  it("shows any list of rows (the CMS decides how many)", () => {
    render(<SplitFeaturesSection content={{ ...content, rows: [content.rows[0]] }} />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });
});
