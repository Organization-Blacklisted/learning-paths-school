import type { Tab } from "payload";
import { line, paragraph, photo } from "./fields";

// src/data/home-campus.ts. The video (when one exists) is added in the code first (docs/22-home-campus.md); until then the box shows the photo.
export const campusTab: Tab = {
  name: "campus",
  label: "Campus",
  description: 'The section "A Campus Built Around Possibility": heading, paragraph and the big media box.',
  fields: [
    line("badge", "Green pill above the heading"),
    line("titleStart", "Heading, first word"),
    line("titleAccent", "Heading, blue part"),
    line("titleEnd", "Heading, end"),
    paragraph("intro", "Paragraph"),
    photo("poster", "Photo in the media box", "Shown 1200 x 594. It stays here until a video is added."),
    line("tag", "Small label on the photo"),
  ],
};
