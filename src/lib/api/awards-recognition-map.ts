import { defaultAwardsRecognition, GENERIC_DESIGN } from "@/data/awards-recognition";
import { text } from "@/lib/api/home-map";
import { photoFromMedia } from "@/lib/api/media-map";
import { pageHeroFromDoc } from "@/lib/api/page-hero-map";
import type { AwardsRecognition } from "@/payload-types";
import type { AwardBlock } from "@/types/awards";
import type { AwardsRecognitionContent } from "@/types/awards-recognition";

// Turns the Awards & Recognition page of the CMS (Payload global "awards-recognition") into the content the page takes. PURE (no Payload runtime), so
// the Live Preview (a Client Component) can use it too. Same rule as the home page's mapper (src/lib/api/home-map.ts): the defaults
// (src/data/awards-recognition.ts) are the base, the CMS overrides what an editor wrote, and anything it lacks (an empty field, an empty list, no
// document, the database down) is the default for that field, so the page is never blank.
//
// The award blocks are a flexible list: when the CMS has blocks, THEY are the blocks, in the editor's order. The designed offsets of a block (where its
// text and laurels sit) are design, so they come from the default block at the same position (the first three), and a block beyond them gets the generic
// ones. A row without a readable photo is left out.

const NO_PHOTO = { src: "", alt: "", width: 0, height: 0 };

export function mapAwardsRecognition(
  doc: AwardsRecognition | null | undefined,
  defaults: AwardsRecognitionContent = defaultAwardsRecognition,
): AwardsRecognitionContent {
  if (!doc) return defaults;
  const { hero, awards } = doc;
  const d = defaults.awards;

  const fromCms: AwardBlock[] = (awards?.items ?? []).flatMap((row, index) => {
    const base = d.awards[index];
    const image = photoFromMedia(row.image, base?.image ?? NO_PHOTO);
    if (!image.src) return [];
    return [
      {
        image,
        title: text(row.title, base?.title ?? ""),
        text: text(row.text, base?.text ?? ""),
        design: base?.design ?? GENERIC_DESIGN,
      },
    ];
  });

  return {
    hero: pageHeroFromDoc(hero, defaults.hero),
    awards: { ...d, awards: fromCms.length ? fromCms : d.awards },
  };
}
