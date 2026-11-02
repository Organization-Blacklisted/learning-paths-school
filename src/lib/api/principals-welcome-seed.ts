import { defaultPrincipalsWelcome } from "@/data/principals-welcome";
import type { PrincipalsWelcomeContent } from "@/types/principals-welcome";

// The INVERSE of src/lib/api/principals-welcome-map.ts: the current content (src/data/principals-welcome.ts) as the data of the CMS's page, so the
// first version in the CMS is exactly the current page. Used by the seed script (scripts/seed-principals-welcome.ts, which uploads the portrait and
// passes its media id) and by the test that proves `mapPrincipalsWelcome(principalsWelcomeDocFromData(...))` gives the default content back. Pure.

export type PhotoRef = (src: string) => unknown;

/** The photos the page uses, once each (the seed uploads these). */
export const principalsWelcomePhotoPaths = (
  content: PrincipalsWelcomeContent = defaultPrincipalsWelcome,
): { src: string; alt: string }[] => [{ src: content.message.image.src, alt: content.message.image.alt }];

export function principalsWelcomeDocFromData(photo: PhotoRef, content: PrincipalsWelcomeContent = defaultPrincipalsWelcome) {
  const { hero, message } = content;
  return {
    hero: { badge: hero.badge, titleLead: hero.titleLead, titleAccent: hero.titleAccent, subtitle: hero.subtitle },
    message: {
      image: photo(message.image.src),
      titleLead: message.titleLead,
      titleAccent: message.titleAccent,
      paragraphs: message.paragraphs.map((text) => ({ text })),
      signatoryName: message.signatory.name,
      signatoryRole: message.signatory.role,
    },
  };
}
