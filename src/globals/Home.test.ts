import { describe, expect, it } from "vitest";
import { Home } from "./Home";
import { Contact } from "./Contact";
import { PrincipalsWelcome } from "./PrincipalsWelcome";

// Drafts must stay private. With a plain `read: () => true` anyone could ask /api/globals/home?draft=true for the unpublished text
// (found in testing, 2026-10-28). Signed-out visitors may only match the published version.
describe("Home global access", () => {
  const read = Home.access!.read as (args: { req: { user: unknown } }) => unknown;
  const readVersions = Home.access!.readVersions as (args: { req: { user: unknown } }) => unknown;

  it("lets a signed-in user read everything, drafts included", () => {
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(readVersions({ req: { user: { id: 1 } } })).toBe(true);
  });

  it("limits a visitor to the published version and hides the version history", () => {
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
    expect(readVersions({ req: { user: null } })).toBe(false);
  });

  it("has drafts switched on (Save draft and Publish)", () => {
    expect(Home.versions).toMatchObject({ drafts: true });
  });
});

// Owner, 2026-11-02: "remove the limit thing from the whole CMS". An editor may write a text of any length; the rows of the designed lists stay fixed.
describe("no character limit anywhere in the CMS", () => {
  it.each([
    ["Home", Home],
    ["Contact", Contact],
    ["Principal's Welcome", PrincipalsWelcome],
  ])("%s has no maxLength or minLength on any field", (_name, config) => {
    expect(JSON.stringify(config.fields)).not.toMatch(/maxLength|minLength/);
  });

  it("the hero's small connecting word is optional, the big word and the quote are required", () => {
    const fields = JSON.stringify(Home.fields);
    expect(fields).toContain('"name":"lead","label":"Small connecting word","type":"text","required":false');
    expect(fields).toContain('"name":"title","label":"Big word","type":"text","required":true');
    expect(fields).toContain('"name":"quote","label":"Quote in amber","type":"text","required":true');
  });
});
