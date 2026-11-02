// The rules of the Contact page's form, in one place so the browser (to tell the visitor at once) and the server (which never trusts the
// browser) apply the same ones. Pure.

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  /** Optional. */
  phone: string;
  subject: string;
  message: string;
  /** A field no visitor sees: a robot that fills in everything fills this too (see isSpam). */
  website: string;
};

export type ContactField = Exclude<keyof ContactFormValues, "website">;
export type ContactFormErrors = Partial<Record<ContactField, string>>;

export const emptyContactForm: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
};

export const LIMITS = { name: 60, email: 254, subject: 100, message: 2000, messageMin: 10, phoneMin: 7, phoneMax: 15 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The digits of a phone number as typed ("98780 07553", "098-780-07553"). */
export const phoneDigits = (phone: string) => phone.replace(/[\s\-().]/g, "");

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const first = values.firstName.trim();
  const last = values.lastName.trim();
  const email = values.email.trim();
  const phone = phoneDigits(values.phone.trim());
  const message = values.message.trim();

  if (!first) errors.firstName = "Please enter your first name.";
  else if (first.length > LIMITS.name) errors.firstName = `Please keep it under ${LIMITS.name} characters.`;

  if (!last) errors.lastName = "Please enter your last name.";
  else if (last.length > LIMITS.name) errors.lastName = `Please keep it under ${LIMITS.name} characters.`;

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "Please enter a valid email address, like name@example.com.";

  // The phone number is optional; when it is given it must look like one.
  if (phone && !/^\+?\d+$/.test(phone)) errors.phone = "Please use digits only.";
  else if (phone && (phone.replace("+", "").length < LIMITS.phoneMin || phone.replace("+", "").length > LIMITS.phoneMax))
    errors.phone = `A phone number has ${LIMITS.phoneMin} to ${LIMITS.phoneMax} digits.`;

  if (!values.subject.trim()) errors.subject = "Please enter a subject.";
  else if (values.subject.trim().length > LIMITS.subject) errors.subject = `Please keep it under ${LIMITS.subject} characters.`;

  if (!message) errors.message = "Please write your message.";
  else if (message.length < LIMITS.messageMin) errors.message = `Please write at least ${LIMITS.messageMin} characters.`;
  else if (message.length > LIMITS.message) errors.message = `Please keep it under ${LIMITS.message} characters.`;

  return errors;
}

/** True when the hidden field has something in it: a robot. The visitor is told nothing (see src/lib/actions/contact.ts). */
export const isSpam = (values: Pick<ContactFormValues, "website">) => values.website.trim() !== "";
