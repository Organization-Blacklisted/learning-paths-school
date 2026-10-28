import type { Tab } from "payload";
import { line, list, paragraph } from "./fields";

// src/data/home-vision.ts. The width of each paragraph (it decides where the lines break) is design and stays in code.
export const visionTab: Tab = {
  name: "vision",
  label: "Vision, Mission, Values",
  fields: [
    list({
      name: "items",
      label: "The three statements",
      min: 3,
      max: 3,
      description: "In order: Vision, Mission, Values.",
      fields: [line("title", "Title", 30), paragraph("text", "Text", 260)],
    }),
  ],
};
