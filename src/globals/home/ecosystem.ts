import type { Tab } from "payload";
import { heading, line, list, paragraph, photo } from "./fields";

// src/data/home-ecosystem.ts. The width of each tab button is design and stays in code, so tab names have a short limit.
export const ecosystemTab: Tab = {
  name: "ecosystem",
  label: "Ecosystem",
  description: 'The section "The Ecosystem Behind LPS 360": five tabs.',
  fields: [
    ...heading(),
    paragraph("intro", "Paragraph", 300),
    list({
      name: "tabs",
      label: "The five tabs",
      min: 5,
      max: 5,
      description: "In order: Academic, Sports, Co-scholastic, Capstone, Social.",
      fields: [
        line("label", "Tab name", 32, "Keep it about as long as the current one: the button width is fixed."),
        photo("image", "Photo", "Wide photo shown under the tabs (about 1520 x 531)."),
        line("title", "Title", 90),
        paragraph("text", "Text", 400),
        {
          name: "bullets",
          label: "Bullet points",
          type: "array",
          minRows: 1,
          maxRows: 8,
          fields: [line("text", "Bullet", 90)],
        },
      ],
    }),
  ],
};
