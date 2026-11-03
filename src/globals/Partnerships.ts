import type { GlobalConfig } from "payload";
import { line, list, paragraph, photo } from "./home/fields";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./shared/page-global";
import { pageHeroFields } from "./shared/page-hero";

// The Partnerships page (Figma node 5748:505, docs/30-partnerships.md). One document (a Global), like the home page and the Contact page: an editor
// changes the TEXT and the LOGOS (the hero's pill, heading and line; the introduction; the list of partners, each a logo and a label); the layout stays
// in code (src/components/sections/shared/PageHero and PartnersSection; src/data/partnerships.ts has the defaults and the designed offsets of the first
// eight cards, src/lib/api/partnerships-map.ts merges the two). The call to action and the photo strip below are the site's standard ones and are not
// edited here.
//
// The partners are a FLEXIBLE list (1 to 12 cards, in the order shown): partners come and go. A card added after the eighth is laid out with the
// generic design values.
//
// The SEO tab is added by the SEO plugin (payload.config.ts). Drafts, Live Preview and publishing work as on the home page.

export const Partnerships: GlobalConfig = {
  slug: "partnerships",
  label: "Partnerships page",
  admin: {
    group: "Pages",
    description: "The heading, the introduction and the partner logos of the Partnerships page, and its search-engine settings (SEO tab).",
    livePreview: livePreviewAt("/partnerships"),
  },
  access: publishedOnlyAccess,
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateOnPublish("partnerships")] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          description: "The parts of the page, in page order. Open one to change its text and logos.",
          fields: [
            {
              type: "tabs",
              tabs: [
                {
                  name: "hero",
                  label: "Hero",
                  description: "The heading at the top of the page (text only, there is no photo here).",
                  fields: pageHeroFields({ photo: false }),
                },
                {
                  name: "partners",
                  label: "Partners",
                  description: "The introduction and the cards with the partners' logos.",
                  fields: [
                    paragraph("intro", "Introduction", "The paragraph above the partner cards."),
                    list({
                      name: "items",
                      label: "Partners",
                      min: 1,
                      max: 12,
                      description: "One card each, shown in this order, three to a row (the last row is centred). Drag a row to move it.",
                      fields: [
                        photo(
                          "logo",
                          "Logo",
                          "The partner's logo on a transparent or white background, about 300 px wide. Choose one from the library or upload one: JPG, PNG or WebP are converted to AVIF automatically. Its alt text comes from the library (write the partner's name there).",
                        ),
                        line("role", "Label under the logo", "For example: Curriculum Partner"),
                      ],
                    }),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
