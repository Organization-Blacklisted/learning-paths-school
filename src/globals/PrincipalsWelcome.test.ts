import { describe, expect, it } from "vitest";
import { PrincipalsWelcome } from "./PrincipalsWelcome";

type Field = { name?: string; type?: string; fields?: Field[]; tabs?: Field[]; minRows?: number; required?: boolean };

// Every field of the global, however deeply the tabs nest them.
function allFields(fields: Field[] = []): Field[] {
  return fields.flatMap((field) => [field, ...allFields(field.fields), ...allFields(field.tabs)]);
}
const fieldNamed = (name: string) => allFields(PrincipalsWelcome.fields as Field[]).find((field) => field.name === name);

describe("PrincipalsWelcome global", () => {
  it("is the page at /principals-welcome in the Pages group, with drafts (Save draft and Publish) and Live Preview", () => {
    expect(PrincipalsWelcome.slug).toBe("principals-welcome");
    expect(PrincipalsWelcome.admin?.group).toBe("Pages");
    expect(PrincipalsWelcome.versions).toMatchObject({ drafts: true });
    expect(PrincipalsWelcome.admin?.livePreview).toBeTruthy();
  });

  it("keeps drafts private (a visitor reads the published version only)", () => {
    const read = PrincipalsWelcome.access!.read as (args: { req: { user: unknown } }) => unknown;
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
  });

  it("has the hero fields without a photo (the text-only look), and the letter's fields", () => {
    for (const name of [
      "hero",
      "badge",
      "titleLead",
      "titleAccent",
      "subtitle",
      "message",
      "image",
      "paragraphs",
      "signatoryName",
      "signatoryRole",
    ]) {
      expect(fieldNamed(name), name).toBeTruthy();
    }
    // `image` exists once: the portrait of the letter (the hero has none)
    expect(allFields(PrincipalsWelcome.fields as Field[]).filter((field) => field.name === "image")).toHaveLength(1);
  });

  it("never lets the letter be emptied (the list is required as well as minRows: 1)", () => {
    expect(fieldNamed("paragraphs")?.minRows).toBe(1);
    expect(fieldNamed("paragraphs")?.required).toBe(true);
  });
});
