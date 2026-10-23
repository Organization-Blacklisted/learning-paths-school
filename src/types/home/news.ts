/** One news card of "What's New At LPS". Placeholder content until the news comes from the CMS. */
export type NewsItem = {
  id: string;
  /** Shown as written, e.g. "September 6, 2023". */
  date: string;
  title: string;
  /** Shown in five lines at most (CSS), cut with an ellipsis when longer. */
  excerpt: string;
  href: string;
  /** Path under /public: the Figma photo cropped to its 318 x 203 slot at 2x, AVIF. Decorative (the card link has a name). */
  photo: string;
};

export type NewsContent = {
  label: string;
  badge: string;
  /** Heading: grey part and blue slanted part ("What's New" + "At LPS"). */
  titleLead: string;
  titleAccent: string;
  intro: string;
  items: NewsItem[];
};
