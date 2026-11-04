import { describe, expect, it } from "vitest";
import { defaultStudentCouncil, GENERIC_FEATURE_DESIGN } from "@/data/student-council";
import type { StudentCouncil } from "@/payload-types";
import { mapStudentCouncil } from "./student-council-map";
import { studentCouncilDocFromData, studentCouncilPhotoPaths } from "./student-council-seed";

// Same rule as the other pages' mappers: the defaults are the base, the CMS overrides what an editor wrote, and anything the CMS lacks is the default
// for that field, so the page is never blank or half empty.
const doc = (changes: Partial<StudentCouncil>): StudentCouncil => ({ id: 1, updatedAt: "", createdAt: "", ...changes }) as StudentCouncil;
const media = (id: number, url: string, alt: string, width = 1554, height = 1130) => ({ id, url, alt, width, height }) as never;

describe("mapStudentCouncil", () => {
  it("is the default content when there is no CMS document (not configured, database down)", () => {
    expect(mapStudentCouncil(null)).toBe(defaultStudentCouncil);
    expect(mapStudentCouncil(undefined)).toBe(defaultStudentCouncil);
  });

  it("is the default content for a document with nothing filled in (a new, empty global)", () => {
    expect(mapStudentCouncil(doc({}))).toEqual(defaultStudentCouncil);
  });

  it("takes what an editor changed in the hero, and keeps the rest (a text-only hero never gets a photo)", () => {
    const result = mapStudentCouncil(doc({ hero: { badge: "Council", titleLead: "", titleAccent: "Voice", subtitle: null } as never }));
    expect(result.hero).toEqual({ ...defaultStudentCouncil.hero, badge: "Council", titleAccent: "Voice" });
    expect(result.hero.image).toBeUndefined();
    expect(result.features).toEqual(defaultStudentCouncil.features);
  });

  it("takes the introduction's photo, title and paragraph from the CMS, and keeps what is design (the photo's height, where the title is)", () => {
    const result = mapStudentCouncil(
      doc({
        intro: {
          image: media(1, "/api/media/file/new.avif", "New", 2000, 951),
          titleAccent: "  Young Voices ",
          titleRest: "At LPS",
          text: " A new paragraph. ",
        } as never,
      }),
    );
    expect(result.intro).toEqual({
      ...defaultStudentCouncil.intro,
      image: { src: "/api/media/file/new.avif", alt: "New", width: 2000, height: 951 },
      titleAccent: "Young Voices",
      titleRest: "At LPS",
      text: "A new paragraph.",
    });
    expect(result.intro.titlePosition).toBe("below");
    expect(result.intro.photoHeight).toBe(723);
  });

  it("takes the group photo's title and photo from the CMS, and keeps its design (title above, 782px)", () => {
    const result = mapStudentCouncil(
      doc({
        gallery: { titleAccent: "Our Student", titleRest: "Leaders", image: media(2, "/api/media/file/g.avif", "G", 1720, 885) } as never,
      }),
    );
    expect(result.gallery).toMatchObject({ titleAccent: "Our Student", titleRest: "Leaders", titlePosition: "above", photoHeight: 782 });
    expect(result.gallery.image.src).toBe("/api/media/file/g.avif");
  });

  it("makes the editor's rows THE rows, in their order, with the designed column of the row at the same position", () => {
    const result = mapStudentCouncil(
      doc({
        features: {
          items: [
            { id: "a", image: media(1, "/api/media/file/one.avif", "One"), title: "  First ", text: "  First text.  " },
            { id: "b", image: media(2, "/api/media/file/two.avif", "Two"), title: "Second", text: "Second text." },
          ],
        } as never,
      }),
    );
    expect(result.features.rows).toHaveLength(2);
    expect(result.features.rows[0]).toEqual({
      image: { src: "/api/media/file/one.avif", alt: "One", width: 1554, height: 1130 },
      title: "First",
      text: "First text.",
      design: defaultStudentCouncil.features.rows[0].design,
    });
    expect(result.features.rows[1].design).toEqual(defaultStudentCouncil.features.rows[1].design);
  });

  it("gives a row added after the third the generic column, and keeps the third's own wider one", () => {
    const items = Array.from({ length: 4 }, (_, i) => ({
      id: String(i),
      image: media(i + 1, `/api/media/file/r${i}.avif`, `R${i}`),
      title: `T${i}`,
      text: `X${i}`,
    }));
    const result = mapStudentCouncil(doc({ features: { items } as never }));
    expect(result.features.rows).toHaveLength(4);
    expect(result.features.rows[3].design).toEqual(GENERIC_FEATURE_DESIGN);
    expect(result.features.rows[2].design).toEqual({ gap: 88, textWidth: 572 });
  });

  it("keeps a default row's photo when the row's upload could not be read, and leaves out a row with no photo at all", () => {
    const items = [
      { id: "a", image: 5, title: "Kept", text: "Kept text" }, // an id that was not loaded: the default photo of this position
      { id: "b", image: null, title: "Second", text: "Second text" },
      { id: "c", image: null, title: "Third", text: "Third text" },
      { id: "d", image: null, title: "Fourth", text: "Fourth text" }, // no default and no photo: dropped
    ];
    const result = mapStudentCouncil(doc({ features: { items } as never }));
    expect(result.features.rows[0].image).toEqual(defaultStudentCouncil.features.rows[0].image);
    expect(result.features.rows[0].title).toBe("Kept");
    expect(result.features.rows).toHaveLength(3);
  });

  it("keeps the default rows when the list is empty", () => {
    expect(mapStudentCouncil(doc({ features: { items: [] } as never })).features.rows).toEqual(defaultStudentCouncil.features.rows);
  });

  it("gives the default content back from the page seeded from it (the seed is the exact inverse of the mapper)", () => {
    const all = [
      defaultStudentCouncil.intro.image,
      ...defaultStudentCouncil.features.rows.map((r) => r.image),
      defaultStudentCouncil.gallery.image,
    ];
    const ids = new Map(studentCouncilPhotoPaths().map(({ src }, i) => [src, i + 1]));
    const seeded = doc(
      studentCouncilDocFromData((src) => {
        const original = all.find((image) => image.src === src)!;
        return media(ids.get(src)!, src, original.alt, original.width, original.height);
      }) as never,
    );
    expect(mapStudentCouncil(seeded)).toEqual(defaultStudentCouncil);
  });
});

describe("the default Student Council content", () => {
  it("has the three rows of the design, each with its photo, a heading, a paragraph and a designed column", () => {
    const { rows } = defaultStudentCouncil.features;
    expect(rows.map((r) => r.title)).toEqual([
      "Fostering Democracy and Responsibility",
      "Voting for Voices, Electing Change",
      "Guiding the Student Experience",
    ]);
    for (const row of rows) {
      expect(row.image.src).toMatch(/^\/images\/student-council\/.+\.avif$/);
      expect(row.image.alt.length).toBeGreaterThan(20);
      expect(row.text.length).toBeGreaterThan(100);
    }
    expect(new Set(rows.map((r) => r.image.src)).size).toBe(3);
    expect(rows.map((r) => r.design)).toEqual([
      { gap: 81, textWidth: 532 },
      { gap: 81, textWidth: 532 },
      { gap: 88, textWidth: 572 },
    ]);
  });

  it("uses five different photos in all, each described", () => {
    const paths = studentCouncilPhotoPaths();
    expect(paths).toHaveLength(5);
    for (const { alt } of paths) expect(alt.length).toBeGreaterThan(20);
  });

  it("has the two banners as designed: the title under the 723px photo with a paragraph, and the title above the 782px group photo with none", () => {
    expect(defaultStudentCouncil.intro).toMatchObject({ titlePosition: "below", photoHeight: 723 });
    expect(defaultStudentCouncil.intro.text?.length).toBeGreaterThan(100);
    expect(defaultStudentCouncil.gallery).toMatchObject({ titlePosition: "above", photoHeight: 782 });
    expect(defaultStudentCouncil.gallery.text).toBeUndefined();
  });
});
