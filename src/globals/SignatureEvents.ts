import type { GlobalConfig } from "payload";
import { line, list, paragraph, photo } from "./home/fields";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./shared/page-global";
import { pageHeroFields } from "./shared/page-hero";

// The Signature Events page (Figma node 5894:1875, docs/33-signature-events.md). One document (a Global), like the other pages: an editor changes the TEXT and
// the PHOTOS (the hero's pill, heading and line; the events, each a photo, a heading and a paragraph); the layout stays in code
// (src/components/sections/shared/PageHero and AlternatingRowsSection; src/data/signature-events.ts has the defaults and the heading widths the author set by
// hand, src/lib/api/signature-events-map.ts merges the two). The design has no call to action or photo strip on this page.
//
// The events are a FLEXIBLE list (1 to 20, in the order shown): a school adds events over the years. The photo is on the right in the first, third, ...
// event and on the left in the others, whatever the number. An event added after the ninth is laid out with the generic design values.
//
// The SEO tab is added by the SEO plugin (payload.config.ts). Drafts, Live Preview and publishing work as on the home page.

export const SignatureEvents: GlobalConfig = {
  slug: "signature-events",
  label: "Signature Events page",
  admin: {
    group: "Pages",
    description: "The heading, the photos and the text of the Signature Events page, and its search-engine settings (SEO tab).",
    livePreview: livePreviewAt("/signature-events"),
  },
  access: publishedOnlyAccess,
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateOnPublish("signature-events")] },
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
                  name: "events",
                  label: "Events",
                  description:
                    "The events under the heading: a big photo and a heading and a paragraph beside it, the photo changing sides from one to the next.",
                  fields: [
                    list({
                      name: "items",
                      label: "Events",
                      min: 1,
                      max: 20,
                      description:
                        "One event each, shown in this order. Drag one to move it. The photo is on the right in the first, third, fifth... and on the left in the others.",
                      fields: [
                        photo(
                          "image",
                          "Photo",
                          "A photo about 3:2, 1636 x 1046 works best (it is shown 818 x 523 and a photo of another shape is cropped at its middle). Choose one from the library or upload one: JPG, PNG or WebP are converted to AVIF automatically. Its alt text comes from the library.",
                        ),
                        line("title", "Heading", "Shown in blue, slanted, on one or two lines. For example: School Athletic Meet"),
                        paragraph("text", "Paragraph", "The text under the heading, a few lines."),
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
