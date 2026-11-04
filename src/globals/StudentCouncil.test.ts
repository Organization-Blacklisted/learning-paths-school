import { describe, expect, it } from "vitest";
import { StudentCouncil } from "./StudentCouncil";

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
const fields = () => allFields(StudentCouncil.fields as Field[]);
const fieldNamed = (name: string) => fields().find((field) => field.name === name);
/** The fields inside the named tab (hero, intro, features, gallery). */
const inside = (tab: string) => allFields(fields().find((field) => field.name === tab)?.fields);

describe("StudentCouncil global", () => {
  it("is the page at /student-council in the Pages group, with drafts (Save draft and Publish) and Live Preview", () => {
    expect(StudentCouncil.slug).toBe("student-council");
    expect(StudentCouncil.admin?.group).toBe("Pages");
    expect(StudentCouncil.versions).toMatchObject({ drafts: true });
    expect(StudentCouncil.admin?.livePreview).toBeTruthy();
  });

  it("keeps drafts private (a visitor reads the published version only)", () => {
    const read = StudentCouncil.access!.read as (args: { req: { user: unknown } }) => unknown;
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
  });

  it("has the four parts of the page: the hero (text only), the introduction, the rows and the group photo", () => {
    for (const name of ["hero", "intro", "features", "gallery"]) expect(fieldNamed(name), name).toBeTruthy();
    // the hero has no photo; the introduction and the group photo have one each; every row has one
    expect(inside("hero").some((field) => field.name === "image")).toBe(false);
    expect(inside("intro").filter((field) => field.name === "image")).toHaveLength(1);
    expect(inside("gallery").filter((field) => field.name === "image")).toHaveLength(1);
    expect(inside("features").filter((field) => field.name === "image")).toHaveLength(1); // inside the list
  });

  it("has the title in two parts (the blue words, then the grey ones) for the introduction and the group photo, and a paragraph for the introduction", () => {
    for (const tab of ["intro", "gallery"]) {
      const names = inside(tab).map((field) => field.name);
      expect(names, tab).toContain("titleAccent");
      expect(names, tab).toContain("titleRest");
    }
    expect(inside("intro").map((field) => field.name)).toContain("text");
  });

  it("has a flexible list of 1 to 8 rows that can never be emptied (required as well as minRows: 1), and every row needs its photo, heading and text", () => {
    const items = fieldNamed("items");
    expect(items?.minRows).toBe(1);
    expect(items?.maxRows).toBe(8);
    expect(items?.required).toBe(true);
    expect(items?.admin?.isSortable).toBe(true);
    const row = allFields(items?.fields);
    for (const name of ["image", "title", "text"]) expect(row.find((field) => field.name === name)?.required, name).toBe(true);
  });

  it("has no character limit on any field (owner, 2026-11-02)", () => {
    expect(JSON.stringify(StudentCouncil.fields)).not.toMatch(/maxLength|minLength/);
  });
});
