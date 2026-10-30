import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MegaMenu from "@/components/layouts/MegaMenu";
import { menuContent } from "@/data/menu";

// The menu's content, structure and behaviour (what it shows, the chosen item, Escape, the focus, the page scroll). How it LOOKS and slides is
// checked in a real browser by the QA suite (tests/interactions.mjs).
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const first = menuContent.sections[0];
const second = menuContent.sections[1];

// A phone (no media query matches) or a screen from 768px (the lists side by side; 1280px adds the photo)
function setScreen(kind: "phone" | "tablet" | "desktop") {
  const matches = (query: string) => (query.includes("1280px") ? kind === "desktop" : query.includes("768px") ? kind !== "phone" : false);
  window.matchMedia = ((query: string) => ({
    matches: matches(query),
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

const parentButton = (label: string) => screen.getByRole("button", { name: label });

beforeEach(() => {
  vi.useFakeTimers();
  setScreen("desktop");
});
afterEach(() => {
  vi.useRealTimers();
  document.documentElement.style.overflow = "";
});

describe("MegaMenu", () => {
  it("is in the page but closed: inert (not focusable, not announced), so the links can still be read by search engines", () => {
    render(<MegaMenu open={false} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog.hasAttribute("inert")).toBe(true);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe(menuContent.label);
    expect(dialog.querySelectorAll("a").length).toBeGreaterThan(20);
  });

  it("shows the eight main items, the two small links and the two buttons when open", () => {
    render(<MegaMenu open onClose={() => {}} />);
    expect(screen.getByRole("dialog").hasAttribute("inert")).toBe(false);
    for (const section of menuContent.sections) expect(parentButton(section.label)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Parent Login" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Contact us" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Begin an Admission Enquiry" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Career" })).toBeTruthy();
  });

  it("side by side, the first item is chosen when it opens and shows its links; choosing another swaps the links", () => {
    render(<MegaMenu open onClose={() => {}} />);
    expect(parentButton(first.label).getAttribute("aria-expanded")).toBe("true");
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("false");
    const list = (id: string) => document.getElementById(parentButton(id).getAttribute("aria-controls") as string) as HTMLElement;
    expect(list(first.label).hasAttribute("inert")).toBe(false);
    expect(list(second.label).hasAttribute("inert")).toBe(true);

    fireEvent.click(parentButton(second.label));
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("true");
    expect(parentButton(first.label).getAttribute("aria-expanded")).toBe("false");
    expect(list(second.label).hasAttribute("inert")).toBe(false);
    expect(list(first.label).hasAttribute("inert")).toBe(true);
    // choosing the chosen item again keeps it chosen (a column is never empty)
    fireEvent.click(parentButton(second.label));
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("true");
  });

  it("each time it opens, the chosen item starts again from the first one (side by side)", () => {
    const { rerender } = render(<MegaMenu open={false} onClose={() => {}} />);
    rerender(<MegaMenu open onClose={() => {}} />);
    fireEvent.click(parentButton(second.label));
    rerender(<MegaMenu open={false} onClose={() => {}} />);
    rerender(<MegaMenu open onClose={() => {}} />);
    expect(parentButton(first.label).getAttribute("aria-expanded")).toBe("true");
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("false");
  });

  it("a mouse over an item chooses it (side by side only)", () => {
    render(<MegaMenu open onClose={() => {}} />);
    fireEvent.pointerEnter(parentButton(second.label), { pointerType: "mouse" });
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("true");
    fireEvent.pointerEnter(parentButton(first.label), { pointerType: "touch" });
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("true");
  });

  it("on a phone every item starts closed and tapping opens it and tapping it again closes it (an accordion)", () => {
    setScreen("phone");
    // like the real page: it is on the page closed, then opened by the menu button
    const { rerender } = render(<MegaMenu open={false} onClose={() => {}} />);
    rerender(<MegaMenu open onClose={() => {}} />);
    for (const section of menuContent.sections) expect(parentButton(section.label).getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(parentButton(second.label));
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(parentButton(first.label));
    expect(parentButton(first.label).getAttribute("aria-expanded")).toBe("true");
    expect(parentButton(second.label).getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(parentButton(first.label));
    expect(parentButton(first.label).getAttribute("aria-expanded")).toBe("false");
  });

  it("Escape and the close button close it; a click on any link closes it", () => {
    const onClose = vi.fn();
    render(<MegaMenu open onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: menuContent.closeLabel }));
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("link", { name: "Career" }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("moves the focus to the close button when it opens, and gives it back to the menu button when it closes", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    const returnFocusRef = createRef<HTMLElement>();
    (returnFocusRef as { current: HTMLElement | null }).current = opener;
    const { rerender } = render(<MegaMenu open={false} onClose={() => {}} returnFocusRef={returnFocusRef} />);
    rerender(<MegaMenu open onClose={() => {}} returnFocusRef={returnFocusRef} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: menuContent.closeLabel }));
    rerender(<MegaMenu open={false} onClose={() => {}} returnFocusRef={returnFocusRef} />);
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("keeps the focus inside while open: Tab on the last element goes to the first, Shift+Tab on the first goes to the last", () => {
    render(<MegaMenu open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    const focusable = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
      (element) => !element.closest("[inert]"),
    );
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    lastElement.focus();
    fireEvent.keyDown(lastElement, { key: "Tab" });
    expect(document.activeElement).toBe(firstElement);
    fireEvent.keyDown(firstElement, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastElement);
    // the links of the items that are not chosen are inert, so they are not in the loop
    expect(focusable.some((element) => element.textContent === second.links[0].label)).toBe(false);
  });

  it("stops the page from scrolling while it is open and lets it scroll again when it closes", () => {
    const { rerender } = render(<MegaMenu open={false} onClose={() => {}} />);
    expect(document.documentElement.style.overflow).toBe("");
    rerender(<MegaMenu open onClose={() => {}} />);
    expect(document.documentElement.style.overflow).toBe("hidden");
    rerender(<MegaMenu open={false} onClose={() => {}} />);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("only asks for the photo on a wide screen, once the visitor is about to open the menu or has opened it", () => {
    const { rerender, container } = render(<MegaMenu open={false} onClose={() => {}} />);
    expect(container.querySelector("img[src*='menu-crest']")).toBeNull();
    rerender(<MegaMenu open={false} warm onClose={() => {}} />);
    expect(container.querySelector("img[src*='menu-crest']")).not.toBeNull();
  });

  it("never loads the photo on a tablet or a phone", () => {
    setScreen("tablet");
    const { container } = render(<MegaMenu open warm onClose={() => {}} />);
    expect(container.querySelector("img[src*='menu-crest']")).toBeNull();
  });
});

describe("the menu content (src/data/menu.ts)", () => {
  it("has the eight main items of the design, each with links, and every link has an address", () => {
    expect(menuContent.sections.map((section) => section.label)).toEqual([
      "About Us",
      "Admissions",
      "Pre-Primary",
      "Primary",
      "Secondary",
      "XI & XII",
      "Alumni",
      "Connect",
    ]);
    for (const section of menuContent.sections) {
      expect(section.links.length).toBeGreaterThanOrEqual(2);
      expect(section.links.length).toBeLessThanOrEqual(8);
      expect(new Set(section.links.map((link) => link.id)).size).toBe(section.links.length);
      for (const link of section.links) expect(link.href).toBeTruthy();
    }
  });

  it("has the eight links of About Us from the design (spelling corrected)", () => {
    expect(first.links.map((link) => link.label)).toEqual([
      "Welcome to LPS",
      "Principal’s Welcome",
      "Partnerships",
      "Campus Experience",
      "Awards & Recognition",
      "Signature Events",
      "Student Council",
      "Information Desk",
    ]);
  });
});
