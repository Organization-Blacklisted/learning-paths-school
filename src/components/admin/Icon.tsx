import Image from "next/image";

// The small icon of the Payload admin (the navigation and the top bar), instead of Payload's own mark (admin.components.graphics.Icon in payload.config.ts):
// the school's crest, the same picture as the site's favicon (src/app/icon.png, made by scripts/make-favicon.mjs).
export function Icon() {
  return <Image src="/icon.png" alt="" width={28} height={28} unoptimized style={{ width: 28, height: 28, objectFit: "contain" }} />;
}
