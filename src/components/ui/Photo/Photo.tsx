import Image, { getImageProps, type ImageProps } from "next/image";

// A photo of the page, loaded the way every photo below the first screen is: already compressed (AVIF), so next/image must not re-encode it
// (`unoptimized`), requested only when `ready` is true (see useIdleReady: the box around it keeps its size meanwhile, so nothing
// jumps), then loaded right away (`loading="eager"`, since it is only mounted once it is wanted), and not draggable or selectable.
//
//   const ready = useIdleReady(800, rootRef);
//   <div className="relative aspect-[4/3]"><Photo ready={ready} src="/images/…avif" alt="…" fill sizes="…" className="object-cover" /></div>
//
// `ready` defaults to true (load it now). For the first screen of the page (the hero) use next/image's `priority` directly.
type PhotoProps = Omit<ImageProps, "unoptimized" | "loading" | "draggable"> & { ready?: boolean };

export default function Photo({ ready = true, className = "", ...props }: PhotoProps) {
  if (!ready) return null;
  // alt is a required prop of ImageProps (it arrives in ...props), which the lint rule cannot see
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image unoptimized loading="eager" draggable={false} className={`select-none ${className}`} {...props} />;
}

/**
 * The address a <Photo> with this `src` REALLY requests. On Vercel Next.js adds the deployment id to it (`/api/media/file/x.avif?dpl=dpl_...`), so it is not
 * the `src` you pass in. Anything that fetches a photo ahead of time (new Image(), a preload) must use THIS address: for the browser a photo with another
 * query string is another photo, so the page's own <img> would not find what was fetched and would download it again (the Ecosystem tabs faded in
 * an empty layer on a first visit for that reason, 2026-11-03).
 */
export function photoSrc(src: string): string {
  return getImageProps({ src, alt: "", fill: true, unoptimized: true }).props.src;
}
