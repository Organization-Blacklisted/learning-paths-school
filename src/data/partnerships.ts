import type { PartnerDesign } from "@/types/partners";
import type { PartnershipsContent } from "@/types/partnerships";

// The Partnerships page (Figma node 5748:505, 1920px frame). These are the defaults: the CMS (src/globals/Partnerships.ts) overrides what an editor
// changes (src/lib/api/partnerships-map.ts), and this is what the page shows when the CMS has nothing or cannot be read.
//
// Text from the design as written, with two corrections of obvious slips: "Guidence Program Partner" is "Guidance Program Partner" and the double
// space in "Knowledge  Partner" is one space. Mine, not from the design: the accessible names (the sections' names and the logos' descriptions).
// The call to action and the photo strip are the site's standard ones (src/data/cta.ts, marquee.ts).
//
// Each card's `design` is where Figma puts that card's logo, divider and label (the author placed every logo by hand, so the values differ from card
// to card). They are used by index, so a card the editor adds after the eighth gets GENERIC_DESIGN.

const PARTNERS = "/images/partnerships";

/** The design values of a card that has none of its own (a partner an editor adds): the most common values of the designed cards. */
export const GENERIC_DESIGN: PartnerDesign = { top: 35, logoWidth: 200, logoHeight: 70, gap: 12, dividerWidth: 182, labelGap: 10 };

export const defaultPartnerships: PartnershipsContent = {
  hero: {
    label: "Our partnerships",
    badge: "OUR PARTNERSHIPS",
    titleLead: "Stronger Together Through",
    titleAccent: "Shared Purpose",
    subtitle: "Building meaningful connections that enrich learning experiences",
  },
  partners: {
    label: "Our partners",
    intro:
      "At Learning Paths School, we are committed to guiding our students toward pathways to success and equipping them with essential 21st-century skills. To achieve this vision, we have established partnerships with leading organizations in the fields of health, technology, curriculum development, sports, knowledge, and more. These collaborations are designed to enrich the student experience and broaden their horizons, ensuring a holistic and well-rounded educational journey for our students.",
    partners: [
      {
        logo: { src: `${PARTNERS}/macmillan.avif`, alt: "Macmillan Education logo", width: 302, height: 50 },
        role: "Curriculum Partner",
        design: { top: 35, logoWidth: 278, logoHeight: 46, gap: 16, dividerWidth: 182, labelGap: 10 },
      },
      {
        logo: { src: `${PARTNERS}/world-scholars-cup.avif`, alt: "The World Scholar’s Cup logo", width: 257, height: 62 },
        role: "Knowledge Partner",
        design: { top: 35, logoWidth: 257, logoHeight: 62, gap: 9, dividerWidth: 182, labelGap: 10 },
      },
      {
        logo: { src: `${PARTNERS}/stempedia.avif`, alt: "STEMpedia logo", width: 221, height: 86 },
        role: "Innovation Partner",
        design: { top: 35, logoWidth: 184, logoHeight: 72, gap: 3, dividerWidth: 182, labelGap: 10 },
      },
      {
        logo: { src: `${PARTNERS}/edusensei.avif`, alt: "Edusensei logo", width: 289, height: 88 },
        role: "Guidance Program Partner",
        design: { top: 35, logoWidth: 208, logoHeight: 63.34, gap: 8, dividerWidth: 227, labelGap: 10 },
      },
      {
        logo: { src: `${PARTNERS}/arise.avif`, alt: "Arise, Student First, logo", width: 276, height: 188 },
        role: "Association for Reinventing School Education",
        design: { top: 21, logoWidth: 138, logoHeight: 94, gap: 2, dividerWidth: 182, labelGap: 4 },
      },
      {
        logo: { src: `${PARTNERS}/junior-achievement.avif`, alt: "Junior Achievement logo", width: 331, height: 75 },
        role: "Knowledge Partner",
        design: { top: 35, logoWidth: 247, logoHeight: 56, gap: 13, dividerWidth: 182, labelGap: 10 },
      },
      {
        logo: { src: `${PARTNERS}/edusports.avif`, alt: "EduSports, Holistic Education through Sports, logo", width: 339, height: 117 },
        role: "Sports Partner",
        design: { top: 23, logoWidth: 226, logoHeight: 78, gap: 12, dividerWidth: 123, labelGap: 2 },
      },
      {
        logo: { src: `${PARTNERS}/fortis.avif`, alt: "Fortis Healthcare logo", width: 307, height: 114 },
        role: "Health Partner",
        design: { top: 25, logoWidth: 176, logoHeight: 65, gap: 8, dividerWidth: 182, labelGap: 7 },
      },
    ],
  },
};

/** The page’s own title and description for search engines, used while the SEO tab of the CMS is empty. */
export const defaultPartnershipsSeo = {
  title: "Partnerships | Learning Paths School",
  description:
    "Learning Paths School partners with leading organisations in curriculum, knowledge, innovation, guidance, sports and health to enrich every student’s learning journey.",
};
