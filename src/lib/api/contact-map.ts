import { defaultContact } from "@/data/contact";
import { text } from "@/lib/api/home-map";
import { pageHeroFromDoc } from "@/lib/api/page-hero-map";
import { mapEmbedSrc } from "@/lib/map-embed";
import type { Contact } from "@/payload-types";
import type { ContactPageContent } from "@/types/contact";

// Turns the Contact page of the CMS (Payload global "contact") into the content the page takes. PURE (no Payload runtime), so the Live Preview
// (a Client Component) can use it too. Same rule as src/lib/api/home-map.ts: the defaults (src/data/contact.ts) are the base, the CMS
// overrides what an editor wrote, and anything it lacks (an empty field, an empty list, the whole document, the database down) is the default.

const rows = <T, R>(list: T[] | null | undefined, pick: (row: T) => R | null): R[] =>
  (list ?? []).map(pick).filter((row): row is R => row !== null);

const clean = (value: string | null | undefined) => (value ?? "").trim();

export function mapContact(contact: Contact | null | undefined, defaults: ContactPageContent = defaultContact): ContactPageContent {
  if (!contact) return defaults;
  const { hero, details, map } = contact;

  const emails = rows(details?.emails, (row) =>
    clean(row.address) ? { address: clean(row.address), note: clean(row.note) || undefined } : null,
  );
  const phones = rows(details?.phones, (row) =>
    clean(row.number) ? { number: clean(row.number), note: clean(row.note) || undefined } : null,
  );

  return {
    hero: pageHeroFromDoc(hero, defaults.hero),
    details: {
      emails: emails.length ? emails : defaults.details.emails,
      phones: phones.length ? phones : defaults.details.phones,
      location: text(details?.location, defaults.details.location),
    },
    map: {
      // A pasted <iframe> tag or a bare address: only a Google Maps embed address gets through, anything else is the default map.
      embedUrl: mapEmbedSrc(map?.embedUrl) ?? defaults.map.embedUrl,
      title: text(map?.title, defaults.map.title),
    },
  };
}
