/**
 * Where things sit inside one partner card, in Figma pixels of the designed 494px-wide card (src/components/sections/shared/PartnersSection scales
 * them with the card). Design values, so they live in code (src/data/partnerships.ts), not in the CMS.
 */
export type PartnerDesign = {
  /** From the card's top edge to the logo (the card's 1px border included). */
  top: number;
  /** The box the logo is shown in (the logo is fitted into it, never cropped or stretched). */
  logoWidth: number;
  logoHeight: number;
  /** Space between the logo and the divider. */
  gap: number;
  /** Width of the divider line with its dot (its height follows: 182 : 17). */
  dividerWidth: number;
  /** Space between the divider and the label. */
  labelGap: number;
};

export type PartnerCard = {
  logo: { src: string; alt: string; width: number; height: number };
  /** What the partner is to the school ("Curriculum Partner"), or its full name when it is a name. */
  role: string;
  design: PartnerDesign;
};

/** The reusable "partners" section: an introduction and a grid of logo cards (src/components/sections/shared/PartnersSection). */
export type PartnersContent = {
  /** Accessible name of the section. */
  label: string;
  intro: string;
  partners: PartnerCard[];
};
