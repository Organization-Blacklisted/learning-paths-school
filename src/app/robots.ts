import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /admin and /api belong to the Payload CMS: not for search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
