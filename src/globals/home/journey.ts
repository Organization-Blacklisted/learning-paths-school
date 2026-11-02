import type { Tab } from "payload";
import { heading, line, list, paragraph, photo } from "./fields";

// src/data/home-journey.ts. The column colours (tone) and the width of each caption are design and stay in code.
export const journeyTab: Tab = {
  name: "journey",
  label: "Journey",
  description: 'The section "Our Learning Journey": the four school stages.',
  fields: [
    ...heading(),
    paragraph("intro", "Paragraph"),
    list({
      name: "stages",
      label: "The four stages",
      min: 4,
      max: 4,
      description: "In order: Pre-Primary, Primary, Secondary, Senior Secondary.",
      fields: [
        line("level", "Stage name"),
        line("range", "Classes", "For example (Pre-Nursery to UKG)."),
        line("pathPrefix", "Small caption", "For example The Path of."),
        line("path", "Caption word", "For example Discovery."),
        photo("image", "Photo", "Shown in a tall narrow frame (171 x 343), so a portrait photo works best."),
      ],
    }),
  ],
};
