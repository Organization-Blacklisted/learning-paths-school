import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactForm from "@/components/sections/contact/ContactForm";
import { sendContactMessage } from "@/lib/actions/contact";

// The action is replaced: what it answers is tested in src/lib/actions/contact.test.ts. How the form LOOKS is checked in a real browser.
vi.mock("@/lib/actions/contact", () => ({ sendContactMessage: vi.fn() }));
const send = vi.mocked(sendContactMessage);

const fallback = { email: "contact@learningpaths.in", phone: "0172-5134300" };

const field = (label: string) => screen.getByLabelText(label, { exact: false }) as HTMLInputElement;
const type = (label: string, value: string) => fireEvent.change(field(label), { target: { value } });
function fillValid() {
  type("First Name", "Asha");
  type("Last Name", "Kaur");
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "asha@example.com" } });
  type("Subject", "General enquiry");
  type("Message", "Could you tell me about the admission dates?");
}
const press = () => fireEvent.click(screen.getByRole("button", { name: /send message/i }));

// mockClear, not mockReset: after a mockReset vitest reports the rejection of a mocked call as an unhandled error even though the form catches it.
beforeEach(() => {
  send.mockClear();
});

describe("ContactForm", () => {
  it("has a labelled field for everything the design shows, the Subject being plain text", () => {
    render(<ContactForm fallback={fallback} />);
    for (const label of ["First Name", "Last Name", "Email", "Phone Number (optional)", "Subject", "Message"]) {
      expect(screen.getByLabelText(label, { exact: false }), label).toBeTruthy();
    }
    // the Subject is a text field the visitor types in (owner, 2026-11-02: the drop-down of the design is out of date)
    expect((screen.getByLabelText("Subject") as HTMLInputElement).tagName).toBe("INPUT");
    expect(document.querySelector("select")).toBeNull();
  });

  it("does not send an empty form: it says what is missing under each field and puts the focus on the first one", () => {
    render(<ContactForm fallback={fallback} />);
    press();
    expect(send).not.toHaveBeenCalled();
    expect(screen.getByText("Please enter your first name.")).toBeTruthy();
    expect(screen.getByText("Please enter your email address.")).toBeTruthy();
    expect(screen.getByText("Please enter a subject.")).toBeTruthy();
    expect(screen.getByText("Please write your message.")).toBeTruthy();
    expect(document.activeElement).toBe(field("First Name"));
    expect(field("First Name").getAttribute("aria-invalid")).toBe("true");
    expect(field("First Name").getAttribute("aria-describedby")).toBeTruthy();
  });

  it("checks a field as the visitor leaves it, and clears the message once it is fixed", () => {
    render(<ContactForm fallback={fallback} />);
    const email = screen.getByLabelText("Email");
    type("Email", "nope");
    fireEvent.blur(email);
    expect(screen.getByText(/valid email address/)).toBeTruthy();
    fireEvent.change(email, { target: { value: "asha@example.com" } });
    expect(screen.queryByText(/valid email address/)).toBeNull();
    expect(email.getAttribute("aria-invalid")).toBeNull();
  });

  it("tells a visitor the truth while no e-mail host is connected: it cannot send yet, here are the address and the phone number", async () => {
    send.mockResolvedValue({ ok: false, reason: "not-configured" });
    render(<ContactForm fallback={fallback} />);
    fillValid();
    press();
    await waitFor(() => expect(screen.getByText(/cannot send messages just yet/)).toBeTruthy());
    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/has been sent/)).toBeNull();
    expect(screen.getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["mailto:contact@learningpaths.in", "tel:01725134300"]);
    // what the visitor typed is kept, so nothing is lost
    expect(field("First Name").value).toBe("Asha");
  });

  it("thanks the visitor and empties the form once the action sends it", async () => {
    send.mockResolvedValue({ ok: true });
    render(<ContactForm fallback={fallback} />);
    fillValid();
    press();
    await waitFor(() => expect(screen.getByText(/Your message has been sent/)).toBeTruthy());
    expect(send.mock.calls[0][0]).toMatchObject({ firstName: "Asha", email: "asha@example.com", subject: "General enquiry", website: "" });
    expect(field("First Name").value).toBe("");
  });

  it("shows the server's own complaints when it finds something the browser did not", async () => {
    send.mockResolvedValue({
      ok: false,
      reason: "invalid",
      errors: { email: "Please enter a valid email address, like name@example.com." },
    });
    render(<ContactForm fallback={fallback} />);
    fillValid();
    press();
    await waitFor(() => expect(screen.getByText(/valid email address/)).toBeTruthy());
  });

  it("says so when sending fails", async () => {
    send.mockImplementation(() => Promise.reject(new Error("network")));
    render(<ContactForm fallback={fallback} />);
    fillValid();
    await act(async () => {
      press();
    });
    expect(screen.getByText(/was not sent/)).toBeTruthy();
  });

  it("has a hidden field for robots that no visitor reaches (out of the tab order, hidden from assistive technology)", () => {
    const { container } = render(<ContactForm fallback={fallback} />);
    const trap = container.querySelector('input[name="website"]') as HTMLInputElement;
    expect(trap.tabIndex).toBe(-1);
    expect(trap.closest('[aria-hidden="true"]')).toBeTruthy();
  });
});
