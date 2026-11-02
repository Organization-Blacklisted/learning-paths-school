import { text } from "@/lib/api/home-map";
import { photoFromMedia } from "@/lib/api/media-map";
import type { Media } from "@/payload-types";
import type { PageHeroContent } from "@/types/page-hero";

// Turns the hero fields of a page's CMS document (see src/globals/shared/page-hero.ts) into the content <PageHero> takes. PURE (no Payload
// runtime), same rule as the home page's mapper: the defaults are the base, the CMS overrides what an editor wrote, an empty field or a
// missing document gives the default for that field. The result has the same shape as the defaults: a hero whose defaults have a photo gets
// the editor's photo (or the default one), and one whose defaults have none (the text-only look) never gets one.

export type PageHeroDoc = {
  badge?: string | null;
  titleLead?: string | null;
  titleAccent?: string | null;
  subtitle?: string | null;
  image?: number | Media | null;
} | null;

export function pageHeroFromDoc<T extends PageHeroContent>(doc: PageHeroDoc | undefined, defaults: T): T {
  if (!doc) return defaults;
  return {
    ...defaults,
    badge: text(doc.badge, defaults.badge),
    titleLead: text(doc.titleLead, defaults.titleLead),
    titleAccent: text(doc.titleAccent, defaults.titleAccent),
    subtitle: text(doc.subtitle, defaults.subtitle),
    // A hero whose defaults have no photo (the text-only look) never gets one from the CMS either.
    image: defaults.image ? photoFromMedia(doc.image, defaults.image) : undefined,
  };
}
