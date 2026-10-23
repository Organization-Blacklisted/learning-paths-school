/** The content of the reusable call-to-action band (src/components/sections/shared/CtaSection). */
export type CtaContent = {
  /** Accessible name of the section. */
  label: string;
  /** Text of the green pill, shown as written. */
  badge: string;
  /** First part of the heading (white, sans-serif). */
  titleLead: string;
  /** Highlighted last part of the heading (white, serif, slanted). */
  titleAccent: string;
  /** Short paragraph under the heading. */
  text: string;
  button: { label: string; href: string };
};
