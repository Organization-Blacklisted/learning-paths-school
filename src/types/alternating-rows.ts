/**
 * Where things sit inside one row, in Figma pixels of the designed 1520px-wide block (src/components/sections/shared/AlternatingRowsSection scales them
 * with the block). Design values, so they live in code (src/data/signature-events.ts), not in the CMS.
 */
export type AlternatingRowDesign = {
  /** Width of the heading's text, where the author set it by hand so that the heading breaks (or does not break) as drawn. */
  titleWidth: number;
};

export type AlternatingRow = {
  image: { src: string; alt: string; width: number; height: number };
  /** The blue slanted heading. */
  title: string;
  /** The paragraph under the heading. */
  text: string;
  design: AlternatingRowDesign;
};

/** The reusable "alternating rows" section: rows of a photo and a text column, the photo on the right in the first row, on the left in the next, and so on. */
export type AlternatingRowsContent = {
  /** Accessible name of the section. */
  label: string;
  rows: AlternatingRow[];
};
