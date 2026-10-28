import type { Tab } from "payload";
import { heading, line, list, paragraph, photo } from "./fields";

// src/data/home-news.ts. Placeholder cards until real news exists.
export const newsTab: Tab = {
  name: "news",
  label: "News",
  description: 'The section "What\'s New At LPS": the news cards.',
  fields: [
    ...heading(),
    paragraph("intro", "Paragraph", 300),
    list({
      name: "items",
      label: "News cards",
      min: 1,
      max: 6,
      description: "Three fit side by side on a large screen; more can be swiped on small screens.",
      fields: [
        line("date", "Date", 30, "Shown as written, for example September 6, 2023."),
        line("title", "Title", 70),
        paragraph("excerpt", "Short text", 200, "Shown in five lines at most."),
        line("href", "Link", 200, "Where the card goes: a page of the site (/news/example) or a full address."),
        photo("image", "Photo", "Shown 318 x 203."),
      ],
    }),
  ],
};
