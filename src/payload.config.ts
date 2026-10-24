import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Object storage (Neon, S3-compatible) is only switched on once its credentials exist.
// Until then uploads go to the local, gitignored /media folder. Env var names match
// what `neon link` / `neon deploy` write (see .env.example).
const useObjectStorage = Boolean(process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " - Learning Paths School",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  globals: [],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: useObjectStorage,
      collections: {
        media: true,
      },
      // Fixed identifier tied 1:1 to the bucket declared in neon.ts (not an env var).
      // Confirmed 2026-10-24: the Neon bucket `lps-media` (private) exists and is declared in neon.ts.
      bucket: "lps-media",
      config: {
        region: process.env.AWS_REGION,
        endpoint: process.env.AWS_ENDPOINT_URL_S3,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
        // Neon Object Storage only supports path-style addressing.
        forcePathStyle: true,
      },
      disableLocalStorage: true,
    }),
  ],
});
