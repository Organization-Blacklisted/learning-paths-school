import { describe, expect, it } from "vitest";
import { SignatureEvents } from "./SignatureEvents";

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
const fields = () => allFields(SignatureEvents.fields as Field[]);
const fieldNamed = (name: string) => fields().find((field) => field.name === name);
/** The fields inside the named tab (hero, events). */
const inside = (tab: string) => allFields(fields().find((field) => field.name === tab)?.fields);

describe("SignatureEvents global", () => {
  it("is the page at /signature-events in the Pages group, with drafts (Save draft and Publish) and Live Preview", () => {
    expect(SignatureEvents.slug).toBe("signature-events");
    expect(SignatureEvents.admin?.group).toBe("Pages");
    expect(SignatureEvents.versions).toMatchObject({ drafts: true });
    expect(SignatureEvents.admin?.livePreview).toBeTruthy();
  });

  it("keeps drafts private (a visitor reads the published version only)", () => {
    const read = SignatureEvents.access!.read as (args: { req: { user: unknown } }) => unknown;
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
  });

  it("has the two parts of the page: the hero (text only) and the events", () => {
    for (const name of ["hero", "events"]) expect(fieldNamed(name), name).toBeTruthy();
    expect(inside("hero").some((field) => field.name === "image")).toBe(false);
    expect(inside("events").filter((field) => field.name === "image")).toHaveLength(1); // inside the list
  });

  it("has a flexible list of 1 to 20 events that can never be emptied (required as well as minRows: 1), and every event needs its photo, heading and text", () => {
    const items = fieldNamed("items");
    expect(items?.minRows).toBe(1);
    expect(items?.maxRows).toBe(20);
    expect(items?.required).toBe(true);
    expect(items?.admin?.isSortable).toBe(true);
    const row = allFields(items?.fields);
    for (const name of ["image", "title", "text"]) expect(row.find((field) => field.name === name)?.required, name).toBe(true);
  });

  it("has no character limit on any field (owner, 2026-11-02)", () => {
    expect(JSON.stringify(SignatureEvents.fields)).not.toMatch(/maxLength|minLength/);
  });
});
