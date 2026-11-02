/** The content of the reusable page hero (src/components/sections/shared/PageHero): the photo band that opens an inner page. */
export type PageHeroContent = {
  /** Accessible name of the section. */
  label: string;
  /** Text of the green pill, shown in capitals. */
  badge: string;
  /** First part of the heading (grey, sans-serif). */
  titleLead: string;
  /** Last part of the heading (blue, slanted). */
  titleAccent: string;
  /** One line under the heading. */
  subtitle: string;
  /** The photo across the top (1920 x 736 in the design). Leave it out for the text-only look (the Principal’s Welcome page). */
  image?: { src: string; alt: string; width: number; height: number };
};

/** A hero that has its photo (the Contact page): the photo is not optional there. */
export type PageHeroWithPhoto = PageHeroContent & { image: NonNullable<PageHeroContent["image"]> };
