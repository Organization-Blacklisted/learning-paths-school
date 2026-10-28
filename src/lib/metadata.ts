import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// The <head> of a page from what its SEO tab holds (the SEO plugin's `meta` group plus the noindex and canonical fields). Shared by every page
// that is edited in the CMS, so each one only passes its own values. A blank field means "use the site's default" (src/lib/site.ts).

export type PageSeo = {
  title?: string | null;
  description?: string | null;
  /** The share image, as a media document (depth 1) or an id (then there is no image). */
  image?: unknown;
  noIndex?: boolean | null;
  canonical?: string | null;
};

type MediaLike = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  sizes?: { social?: { url?: string | null } | null } | null;
};

/** The share image: the 1200 x 630 JPEG of the media document (social sites do not read AVIF), or nothing. */
export function shareImage(image: unknown): { url: string; width?: number; height?: number; alt?: string } | undefined {
  if (!image || typeof image !== "object") return undefined;
  const media = image as MediaLike;
  const social = media.sizes?.social?.url;
  if (social) return { url: social, width: 1200, height: 630, alt: media.alt ?? undefined };
  return undefined;
}

/**
 * @param path the page's own path ("/" for the home page), used for the canonical address and the Open Graph url
 */
export function buildPageMetadata(seo: PageSeo | null | undefined, path: string): Metadata {
  const title = seo?.title?.trim() || SITE_NAME;
  const description = seo?.description?.trim() || SITE_DESCRIPTION;
  const canonical = seo?.canonical?.trim() || path;
  const image = shareImage(seo?.image);

  return {
    // `absolute`: the title the editor wrote is the whole title (the layout's "%s | Learning Paths School" would repeat the name).
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: canonical,
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image.url] } : {}) },
    ...(seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
