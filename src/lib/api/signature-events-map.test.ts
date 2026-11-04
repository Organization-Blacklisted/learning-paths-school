import { describe, expect, it } from "vitest";
import { defaultSignatureEvents, GENERIC_EVENT_DESIGN } from "@/data/signature-events";
import type { SignatureEvent } from "@/payload-types";
import { mapSignatureEvents } from "./signature-events-map";
import { signatureEventsDocFromData, signatureEventsPhotoPaths } from "./signature-events-seed";

// Same rule as the other pages' mappers: the defaults are the base, the CMS overrides what an editor wrote, and anything the CMS lacks is the default
// for that field, so the page is never blank or half empty.
const doc = (changes: Partial<SignatureEvent>): SignatureEvent => ({ id: 1, updatedAt: "", createdAt: "", ...changes }) as SignatureEvent;
const media = (id: number, url: string, alt: string, width = 1636, height = 1046) => ({ id, url, alt, width, height }) as never;

describe("mapSignatureEvents", () => {
  it("is the default content when there is no CMS document (not configured, database down)", () => {
    expect(mapSignatureEvents(null)).toBe(defaultSignatureEvents);
    expect(mapSignatureEvents(undefined)).toBe(defaultSignatureEvents);
  });

  it("is the default content for a document with nothing filled in (a new, empty global)", () => {
    expect(mapSignatureEvents(doc({}))).toEqual(defaultSignatureEvents);
  });

  it("takes what an editor changed in the hero, and keeps the rest (a text-only hero never gets a photo)", () => {
    const result = mapSignatureEvents(doc({ hero: { badge: "Events", titleLead: "", titleAccent: "Stories", subtitle: null } as never }));
    expect(result.hero).toEqual({ ...defaultSignatureEvents.hero, badge: "Events", titleAccent: "Stories" });
    expect(result.hero.image).toBeUndefined();
    expect(result.events).toEqual(defaultSignatureEvents.events);
  });

  it("makes the editor's events THE rows, in their order, with the designed heading width of the row at the same position", () => {
    const result = mapSignatureEvents(
      doc({
        events: {
          items: [
            { id: "a", image: media(1, "/api/media/file/one.avif", "One"), title: "  First ", text: "  First text.  " },
            { id: "b", image: media(2, "/api/media/file/two.avif", "Two"), title: "Second", text: "Second text." },
          ],
        } as never,
      }),
    );
    expect(result.events.rows).toHaveLength(2);
    expect(result.events.rows[0]).toEqual({
      image: { src: "/api/media/file/one.avif", alt: "One", width: 1636, height: 1046 },
      title: "First",
      text: "First text.",
      design: defaultSignatureEvents.events.rows[0].design,
    });
    expect(result.events.rows[1].design).toEqual(defaultSignatureEvents.events.rows[1].design);
    expect(result.events.label).toBe(defaultSignatureEvents.events.label);
  });

  it("gives an event added after the ninth the generic heading width", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      image: media(i + 1, `/api/media/file/r${i}.avif`, `R${i}`),
      title: `T${i}`,
      text: `X${i}`,
    }));
    const result = mapSignatureEvents(doc({ events: { items } as never }));
    expect(result.events.rows).toHaveLength(10);
    expect(result.events.rows[9].design).toEqual(GENERIC_EVENT_DESIGN);
    expect(result.events.rows[8].design).toEqual({ titleWidth: 511.84 });
  });

  it("keeps a default row's photo when the row's upload could not be read, and leaves out a row with no photo at all", () => {
    const items = [
      { id: "a", image: 5, title: "Kept", text: "Kept text" }, // an id that was not loaded: the default photo of this position
      ...Array.from({ length: 8 }, (_, i) => ({ id: `d${i}`, image: null, title: `T${i}`, text: `X${i}` })),
      { id: "z", image: null, title: "Tenth", text: "Tenth text" }, // no default and no photo: dropped
    ];
    const result = mapSignatureEvents(doc({ events: { items } as never }));
    expect(result.events.rows[0].image).toEqual(defaultSignatureEvents.events.rows[0].image);
    expect(result.events.rows[0].title).toBe("Kept");
    expect(result.events.rows).toHaveLength(9);
  });

  it("keeps the default events when the list is empty", () => {
    expect(mapSignatureEvents(doc({ events: { items: [] } as never })).events.rows).toEqual(defaultSignatureEvents.events.rows);
  });

  it("gives the default content back from the page seeded from it (the seed is the exact inverse of the mapper)", () => {
    const all = defaultSignatureEvents.events.rows.map((r) => r.image);
    const ids = new Map(signatureEventsPhotoPaths().map(({ src }, i) => [src, i + 1]));
    const seeded = doc(
      signatureEventsDocFromData((src) => {
        const original = all.find((image) => image.src === src)!;
        return media(ids.get(src)!, src, original.alt, original.width, original.height);
      }) as never,
    );
    expect(mapSignatureEvents(seeded)).toEqual(defaultSignatureEvents);
  });
});

describe("the default Signature Events content", () => {
  it("has the nine events of the design in order, each with its own photo, a heading, a paragraph and a designed heading width", () => {
    const { rows } = defaultSignatureEvents.events;
    expect(rows.map((r) => r.title)).toEqual([
      "Pre-Primary Annual Show",
      "Primary School Annual Show",
      "World Scholar’s Cup- Regional Round",
      "School Athletic Meet",
      "Club Explorama - Showcase of club activities",
      "Achiever’s Day",
      "Company Program",
      "Community service program",
      "LPS Business Conclave",
    ]);
    for (const row of rows) {
      expect(row.image.src).toMatch(/^\/images\/signature-events\/.+\.avif$/);
      expect(row.image.alt.length).toBeGreaterThan(20);
      expect(row.text.length).toBeGreaterThan(100);
      expect(row.design.titleWidth).toBeGreaterThan(300);
    }
    expect(new Set(rows.map((r) => r.image.src)).size).toBe(9);
  });

  it("uses nine different photos, each described", () => {
    const paths = signatureEventsPhotoPaths();
    expect(paths).toHaveLength(9);
    for (const { alt } of paths) expect(alt.length).toBeGreaterThan(20);
  });
});
