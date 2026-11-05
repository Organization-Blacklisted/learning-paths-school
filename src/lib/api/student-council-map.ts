import { defaultStudentCouncil, GENERIC_FEATURE_DESIGN } from "@/data/student-council";
import { text } from "@/lib/api/home-map";
import { photoFromMedia } from "@/lib/api/media-map";
import { pageHeroFromDoc } from "@/lib/api/page-hero-map";
import type { StudentCouncil } from "@/payload-types";
import type { SplitFeature } from "@/types/split-features";
import type { StudentCouncilContent } from "@/types/student-council";

// Turns the Student Council page of the CMS (Payload global "student-council") into the content the page takes. PURE (no Payload runtime), so the Live
// Preview (a Client Component) can use it too. Same rule as the home page's mapper (src/lib/api/home-map.ts): the defaults (src/data/student-council.ts) are
// the base, the CMS overrides what an editor wrote, and anything it lacks (an empty field, an empty list, no document, the database down) is the default for
// that field, so the page is never blank.
//
// The rows are a flexible list: when the CMS has rows, THEY are the rows, in the editor's order. The designed offsets of a row (where its text column
// sits) are design, so they come from the default row at the same position (the first three), and a row beyond them gets the generic ones. A row without a
// readable photo is left out. What an editor cannot change stays as designed: the photos' heights and where the titles are.

const NO_PHOTO = { src: "", alt: "", width: 0, height: 0 };

export function mapStudentCouncil(
  doc: StudentCouncil | null | undefined,
  defaults: StudentCouncilContent = defaultStudentCouncil,
): StudentCouncilContent {
  if (!doc) return defaults;
  const { hero, intro, features, gallery } = doc;

  const rows: SplitFeature[] = (features?.items ?? []).flatMap((row, index) => {
    const base = defaults.features.rows[index];
    const image = photoFromMedia(row.image, base?.image ?? NO_PHOTO);
    if (!image.src) return [];
    return [
      {
        image,
        title: text(row.title, base?.title ?? ""),
        text: text(row.text, base?.text ?? ""),
        design: base?.design ?? GENERIC_FEATURE_DESIGN,
      },
    ];
  });

  return {
    hero: pageHeroFromDoc(hero, defaults.hero),
    intro: {
      ...defaults.intro,
      image: photoFromMedia(intro?.image, defaults.intro.image),
      titleAccent: text(intro?.titleAccent, defaults.intro.titleAccent ?? ""),
      titleRest: text(intro?.titleRest, defaults.intro.titleRest ?? ""),
      text: text(intro?.text, defaults.intro.text ?? ""),
    },
    features: { ...defaults.features, rows: rows.length ? rows : defaults.features.rows },
    gallery: {
      ...defaults.gallery,
      image: photoFromMedia(gallery?.image, defaults.gallery.image),
      titleAccent: text(gallery?.titleAccent, defaults.gallery.titleAccent ?? ""),
      titleRest: text(gallery?.titleRest, defaults.gallery.titleRest ?? ""),
    },
  };
}
