import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AlternatingRowsSection from "@/components/sections/shared/AlternatingRowsSection";
import { defaultSignatureEvents } from "@/data/signature-events";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultSignatureEvents.events;

describe("AlternatingRowsSection", () => {
  it("is a region named for the section", () => {
    render(<AlternatingRowsSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
  });

  it("shows every row in order: its photo (described), its heading as an h2 and its paragraph", () => {
    render(<AlternatingRowsSection content={content} />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(content.rows.length);
    content.rows.forEach((row, index) => {
      const block = within(articles[index]);
      expect(block.getByRole("img", { name: row.image.alt }).getAttribute("src")).toBe(row.image.src);
      expect(block.getByRole("heading", { level: 2 }).textContent).toBe(row.title);
      expect(block.getByText(row.text)).toBeTruthy();
    });
  });

  it("sets the heading in the blue slanted style", () => {
    render(<AlternatingRowsSection content={content} />);
    expect(screen.getAllByRole("heading", { level: 2 })[0].firstElementChild?.className).toContain("text-brand-blue");
  });

  it("puts the photo on the right in the first row and on the left in the next, alternating (from lg; the photo is first in the page order for a small screen)", () => {
    const { container } = render(<AlternatingRowsSection content={content} />);
    const flows = [...container.querySelectorAll("article > div")].map((el) =>
      el.className.includes("lg:flex-row-reverse") ? "reverse" : "row",
    );
    expect(flows).toEqual(content.rows.map((_, index) => (index % 2 === 0 ? "reverse" : "row")));
    for (const article of container.querySelectorAll("article")) {
      const photo = article.querySelector("[data-row-photo]")!;
      const heading = article.querySelector("h2")!;
      expect(photo.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it("keeps the photo in its 818 : 523 shape", () => {
    const { container } = render(<AlternatingRowsSection content={content} />);
    for (const photo of container.querySelectorAll("[data-row-photo]")) expect(photo.className).toContain("aspect-[818/523]");
  });

  it("scales the designed sizes with the block (container query units of the designed 1520px, never px)", () => {
    const { container } = render(<AlternatingRowsSection content={content} />);
    const styles = [...container.querySelectorAll<HTMLElement>("article > div")].map((el) => el.getAttribute("style") ?? "");
    expect(styles).toHaveLength(content.rows.length);
    for (const style of styles) {
      expect(style).toContain("cqw");
      expect(style).not.toMatch(/\d\s*px/);
      expect(style).toContain("818 * 100cqw / 1520");
      expect(style).toContain("138 * 100cqw / 1520");
      expect(style).toContain("564 * 100cqw / 1520");
    }
  });

  it("gives each heading the width the author set (the second breaks in two although one line would fit)", () => {
    const { container } = render(<AlternatingRowsSection content={content} />);
    const styles = [...container.querySelectorAll<HTMLElement>("article > div")].map((el) => el.getAttribute("style") ?? "");
    expect(styles[0]).toContain("505.68 * 100cqw / 1520");
    expect(styles[1]).toContain("420.57 * 100cqw / 1520");
    expect(styles[7]).toContain("567.68 * 100cqw / 1520");
  });

  it("loads only the first photo right away, and only when told to (the others are lazy)", () => {
    const { container, rerender } = render(<AlternatingRowsSection content={content} priority />);
    const loading = () => [...container.querySelectorAll("img")].map((img) => img.getAttribute("loading"));
    expect(loading()[0]).not.toBe("lazy");
    expect(
      loading()
        .slice(1)
        .every((value) => value === "lazy"),
    ).toBe(true);
    rerender(<AlternatingRowsSection content={content} />);
    expect(loading().every((value) => value === "lazy")).toBe(true);
  });

  it("shows any list of rows (the CMS decides how many)", () => {
    render(<AlternatingRowsSection content={{ ...content, rows: [content.rows[0]] }} />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });
});
