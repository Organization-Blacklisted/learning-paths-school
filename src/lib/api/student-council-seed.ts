import { defaultStudentCouncil } from "@/data/student-council";
import type { StudentCouncilContent } from "@/types/student-council";

// The INVERSE of src/lib/api/student-council-map.ts: the current content (src/data/student-council.ts) as the data of the CMS's page, so the first version in
// the CMS is exactly the current page. Used by the seed script (scripts/seed-student-council.ts, which uploads the photos and passes their media ids) and by
// the test that proves `mapStudentCouncil(studentCouncilDocFromData(...))` gives the default content back. Pure.

export type PhotoRef = (src: string) => unknown;

/** The photos the page uses, once each (the seed uploads these). */
export const studentCouncilPhotoPaths = (content: StudentCouncilContent = defaultStudentCouncil): { src: string; alt: string }[] => {
  const all = [content.intro.image, ...content.features.rows.map((row) => row.image), content.gallery.image];
  return all.filter((image, index) => all.findIndex((other) => other.src === image.src) === index).map(({ src, alt }) => ({ src, alt }));
};

export function studentCouncilDocFromData(photo: PhotoRef, content: StudentCouncilContent = defaultStudentCouncil) {
  const { hero, intro, features, gallery } = content;
  return {
    hero: { badge: hero.badge, titleLead: hero.titleLead, titleAccent: hero.titleAccent, subtitle: hero.subtitle },
    intro: { image: photo(intro.image.src), titleAccent: intro.titleAccent, titleRest: intro.titleRest, text: intro.text ?? "" },
    features: { items: features.rows.map(({ image, title, text }) => ({ image: photo(image.src), title, text })) },
    gallery: { titleAccent: gallery.titleAccent, titleRest: gallery.titleRest, image: photo(gallery.image.src) },
  };
}
