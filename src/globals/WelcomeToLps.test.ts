import { describe, expect, it } from "vitest";
import { WelcomeToLps } from "./WelcomeToLps";

type Field = {
  name?: string;
  type?: string;
  fields?: Field[];
  tabs?: Field[];
  minRows?: number;
  maxRows?: number;
  required?: boolean;
  admin?: { isSortable?: boolean };
};

// Every field of the global, however deeply the tabs nest them.
function allFields(fields: Field[] = []): Field[] {
  return fields.flatMap((field) => [field, ...allFields(field.fields), ...allFields(field.tabs)]);
}
const fields = () => allFields(WelcomeToLps.fields as Field[]);
const tab = (name: string) => fields().find((field) => field.name === name);
/** The fields inside the named tab. */
const inside = (name: string) => allFields(tab(name)?.fields);
const list = (tabName: string, name: string) => inside(tabName).find((field) => field.name === name);

describe("WelcomeToLps global", () => {
  it("is the page at /welcome-to-lps in the Pages group, with drafts (Save draft and Publish) and Live Preview, and the plain type name", () => {
    expect(WelcomeToLps.slug).toBe("welcome-to-lps");
    expect(WelcomeToLps.admin?.group).toBe("Pages");
    expect(WelcomeToLps.versions).toMatchObject({ drafts: true });
    expect(WelcomeToLps.admin?.livePreview).toBeTruthy();
    expect(WelcomeToLps.typescript?.interface).toBe("WelcomeToLps");
  });

  it("keeps drafts private (a visitor reads the published version only)", () => {
    const read = WelcomeToLps.access!.read as (args: { req: { user: unknown } }) => unknown;
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
  });

  it("has the seven parts of the page in order", () => {
    const names = (WelcomeToLps.fields[0] as { tabs: { fields: Field[] }[] }).tabs[0].fields[0].tabs!.map((t) => t.name);
    expect(names).toEqual(["hero", "intro", "banner", "crests", "welcome", "values", "story"]);
  });

  it("has a photo in the hero (it is the photo look), the wide photo, each crest card, the portrait and each slide", () => {
    for (const name of ["hero", "banner", "crests", "welcome", "story"]) {
      expect(
        inside(name).some((field) => field.name === "image"),
        name,
      ).toBe(true);
    }
    expect(inside("intro").some((field) => field.name === "image")).toBe(false);
    expect(inside("values").some((field) => field.name === "image")).toBe(false);
  });

  it("has flexible lists that can never be emptied (required as well as minRows), and every row needs its text and photo", () => {
    const expected: [string, string, number, number][] = [
      ["intro", "paragraphs", 1, 6],
      ["crests", "cards", 1, 4],
      ["welcome", "paragraphs", 1, 4],
      ["values", "items", 2, 8],
      ["story", "slides", 1, 12],
    ];
    for (const [tabName, name, min, max] of expected) {
      const field = list(tabName, name);
      expect(field?.minRows, `${tabName}.${name} min`).toBe(min);
      expect(field?.maxRows, `${tabName}.${name} max`).toBe(max);
      expect(field?.required, `${tabName}.${name} required`).toBe(true);
      expect(field?.admin?.isSortable, `${tabName}.${name} sortable`).toBe(true);
    }
    const slide = allFields(list("story", "slides")?.fields);
    for (const name of ["image", "period", "text"]) expect(slide.find((field) => field.name === name)?.required, name).toBe(true);
    const card = allFields(list("crests", "cards")?.fields);
    for (const name of ["image", "title", "text"]) expect(card.find((field) => field.name === name)?.required, name).toBe(true);
  });

  it("has no character limit on any field (owner, 2026-11-02)", () => {
    expect(JSON.stringify(WelcomeToLps.fields)).not.toMatch(/maxLength|minLength/);
  });
});
