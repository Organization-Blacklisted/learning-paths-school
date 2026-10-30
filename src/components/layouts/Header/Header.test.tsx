import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/layouts/Header";

// Which header the server draws. The look of the header and how it moves are checked in a real browser (tests/interactions.mjs).
let pathname: string | null = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

beforeEach(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

const variantAt = (path: string | null) => {
  pathname = path;
  const { container, unmount } = render(<Header />);
  const header = container.querySelector("header");
  const result = { variant: header?.getAttribute("data-variant"), position: header ? header.className.includes("fixed") : null };
  unmount();
  return result;
};

describe("Header variant", () => {
  it("is the transparent, fixed header on the home page", () => {
    expect(variantAt("/")).toEqual({ variant: "transparent", position: true });
  });

  it('is the transparent header for "/index" too: that is how the server names the home page on Vercel (a blue bar in the page flow pushed the hero down 74px, found 2026-10-30)', () => {
    expect(variantAt("/index")).toEqual({ variant: "transparent", position: true });
  });

  it("is the solid, sticky header on every other page", () => {
    expect(variantAt("/admissions")).toEqual({ variant: "solid", position: false });
    expect(variantAt(null)).toEqual({ variant: "solid", position: false });
  });
});
