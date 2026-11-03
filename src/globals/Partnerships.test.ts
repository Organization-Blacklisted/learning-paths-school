import { describe, expect, it } from "vitest";
import { Partnerships } from "./Partnerships";

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
const fieldNamed = (name: string) => allFields(Partnerships.fields as Field[]).find((field) => field.name === name);

describe("Partnerships global", () => {
  it("is the page at /partnerships in the Pages group, with drafts (Save draft and Publish) and Live Preview", () => {
    expect(Partnerships.slug).toBe("partnerships");
    expect(Partnerships.admin?.group).toBe("Pages");
    expect(Partnerships.versions).toMatchObject({ drafts: true });
    expect(Partnerships.admin?.livePreview).toBeTruthy();
  });

  it("keeps drafts private (a visitor reads the published version only)", () => {
    const read = Partnerships.access!.read as (args: { req: { user: unknown } }) => unknown;
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
  });

  it("has the hero fields without a photo (the text-only look), the introduction and the partners", () => {
    for (const name of ["hero", "badge", "titleLead", "titleAccent", "subtitle", "partners", "intro", "items", "logo", "role"]) {
      expect(fieldNamed(name), name).toBeTruthy();
    }
    // `logo` exists once, in the partners list; the hero has no photo
    expect(allFields(Partnerships.fields as Field[]).filter((field) => field.name === "logo")).toHaveLength(1);
    expect(allFields(Partnerships.fields as Field[]).filter((field) => field.name === "image")).toHaveLength(0);
  });

  it("has a flexible list of 1 to 12 partners that can never be emptied (required as well as minRows: 1), and every card needs its logo and label", () => {
    const items = fieldNamed("items");
    expect(items?.minRows).toBe(1);
    expect(items?.maxRows).toBe(12);
    expect(items?.required).toBe(true);
    expect(items?.admin?.isSortable).toBe(true);
    expect(fieldNamed("logo")?.required).toBe(true);
    expect(fieldNamed("role")?.required).toBe(true);
  });

  it("has no character limit on any field (owner, 2026-11-02)", () => {
    expect(JSON.stringify(Partnerships.fields)).not.toMatch(/maxLength|minLength/);
  });
});
