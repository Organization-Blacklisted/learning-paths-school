/**
 * Where things sit inside one row, in Figma pixels of the designed 1437px-wide block (src/components/sections/shared/SplitFeaturesSection scales them with
 * the block). Design values, so they live in code (src/data/student-council.ts), not in the CMS.
 */
export type SplitFeatureDesign = {
  /** Space between the photo and the column of text. */
  gap: number;
  /** Width of the column of text. */
  textWidth: number;
};

export type SplitFeature = {
  image: { src: string; alt: string; width: number; height: number };
  /** The blue slanted heading. */
  title: string;
  /** The paragraph under the heading and its rule. */
  text: string;
  design: SplitFeatureDesign;
};

/** The reusable "split features" section: rows of a photo on the left and, on the right, a blue slanted heading, a thin rule and a paragraph. */
export type SplitFeaturesContent = {
  /** Accessible name of the section. */
  label: string;
  rows: SplitFeature[];
};
