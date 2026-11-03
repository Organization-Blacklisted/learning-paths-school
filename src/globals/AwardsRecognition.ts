import type { GlobalConfig } from "payload";
import { line, list, paragraph, photo } from "./home/fields";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./shared/page-global";
import { pageHeroFields } from "./shared/page-hero";

// The Awards & Recognition page (Figma node 5893:1651, docs/31-awards-recognition.md). One document (a Global), like the other pages: an editor changes
// the TEXT and the PHOTOS (the hero's pill, heading and line; the award blocks, each a photo, a title and a paragraph); the layout stays in code
// (src/components/sections/shared/PageHero and AwardsSection; src/data/awards-recognition.ts has the defaults and the designed offsets of the first three
// blocks, src/lib/api/awards-recognition-map.ts merges the two). The design has no call to action or photo strip on this page.
//
// The awards are a FLEXIBLE list (1 to 10 blocks, in the order shown): there will be more awards. A block added after the third is laid out with the
// generic design values.
//
// The SEO tab is added by the SEO plugin (payload.config.ts). Drafts, Live Preview and publishing work as on the home page.

export const AwardsRecognition: GlobalConfig = {
  slug: "awards-recognition",
  label: "Awards & Recognition page",
  admin: {
    group: "Pages",
    description: "The heading and the award blocks of the Awards & Recognition page, and its search-engine settings (SEO tab).",
    livePreview: livePreviewAt("/awards-recognition"),
  },
  access: publishedOnlyAccess,
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateOnPublish("awards-recognition")] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          description: "The parts of the page, in page order. Open one to change its text and photos.",
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
                  name: "awards",
                  label: "Awards",
                  description: "The blocks under the heading: a wide photo, a title and a paragraph each.",
                  fields: [
                    list({
                      name: "items",
                      label: "Award blocks",
                      min: 1,
                      max: 10,
                      description: "One block each, shown in this order. Drag a row to move it.",
                      fields: [
                        photo(
                          "image",
                          "Photo",
                          "A wide photo, 1848 x 1170 works best (it is shown 924 x 585 and a photo of another shape is cropped at its middle). Choose one from the library or upload one: JPG, PNG or WebP are converted to AVIF automatically. Its alt text comes from the library.",
                        ),
                        line("title", "Title", "Shown in blue, slanted. For example: School Awards"),
                        paragraph("text", "Paragraph", "The text under the title, a few lines."),
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
