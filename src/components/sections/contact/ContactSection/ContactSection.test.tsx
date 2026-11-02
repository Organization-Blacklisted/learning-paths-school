import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContactMap from "@/components/sections/contact/ContactMap";
import ContactSection from "@/components/sections/contact/ContactSection";
import { defaultContact } from "@/data/contact";

vi.mock("@/lib/actions/contact", () => ({ sendContactMessage: vi.fn() }));

describe("ContactSection", () => {
  it("shows the three groups of details with real links", () => {
    render(<ContactSection details={defaultContact.details} />);
    for (const heading of ["Email", "Contact", "Location"]) {
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeTruthy();
    }
    const email = screen.getByRole("link", { name: "admn@learningpaths.in" });
    expect(email.getAttribute("href")).toBe("mailto:admn@learningpaths.in");
    expect(email.parentElement?.textContent).toBe("admn@learningpaths.in (admissions)");
    const phone = screen.getByRole("link", { name: "098-780-07553" });
    expect(phone.getAttribute("href")).toBe("tel:09878007553");
    expect(phone.parentElement?.textContent).toBe("098-780-07553 (for admissions only)");
    expect(screen.getByText(/Site No 66, Plot No 3/)).toBeTruthy();
  });

  it("is an address element and has the form beside it", () => {
    const { container } = render(<ContactSection details={defaultContact.details} />);
    expect(container.querySelector("address")).toBeTruthy();
    expect(within(container).getByRole("form", { name: "Contact form" })).toBeTruthy();
  });

  it("writes only the notes that exist", () => {
    render(<ContactSection details={{ emails: [{ address: "a@x.in" }], phones: [{ number: "123-4567" }], location: "Somewhere" }} />);
    expect(screen.getByRole("link", { name: "a@x.in" }).parentElement?.textContent).toBe("a@x.in");
    expect(screen.getByRole("link", { name: "123-4567" }).parentElement?.textContent).toBe("123-4567");
  });
});

describe("ContactMap", () => {
  const embedUrl = defaultContact.map.embedUrl;

  it("is a lazy Google Maps iframe with a name for screen readers", () => {
    render(<ContactMap embedUrl={embedUrl} title="The map" />);
    const frame = screen.getByTitle("The map");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame.getAttribute("src")).toBe(embedUrl);
    expect(frame.getAttribute("loading")).toBe("lazy");
    expect(frame.getAttribute("referrerpolicy")).toBe("strict-origin-when-cross-origin");
  });

  it("draws nothing for an address that is not a Google Maps embed", () => {
    const { container } = render(<ContactMap embedUrl="https://evil.example/embed" title="The map" />);
    expect(container.querySelector("iframe")).toBeNull();
  });
});
