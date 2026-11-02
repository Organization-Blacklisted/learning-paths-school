"use client";

import Image from "next/image";
import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { contactLabels } from "@/data/contact";
import { sendContactMessage } from "@/lib/actions/contact";
import {
  LIMITS,
  emptyContactForm,
  phoneDigits,
  validateContactForm,
  type ContactField,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/contact-form";

// The Contact page's form: First Name, Last Name, Email, Phone Number (optional, +91), Subject (a text field), Message and "Send Message".
// Figma "Form" (node 5644:9585), 784px wide at 1920px. Every field is a 1px grey box with its label sitting ON the top border (the label has
// the page's colour behind it, so the border seems to be cut), 53px high, 5.33px corners; the message box is 213px high. The rows are 32px apart.
//
// NOT CONNECTED TO AN E-MAIL HOST YET (owner, 2026-11-02): the form is complete and checks what the visitor typed (src/lib/contact-form.ts, the
// rules the server applies again), but src/lib/actions/contact.ts does not send anything yet. Until then a visitor who presses Send is told
// that the form cannot send just yet and given the e-mail address and the phone number: never that the message went. The page works the same
// once the action sends, and shows "Thank you" then.
//
// Accessibility: every field has a real <label>, errors are written under the field (aria-describedby, aria-invalid) and the first wrong field
// gets the focus; the result of sending is in an aria-live region. A hidden field (`website`) catches robots.

type Status = "idle" | "sending" | "sent" | "unavailable" | "error";

const fieldBox =
  "block w-full rounded-[5.333px] border border-brand-fog bg-transparent font-body text-px-18 tracking-[-0.01em] text-brand-navy outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue aria-invalid:border-red-700 aria-invalid:focus:ring-red-700";
const labelClass =
  "absolute -top-[13px] left-4 z-10 bg-brand-snow px-[5.333px] font-body text-px-18 leading-[1.5] tracking-[-0.01em] text-brand-navy/80";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <div className="relative">
        {children}
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 font-body text-px-14 leading-[1.4] text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ContactForm({ fallback }: { fallback: { email: string; phone: string } }) {
  const labels = contactLabels.form;
  const base = useId();
  const id = (name: string) => `${base}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ContactFormValues>(emptyContactForm);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [shown, setShown] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const change = (name: keyof ContactFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const next = { ...values, [name]: event.target.value };
    setValues(next);
    // A field that already showed an error is checked again as the visitor fixes it.
    if (name !== "website" && shown[name]) setErrors(validateContactForm(next));
  };
  const blur = (name: ContactField) => () => {
    setShown((current) => ({ ...current, [name]: true }));
    setErrors(validateContactForm(values));
  };
  const shownError = (name: ContactField) => (shown[name] ? errors[name] : undefined);
  const a11y = (name: ContactField) => ({
    id: id(name),
    name,
    "aria-invalid": shownError(name) ? (true as const) : undefined,
    "aria-describedby": shownError(name) ? `${id(name)}-error` : undefined,
    onBlur: blur(name),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const found = validateContactForm(values);
    setErrors(found);
    setShown({ firstName: true, lastName: true, email: true, phone: true, subject: true, message: true });
    const firstWrong = (Object.keys(found) as ContactField[])[0];
    if (firstWrong) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstWrong}"]`)?.focus();
      setStatus("idle");
      return;
    }
    setStatus("sending");
    try {
      const result = await sendContactMessage(values);
      if (result.ok) {
        setValues(emptyContactForm);
        setShown({});
        setErrors({});
        setStatus("sent");
      } else if (result.reason === "invalid") {
        setErrors(result.errors);
        setStatus("idle");
      } else {
        setStatus("unavailable");
      }
    } catch {
      setStatus("error");
    }
  }

  const sending = status === "sending";
  const text = `${fieldBox} h-[53.333px] px-[21.333px]`;
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-label="Contact form"
      className="relative order-1 flex w-full flex-col gap-8 lg:order-2 lg:max-w-[784px] lg:justify-self-end"
    >
      <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-[26.667px]">
        <Field id={id("firstName")} label={labels.firstName} error={shownError("firstName")}>
          <input
            {...a11y("firstName")}
            type="text"
            autoComplete="given-name"
            maxLength={LIMITS.name + 20}
            required
            value={values.firstName}
            onChange={change("firstName")}
            className={text}
          />
        </Field>
        <Field id={id("lastName")} label={labels.lastName} error={shownError("lastName")}>
          <input
            {...a11y("lastName")}
            type="text"
            autoComplete="family-name"
            maxLength={LIMITS.name + 20}
            required
            value={values.lastName}
            onChange={change("lastName")}
            className={text}
          />
        </Field>
      </div>

      <Field id={id("email")} label={labels.email} error={shownError("email")}>
        <input
          {...a11y("email")}
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={LIMITS.email}
          required
          value={values.email}
          onChange={change("email")}
          className={text}
        />
      </Field>

      {/* Phone: the box is 67px high and holds the fixed +91 (a flag and the code, 109px wide with a rule after it) and the number */}
      <Field id={id("phone")} label={labels.phone} error={shownError("phone")}>
        <div
          className={`${fieldBox} flex h-[67px] items-center gap-4 focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue`}
          aria-invalid={shownError("phone") ? true : undefined}
        >
          <span
            aria-hidden="true"
            className="flex h-[53px] w-[109px] shrink-0 items-center gap-[3px] border-r border-brand-fog px-[21.333px]"
          >
            <Image
              src="/images/contact/flag-in.avif"
              alt=""
              width={21}
              height={18}
              unoptimized
              className="h-[18px] w-[21px] object-cover"
            />
            <span className="font-body text-px-18 leading-[1.5] tracking-[-0.01em] text-brand-navy/80">+91</span>
          </span>
          <input
            {...a11y("phone")}
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            maxLength={20}
            value={values.phone}
            onChange={change("phone")}
            className="h-[53px] min-w-0 flex-1 bg-transparent pr-[21.333px] font-body text-px-18 tracking-[-0.01em] text-brand-navy outline-none"
          />
        </div>
      </Field>

      <Field id={id("subject")} label={labels.subject} error={shownError("subject")}>
        <input
          {...a11y("subject")}
          type="text"
          autoComplete="off"
          maxLength={LIMITS.subject + 20}
          required
          value={values.subject}
          onChange={change("subject")}
          className={text}
        />
      </Field>

      <Field id={id("message")} label={labels.message} error={shownError("message")}>
        <textarea
          {...a11y("message")}
          required
          maxLength={LIMITS.message + 200}
          value={values.message}
          onChange={change("message")}
          className={`${fieldBox} h-[213.333px] resize-none px-[21.333px] pt-4 leading-[1.4]`}
        />
      </Field>

      {/* The hidden field for robots: out of sight and out of the tab order, and hidden from assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={change("website")} />
        </label>
      </div>

      <div className="flex flex-col items-start">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-[48.333px] min-w-[176px] items-center justify-center gap-[10.667px] bg-brand-green-light px-[11.34px] font-body text-px-18 leading-[1.5] tracking-[-0.01em] whitespace-nowrap text-white transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-wait disabled:opacity-70"
        >
          <Image
            src="/images/contact/icon-arrow.svg"
            alt=""
            width={19}
            height={19}
            aria-hidden="true"
            className="size-[18.656px] shrink-0"
          />
          {sending ? labels.sending : labels.send}
        </button>

        {/* The room above the message exists only while there is a message, so the form is exactly as high as the design (648px) until then. */}
        <div
          aria-live="polite"
          className={`font-body text-px-16 leading-[1.5] text-brand-navy/80 ${status === "idle" || status === "sending" ? "" : "mt-4"}`}
        >
          {status === "sent" ? <p>Thank you. Your message has been sent and we will reply soon.</p> : null}
          {status === "unavailable" ? (
            <p>
              Sorry, this form cannot send messages just yet. Please email us at{" "}
              <a href={`mailto:${fallback.email}`} className="underline underline-offset-4">
                {fallback.email}
              </a>{" "}
              or call{" "}
              <a href={`tel:${phoneDigits(fallback.phone)}`} className="underline underline-offset-4">
                {fallback.phone}
              </a>
              .
            </p>
          ) : null}
          {status === "error" ? (
            <p>Something went wrong and your message was not sent. Please try again, or email us at {fallback.email}.</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
