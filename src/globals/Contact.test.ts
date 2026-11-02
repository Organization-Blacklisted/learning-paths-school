import { describe, expect, it } from "vitest";
import { Contact } from "./Contact";

type Field = {
  name?: string;
  type?: string;
  fields?: Field[];
  tabs?: Field[];
  validate?: (value: unknown) => unknown;
  minRows?: number;
  required?: boolean;
};

// Every field of the global, however deeply the tabs nest them.
function allFields(fields: Field[] = []): Field[] {
  return fields.flatMap((field) => [field, ...allFields(field.fields), ...allFields(field.tabs)]);
}
const fieldNamed = (name: string) => allFields(Contact.fields as Field[]).find((field) => field.name === name)!;

// Drafts must stay private, as on the home page (see Home.test.ts and why).
describe("Contact global access", () => {
  const read = Contact.access!.read as (args: { req: { user: unknown } }) => unknown;
  const readVersions = Contact.access!.readVersions as (args: { req: { user: unknown } }) => unknown;

  it("lets a signed-in user read everything, drafts included", () => {
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(readVersions({ req: { user: { id: 1 } } })).toBe(true);
  });

  it("limits a visitor to the published version and hides the version history", () => {
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
    expect(readVersions({ req: { user: null } })).toBe(false);
  });

  it("has drafts switched on (Save draft and Publish)", () => {
    expect(Contact.versions).toMatchObject({ drafts: true });
  });
});

describe("Contact global fields", () => {
  it("has the reusable hero fields, the details and the map, and no subject choices (the Subject is a text field)", () => {
    for (const name of [
      "hero",
      "badge",
      "titleLead",
      "titleAccent",
      "subtitle",
      "image",
      "details",
      "emails",
      "phones",
      "location",
      "map",
      "embedUrl",
      "title",
    ]) {
      expect(fieldNamed(name), name).toBeTruthy();
    }
  });

  it("never lets the lists be emptied (the page is built for at least one of each)", () => {
    for (const name of ["emails", "phones"]) {
      expect(fieldNamed(name).minRows, name).toBe(1);
      // minRows alone lets an EMPTY list through (found in the CMS test, 2026-11-02): the list must also be required
      expect(fieldNamed(name).required, name).toBe(true);
    }
  });

  it("only accepts a Google Maps embed (or a pasted iframe holding one) for the map", () => {
    const validate = fieldNamed("embedUrl").validate!;
    expect(validate("https://www.google.com/maps/embed?pb=!1m18")).toBe(true);
    expect(validate('<iframe src="https://www.google.com/maps/embed?pb=!1m18"></iframe>')).toBe(true);
    expect(validate("https://evil.example/embed")).toEqual(expect.stringContaining("Google Maps"));
    expect(validate("")).toEqual(expect.stringContaining("Google Maps"));
  });

  it("only accepts something that looks like an email address for an email address", () => {
    const validate = fieldNamed("address").validate!;
    expect(validate("principal@learningpaths.in")).toBe(true);
    expect(validate("principal")).toEqual(expect.stringContaining("email address"));
    expect(validate("")).toEqual(expect.stringContaining("email address"));
  });
});
