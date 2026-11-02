import type { Tab } from "payload";
import { line, paragraph } from "./fields";

// src/data/cta.ts (defaultCta)
export const ctaTab: Tab = {
  name: "cta",
  label: "Call to action",
  description: "The blue admissions band near the bottom.",
  fields: [
    line("badge", "Green pill above the heading"),
    line("titleLead", "Heading, first part", "Shown in white."),
    line("titleAccent", "Heading, last part", "Shown in white, slanted."),
    paragraph("text", "Paragraph"),
    line("buttonLabel", "Button text"),
    line("buttonHref", "Button link", "A page of the site (/admissions) or a full address."),
  ],
};
