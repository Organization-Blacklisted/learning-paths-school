import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CrestCardsSection from "@/components/sections/shared/CrestCardsSection";
import { defaultWelcomeToLps } from "@/data/welcome-to-lps";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultWelcomeToLps.crests;

describe("CrestCardsSection", () => {
  it("is a region named for the section, with one list item per card", () => {
    render(<CrestCardsSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(content.cards.length);
  });

  it("shows each card's crest (described), its title as an h2 and its paragraph, in order", () => {
    render(<CrestCardsSection content={content} />);
    const items = screen.getAllByRole("listitem");
    content.cards.forEach((card, index) => {
      const block = within(items[index]);
      expect(block.getByRole("img", { name: card.image.alt }).getAttribute("src")).toBe(card.image.src);
      expect(block.getByRole("heading", { level: 2 }).textContent).toBe(card.title);
      expect(block.getByText(card.text)).toBeTruthy();
    });
  });

  it("sets the title in the blue slanted style, centred over the crest", () => {
    render(<CrestCardsSection content={content} />);
    const heading = screen.getAllByRole("heading", { level: 2 })[0];
    expect(heading.firstElementChild?.className).toContain("text-brand-blue");
    expect(heading.className).toContain("-translate-x-1/2");
    expect(heading.className).toContain("text-center");
  });

  it("keeps the crest in its 365 : 313 shape and makes it a size container, so the title's box follows it", () => {
    const { container } = render(<CrestCardsSection content={content} />);
    for (const crest of container.querySelectorAll("[data-crest]")) {
      expect(crest.className).toContain("aspect-[365/313]");
      expect(crest.className).toContain("@container");
    }
  });

  it("gives each card its own designed widths: the title's box and the paragraph's (Vision breaks on two lines, Mission stays on one)", () => {
    render(<CrestCardsSection content={content} />);
    const titles = screen.getAllByRole("heading", { level: 2 });
    // the browser works the calc() out: the box is that share of the crest, in container width units
    const share = (el: HTMLElement) => Number.parseFloat(/calc\(([\d.]+)cqw\)/.exec(el.getAttribute("style") ?? "")?.[1] ?? "0");
    expect(share(titles[0])).toBeCloseTo((132.36 / 365) * 100, 1);
    expect(share(titles[1])).toBeCloseTo((200.79 / 365) * 100, 1);
    const paragraphs = content.cards.map((card) => screen.getByText(card.text));
    expect(paragraphs[0].getAttribute("style")).toContain("423 * 100cqw / 1108");
    expect(paragraphs[1].getAttribute("style")).toContain("365 * 100cqw / 1108");
  });

  it("scales the columns with the block (container query units of the designed 1108px, never px)", () => {
    render(<CrestCardsSection content={content} />);
    for (const item of screen.getAllByRole("listitem")) {
      const style = item.getAttribute("style") ?? "";
      expect(style).toContain("485 * 100cqw / 1108");
      expect(style).not.toMatch(/\d\s*px/);
    }
  });

  it("shows any number of cards (the CMS decides)", () => {
    render(<CrestCardsSection content={{ ...content, cards: [content.cards[0]] }} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
