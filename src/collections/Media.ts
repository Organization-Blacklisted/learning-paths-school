import type { CollectionConfig } from "payload";

// Uploads collection: every image or file in the other collections relates to a document here.
// Kept minimal on purpose (no folders or tags); add them if the content volume needs it.
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  // Without a named admin thumbnail, every preview in /admin downloads the FULL original
  // file (lesson from the Giada project). `thumbnail` is a stored 400x400 crop used only
  // for admin previews; the public site never references it.
  upload: {
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 400,
        fit: "cover",
      },
    ],
    adminThumbnail: "thumbnail",
  },
};
