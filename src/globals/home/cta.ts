import type { Tab } from "payload";
import { line, paragraph } from "./fields";

// src/data/cta.ts (defaultCta)
export const ctaTab: Tab = {
  name: "cta",
  label: "Call to action",
  description: "The blue admissions band near the bottom.",
  fields: [
    line("badge", "Green pill above the heading", 70),
    line("titleLead", "Heading, first part", 50, "Shown in white."),
    line("titleAccent", "Heading, last part", 40, "Shown in white, slanted."),
    paragraph("text", "Paragraph", 220),
    line("buttonLabel", "Button text", 30),
    line("buttonHref", "Button link", 200, "A page of the site (/admissions) or a full address."),
  ],
};
