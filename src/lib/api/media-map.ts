import type { Media } from "@/payload-types";

/** A photo of a page, as the components take it. */
export type PhotoContent = { src: string; alt: string; width: number; height: number };

/**
 * A photo from an upload field of the CMS: the editor's (its address, size and alt text from the media library) when the reference has been loaded
 * (depth 1) and has a file, otherwise the default. PURE. The size is the size of the file itself, which is what next/image needs.
 */
export function photoFromMedia<T extends PhotoContent>(ref: number | Media | null | undefined, fallback: T): T {
  const file = ref && typeof ref === "object" && ref.url ? ref : null;
  if (!file) return fallback;
  return {
    ...fallback,
    src: file.url as string,
    alt: file.alt || fallback.alt,
    width: file.width ?? fallback.width,
    height: file.height ?? fallback.height,
  };
}
