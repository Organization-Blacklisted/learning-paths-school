import type { PageHeroContent } from "@/types/page-hero";
import type { PartnersContent } from "@/types/partners";

/** What an editor can change on the Partnerships page (src/globals/Partnerships.ts). The call to action and the photo strip are the site's standard ones. */
export type PartnershipsContent = {
  /** The text-only hero (no photo). */
  hero: PageHeroContent;
  partners: PartnersContent;
};
