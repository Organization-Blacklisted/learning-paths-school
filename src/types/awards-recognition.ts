import type { AwardsContent } from "@/types/awards";
import type { PageHeroContent } from "@/types/page-hero";

/** What an editor can change on the Awards & Recognition page (src/globals/AwardsRecognition.ts). The design has no call to action or photo strip here. */
export type AwardsRecognitionContent = {
  /** The text-only hero (no photo). */
  hero: PageHeroContent;
  awards: AwardsContent;
};
