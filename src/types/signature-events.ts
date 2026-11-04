import type { AlternatingRowsContent } from "@/types/alternating-rows";
import type { PageHeroContent } from "@/types/page-hero";

/** What an editor can change on the Signature Events page (src/globals/SignatureEvents.ts). The design has no call to action or photo strip here. */
export type SignatureEventsContent = {
  /** The text-only hero (no photo). */
  hero: PageHeroContent;
  /** The nine events: a photo, a heading and a paragraph each, alternating sides. */
  events: AlternatingRowsContent;
};
