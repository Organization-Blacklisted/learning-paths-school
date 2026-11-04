import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PhotoBannerSection from "@/components/sections/shared/PhotoBannerSection";
import { defaultStudentCouncil } from "@/data/student-council";

// The entrance animation (GSAP) is checked in a real browser; here it does nothing.
vi.mock("@/lib/useScrollReveal", () => ({ useScrollReveal: () => {} }));

const intro = defaultStudentCouncil.intro;
const gallery = defaultStudentCouncil.gallery;

describe("PhotoBannerSection", () => {
  it("is a region named for the section", () => {
    render(<PhotoBannerSection content={intro} />);
    expect(screen.getByRole("region", { name: intro.label })).toBeTruthy();
  });

  it("shows the photo with its description, and the title as an h2 made of the blue words then the grey ones", () => {
    render(<PhotoBannerSection content={intro} />);
    expect(screen.getByRole("img", { name: intro.image.alt }).getAttribute("src")).toBe(intro.image.src);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe(`${intro.titleAccent} ${intro.titleRest}`);
    // the first words are the blue slanted ones
    expect(heading.firstElementChild?.textContent).toBe(intro.titleAccent);
    expect(heading.firstElementChild?.className).toContain("text-brand-blue");
  });

  it("shows the paragraph under the title", () => {
    render(<PhotoBannerSection content={intro} />);
    expect(screen.getByText(intro.text!)).toBeTruthy();
  });

  it("keeps the photo in the shape of its design box (1520 by the photo's height)", () => {
    const { container, rerender } = render(<PhotoBannerSection content={intro} />);
    expect(container.querySelector<HTMLElement>("[data-banner-photo]")?.style.aspectRatio).toBe("1520 / 723");
    rerender(<PhotoBannerSection content={gallery} />);
    expect(container.querySelector<HTMLElement>("[data-banner-photo]")?.style.aspectRatio).toBe("1520 / 782");
  });

  it("puts the title UNDER the photo when it says so (and the paragraph with it), and ABOVE the photo when it says so", () => {
    const { container, rerender } = render(<PhotoBannerSection content={intro} />);
    const order = () => {
      const heading = container.querySelector("h2")!;
      const photo = container.querySelector("[data-banner-photo]")!;
      return photo.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING ? "photo, title" : "title, photo";
    };
    expect(order()).toBe("photo, title");
    rerender(<PhotoBannerSection content={gallery} />);
    expect(order()).toBe("title, photo");
  });

  it("has no paragraph when the content has none", () => {
    const { container } = render(<PhotoBannerSection content={{ ...intro, text: undefined }} />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("loads the photo right away only when it is told to (the biggest thing of the first screen); otherwise it is lazy", () => {
    const { container, rerender } = render(<PhotoBannerSection content={intro} priority />);
    expect(container.querySelector("img")?.getAttribute("loading")).not.toBe("lazy");
    rerender(<PhotoBannerSection content={intro} />);
    expect(container.querySelector("img")?.getAttribute("loading")).toBe("lazy");
  });
});
