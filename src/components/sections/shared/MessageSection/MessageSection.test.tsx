import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MessageSection from "@/components/sections/shared/MessageSection";
import { defaultPrincipalsWelcome } from "@/data/principals-welcome";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const content = defaultPrincipalsWelcome.message;

describe("MessageSection", () => {
  it("is a region with the quotation as its heading", () => {
    render(<MessageSection content={content} />);
    expect(screen.getByRole("region", { name: content.label })).toBeTruthy();
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe(`${content.titleLead} ${content.titleAccent}`);
  });

  it("shows the portrait with its description, as the file in /public (not re-encoded)", () => {
    render(<MessageSection content={content} />);
    const portrait = screen.getByRole("img", { name: content.image.alt });
    expect(portrait.getAttribute("src")).toBe(content.image.src);
  });

  it("shows every paragraph of the letter, in order", () => {
    const { container } = render(<MessageSection content={content} />);
    const shown = [...container.querySelectorAll("p")].map((p) => p.textContent);
    expect(shown.slice(0, content.paragraphs.length)).toEqual(content.paragraphs);
  });

  it("keeps a line break inside a paragraph (it starts a new line there, with no extra space)", () => {
    render(<MessageSection content={content} />);
    const last = content.paragraphs[content.paragraphs.length - 1];
    expect(last).toContain("\n");
    const paragraph = screen.getByText(/Collaboration with parents/);
    expect(paragraph.textContent).toBe(last);
    expect(paragraph.className).toContain("whitespace-pre-line");
  });

  it("shows the name and the role under the letter, the name in the italic font that is loaded only for it", () => {
    render(<MessageSection content={content} />);
    const name = screen.getByText(content.signatory.name);
    expect(name.className).toContain("italic");
    expect(name.style.fontFamily).toContain("--font-plus-jakarta-italic");
    expect(screen.getByText(content.signatory.role)).toBeTruthy();
  });

  it("draws the rule under the heading for decoration only", () => {
    const { container } = render(<MessageSection content={content} />);
    expect(container.querySelector('[aria-hidden="true"].bg-brand-blue')).toBeTruthy();
  });

  it("takes any person's message (it is the reusable section)", () => {
    render(
      <MessageSection
        content={{
          label: "A message from the Chairperson",
          image: { src: "/x.avif", alt: "The Chairperson", width: 100, height: 100 },
          titleLead: "A Note",
          titleAccent: "From Us",
          paragraphs: ["One.", "Two."],
          signatory: { name: "Mr. Chair", role: "chairperson" },
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("A Note From Us");
    expect(screen.getByText("One.")).toBeTruthy();
    expect(screen.getByText("Two.")).toBeTruthy();
    expect(screen.getByText("Mr. Chair")).toBeTruthy();
  });
});
