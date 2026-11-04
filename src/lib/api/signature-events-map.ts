import { defaultSignatureEvents, GENERIC_EVENT_DESIGN } from "@/data/signature-events";
import { text } from "@/lib/api/home-map";
import { photoFromMedia } from "@/lib/api/media-map";
import { pageHeroFromDoc } from "@/lib/api/page-hero-map";
import type { SignatureEvent } from "@/payload-types";
import type { AlternatingRow } from "@/types/alternating-rows";
import type { SignatureEventsContent } from "@/types/signature-events";

// Turns the Signature Events page of the CMS (Payload global "signature-events") into the content the page takes. PURE (no Payload runtime), so the Live
// Preview (a Client Component) can use it too. Same rule as the home page's mapper (src/lib/api/home-map.ts): the defaults (src/data/signature-events.ts) are
// the base, the CMS overrides what an editor wrote, and anything it lacks (an empty field, an empty list, no document, the database down) is the default for
// that field, so the page is never blank.
//
// The events are a flexible list: when the CMS has events, THEY are the events, in the editor's order. The designed width of a heading is design, so it comes
// from the default row at the same position (the first nine), and a row beyond them gets the generic one. A row without a readable photo is left out.

const NO_PHOTO = { src: "", alt: "", width: 0, height: 0 };

export function mapSignatureEvents(
  doc: SignatureEvent | null | undefined,
  defaults: SignatureEventsContent = defaultSignatureEvents,
): SignatureEventsContent {
  if (!doc) return defaults;
  const { hero, events } = doc;

  const rows: AlternatingRow[] = (events?.items ?? []).flatMap((row, index) => {
    const base = defaults.events.rows[index];
    const image = photoFromMedia(row.image, base?.image ?? NO_PHOTO);
    if (!image.src) return [];
    return [
      {
        image,
        title: text(row.title, base?.title ?? ""),
        text: text(row.text, base?.text ?? ""),
        design: base?.design ?? GENERIC_EVENT_DESIGN,
      },
    ];
  });

  return {
    hero: pageHeroFromDoc(hero, defaults.hero),
    events: { ...defaults.events, rows: rows.length ? rows : defaults.events.rows },
  };
}
