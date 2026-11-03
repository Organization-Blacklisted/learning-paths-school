/**
 * Where things sit inside one award block, in Figma pixels of the designed 924px-wide block (src/components/sections/shared/AwardsSection scales them with
 * the block). Design values, so they live in code (src/data/awards-recognition.ts), not in the CMS.
 */
export type AwardDesign = {
  /** Width of the column of title and text. */
  textWidth: number;
  /** Space above the title, inside the framed group (the design nudges each block's text by hand). */
  textTop: number;
  /** Space above the two laurels. */
  laurelTop: number;
};

export type AwardBlock = {
  image: { src: string; alt: string; width: number; height: number };
  /** The blue slanted heading ("School Awards"). */
  title: string;
  /** The paragraph under it. */
  text: string;
  design: AwardDesign;
};

/** The reusable "awards" section: blocks of a wide photo with a laurel-framed title and paragraph under it (src/components/sections/shared/AwardsSection). */
export type AwardsContent = {
  /** Accessible name of the section. */
  label: string;
  awards: AwardBlock[];
};
