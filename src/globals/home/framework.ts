import type { Tab } from "payload";
import { heading, line, list, paragraph, photo } from "./fields";

// src/data/home-framework.ts. The whole diagram (every position, line, dot and the ring) is design and stays in code. The letter in each
// circle stays P, I, O, N, E, E, R.
export const frameworkTab: Tab = {
  name: "framework",
  label: "LPS 360 Framework",
  description: "The diagram of the seven PIONEER outcomes.",
  fields: [
    ...heading(),
    paragraph("intro", "Paragraph", 300),
    photo("centrePhoto", "Photo in the middle of the ring"),
    line("centreLabel", "Text under the ring", 40),
    list({
      name: "items",
      label: "The seven outcomes",
      min: 7,
      max: 7,
      description: "In order: Proficient, Inclusive, Open-minded, Novel, Enterprising, Ethical, Resilient (they spell PIONEER).",
      fields: [line("label", "Name", 24, "The letter in the circle stays the same."), paragraph("description", "Description", 160)],
    }),
  ],
};
