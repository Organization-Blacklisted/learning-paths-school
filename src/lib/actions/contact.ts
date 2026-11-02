"use server";

import { isSpam, validateContactForm, type ContactFormErrors, type ContactFormValues } from "@/lib/contact-form";

// What the Contact page's form does with a message. NOT CONNECTED YET (owner, 2026-11-02: "we will connect it with an email host later"): the
// form is built and validated, and this is the one place to finish. When the e-mail host is chosen:
//   1. send `values` to the school's address (admissions or general, by `values.subject`) with the host's SDK or SMTP;
//   2. keep the reply-to as `values.email`;
//   3. return { ok: true } when the host accepted it.
// Until then it answers "not-configured", and the page tells the visitor to e-mail or phone (never that the message was sent).

export type ContactSendResult =
  { ok: true } | { ok: false; reason: "invalid"; errors: ContactFormErrors } | { ok: false; reason: "not-configured" };

export async function sendContactMessage(values: ContactFormValues): Promise<ContactSendResult> {
  // The browser checked already; the server never trusts that.
  const errors = validateContactForm(values);
  if (Object.keys(errors).length > 0) return { ok: false, reason: "invalid", errors };
  // A robot gets the same answer as a visitor, and nothing is sent.
  if (isSpam(values)) return { ok: true };
  return { ok: false, reason: "not-configured" };
}
