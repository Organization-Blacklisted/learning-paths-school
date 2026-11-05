import type { GlobalConfig } from "payload";
import { line, list, paragraph, photo } from "./home/fields";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./shared/page-global";
import { pageHeroFields } from "./shared/page-hero";

// The Welcome to LPS page (Figma node 5688:14367, docs/34-welcome-to-lps.md). One document (a Global), like the other pages: an editor changes the TEXT and the
// PHOTOS of every part (the hero; the two paragraphs under it; the wide photo; Our Vision and Our Mission; the Principal's welcome; the values; the story's slides);
// the layout stays in code (src/components/sections/shared/PageHero, IntroTextSection, PhotoBannerSection, CrestCardsSection, MessageSection, ValuesListSection and
// StorySwipeSection; src/data/welcome-to-lps.ts has the defaults and the designed widths of the crest cards' titles, src/lib/api/welcome-to-lps-map.ts merges the
// two). The call to action and the photo strip at the end are the site's standard ones and are not edited here.
//
// The lists are FLEXIBLE: the crest cards (1 to 4), the paragraphs, the values (2 to 8: the first is the active one at the start) and the story's slides (1 to 12:
// each is a step of the timeline, and the green line of a slide is its share of the whole). A crest card added after the second is laid out with the generic design
// values.
//
// The SEO tab is added by the SEO plugin (payload.config.ts). Drafts, Live Preview and publishing work as on the home page.

const TITLE_LEAD = "The first words of the heading: shown in grey.";
const TITLE_ACCENT = "The last words of the heading: shown in blue, slanted.";

export const WelcomeToLps: GlobalConfig = {
  slug: "welcome-to-lps",
  label: "Welcome to LPS page",
  // The generated type would be "WelcomeToLp" (Payload cuts the plural s): name it plainly.
  typescript: { interface: "WelcomeToLps" },
  admin: {
    group: "Pages",
    description: "The heading, the photos and the text of the Welcome to LPS page, and its search-engine settings (SEO tab).",
    livePreview: livePreviewAt("/welcome-to-lps"),
  },
  access: publishedOnlyAccess,
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateOnPublish("welcome-to-lps")] },
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
                  description: "The photo across the top of the page and the heading over its bottom edge.",
                  fields: pageHeroFields(),
                },
                {
                  name: "intro",
                  label: "Introduction",
                  description: "The paragraphs under the hero, centred.",
                  fields: [
                    list({
                      name: "paragraphs",
                      label: "Paragraphs",
                      min: 1,
                      max: 6,
                      description: "One paragraph each, shown in this order. Drag one to move it.",
                      fields: [paragraph("text", "Paragraph", "A few lines.")],
                    }),
                  ],
                },
                {
                  name: "banner",
                  label: "Wide photo",
                  description: "The wide photo under the introduction (no title).",
                  fields: [
                    photo(
                      "image",
                      "Photo",
                      "A wide photo, 1800 x 873 works best (it is shown 1520 x 737 and a photo of another shape is cropped at its middle). Choose one from the library or upload one: JPG, PNG or WebP are converted to AVIF automatically. Its alt text comes from the library.",
                    ),
                  ],
                },
                {
                  name: "crests",
                  label: "Vision and Mission",
                  description: "Our Vision and Our Mission: a crest with its title over it and a paragraph under it, side by side.",
                  fields: [
                    list({
                      name: "cards",
                      label: "Cards",
                      min: 1,
                      max: 4,
                      description: "One card each, shown in this order.",
                      fields: [
                        photo(
                          "image",
                          "Crest picture",
                          "The picture of the crest, 730 x 626 (a shield between two laurel branches with an empty middle: the title is written over it). Choose one from the library or upload one. Its alt text comes from the library.",
                        ),
                        line("title", "Title", "Shown in blue, slanted, over the middle of the crest. For example: Our Vision"),
                        paragraph("text", "Paragraph", "The text under the crest, two or three lines."),
                      ],
                    }),
                  ],
                },
                {
                  name: "welcome",
                  label: "Principal’s welcome",
                  description: "The portrait on the left and the welcome on the right, on a white band.",
                  fields: [
                    photo(
                      "image",
                      "Portrait",
                      "A portrait photo, about 1203 x 1263 (it is shown 859 x 902 with rounded corners). Choose one from the library or upload one. Its alt text comes from the library.",
                    ),
                    line("titleLead", "Heading, first line", "Shown in grey. For example: Welcome To"),
                    line("titleAccent", "Heading, second line", "Shown in blue, slanted. For example: Learning Paths School"),
                    list({
                      name: "paragraphs",
                      label: "Paragraphs",
                      min: 1,
                      max: 4,
                      description: "One paragraph each, shown in this order.",
                      fields: [
                        paragraph(
                          "text",
                          "Paragraph",
                          "A line break (Enter) inside a paragraph starts a new line without the space between paragraphs.",
                        ),
                      ],
                    }),
                    line("signatoryName", "Name under the text", "Shown in blue, bold italic."),
                    line("signatoryRole", "Role under the name", "For example: Principal"),
                  ],
                },
                {
                  name: "values",
                  label: "Values",
                  description:
                    "The heading on the navy band and the list of values. The first value is the active one when the page opens.",
                  fields: [
                    line("title", "Heading on the band", "For example: Guided by"),
                    list({
                      name: "items",
                      label: "Values",
                      min: 2,
                      max: 8,
                      description:
                        "One value each, shown in this order. The text shows beside the value that is active (hovered, focused or tapped).",
                      fields: [
                        line("title", "Title", "Shown in blue, slanted. For example: Courage & Respect"),
                        paragraph("text", "Text", "Two or three lines."),
                      ],
                    }),
                  ],
                },
                {
                  name: "story",
                  label: "Story",
                  description: "“A Story That Keeps Growing”: the page is pinned here while the visitor scrolls through the slides.",
                  fields: [
                    line("titleLead", "Heading, grey part", TITLE_LEAD),
                    line("titleAccent", "Heading, blue part", TITLE_ACCENT),
                    list({
                      name: "slides",
                      label: "Slides",
                      min: 1,
                      max: 12,
                      description:
                        "One slide each, shown in this order. The green line over a slide's period is its step of the whole story (the third of three slides has it full).",
                      fields: [
                        photo(
                          "image",
                          "Photo",
                          "A photo about 28:15, 1260 x 675 works best (it is shown 840 x 450 and a photo of another shape is cropped at its middle). Choose one from the library or upload one. Its alt text comes from the library.",
                        ),
                        line("period", "Period", "Shown in green over the timeline. For example: 2008–2016"),
                        paragraph("text", "Story", "A line break (Enter) starts a new line without the space between paragraphs."),
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
