import type { MessageContent } from "@/types/message";
import type { PageHeroContent } from "@/types/page-hero";

/** What an editor can change on the Principal's Welcome page (src/globals/PrincipalsWelcome.ts). The call to action and the photo strip are the site's standard ones. */
export type PrincipalsWelcomeContent = {
  /** The text-only hero (no photo). */
  hero: PageHeroContent;
  message: MessageContent;
};
