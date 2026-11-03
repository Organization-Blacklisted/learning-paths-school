import { defaultAwardsRecognition } from "@/data/awards-recognition";
import type { AwardsRecognitionContent } from "@/types/awards-recognition";

// The INVERSE of src/lib/api/awards-recognition-map.ts: the current content (src/data/awards-recognition.ts) as the data of the CMS's page, so the first
// version in the CMS is exactly the current page. Used by the seed script (scripts/seed-awards-recognition.ts, which uploads the photos and passes their
// media ids) and by the test that proves `mapAwardsRecognition(awardsRecognitionDocFromData(...))` gives the default content back. Pure.

export type PhotoRef = (src: string) => unknown;

/** The photos the page uses, once each (the seed uploads these). */
export const awardsRecognitionPhotoPaths = (content: AwardsRecognitionContent = defaultAwardsRecognition): { src: string; alt: string }[] =>
  content.awards.awards.map(({ image }) => ({ src: image.src, alt: image.alt }));

export function awardsRecognitionDocFromData(photo: PhotoRef, content: AwardsRecognitionContent = defaultAwardsRecognition) {
  const { hero, awards } = content;
  return {
    hero: { badge: hero.badge, titleLead: hero.titleLead, titleAccent: hero.titleAccent, subtitle: hero.subtitle },
    awards: {
      items: awards.awards.map(({ image, title, text }) => ({ image: photo(image.src), title, text })),
    },
  };
}
