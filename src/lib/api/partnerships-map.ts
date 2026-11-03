import { defaultPartnerships, GENERIC_DESIGN } from "@/data/partnerships";
import { text } from "@/lib/api/home-map";
import { photoFromMedia } from "@/lib/api/media-map";
import { pageHeroFromDoc } from "@/lib/api/page-hero-map";
import type { Partnership } from "@/payload-types";
import type { PartnerCard } from "@/types/partners";
import type { PartnershipsContent } from "@/types/partnerships";

// Turns the Partnerships page of the CMS (Payload global "partnerships") into the content the page takes. PURE (no Payload runtime), so the Live
// Preview (a Client Component) can use it too. Same rule as the home page's mapper (src/lib/api/home-map.ts): the defaults (src/data/partnerships.ts)
// are the base, the CMS overrides what an editor wrote, and anything it lacks (an empty field, an empty list, no document, the database down) is the
// default for that field, so the page is never blank.
//
// The partners are a flexible list: when the CMS has cards, THEY are the cards, in the editor's order. The designed offsets of a card (where its logo,
// divider and label sit) are design, so they come from the default card at the same position (the first eight), and a card beyond them gets the generic
// ones. A row without a logo (an upload that could not be read) is left out.

const NO_LOGO = { src: "", alt: "", width: 0, height: 0 };

export function mapPartnerships(
  doc: Partnership | null | undefined,
  defaults: PartnershipsContent = defaultPartnerships,
): PartnershipsContent {
  if (!doc) return defaults;
  const { hero, partners } = doc;
  const d = defaults.partners;

  const fromCms: PartnerCard[] = (partners?.items ?? []).flatMap((row, index) => {
    const base = d.partners[index];
    const logo = photoFromMedia(row.logo, base?.logo ?? NO_LOGO);
    if (!logo.src) return [];
    return [{ logo, role: text(row.role, base?.role ?? ""), design: base?.design ?? GENERIC_DESIGN }];
  });

  return {
    hero: pageHeroFromDoc(hero, defaults.hero),
    partners: {
      ...d,
      intro: text(partners?.intro, d.intro),
      partners: fromCms.length ? fromCms : d.partners,
    },
  };
}
