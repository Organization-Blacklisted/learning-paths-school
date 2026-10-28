import type { Tab } from "payload";
import { line, list, photo } from "./fields";

// src/data/home-courage.ts. The collage positions, sizes and crops are design and stay in code, so a replacement photo must have the
// same shape as the one it replaces.
export const courageTab: Tab = {
  name: "courage",
  label: "Courage",
  description: 'The heading "The courage to find your path" and the collage of photos.',
  fields: [
    line("titleLead", "Heading, grey part", 40, "Keep the words that lead into the blue part."),
    line("titleAccent", "Heading, blue part", 30),
    {
      name: "rotatingWords",
      label: "Swapping words",
      type: "array",
      minRows: 0,
      maxRows: 6,
      admin: { description: "Only used if the heading is switched to the swapping-word style (it is not now). Keep the words short." },
      fields: [line("word", "Word", 10)],
    },
    list({
      name: "photos",
      label: "Collage photos",
      min: 8,
      max: 8,
      description:
        "In this order: chess, building, stage, race, skating, carrom, dance, slide. Each photo is cropped to a fixed shape in the collage, so replace a photo with one of the same shape.",
      fields: [line("slot", "Which one", 20, "Do not change."), photo("image", "Photo")],
    }),
  ],
};
