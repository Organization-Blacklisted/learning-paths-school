import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the home page exists so far. Add each page here as it is built (see docs/03-sitemap.md), or generate the
// list from the CMS once pages come from Payload.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }];
}
