import { describe, expect, it } from "vitest";
import { defaultWelcomeToLps, GENERIC_CREST_DESIGN } from "@/data/welcome-to-lps";
import type { WelcomeToLps } from "@/payload-types";
import { mapWelcomeToLps } from "./welcome-to-lps-map";
import { welcomeToLpsDocFromData, welcomeToLpsPhotoPaths } from "./welcome-to-lps-seed";

// Same rule as the other pages' mappers: the defaults are the base, the CMS overrides what an editor wrote, and anything the CMS lacks is the default for that field,
// so the page is never blank or half empty.
const doc = (changes: Partial<WelcomeToLps>): WelcomeToLps => ({ id: 1, updatedAt: "", createdAt: "", ...changes }) as WelcomeToLps;
const media = (id: number, url: string, alt: string, width = 1260, height = 675) => ({ id, url, alt, width, height }) as never;

describe("mapWelcomeToLps", () => {
  it("is the default content when there is no CMS document (not configured, database down)", () => {
    expect(mapWelcomeToLps(null)).toBe(defaultWelcomeToLps);
    expect(mapWelcomeToLps(undefined)).toBe(defaultWelcomeToLps);
  });

  it("is the default content for a document with nothing filled in (a new, empty global)", () => {
    expect(mapWelcomeToLps(doc({}))).toEqual(defaultWelcomeToLps);
  });

  it("takes what an editor changed in the hero, photo included, and keeps the rest", () => {
    const result = mapWelcomeToLps(
      doc({
        hero: {
          badge: "About",
          titleLead: "",
          titleAccent: "Learning",
          subtitle: null,
          image: media(1, "/api/media/file/h.avif", "H", 1880, 720),
        } as never,
      }),
    );
    expect(result.hero).toEqual({
      ...defaultWelcomeToLps.hero,
      badge: "About",
      titleAccent: "Learning",
      image: { src: "/api/media/file/h.avif", alt: "H", width: 1880, height: 720 },
    });
    expect(result.intro).toEqual(defaultWelcomeToLps.intro);
  });

  it("takes the paragraphs of the introduction as typed (trimmed, the empty ones dropped) and keeps the defaults for an empty list", () => {
    const result = mapWelcomeToLps(
      doc({
        intro: {
          paragraphs: [
            { id: "a", text: "  One. " },
            { id: "b", text: "  " },
            { id: "c", text: "Two." },
          ],
        } as never,
      }),
    );
    expect(result.intro.paragraphs).toEqual(["One.", "Two."]);
    expect(mapWelcomeToLps(doc({ intro: { paragraphs: [] } as never })).intro).toEqual(defaultWelcomeToLps.intro);
  });

  it("takes the wide photo from the CMS and keeps its design (no title, 737px high, nothing under it)", () => {
    const result = mapWelcomeToLps(doc({ banner: { image: media(2, "/api/media/file/b.avif", "B", 1800, 873) } as never }));
    expect(result.banner.image.src).toBe("/api/media/file/b.avif");
    expect(result.banner).toMatchObject({ titlePosition: "below", photoHeight: 737 });
    expect(result.banner.titleAccent).toBeUndefined();
  });

  it("makes the editor's crest cards THE cards, in order, with the designed widths of the card at the same position, and a generic one after the second", () => {
    const cards = Array.from({ length: 3 }, (_, i) => ({
      id: String(i),
      image: media(i + 1, `/api/media/file/c${i}.avif`, `C${i}`, 730, 626),
      title: ` T${i} `,
      text: `X${i}`,
    }));
    const result = mapWelcomeToLps(doc({ crests: { cards } as never }));
    expect(result.crests.cards).toHaveLength(3);
    expect(result.crests.cards[0]).toEqual({
      image: { src: "/api/media/file/c0.avif", alt: "C0", width: 730, height: 626 },
      title: "T0",
      text: "X0",
      design: { titleWidth: 132.36, textWidth: 423 },
    });
    expect(result.crests.cards[1].design).toEqual({ titleWidth: 200.79, textWidth: 365 });
    expect(result.crests.cards[2].design).toEqual(GENERIC_CREST_DESIGN);
  });

  it("keeps a default card's picture when its upload could not be read, and leaves out a card with no picture at all", () => {
    const cards = [
      { id: "a", image: 9, title: "Kept", text: "Kept text" },
      { id: "b", image: null, title: "Second", text: "Second text" },
      { id: "c", image: null, title: "Third", text: "Dropped" },
    ];
    const result = mapWelcomeToLps(doc({ crests: { cards } as never }));
    expect(result.crests.cards[0].image).toEqual(defaultWelcomeToLps.crests.cards[0].image);
    expect(result.crests.cards).toHaveLength(2);
  });

  it("takes the Principal's welcome from the CMS: portrait, the two heading lines, the paragraphs and the signature", () => {
    const result = mapWelcomeToLps(
      doc({
        welcome: {
          image: media(3, "/api/media/file/p.avif", "P", 1203, 1263),
          titleLead: "Hello",
          titleAccent: "Everyone",
          paragraphs: [{ id: "a", text: " A paragraph.\nWith a line break. " }],
          signatoryName: "Ms. Example",
          signatoryRole: "Head",
        } as never,
      }),
    );
    expect(result.welcome).toEqual({
      label: defaultWelcomeToLps.welcome.label,
      image: { src: "/api/media/file/p.avif", alt: "P", width: 1203, height: 1263 },
      titleLead: "Hello",
      titleAccent: "Everyone",
      paragraphs: ["A paragraph.\nWith a line break."],
      signatory: { name: "Ms. Example", role: "Head" },
    });
  });

  it("makes the editor's values THE values, in order (the first is the active one at the start), and keeps the defaults for an empty list", () => {
    const items = [
      { id: "a", title: "Courage & One", text: "Text one" },
      { id: "b", title: "Courage & Two", text: "Text two" },
    ];
    const result = mapWelcomeToLps(doc({ values: { title: "Led by", items } as never }));
    expect(result.values.title).toBe("Led by");
    expect(result.values.items).toEqual([
      { title: "Courage & One", text: "Text one" },
      { title: "Courage & Two", text: "Text two" },
    ]);
    expect(mapWelcomeToLps(doc({ values: { items: [] } as never })).values.items).toEqual(defaultWelcomeToLps.values.items);
  });

  it("makes the editor's slides THE slides, in order, keeping the line breaks of a story, and leaves out a slide with no photo", () => {
    const slides = [
      { id: "a", image: media(4, "/api/media/file/s0.avif", "S0"), period: " 1990–2000 ", text: " First.\nSecond. " },
      { id: "b", image: null, period: "2000–2010", text: "Third" },
      { id: "c", image: null, period: "2010–2020", text: "Fourth" },
      { id: "d", image: null, period: "Dropped", text: "No photo and no default" },
    ];
    const result = mapWelcomeToLps(doc({ story: { titleLead: "Our", titleAccent: "History", slides } as never }));
    expect(result.story.titleAccent).toBe("History");
    expect(result.story.slides).toHaveLength(3);
    expect(result.story.slides[0]).toEqual({
      image: { src: "/api/media/file/s0.avif", alt: "S0", width: 1260, height: 675 },
      period: "1990–2000",
      text: "First.\nSecond.",
    });
    expect(result.story.slides[1].image).toEqual(defaultWelcomeToLps.story.slides[1].image);
  });

  it("gives the default content back from the page seeded from it (the seed is the exact inverse of the mapper)", () => {
    const paths = welcomeToLpsPhotoPaths();
    const ids = new Map(paths.map(({ src }, i) => [src, i + 1]));
    const all = [
      defaultWelcomeToLps.hero.image,
      defaultWelcomeToLps.banner.image,
      ...defaultWelcomeToLps.crests.cards.map((card) => card.image),
      defaultWelcomeToLps.welcome.image,
      ...defaultWelcomeToLps.story.slides.map((slide) => slide.image),
    ];
    const seeded = doc(
      welcomeToLpsDocFromData((src) => {
        const original = all.find((image) => image.src === src)!;
        return media(ids.get(src)!, src, original.alt, original.width, original.height);
      }) as never,
    );
    expect(mapWelcomeToLps(seeded)).toEqual(defaultWelcomeToLps);
  });
});

describe("the default Welcome to LPS content", () => {
  it("has the hero, two paragraphs, the wide photo, two crest cards, the welcome, four values and three slides of the design", () => {
    const d = defaultWelcomeToLps;
    expect(d.hero.image.src).toMatch(/^\/images\/welcome\/.+\.avif$/);
    expect(d.intro.paragraphs).toHaveLength(2);
    expect(d.banner).toMatchObject({ titlePosition: "below", photoHeight: 737 });
    expect(d.crests.cards.map((card) => card.title)).toEqual(["Our Vision", "Our Mission"]);
    expect(d.welcome.titleLead).toBe("Welcome To");
    expect(d.values.items.map((item) => item.title)).toEqual([
      "Courage & Commitment",
      "Courage & Respect",
      "Courage & Excellence",
      "Courage & Opportunity",
    ]);
    expect(d.story.slides.map((slide) => slide.period)).toEqual(["2008–2016", "2016–2021", "2021–Onwards"]);
  });

  it("uses eight different photos in all (one per story slide), each described", () => {
    const paths = welcomeToLpsPhotoPaths();
    expect(paths).toHaveLength(8);
    for (const { alt } of paths) expect(alt.length).toBeGreaterThan(20);
  });
});
