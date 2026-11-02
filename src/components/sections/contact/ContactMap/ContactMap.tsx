import { mapEmbedSrc } from "@/lib/map-embed";

// The map of the Contact page: a Google Maps embed in a 1518 x 516px box (Figma "Rectangle 258", node 5644:9645, which holds a screenshot of
// the map; the live embed replaces it). The address is the `src` of Google's "Embed a map" iframe (src/lib/map-embed.ts accepts the whole
// pasted tag too and only lets a Google Maps embed through). Loaded lazily, so the map costs nothing until the visitor scrolls to it.
// Nothing is drawn when there is no valid address.
export default function ContactMap({ embedUrl, title }: { embedUrl: string; title: string }) {
  const src = mapEmbedSrc(embedUrl);
  if (!src) return null;
  return (
    <div className="aspect-[1518/516] min-h-[300px] w-full overflow-hidden bg-brand-mist">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="block size-full border-0"
      />
    </div>
  );
}
