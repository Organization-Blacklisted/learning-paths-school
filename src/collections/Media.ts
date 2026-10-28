import path from "path";
import sharp from "sharp";
import { APIError, type CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";

// Every photo on the site is an AVIF (owner rule, scripts/README.md: "Never add a JPG, PNG or WebP photo"). Editors upload what they have;
// this converts it on the way in, so the speed work survives an upload:
//  - a JPG, PNG or WebP is resized to at most MAX_EDGE px on its longest side (never enlarged) and saved as AVIF at AVIF_QUALITY;
//  - a file that is ALREADY an AVIF is stored byte for byte (so the photos seeded from public/images keep the quality they were made with:
//    re-encoding an AVIF would lose some).
// Payload's own `upload.formatOptions` is not used because it always re-encodes, AVIF included.
const MAX_EDGE = 2560;
const AVIF_QUALITY = 85;
const CONVERTIBLE = ["image/jpeg", "image/png", "image/webp"];

// Pages that show media read it through this tag (see src/lib/api/home.ts): a changed or deleted photo refreshes them.
const revalidateMedia = () => {
  try {
    revalidateTag("home", { expire: 0 });
  } catch {
    // Not inside a Next request (a script, the seed): nothing to refresh.
  }
};

// Uploads collection: every image or file in the other collections relates to a document here.
// Kept minimal on purpose (no folders or tags); add them if the content volume needs it.
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  admin: { group: "Library" },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "Describe the photo for people who cannot see it (and for search engines). Leave out 'image of'. A purely decorative photo can still say what it shows.",
      },
    },
  ],
  hooks: {
    // Runs before Payload reads the file (to measure it and make the thumbnail), so everything downstream sees the AVIF.
    beforeOperation: [
      async ({ args, operation }) => {
        if (operation !== "create" && operation !== "update") return args;
        const file = args.req?.file;
        if (!file || !CONVERTIBLE.includes(file.mimetype)) return args;
        let data: Buffer;
        try {
          data = await sharp(file.data)
            .rotate() // apply the camera's orientation, then drop it
            .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
            .avif({ quality: AVIF_QUALITY, effort: 4 })
            .toBuffer();
        } catch {
          // A damaged file or one that only pretends to be a photo: say so, instead of a bare server error.
          throw new APIError("This file could not be read as a photo. Please upload a JPG, PNG, WebP or AVIF image.", 400);
        }
        args.req.file = {
          ...file,
          data,
          size: data.length,
          mimetype: "image/avif",
          name: `${path.parse(file.name).name}.avif`,
        };
        return args;
      },
    ],
    afterChange: [
      ({ doc }) => {
        revalidateMedia();
        return doc;
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateMedia();
        return doc;
      },
    ],
  },
  // Without a named admin thumbnail, every preview in /admin downloads the FULL original
  // file (lesson from the Giada project). `thumbnail` is a stored 400x400 crop used only
  // for admin previews; the public site never references it.
  upload: {
    // Photos only (a SVG is code, a video is not supported yet): the list the converter above understands, plus AVIF itself.
    mimeTypes: [...CONVERTIBLE, "image/avif"],
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 400,
        fit: "cover",
      },
      // The share image (Open Graph / Twitter): WhatsApp, Facebook and X do not read AVIF, so the SEO "meta image" is read from this
      // 1200 x 630 JPEG, never from the AVIF original (see src/lib/metadata.ts).
      {
        name: "social",
        width: 1200,
        height: 630,
        fit: "cover",
        formatOptions: { format: "jpeg", options: { quality: 82, mozjpeg: true } },
      },
    ],
    adminThumbnail: "thumbnail",
  },
};
