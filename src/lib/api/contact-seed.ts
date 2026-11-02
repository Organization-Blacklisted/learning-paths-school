import { defaultContact } from "@/data/contact";
import type { ContactPageContent } from "@/types/contact";

// The INVERSE of src/lib/api/contact-map.ts: the current content (src/data/contact.ts) as the data of the CMS's Contact page, so the first
// version in the CMS is exactly the current page. Used by the seed script (scripts/seed-contact.ts, which uploads the photo and passes its media
// id) and by the test that proves `mapContact(contactDocFromData(...))` gives the default content back (contact-map.test.ts). Pure.

export type PhotoRef = (src: string) => unknown;

/** The photos the Contact page uses, once each (the seed uploads these). */
export const contactPhotoPaths = (content: ContactPageContent = defaultContact): { src: string; alt: string }[] => [
  { src: content.hero.image.src, alt: content.hero.image.alt },
];

export function contactDocFromData(photo: PhotoRef, content: ContactPageContent = defaultContact) {
  return {
    hero: {
      badge: content.hero.badge,
      titleLead: content.hero.titleLead,
      titleAccent: content.hero.titleAccent,
      subtitle: content.hero.subtitle,
      image: photo(content.hero.image.src),
    },
    details: {
      emails: content.details.emails.map((email) => ({ address: email.address, note: email.note ?? "" })),
      phones: content.details.phones.map((phone) => ({ number: phone.number, note: phone.note ?? "" })),
      location: content.details.location,
    },
    map: { embedUrl: content.map.embedUrl, title: content.map.title },
  };
}
