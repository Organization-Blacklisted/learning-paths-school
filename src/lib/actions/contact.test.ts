import { describe, expect, it } from "vitest";
import { emptyContactForm, type ContactFormValues } from "@/lib/contact-form";
import { sendContactMessage } from "./contact";

const valid: ContactFormValues = {
  firstName: "Asha",
  lastName: "Kaur",
  email: "asha@example.com",
  phone: "",
  subject: "General enquiry",
  message: "Could you tell me about the admission dates?",
  website: "",
};

// The action does not send anything yet (no e-mail host, owner 2026-11-02): these tests pin down what it answers until it does.
describe("sendContactMessage", () => {
  it("checks the form again on the server and says what is wrong", async () => {
    const result = await sendContactMessage({ ...emptyContactForm, email: "nope" });
    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    if (!result.ok && result.reason === "invalid") expect(Object.keys(result.errors)).toContain("email");
  });

  it('says "not-configured" for a good message, and never that it was sent', async () => {
    expect(await sendContactMessage(valid)).toEqual({ ok: false, reason: "not-configured" });
  });

  it("answers a robot (the hidden field is filled) as if it had worked, and sends nothing", async () => {
    expect(await sendContactMessage({ ...valid, website: "http://spam.example" })).toEqual({ ok: true });
  });
});
