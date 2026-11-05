import type { PageHeroContent } from "@/types/page-hero";

export type PageHeroProps = {
  content: PageHeroContent;
  /**
   * The roomy look of a hero WITH a photo (the Welcome to LPS page, Figma node 5688:14367): 60px between the line of text and the rule and 60px under the
   * rule, where the Contact page's has 45px and 51px (its card is 24px taller). Design values, so a page chooses it, not the CMS. Ignored without a photo.
   */
  roomy?: boolean;
};
