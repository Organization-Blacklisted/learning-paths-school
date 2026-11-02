import { describe, expect, it } from "vitest";
import { LIMITS, emptyContactForm, isSpam, phoneDigits, validateContactForm, type ContactFormValues } from "./contact-form";

const valid: ContactFormValues = {
  firstName: "Asha",
  lastName: "Kaur",
  email: "asha@example.com",
  phone: "",
  subject: "Admissions enquiry",
  message: "I would like to visit the school next week.",
  website: "",
};
const errorsOf = (changes: Partial<ContactFormValues>) => validateContactForm({ ...valid, ...changes });

describe("validateContactForm", () => {
  it("has no errors for a complete form, with or without a phone number", () => {
    expect(validateContactForm(valid)).toEqual({});
    expect(errorsOf({ phone: "098-780-07553" })).toEqual({});
    expect(errorsOf({ phone: "+91 98780 07553" })).toEqual({});
  });

  it("asks for every field that is required, and only those", () => {
    expect(Object.keys(validateContactForm(emptyContactForm)).sort()).toEqual(["email", "firstName", "lastName", "message", "subject"]);
  });

  it("treats spaces alone as nothing", () => {
    const errors = errorsOf({ firstName: "   ", lastName: "  ", message: "      " });
    expect(Object.keys(errors).sort()).toEqual(["firstName", "lastName", "message"]);
  });

  it("checks the shape of the email address", () => {
    for (const bad of ["asha", "asha@", "@example.com", "asha@example", "asha @example.com", "a@b.c"]) {
      expect(errorsOf({ email: bad }).email, bad).toBeTruthy();
    }
    expect(errorsOf({ email: "  asha@example.com  " }).email).toBeUndefined();
    expect(errorsOf({ email: `${"a".repeat(250)}@example.com` }).email).toBeTruthy();
  });

  it("checks a phone number only when one is given", () => {
    expect(errorsOf({ phone: "abc" }).phone).toBeTruthy();
    expect(errorsOf({ phone: "12345" }).phone).toMatch(/digits/);
    expect(errorsOf({ phone: "1".repeat(LIMITS.phoneMax + 1) }).phone).toBeTruthy();
    expect(errorsOf({ phone: "0172-5134300" }).phone).toBeUndefined();
  });

  it("wants a message of a sensible length", () => {
    expect(errorsOf({ message: "Hi" }).message).toMatch(String(LIMITS.messageMin));
    expect(errorsOf({ message: "x".repeat(LIMITS.message + 1) }).message).toBeTruthy();
    expect(errorsOf({ message: "x".repeat(LIMITS.message) }).message).toBeUndefined();
  });

  it("keeps names and the subject within their limits", () => {
    expect(errorsOf({ firstName: "x".repeat(LIMITS.name + 1) }).firstName).toBeTruthy();
    expect(errorsOf({ subject: "x".repeat(LIMITS.subject + 1) }).subject).toBeTruthy();
    expect(errorsOf({ subject: "x".repeat(LIMITS.subject) }).subject).toBeUndefined();
  });
});

describe("phoneDigits", () => {
  it("drops spaces, dashes, dots and brackets, and keeps a leading plus", () => {
    expect(phoneDigits("098-780-07553")).toBe("09878007553");
    expect(phoneDigits("+91 (98780) 07553")).toBe("+919878007553");
  });
});

describe("isSpam", () => {
  it("is true only when the hidden field has something in it", () => {
    expect(isSpam({ website: "" })).toBe(false);
    expect(isSpam({ website: "   " })).toBe(false);
    expect(isSpam({ website: "http://spam.example" })).toBe(true);
  });
});
