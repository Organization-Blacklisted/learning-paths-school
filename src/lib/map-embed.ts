// The address of a Google Maps embed, from what an editor pasted. Google's "Share > Embed a map" gives a whole <iframe ...> tag; the page needs
// only its `src`, and only a Google Maps embed address is accepted (nothing else is ever put in the page's iframe). Pure, so the CMS field
// validation, the mapper and the tests all use it.

const GOOGLE_MAPS_EMBED = "https://www.google.com/maps/embed";

/** The embed address in `value` (a bare address or a pasted <iframe> tag), or null when there is none or it is not a Google Maps embed. */
export function mapEmbedSrc(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  if (!text) return null;
  const fromTag = /<iframe[^>]*?\bsrc\s*=\s*(["'])([\s\S]*?)\1/i.exec(text);
  // In an HTML attribute an & is written &amp;
  const src = (fromTag ? fromTag[2] : text).trim().replace(/&amp;/g, "&");
  return src.startsWith(`${GOOGLE_MAPS_EMBED}?`) || src.startsWith(`${GOOGLE_MAPS_EMBED}/`) ? src : null;
}
