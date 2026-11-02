import type { Field } from "payload";
import { line, paragraph, photo } from "../home/fields";

// The fields of the reusable page hero (src/components/sections/shared/PageHero, src/types/page-hero.ts), for any page that opens with it:
//
//   { name: "hero", label: "Hero", fields: pageHeroFields() }                  a tab of the page's global, with a photo
//   { name: "hero", label: "Hero", fields: pageHeroFields({ photo: false }) }  the text-only look: no Photo field
//
// and read it back with `pageHeroFromDoc` (src/lib/api/page-hero-map.ts). What an editor can change: the pill, the two-colour heading, the
// line under it and the photo. The photo's alt text comes from the media library. Positions, sizes and the crest rule are design (in code).
export const pageHeroFields = ({ photo: withPhoto = true }: { photo?: boolean } = {}): Field[] => [
  line("badge", "Green pill above the heading", "Shown in capitals, for example Contact us."),
  line("titleLead", "Heading, grey part", "For example: Let’s Begin a"),
  line("titleAccent", "Heading, blue part", "Shown in blue, slanted. For example: Conversation"),
  paragraph("subtitle", "Line under the heading", "One short line."),
  ...(withPhoto
    ? [
        photo(
          "image",
          "Photo",
          "1920 x 736 works best (a wide photo; its middle is what shows on a narrow screen). Choose one from the library or upload one: JPG, PNG or WebP are converted to AVIF automatically.",
        ),
      ]
    : []),
];
