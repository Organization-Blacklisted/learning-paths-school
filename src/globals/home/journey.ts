import type { Tab } from "payload";
import { heading, line, list, paragraph, photo } from "./fields";

// src/data/home-journey.ts. The column colours (tone) and the width of each caption are design and stay in code.
export const journeyTab: Tab = {
  name: "journey",
  label: "Journey",
  description: 'The section "Our Learning Journey": the four school stages.',
  fields: [
    ...heading(),
    paragraph("intro", "Paragraph", 300),
    list({
      name: "stages",
      label: "The four stages",
      min: 4,
      max: 4,
      description: "In order: Pre-Primary, Primary, Secondary, Senior Secondary.",
      fields: [
        line("level", "Stage name", 30),
        line("range", "Classes", 40, "For example (Pre-Nursery to UKG)."),
        line("pathPrefix", "Small caption", 20, "For example The Path of."),
        line("path", "Caption word", 20, "For example Discovery."),
        photo("image", "Photo", "Shown in a tall narrow frame (171 x 343), so a portrait photo works best."),
      ],
    }),
  ],
};
