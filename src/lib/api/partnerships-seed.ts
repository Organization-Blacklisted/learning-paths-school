import { defaultPartnerships } from "@/data/partnerships";
import type { PartnershipsContent } from "@/types/partnerships";

// The INVERSE of src/lib/api/partnerships-map.ts: the current content (src/data/partnerships.ts) as the data of the CMS's page, so the first version in
// the CMS is exactly the current page. Used by the seed script (scripts/seed-partnerships.ts, which uploads the logos and passes their media ids) and by
// the test that proves `mapPartnerships(partnershipsDocFromData(...))` gives the default content back. Pure.

export type PhotoRef = (src: string) => unknown;

/** The photos the page uses, once each (the seed uploads these). */
export const partnershipsPhotoPaths = (content: PartnershipsContent = defaultPartnerships): { src: string; alt: string }[] =>
  content.partners.partners.map(({ logo }) => ({ src: logo.src, alt: logo.alt }));

export function partnershipsDocFromData(photo: PhotoRef, content: PartnershipsContent = defaultPartnerships) {
  const { hero, partners } = content;
  return {
    hero: { badge: hero.badge, titleLead: hero.titleLead, titleAccent: hero.titleAccent, subtitle: hero.subtitle },
    partners: {
      intro: partners.intro,
      items: partners.partners.map(({ logo, role }) => ({ logo: photo(logo.src), role })),
    },
  };
}
