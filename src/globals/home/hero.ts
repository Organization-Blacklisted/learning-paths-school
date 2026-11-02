import type { Tab } from "payload";
import { line, list, photo } from "./fields";

// src/data/home-hero.ts. The first slide uses the smaller "compact" text scale, the others the "large" one (the design); the timings
// (3.5 s per slide, 0.4 s change) stay in code.
export const heroTab: Tab = {
  name: "hero",
  label: "Hero",
  description: "The slideshow at the top of the page.",
  fields: [
    list({
      name: "slides",
      label: "Slides",
      min: 2,
      max: 6,
      description: "Shown one after another. The photo is shown full width behind the text.",
      fields: [
        photo(
          "image",
          "Photo",
          "1920 x 993 works best. The text sits on top of it, so the photo needs the dark shading at the top and bottom that the current ones have (it is part of the picture).",
        ),
        line("title", "Big word", "For example Courage."),
        line("lead", "Small connecting word", "For example that. Optional: leave it empty to show only the quote after the big word.", {
          required: false,
        }),
        line("quote", "Quote in amber", "Include the quote marks."),
      ],
    }),
  ],
};
