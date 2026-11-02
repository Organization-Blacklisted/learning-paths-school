import type { PageHeroWithPhoto } from "@/types/page-hero";

/** One e-mail address of the school; `note` is shown in brackets after it ("admissions"). */
export type ContactEmail = { address: string; note?: string };

/** One phone number as people write it ("0172-5134300"); `note` is shown in brackets after it ("for admissions only"). */
export type ContactPhone = { number: string; note?: string };

/** What an editor can change on the Contact page (src/globals/Contact.ts). Everything else (labels, layout) is in the components. */
export type ContactPageContent = {
  hero: PageHeroWithPhoto;
  details: {
    emails: ContactEmail[];
    phones: ContactPhone[];
    /** The address, one line. */
    location: string;
  };
  map: {
    /** The `src` of a Google Maps "Embed a map" iframe (an editor may paste the whole iframe: see src/lib/map-embed.ts). */
    embedUrl: string;
    /** What a screen reader says for the map. */
    title: string;
  };
};
