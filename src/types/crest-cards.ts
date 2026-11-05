/**
 * Where things sit inside one card, in Figma pixels of the designed card (src/components/sections/shared/CrestCardsSection scales them with the crest). Design
 * values, so they live in code (src/data/welcome-to-lps.ts), not in the CMS.
 */
export type CrestCardDesign = {
  /** Width of the box the title is centred in, in Figma pixels of the 365px-wide crest: it decides where the title breaks ("Our / Vision" on two lines, "Our Mission" on one). */
  titleWidth: number;
  /** Width of the paragraph under the crest, in Figma pixels of the 1108px-wide block. */
  textWidth: number;
};

export type CrestCard = {
  /** The crest picture (365 x 313 in the design): a shield between two laurel branches, with an empty space for the title. */
  image: { src: string; alt: string; width: number; height: number };
  /** The title, over the empty space of the crest ("Our Vision"). */
  title: string;
  /** The paragraph under the crest. */
  text: string;
  design: CrestCardDesign;
};

/** The reusable crest cards section: cards of a crest picture with a blue slanted title over it and a paragraph under it, side by side. */
export type CrestCardsContent = {
  /** Accessible name of the section. */
  label: string;
  cards: CrestCard[];
};
