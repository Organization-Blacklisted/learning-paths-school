import type { Tab } from "payload";
import { line, list, paragraph, photo } from "./fields";

// src/data/home-alumni.ts
export const alumniTab: Tab = {
  name: "alumni",
  label: "Alumni",
  description: 'The section "Their Paths Continue Long After They Leave".',
  fields: [
    line("badge", "Green pill above the heading", 70),
    line("titleStart", "Heading, first word", 20),
    line("titleAccent", "Heading, blue part", 40),
    line("titleSecondLine", "Heading, second line", 50),
    {
      name: "paragraphs",
      label: "Paragraphs",
      type: "array",
      minRows: 1,
      maxRows: 3,
      fields: [paragraph("text", "Paragraph", 400)],
    },
    list({
      name: "people",
      label: "The two alumni",
      min: 2,
      max: 2,
      fields: [
        line("name", "Name", 40),
        line("institution", "University or institution", 60),
        photo("image", "Portrait", "Shown in a frame of about 428 x 385."),
      ],
    }),
  ],
};
