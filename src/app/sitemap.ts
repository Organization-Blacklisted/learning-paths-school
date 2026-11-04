import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The pages that exist so far (home, contact, principal's welcome, partnerships, awards & recognition). Add each page here as it is built (see docs/03-sitemap.md), or generate the
// list from the CMS once pages come from Payload.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/contact-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/principals-welcome`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/partnerships`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/awards-recognition`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/student-council`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/signature-events`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
