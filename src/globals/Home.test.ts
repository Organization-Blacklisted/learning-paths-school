import { describe, expect, it } from "vitest";
import { Home } from "./Home";

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
