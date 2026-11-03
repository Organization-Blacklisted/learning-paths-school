import { describe, expect, it } from "vitest";
import { defaultPartnerships, GENERIC_DESIGN } from "@/data/partnerships";
import type { Partnership } from "@/payload-types";
import { mapPartnerships } from "./partnerships-map";
import { partnershipsDocFromData, partnershipsPhotoPaths } from "./partnerships-seed";

// Same rule as the home page's, the Contact page's and the Principal's Welcome page's mappers: the defaults are the base, the CMS overrides what an
// editor wrote, and anything the CMS lacks is the default for that field, so the page is never blank or half empty.
const doc = (changes: Partial<Partnership>): Partnership => ({ id: 1, updatedAt: "", createdAt: "", ...changes }) as Partnership;
const media = (id: number, url: string, alt: string, width = 300, height = 80) => ({ id, url, alt, width, height }) as never;

describe("mapPartnerships", () => {
  it("is the default content when there is no CMS document (not configured, database down)", () => {
    expect(mapPartnerships(null)).toBe(defaultPartnerships);
    expect(mapPartnerships(undefined)).toBe(defaultPartnerships);
  });

  it("is the default content for a document with nothing filled in (a new, empty global)", () => {
    expect(mapPartnerships(doc({}))).toEqual(defaultPartnerships);
  });

  it("takes what an editor changed in the hero and the introduction, and keeps the rest", () => {
    const result = mapPartnerships(
      doc({
        hero: { badge: "Partners", titleLead: "", titleAccent: "Together", subtitle: null } as never,
        partners: { intro: "  A new introduction.  " } as never,
      }),
    );
    expect(result.hero).toEqual({ ...defaultPartnerships.hero, badge: "Partners", titleAccent: "Together" });
    expect(result.hero.image).toBeUndefined();
    expect(result.partners.intro).toBe("A new introduction.");
    expect(result.partners.partners).toEqual(defaultPartnerships.partners.partners);
  });

  it("makes the editor's cards THE cards, in their order, with the designed offsets of the card at the same position", () => {
    const result = mapPartnerships(
      doc({
        partners: {
          items: [
            { id: "a", logo: media(1, "/api/media/file/one.avif", "One"), role: "First Partner" },
            { id: "b", logo: media(2, "/api/media/file/two.avif", "Two"), role: "  Second Partner " },
          ],
        } as never,
      }),
    );
    expect(result.partners.partners).toHaveLength(2);
    expect(result.partners.partners[0]).toEqual({
      logo: { src: "/api/media/file/one.avif", alt: "One", width: 300, height: 80 },
      role: "First Partner",
      design: defaultPartnerships.partners.partners[0].design,
    });
    expect(result.partners.partners[1].role).toBe("Second Partner");
    expect(result.partners.partners[1].design).toEqual(defaultPartnerships.partners.partners[1].design);
  });

  it("gives a card added after the eighth the generic offsets", () => {
    const items = Array.from({ length: 9 }, (_, i) => ({
      id: String(i),
      logo: media(i + 1, `/api/media/file/p${i}.avif`, `P${i}`),
      role: `Partner ${i}`,
    }));
    const result = mapPartnerships(doc({ partners: { items } as never }));
    expect(result.partners.partners).toHaveLength(9);
    expect(result.partners.partners[8].design).toEqual(GENERIC_DESIGN);
    expect(result.partners.partners[7].design).toEqual(defaultPartnerships.partners.partners[7].design);
  });

  it("keeps a default card's logo when the row's upload could not be read, and leaves out a row with no logo at all", () => {
    const items = [
      { id: "a", logo: 5, role: "Kept Partner" }, // an id that was not loaded: the default logo of this position
      ...Array.from({ length: 8 }, (_, i) => ({ id: `x${i}`, logo: null, role: `R${i}` })),
    ];
    const result = mapPartnerships(doc({ partners: { items } as never }));
    expect(result.partners.partners[0].logo).toEqual(defaultPartnerships.partners.partners[0].logo);
    expect(result.partners.partners[0].role).toBe("Kept Partner");
    // positions 1 to 7 fall back to their default logos; the ninth row has no default and no logo, so it is dropped
    expect(result.partners.partners).toHaveLength(8);
  });

  it("keeps the default cards when the list is empty", () => {
    expect(mapPartnerships(doc({ partners: { items: [] } as never })).partners.partners).toEqual(defaultPartnerships.partners.partners);
  });

  it("gives the default content back from the page seeded from it (the seed is the exact inverse of the mapper)", () => {
    const ids = new Map(partnershipsPhotoPaths().map(({ src }, i) => [src, i + 1]));
    const seeded = doc(
      partnershipsDocFromData((src) => {
        const id = ids.get(src)!;
        const original = defaultPartnerships.partners.partners.find((p) => p.logo.src === src)!.logo;
        return media(id, src, original.alt, original.width, original.height);
      }) as never,
    );
    expect(mapPartnerships(seeded)).toEqual(defaultPartnerships);
  });
});

describe("the default Partnerships content", () => {
  it("has the eight partners of the design, each with its logo file and designed offsets", () => {
    const { partners } = defaultPartnerships.partners;
    expect(partners.map((p) => p.role)).toEqual([
      "Curriculum Partner",
      "Knowledge Partner",
      "Innovation Partner",
      "Guidance Program Partner",
      "Association for Reinventing School Education",
      "Knowledge Partner",
      "Sports Partner",
      "Health Partner",
    ]);
    for (const partner of partners) {
      expect(partner.logo.src).toMatch(/^\/images\/partnerships\/.+\.avif$/);
      expect(partner.logo.alt.length).toBeGreaterThan(5);
      expect(partner.design.logoWidth).toBeGreaterThan(100);
    }
    expect(new Set(partners.map((p) => p.logo.src)).size).toBe(8);
  });
});
