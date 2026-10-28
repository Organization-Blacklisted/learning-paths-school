import type { Tab } from "payload";
import { list, photo } from "./fields";

// src/data/marquee.ts (defaultMarquee)
export const marqueeTab: Tab = {
  name: "marquee",
  label: "Photo strip",
  description: "The row of square photos that scrolls above the footer.",
  fields: [
    list({
      name: "images",
      label: "Photos",
      min: 6,
      max: 12,
      description: "Shown as squares, in this order, scrolling forever.",
      fields: [photo("image", "Photo", "A square photo (640 x 640 works best).")],
    }),
  ],
};
