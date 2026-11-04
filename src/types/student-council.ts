import type { PageHeroContent } from "@/types/page-hero";
import type { PhotoBannerContent } from "@/types/photo-banner";
import type { SplitFeaturesContent } from "@/types/split-features";

/** What an editor can change on the Student Council page (src/globals/StudentCouncil.ts). The design has no call to action or photo strip here. */
export type StudentCouncilContent = {
  /** The text-only hero (no photo). */
  hero: PageHeroContent;
  /** The wide photo with the title "Early Leadership With Learning Paths School Student Council" and a paragraph under it. */
  intro: PhotoBannerContent;
  /** The three rows: a photo, a heading and a paragraph each. */
  features: SplitFeaturesContent;
  /** The title "LPS Student Council" and the big group photo under it. */
  gallery: PhotoBannerContent;
};
