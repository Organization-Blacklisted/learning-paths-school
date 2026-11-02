import type { Field, GlobalConfig } from "payload";
import { mapEmbedSrc } from "@/lib/map-embed";
import { line } from "./home/fields";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./shared/page-global";
import { pageHeroFields } from "./shared/page-hero";

// The Contact page (Figma node 5644:9493, docs/28-contact-page.md). One document (a Global), like the home page: an editor changes the TEXT, the
// PHOTO, the contact details and the map; the layout, the form's labels and the design stay in code
// (src/components/sections/contact, src/data/contact.ts has the defaults and src/lib/api/contact-map.ts merges the two).
//
// The SEO tab is added by the SEO plugin (payload.config.ts). Drafts, Live Preview and publishing work as on the home page.

const ROW_LABEL = { RowLabel: "@/components/admin/RowLabel#RowLabel" };

const optionalLine = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: "text",
  admin: { description },
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const Contact: GlobalConfig = {
  slug: "contact",
  label: "Contact page",
  admin: {
    group: "Pages",
    description: "The photo and heading, the contact details and the map of the Contact page, and its search-engine settings (SEO tab).",
    livePreview: livePreviewAt("/contact-us"),
  },
  access: publishedOnlyAccess,
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateOnPublish("contact")] },
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
                  description: "The photo at the top with the heading card over its lower edge.",
                  fields: pageHeroFields(),
                },
                {
                  name: "details",
                  label: "Contact details",
                  description: "Shown on the left of the form. Each address and number becomes a link (e-mail, call).",
                  fields: [
                    {
                      name: "emails",
                      label: "Email addresses",
                      type: "array",
                      required: true,
                      minRows: 1,
                      maxRows: 5,
                      fields: [
                        {
                          name: "address",
                          label: "Email address",
                          type: "text",
                          required: true,
                          validate: (value: string | null | undefined) =>
                            value && EMAIL.test(value.trim()) ? true : "Please enter an email address like name@example.com.",
                        },
                        optionalLine("note", "Note in brackets", "For example: admissions. Leave empty for none."),
                      ],
                      admin: { components: ROW_LABEL },
                    },
                    {
                      name: "phones",
                      label: "Phone numbers",
                      type: "array",
                      required: true,
                      minRows: 1,
                      maxRows: 4,
                      fields: [
                        line("number", "Phone number", "As people write it, for example: 0172-5134300"),
                        optionalLine("note", "Note in brackets", "For example: for admissions only. Leave empty for none."),
                      ],
                      admin: { components: ROW_LABEL },
                    },
                    line("location", "Address", "One line."),
                  ],
                },
                {
                  name: "map",
                  label: "Map",
                  description:
                    "In Google Maps: Share, Embed a map, Copy HTML. Paste it here: only the address (src) of the iframe is used.",
                  fields: [
                    {
                      name: "embedUrl",
                      label: "Google Maps embed",
                      type: "textarea",
                      required: true,
                      validate: (value: unknown) =>
                        typeof value === "string" && mapEmbedSrc(value)
                          ? true
                          : "Please paste the embed code (or just the address) from Google Maps: Share, Embed a map. It must start with https://www.google.com/maps/embed.",
                    },
                    line(
                      "title",
                      "Description of the map for screen readers",
                      "For example: Map showing Learning Paths School in Sector 67, Mohali.",
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
