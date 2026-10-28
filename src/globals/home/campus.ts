import type { Tab } from "payload";
import { line, paragraph, photo } from "./fields";

// src/data/home-campus.ts. The video (when one exists) is added in the code first (docs/22-home-campus.md); until then the box shows the photo.
export const campusTab: Tab = {
  name: "campus",
  label: "Campus",
  description: 'The section "A Campus Built Around Possibility": heading, paragraph and the big media box.',
  fields: [
    line("badge", "Green pill above the heading", 70),
    line("titleStart", "Heading, first word", 10),
    line("titleAccent", "Heading, blue part", 20),
    line("titleEnd", "Heading, end", 50),
    paragraph("intro", "Paragraph", 400),
    photo("poster", "Photo in the media box", "Shown 1200 x 594. It stays here until a video is added."),
    line("tag", "Small label on the photo", 24),
  ],
};
