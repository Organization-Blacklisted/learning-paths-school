import { describe, expect, it } from "vitest";
import { AwardsRecognition } from "./AwardsRecognition";

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
const fieldNamed = (name: string) => allFields(AwardsRecognition.fields as Field[]).find((field) => field.name === name);

describe("AwardsRecognition global", () => {
  it("is the page at /awards-recognition in the Pages group, with drafts (Save draft and Publish) and Live Preview", () => {
    expect(AwardsRecognition.slug).toBe("awards-recognition");
    expect(AwardsRecognition.admin?.group).toBe("Pages");
    expect(AwardsRecognition.versions).toMatchObject({ drafts: true });
    expect(AwardsRecognition.admin?.livePreview).toBeTruthy();
  });

  it("keeps drafts private (a visitor reads the published version only)", () => {
    const read = AwardsRecognition.access!.read as (args: { req: { user: unknown } }) => unknown;
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
  });

  it("has the hero fields without a photo (the text-only look) and the award blocks", () => {
    for (const name of ["hero", "badge", "titleLead", "titleAccent", "subtitle", "awards", "items", "image", "title", "text"]) {
      expect(fieldNamed(name), name).toBeTruthy();
    }
    // `image` exists once, in the award blocks (the hero has no photo)
    expect(allFields(AwardsRecognition.fields as Field[]).filter((field) => field.name === "image")).toHaveLength(1);
  });

  it("has a flexible list of 1 to 10 blocks that can never be emptied (required as well as minRows: 1), and every block needs its photo, title and text", () => {
    const items = fieldNamed("items");
    expect(items?.minRows).toBe(1);
    expect(items?.maxRows).toBe(10);
    expect(items?.required).toBe(true);
    expect(items?.admin?.isSortable).toBe(true);
    for (const name of ["image", "title", "text"]) expect(fieldNamed(name)?.required, name).toBe(true);
  });

  it("has no character limit on any field (owner, 2026-11-02)", () => {
    expect(JSON.stringify(AwardsRecognition.fields)).not.toMatch(/maxLength|minLength/);
  });
});
