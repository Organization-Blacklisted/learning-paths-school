import { describe, expect, it } from "vitest";
import { defaultContact } from "@/data/contact";
import type { Contact } from "@/payload-types";
import { mapContact } from "./contact-map";
import { contactDocFromData } from "./contact-seed";

// Same rule as the home page's mapper (home-map.test.ts): the defaults are the base, the CMS overrides what an editor wrote, and anything the
// CMS lacks is the default for that field, so the page is never blank or half empty.
const doc = (changes: Partial<Contact>): Contact => ({ id: 1, updatedAt: "", createdAt: "", ...changes }) as Contact;

describe("mapContact", () => {
  it("is the default content when there is no CMS document (not configured, database down)", () => {
    expect(mapContact(null)).toBe(defaultContact);
    expect(mapContact(undefined)).toBe(defaultContact);
  });

  it("is the default content for a document with nothing filled in (a new, empty global)", () => {
    expect(mapContact(doc({}))).toEqual(defaultContact);
  });

  it("takes what an editor changed and keeps the rest", () => {
    const result = mapContact(
      doc({
        hero: { badge: "Get in touch", titleLead: null, titleAccent: "Hello", subtitle: "", image: null } as never,
        details: {
          emails: [{ address: " hello@learningpaths.in ", note: " front desk ", id: "1" }],
          phones: [],
          location: "Sector 67, Mohali",
        },
      }),
    );
    expect(result.hero.badge).toBe("Get in touch");
    expect(result.hero.titleAccent).toBe("Hello");
    expect(result.hero.titleLead).toBe(defaultContact.hero.titleLead);
    expect(result.hero.subtitle).toBe(defaultContact.hero.subtitle);
    expect(result.hero.image).toEqual(defaultContact.hero.image);
    expect(result.details.emails).toEqual([{ address: "hello@learningpaths.in", note: "front desk" }]);
    expect(result.details.phones).toEqual(defaultContact.details.phones);
    expect(result.details.location).toBe("Sector 67, Mohali");
  });

  it("uses the photo of the media library, with its own size and alt text", () => {
    const image = { id: 9, url: "/api/media/file/new.avif", alt: "New photo", width: 2000, height: 800 } as never;
    const result = mapContact(doc({ hero: { image } as never }));
    expect(result.hero.image).toEqual({ src: "/api/media/file/new.avif", alt: "New photo", width: 2000, height: 800 });
  });

  it("falls back to the default photo when the reference was not loaded (only an id)", () => {
    expect(mapContact(doc({ hero: { image: 7 } as never })).hero.image).toEqual(defaultContact.hero.image);
  });

  it("takes the map from a bare address or from a whole pasted iframe, and ignores anything that is not a Google Maps embed", () => {
    const src = "https://www.google.com/maps/embed?pb=!1m18!2d1!3d2";
    expect(mapContact(doc({ map: { embedUrl: src, title: "Our map" } })).map).toEqual({ embedUrl: src, title: "Our map" });
    expect(mapContact(doc({ map: { embedUrl: `<iframe src="${src}" loading="lazy"></iframe>`, title: "" } })).map.embedUrl).toBe(src);
    expect(mapContact(doc({ map: { embedUrl: "https://evil.example/embed", title: "" } })).map).toEqual(defaultContact.map);
  });

  it("gives the default content back from the seed data (what the seed script stores is exactly what the page shows)", () => {
    const stored = contactDocFromData((src) => ({ id: 1, url: src, alt: defaultContact.hero.image.alt, width: 1920, height: 736 }));
    expect(mapContact(doc(stored as never))).toEqual(defaultContact);
  });
});
