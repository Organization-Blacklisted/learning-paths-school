import type { GlobalConfig } from "payload";
import { line, list, paragraph, photo } from "./home/fields";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./shared/page-global";
import { pageHeroFields } from "./shared/page-hero";

// The Student Council page (Figma node 5896:2063, docs/32-student-council.md). One document (a Global), like the other pages: an editor changes the TEXT and
// the PHOTOS (the hero's pill, heading and line; the intro's photo, title and paragraph; the rows, each a photo, a heading and a paragraph; the closing
// title and group photo); the layout stays in code (src/components/sections/shared/PageHero, PhotoBannerSection and SplitFeaturesSection;
// src/data/student-council.ts has the defaults and the designed offsets of the three rows, src/lib/api/student-council-map.ts merges the two). The design
// has no call to action or photo strip on this page.
//
// The rows are a FLEXIBLE list (1 to 8 rows, in the order shown): a council has more to say over the years. A row added after the third is laid out with the
// generic design values.
//
// The SEO tab is added by the SEO plugin (payload.config.ts). Drafts, Live Preview and publishing work as on the home page.

const TITLE_ACCENT = "The first words of the title: shown in blue, slanted.";
const TITLE_REST = "The rest of the title, on the same line: shown in grey.";

export const StudentCouncil: GlobalConfig = {
  slug: "student-council",
  label: "Student Council page",
  admin: {
    group: "Pages",
    description: "The heading, the photos and the text of the Student Council page, and its search-engine settings (SEO tab).",
    livePreview: livePreviewAt("/student-council"),
  },
  access: publishedOnlyAccess,
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateOnPublish("student-council")] },
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
                  name: "intro",
                  label: "Introduction",
                  description: "The wide photo under the heading, and the title and paragraph under it.",
                  fields: [
                    photo(
                      "image",
                      "Photo",
                      "A wide photo, 2000 x 951 works best (it is shown 1520 x 723 and a photo of another shape is cropped at its middle). Choose one from the library or upload one: JPG, PNG or WebP are converted to AVIF automatically. Its alt text comes from the library.",
                    ),
                    line("titleAccent", "Title, first words", TITLE_ACCENT),
                    line("titleRest", "Title, the rest", TITLE_REST),
                    paragraph("text", "Paragraph", "The text under the title, a few lines."),
                  ],
                },
                {
                  name: "features",
                  label: "Rows",
                  description: "The rows under the introduction: a photo on the left and a heading and a paragraph on the right.",
                  fields: [
                    list({
                      name: "items",
                      label: "Rows",
                      min: 1,
                      max: 8,
                      description: "One row each, shown in this order. Drag a row to move it.",
                      fields: [
                        photo(
                          "image",
                          "Photo",
                          "A photo about 4:3, 1554 x 1130 works best (it is shown 777 x 565 and a photo of another shape is cropped at its middle). Choose one from the library or upload one. Its alt text comes from the library.",
                        ),
                        line(
                          "title",
                          "Heading",
                          "Shown in blue, slanted, usually on two lines. For example: Voting for Voices, Electing Change",
                        ),
                        paragraph("text", "Paragraph", "The text under the heading and its thin rule, a few lines."),
                      ],
                    }),
                  ],
                },
                {
                  name: "gallery",
                  label: "Group photo",
                  description: "The title and the big photo at the end of the page.",
                  fields: [
                    line("titleAccent", "Title, first words", TITLE_ACCENT),
                    line("titleRest", "Title, the rest", TITLE_REST),
                    photo(
                      "image",
                      "Photo",
                      "A wide photo, 1840 x 947 works best (it is shown 1520 x 782 and a photo of another shape is cropped at its middle). Choose one from the library or upload one. Its alt text comes from the library.",
                    ),
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
