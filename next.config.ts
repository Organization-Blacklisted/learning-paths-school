import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build go to its own folder (NEXT_DIST_DIR=.next-prod npm run build) so it never touches the
  // running dev server's .next folder. Unset, it is the normal .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Do not announce the framework in a response header.
  poweredByHeader: false,
  // One branded 404 page for every URL that matches no route (src/app/global-not-found.tsx). Needed because the app has two
  // root layouts (the site and the Payload admin), so there is no single layout to build the default 404 from.
  // Marked experimental in Next 16.4 (docs: file-conventions/not-found.md).
  experimental: { globalNotFound: true },
  // Cache Components (`cacheComponents` + `partialPrefetching`, from the project generator's
  // defaults) is OFF on purpose. Payload's admin is not compatible with it: every /admin request
  // logs "Next.js encountered the unstable value `new Date()` while prerendering" from
  // Payload's `authenticate`. The Giada project runs without it, using `unstable_cache` + tags.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        // Safe, standard hardening for every page. No Content-Security-Policy yet: it needs a nonce set up that also
        // works with Payload's admin (inline scripts), tracked in docs/07-decisions.md. HSTS is left to the host.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        // The files in /public are served with `max-age=0` by default, so every visit revalidated every photo. Their
        // names do not change when a file is replaced, so not "immutable": a week, then revalidate in the background.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default withPayload(nextConfig);
