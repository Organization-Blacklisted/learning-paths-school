import type { CrestCardsContent } from "@/types/crest-cards";
import type { IntroTextContent } from "@/types/intro-text";
import type { MessageContent } from "@/types/message";
import type { PageHeroWithPhoto } from "@/types/page-hero";
import type { PhotoBannerContent } from "@/types/photo-banner";
import type { StorySwipeContent } from "@/types/story-swipe";
import type { ValuesListContent } from "@/types/values-list";

/** What an editor can change on the Welcome to LPS page (src/globals/WelcomeToLps.ts). The call to action and the photo strip at the end are the site's standard ones. */
export type WelcomeToLpsContent = {
  /** The hero with its photo. */
  hero: PageHeroWithPhoto;
  /** Two paragraphs about the school, centred under the hero. */
  intro: IntroTextContent;
  /** The wide photo (no title). */
  banner: PhotoBannerContent;
  /** Our Vision and Our Mission. */
  crests: CrestCardsContent;
  /** The Principal's welcome: portrait, heading, a paragraph and the signature. */
  welcome: MessageContent;
  /** "Guided by" and the four values. */
  values: ValuesListContent;
  /** "A Story That Keeps Growing": the slides of the pinned story. */
  story: StorySwipeContent;
};
