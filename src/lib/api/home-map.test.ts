import { describe, expect, it } from "vitest";
import { buildHomePage, defaultHomeSections, homePageAll } from "@/data/home-page";
import type { Home } from "@/payload-types";
import { homeDocFromData, homePhotoPaths } from "./home-seed";
import { mapHome, text } from "./home-map";

// The CMS home page must give back EXACTLY the site as it is in src/data: this is what makes switching the page to the CMS safe
// (docs/26-cms-home-plan.md). `homeDocFromData` is what the seed script stores; here its photos are fake media documents.
const alts = new Map(homePhotoPaths().map(({ src, alt }) => [src, alt]));
const fakeMedia = (src: string) => ({ id: 1, url: src, alt: alts.get(src) ?? "", updatedAt: "", createdAt: "" });
const seeded = () => homeDocFromData(fakeMedia) as unknown as Home;

describe("mapHome", () => {
  it("gives the default content when there is no CMS data (database down, nothing saved)", () => {
    expect(mapHome(null)).toEqual(defaultHomeSections);
    expect(mapHome({} as Home)).toEqual(defaultHomeSections);
  });

  it("gives the default content back from a CMS page seeded from it (the page does not change)", () => {
    expect(mapHome(seeded())).toEqual(defaultHomeSections);
  });

  it("builds the very same page blocks from a seeded CMS page", () => {
    expect(buildHomePage(mapHome(seeded()))).toEqual(homePageAll);
  });

  it("uses what an editor changes, and only that", () => {
    const doc = seeded();
    doc.news!.items![0].title = "A brand new title";
    doc.cta!.buttonHref = "/admissions";
    const mapped = mapHome(doc);
    expect(mapped.news.items[0].title).toBe("A brand new title");
    expect(mapped.news.items[1]).toEqual(defaultHomeSections.news.items[1]);
    expect(mapped.cta.button).toEqual({ label: defaultHomeSections.cta.button.label, href: "/admissions" });
    expect(mapped.hero).toEqual(defaultHomeSections.hero);
  });

  it("keeps the design values of a fixed list whatever the editor does (positions, widths, tones)", () => {
    const doc = seeded();
    doc.framework!.items![2].label = "Curious";
    doc.journey!.stages![1].level = "Junior";
    doc.ecosystem!.tabs![0].label = "Learning";
    const mapped = mapHome(doc);
    expect(mapped.framework.items[2]).toEqual({ ...defaultHomeSections.framework.items[2], label: "Curious" });
    expect(mapped.journey.stages[1].tone).toBe(defaultHomeSections.journey.stages[1].tone);
    expect(mapped.journey.stages[1].captionWidth).toBe(defaultHomeSections.journey.stages[1].captionWidth);
    expect(mapped.ecosystem.tabs[0].width).toBe(defaultHomeSections.ecosystem.tabs[0].width);
  });

  it("takes a replaced photo's address, size and alt text from the media library", () => {
    const doc = seeded();
    doc.campus!.poster = {
      id: 9,
      url: "/api/media/file/new.avif",
      alt: "A new aerial view",
      width: 1800,
      height: 891,
      updatedAt: "",
      createdAt: "",
    };
    const mapped = mapHome(doc);
    expect(mapped.campus.media.poster).toBe("/api/media/file/new.avif");
    expect(mapped.campus.media.alt).toBe("A new aerial view");
  });

  it("takes the file's own size only where the data means the size of the file (hero, Courage), never where it is a box in the layout (Framework)", () => {
    const doc = seeded();
    const big = (src: string) => ({ ...fakeMedia(src), width: 4000, height: 3000 });
    doc.framework!.centrePhoto = big("/api/media/file/new-centre.avif");
    doc.hero!.slides![0].image = big("/api/media/file/new-hero.avif");
    doc.courage!.photos![0].image = big("/api/media/file/new-chess.avif");
    const mapped = mapHome(doc);
    // The Framework photo is a positioned box in the diagram: the address changes, the box does not.
    expect(mapped.framework.photo).toEqual({ ...defaultHomeSections.framework.photo, src: "/api/media/file/new-centre.avif" });
    // The hero and the collage hand the file's size to next/image.
    expect(mapped.hero.slides[0].image).toMatchObject({ src: "/api/media/file/new-hero.avif", width: 4000, height: 3000 });
    expect(mapped.courage.photos[0]).toMatchObject({
      src: "/api/media/file/new-chess.avif",
      width: 4000,
      height: 3000,
      boxWidth: defaultHomeSections.courage.photos[0].boxWidth,
    });
  });

  it("falls back to the default photo when the upload is only an id (not loaded) or has no file", () => {
    const doc = seeded();
    doc.campus!.poster = 7;
    doc.hero!.slides![0].image = { id: 3, alt: "x", updatedAt: "", createdAt: "" };
    const mapped = mapHome(doc);
    expect(mapped.campus.media.poster).toBe(defaultHomeSections.campus.media.poster);
    expect(mapped.hero.slides[0].image).toEqual(defaultHomeSections.hero.slides[0].image);
  });

  it("supports the flexible lists: more news cards, more slides, more photos in the strip", () => {
    const doc = seeded();
    doc.news!.items!.push({
      date: "October 28, 2026",
      title: "Fourth",
      excerpt: "Text",
      href: "/n/4",
      image: fakeMedia("/images/home/news/news-2.avif"),
    });
    doc.hero!.slides!.push({ image: fakeMedia("/images/home/hero/slide-1.avif"), title: "Care", lead: "and", quote: "“Yes.”" });
    doc.marquee!.images!.push({ image: fakeMedia("/images/marquee/stage.avif") });
    const mapped = mapHome(doc);
    expect(mapped.news.items).toHaveLength(4);
    expect(mapped.news.items[3]).toMatchObject({ id: "news-4", title: "Fourth", href: "/n/4", photo: "/images/home/news/news-2.avif" });
    expect(mapped.hero.slides).toHaveLength(4);
    expect(mapped.hero.slides[3]).toMatchObject({ title: "Care", scale: "large" });
    expect(mapped.hero.slides[0].scale).toBe("compact");
    expect(mapped.marquee.images).toHaveLength(7);
  });
});

describe("text", () => {
  it("is the default when empty or when only the spacing differs", () => {
    expect(text("", "Hello")).toBe("Hello");
    expect(text(null, "Hello")).toBe("Hello");
    expect(text("  Hello ", "Hello")).toBe("Hello");
    expect(text("more than 4,000", "more than  4,000")).toBe("more than  4,000");
  });

  it("is the editor's words, keeping the default's space at the ends (a heading part that ends in a space still joins the next one)", () => {
    expect(text("Find the courage to find ", "The courage to find ")).toBe("Find the courage to find ");
    expect(text("Find your way", "The courage to find ")).toBe("Find your way ");
    expect(text("New", " Old")).toBe(" New");
  });
});

// The limits written in the CMS fields (maxLength, number of rows) must hold for today's content, or the seed (and any editor starting from
// it) would be refused. Walks the Home global's own field definitions.
describe("the CMS fields", () => {
  type FieldLike = {
    type: string;
    name?: string;
    maxLength?: number;
    minRows?: number;
    maxRows?: number;
    fields?: FieldLike[];
    tabs?: { name?: string; fields: FieldLike[] }[];
  };

  const problems: string[] = [];
  const check = (fields: FieldLike[], value: Record<string, unknown> | undefined, where: string) => {
    for (const field of fields) {
      if (field.type === "tabs") {
        for (const tab of field.tabs ?? [])
          check(tab.fields, tab.name ? (value?.[tab.name] as Record<string, unknown>) : value, `${where}${tab.name ? `.${tab.name}` : ""}`);
      } else if (field.type === "array" && field.name) {
        const rows = (value?.[field.name] as Record<string, unknown>[] | undefined) ?? [];
        const here = `${where}.${field.name}`;
        if (field.minRows !== undefined && rows.length < field.minRows)
          problems.push(`${here}: ${rows.length} rows, needs at least ${field.minRows}`);
        if (field.maxRows !== undefined && rows.length > field.maxRows)
          problems.push(`${here}: ${rows.length} rows, at most ${field.maxRows}`);
        rows.forEach((row, i) => check(field.fields ?? [], row, `${here}[${i}]`));
      } else if ((field.type === "text" || field.type === "textarea") && field.name && field.maxLength) {
        const text = value?.[field.name];
        if (typeof text === "string" && text.length > field.maxLength)
          problems.push(`${where}.${field.name}: ${text.length} characters, limit ${field.maxLength}`);
      }
    }
  };

  it("allow today's content (no text too long, every list has an allowed number of rows)", async () => {
    const { Home } = await import("@/globals/Home");
    check(Home.fields as unknown as FieldLike[], homeDocFromData(fakeMedia) as Record<string, unknown>, "home");
    expect(problems).toEqual([]);
  });
});
