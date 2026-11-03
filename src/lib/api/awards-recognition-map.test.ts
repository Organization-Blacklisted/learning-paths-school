import { describe, expect, it } from "vitest";
import { defaultAwardsRecognition, GENERIC_DESIGN } from "@/data/awards-recognition";
import type { AwardsRecognition } from "@/payload-types";
import { mapAwardsRecognition } from "./awards-recognition-map";
import { awardsRecognitionDocFromData, awardsRecognitionPhotoPaths } from "./awards-recognition-seed";

// Same rule as the other pages' mappers: the defaults are the base, the CMS overrides what an editor wrote, and anything the CMS lacks is the default
// for that field, so the page is never blank or half empty.
const doc = (changes: Partial<AwardsRecognition>): AwardsRecognition =>
  ({ id: 1, updatedAt: "", createdAt: "", ...changes }) as AwardsRecognition;
const media = (id: number, url: string, alt: string, width = 1848, height = 1170) => ({ id, url, alt, width, height }) as never;

describe("mapAwardsRecognition", () => {
  it("is the default content when there is no CMS document (not configured, database down)", () => {
    expect(mapAwardsRecognition(null)).toBe(defaultAwardsRecognition);
    expect(mapAwardsRecognition(undefined)).toBe(defaultAwardsRecognition);
  });

  it("is the default content for a document with nothing filled in (a new, empty global)", () => {
    expect(mapAwardsRecognition(doc({}))).toEqual(defaultAwardsRecognition);
  });

  it("takes what an editor changed in the hero, and keeps the rest (a text-only hero never gets a photo)", () => {
    const result = mapAwardsRecognition(doc({ hero: { badge: "Awards", titleLead: "", titleAccent: "Pride", subtitle: null } as never }));
    expect(result.hero).toEqual({ ...defaultAwardsRecognition.hero, badge: "Awards", titleAccent: "Pride" });
    expect(result.hero.image).toBeUndefined();
    expect(result.awards.awards).toEqual(defaultAwardsRecognition.awards.awards);
  });

  it("makes the editor's blocks THE blocks, in their order, with the designed offsets of the block at the same position", () => {
    const result = mapAwardsRecognition(
      doc({
        awards: {
          items: [
            { id: "a", image: media(1, "/api/media/file/one.avif", "One"), title: "  First Award ", text: "  First text.  " },
            { id: "b", image: media(2, "/api/media/file/two.avif", "Two"), title: "Second Award", text: "Second text." },
          ],
        } as never,
      }),
    );
    expect(result.awards.awards).toHaveLength(2);
    expect(result.awards.awards[0]).toEqual({
      image: { src: "/api/media/file/one.avif", alt: "One", width: 1848, height: 1170 },
      title: "First Award",
      text: "First text.",
      design: defaultAwardsRecognition.awards.awards[0].design,
    });
    expect(result.awards.awards[1].design).toEqual(defaultAwardsRecognition.awards.awards[1].design);
  });

  it("gives a block added after the third the generic offsets", () => {
    const items = Array.from({ length: 4 }, (_, i) => ({
      id: String(i),
      image: media(i + 1, `/api/media/file/a${i}.avif`, `A${i}`),
      title: `T${i}`,
      text: `X${i}`,
    }));
    const result = mapAwardsRecognition(doc({ awards: { items } as never }));
    expect(result.awards.awards).toHaveLength(4);
    expect(result.awards.awards[3].design).toEqual(GENERIC_DESIGN);
    expect(result.awards.awards[2].design).toEqual(defaultAwardsRecognition.awards.awards[2].design);
  });

  it("keeps a default block's photo when the row's upload could not be read, and leaves out a row with no photo at all", () => {
    const items = [
      { id: "a", image: 5, title: "Kept", text: "Kept text" }, // an id that was not loaded: the default photo of this position
      { id: "b", image: null, title: "Second", text: "Second text" },
      { id: "c", image: null, title: "Third", text: "Third text" },
      { id: "d", image: null, title: "Fourth", text: "Fourth text" }, // no default and no photo: dropped
    ];
    const result = mapAwardsRecognition(doc({ awards: { items } as never }));
    expect(result.awards.awards[0].image).toEqual(defaultAwardsRecognition.awards.awards[0].image);
    expect(result.awards.awards[0].title).toBe("Kept");
    expect(result.awards.awards).toHaveLength(3);
  });

  it("keeps the default blocks when the list is empty", () => {
    expect(mapAwardsRecognition(doc({ awards: { items: [] } as never })).awards.awards).toEqual(defaultAwardsRecognition.awards.awards);
  });

  it("gives the default content back from the page seeded from it (the seed is the exact inverse of the mapper)", () => {
    const ids = new Map(awardsRecognitionPhotoPaths().map(({ src }, i) => [src, i + 1]));
    const seeded = doc(
      awardsRecognitionDocFromData((src) => {
        const original = defaultAwardsRecognition.awards.awards.find((a) => a.image.src === src)!.image;
        return media(ids.get(src)!, src, original.alt, original.width, original.height);
      }) as never,
    );
    expect(mapAwardsRecognition(seeded)).toEqual(defaultAwardsRecognition);
  });
});

describe("the default Awards & Recognition content", () => {
  it("has the three blocks of the design, each with its photo, a title, a paragraph and designed offsets", () => {
    const { awards } = defaultAwardsRecognition.awards;
    expect(awards.map((a) => a.title)).toEqual(["School Awards", "Student Awards", "Achievers’ Awards"]);
    for (const award of awards) {
      expect(award.image.src).toMatch(/^\/images\/awards\/.+\.avif$/);
      expect(award.image.alt.length).toBeGreaterThan(20);
      expect(award.text.length).toBeGreaterThan(100);
      expect(award.design.textWidth).toBeGreaterThan(600);
    }
    expect(new Set(awards.map((a) => a.image.src)).size).toBe(3);
  });

  it('ends the Student Awards paragraph with a whole word and a full stop (the design\'s own text is cut off in the middle of a word: "showcasing their e")', () => {
    const last = defaultAwardsRecognition.awards.awards[1].text.split(" ").pop();
    expect(last).toMatch(/^[A-Za-z]{3,}\.$/);
  });
});
