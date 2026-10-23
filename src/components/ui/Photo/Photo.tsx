import Image, { type ImageProps } from "next/image";

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
