import { describe, expect, it } from "vitest";
import { defaultPrincipalsWelcome } from "@/data/principals-welcome";
import type { PrincipalsWelcome } from "@/payload-types";
import { mapPrincipalsWelcome } from "./principals-welcome-map";
import { principalsWelcomeDocFromData } from "./principals-welcome-seed";

// Same rule as the home page's and the Contact page's mappers: the defaults are the base, the CMS overrides what an editor wrote, and anything the
// CMS lacks is the default for that field, so the page is never blank or half empty.
const doc = (changes: Partial<PrincipalsWelcome>): PrincipalsWelcome =>
  ({ id: 1, updatedAt: "", createdAt: "", ...changes }) as PrincipalsWelcome;

describe("mapPrincipalsWelcome", () => {
  it("is the default content when there is no CMS document (not configured, database down)", () => {
    expect(mapPrincipalsWelcome(null)).toBe(defaultPrincipalsWelcome);
    expect(mapPrincipalsWelcome(undefined)).toBe(defaultPrincipalsWelcome);
  });

  it("is the default content for a document with nothing filled in (a new, empty global)", () => {
    expect(mapPrincipalsWelcome(doc({}))).toEqual(defaultPrincipalsWelcome);
  });

  it("takes what an editor changed and keeps the rest", () => {
    const result = mapPrincipalsWelcome(
      doc({
        hero: { badge: "A word from the desk", titleLead: "", titleAccent: "New Accent", subtitle: null } as never,
        message: {
          titleLead: "“Why not,",
          signatoryName: "Mr. Someone",
          paragraphs: [
            { text: "  First paragraph.  ", id: "a" },
            { text: "   ", id: "b" },
            { text: "Second paragraph,\nwith a line break.", id: "c" },
          ],
        } as never,
      }),
    );
    expect(result.hero).toEqual({ ...defaultPrincipalsWelcome.hero, badge: "A word from the desk", titleAccent: "New Accent" });
    expect(result.hero.image).toBeUndefined();
    expect(result.message.titleLead).toBe("“Why not,");
    expect(result.message.titleAccent).toBe(defaultPrincipalsWelcome.message.titleAccent);
    expect(result.message.paragraphs).toEqual(["First paragraph.", "Second paragraph,\nwith a line break."]);
    expect(result.message.signatory).toEqual({ name: "Mr. Someone", role: "Principal" });
    expect(result.message.image).toEqual(defaultPrincipalsWelcome.message.image);
  });

  it("keeps the default letter when the list of paragraphs is empty", () => {
    expect(mapPrincipalsWelcome(doc({ message: { paragraphs: [] } as never })).message.paragraphs).toEqual(
      defaultPrincipalsWelcome.message.paragraphs,
    );
  });

  it("uses the portrait of the media library, with its own size and alt text", () => {
    const image = { id: 9, url: "/api/media/file/new.avif", alt: "New portrait", width: 1200, height: 1300 } as never;
    expect(mapPrincipalsWelcome(doc({ message: { image } as never })).message.image).toEqual({
      src: "/api/media/file/new.avif",
      alt: "New portrait",
      width: 1200,
      height: 1300,
    });
  });

  it("gives the default content back from the seed data (what the seed script stores is exactly what the page shows)", () => {
    const stored = principalsWelcomeDocFromData((src) => ({
      id: 1,
      url: src,
      alt: defaultPrincipalsWelcome.message.image.alt,
      width: 1166,
      height: 1224,
    }));
    expect(mapPrincipalsWelcome(doc(stored as never))).toEqual(defaultPrincipalsWelcome);
  });
});
