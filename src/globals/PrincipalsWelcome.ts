import type { Field, GlobalConfig } from "payload";
import { line, photo } from "./home/fields";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./shared/page-global";
import { pageHeroFields } from "./shared/page-hero";

// The Principal's Welcome page (Figma node 5748:2, docs/29-principals-welcome.md). One document (a Global), like the home page and the Contact page:
// an editor changes the TEXT and the PHOTO (the hero's pill, heading and line; the portrait, the quotation heading, the paragraphs of the letter and the
// signature); the layout stays in code (src/components/sections/shared/PageHero and MessageSection, src/data/principals-welcome.ts has the defaults and
// src/lib/api/principals-welcome-map.ts merges the two). The call to action and the photo strip below the letter are the site's standard ones and are
// not edited here.
//
// The SEO tab is added by the SEO plugin (payload.config.ts). Drafts, Live Preview and publishing work as on the home page.

const paragraph: Field = {
  name: "text",
  label: "Paragraph",
  type: "textarea",
  required: true,
  admin: { description: "A line break (Enter) inside a paragraph starts a new line without the space between paragraphs." },
};

export const PrincipalsWelcome: GlobalConfig = {
  slug: "principals-welcome",
  label: "Principal’s Welcome page",
  admin: {
    group: "Pages",
    description: "The heading, the portrait and the letter of the Principal’s Welcome page, and its search-engine settings (SEO tab).",
    livePreview: livePreviewAt("/principals-welcome"),
  },
  access: publishedOnlyAccess,
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateOnPublish("principals-welcome")] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          description: "The parts of the page, in page order. Open one to change its text and photo.",
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
                  name: "message",
                  label: "Letter",
                  description: "The portrait on the left and the letter on the right.",
                  fields: [
                    photo(
                      "image",
                      "Portrait",
                      "A portrait photo, about 777 x 816 (it is shown with rounded corners). Choose one from the library or upload one: JPG, PNG or WebP are converted to AVIF automatically. Its alt text comes from the library.",
                    ),
                    line("titleLead", "Heading, grey part", "For example: “How can I win medals,"),
                    line("titleAccent", "Heading, blue part", "Shown in blue, slanted. For example: Ma’am?”"),
                    {
                      name: "paragraphs",
                      label: "Paragraphs of the letter",
                      type: "array",
                      required: true,
                      minRows: 1,
                      maxRows: 10,
                      fields: [paragraph],
                      admin: { components: { RowLabel: "@/components/admin/RowLabel#RowLabel" } },
                    },
                    line("signatoryName", "Name under the letter", "Shown in blue, bold italic."),
                    line("signatoryRole", "Role under the name", "For example: Principal"),
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
