export type ValuesListItem = {
  /** The blue slanted title of the row ("Courage & Respect"). */
  title: string;
  /** What shows beside the title while the row is the active one. */
  text: string;
};

/** The reusable values list section: a short heading ("Guided by") and a list of titles, one of them active at a time (on hover, focus or tap) and shown on a navy band. */
export type ValuesListContent = {
  /** Accessible name of the section. */
  label: string;
  /** The heading on the band ("Guided by"). */
  title: string;
  items: ValuesListItem[];
};
