import { defaultSignatureEvents } from "@/data/signature-events";
import type { SignatureEventsContent } from "@/types/signature-events";

// The INVERSE of src/lib/api/signature-events-map.ts: the current content (src/data/signature-events.ts) as the data of the CMS's page, so the first version in
// the CMS is exactly the current page. Used by the seed script (scripts/seed-signature-events.ts, which uploads the photos and passes their media ids) and by
// the test that proves `mapSignatureEvents(signatureEventsDocFromData(...))` gives the default content back. Pure.

export type PhotoRef = (src: string) => unknown;

/** The photos the page uses, once each (the seed uploads these). */
export const signatureEventsPhotoPaths = (content: SignatureEventsContent = defaultSignatureEvents): { src: string; alt: string }[] => {
  const all = content.events.rows.map((row) => row.image);
  return all.filter((image, index) => all.findIndex((other) => other.src === image.src) === index).map(({ src, alt }) => ({ src, alt }));
};

export function signatureEventsDocFromData(photo: PhotoRef, content: SignatureEventsContent = defaultSignatureEvents) {
  const { hero, events } = content;
  return {
    hero: { badge: hero.badge, titleLead: hero.titleLead, titleAccent: hero.titleAccent, subtitle: hero.subtitle },
    events: { items: events.rows.map(({ image, title, text }) => ({ image: photo(image.src), title, text })) },
  };
}
