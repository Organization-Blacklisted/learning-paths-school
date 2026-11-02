import type { Tab } from "payload";
import { line, list, paragraph, photo } from "./fields";

// src/data/home-alumni.ts
export const alumniTab: Tab = {
  name: "alumni",
  label: "Alumni",
  description: 'The section "Their Paths Continue Long After They Leave".',
  fields: [
    line("badge", "Green pill above the heading"),
    line("titleStart", "Heading, first word"),
    line("titleAccent", "Heading, blue part"),
    line("titleSecondLine", "Heading, second line"),
    {
      name: "paragraphs",
      label: "Paragraphs",
      type: "array",
      minRows: 1,
      maxRows: 3,
      fields: [paragraph("text", "Paragraph")],
    },
    list({
      name: "people",
      label: "The two alumni",
      min: 2,
      max: 2,
      fields: [
        line("name", "Name"),
        line("institution", "University or institution"),
        photo("image", "Portrait", "Shown in a frame of about 428 x 385."),
      ],
    }),
  ],
};
