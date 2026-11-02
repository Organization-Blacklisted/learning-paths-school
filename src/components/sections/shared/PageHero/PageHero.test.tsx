import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageHero from "@/components/sections/shared/PageHero";
import { defaultContact } from "@/data/contact";
import { defaultPrincipalsWelcome } from "@/data/principals-welcome";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultContact.hero;
const textOnly = defaultPrincipalsWelcome.hero;

describe("PageHero", () => {
  it("is a region named after the page, with the heading as the page's one h1", () => {
    render(<PageHero content={content} />);
    const region = screen.getByRole("region", { name: content.label });
    expect(region).toBeTruthy();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe(`${content.titleLead} ${content.titleAccent}`);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the pill and the line of text", () => {
    render(<PageHero content={content} />);
    expect(screen.getByText(content.badge)).toBeTruthy();
    expect(screen.getByText(content.subtitle)).toBeTruthy();
  });

  it("shows the photo with its description, as the file in /public (not re-encoded)", () => {
    render(<PageHero content={content} />);
    const photo = screen.getByRole("img", { name: content.image.alt });
    expect(photo.getAttribute("src")).toBe(content.image.src);
  });

  it("draws the crest rule for decoration only (hidden from screen readers)", () => {
    const { container } = render(<PageHero content={content} />);
    const rule = container.querySelector('[aria-hidden="true"]');
    expect(rule?.querySelector("img")?.getAttribute("src")).toBe("/images/page-hero/crest.svg");
    expect(screen.queryAllByRole("img")).toHaveLength(1);
  });

  it("takes any page's content (it is the reusable hero)", () => {
    render(
      <PageHero
        content={{
          ...content,
          label: "About",
          badge: "About us",
          titleLead: "A School Built",
          titleAccent: "Around You",
          subtitle: "Another page",
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("A School Built Around You");
    expect(screen.getByText("About us")).toBeTruthy();
  });

  it("has a text-only look: no photo, the same heading card, the crest rule, and the semibold pill", () => {
    const { container } = render(<PageHero content={textOnly} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(`${textOnly.titleLead} ${textOnly.titleAccent}`);
    expect(screen.getByText(textOnly.badge).className).toContain("font-semibold");
    expect(container.querySelector("[data-hero-photo]")).toBeNull();
    // the only image is the decorative crest
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/images/page-hero/crest.svg");
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("has a bold pill with a photo", () => {
    render(<PageHero content={content} />);
    expect(screen.getByText(content.badge).className).toContain("font-bold");
  });
});
