import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidateTag } from "next/cache";
import { livePreviewAt, publishedOnlyAccess, revalidateOnPublish } from "./page-global";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

// mockClear, not mockReset: after a mockReset vitest reports a throw of the mock as an unhandled error even though the code under test catches it.
beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
  vi.mocked(revalidateTag).mockImplementation(() => undefined);
});

describe("publishedOnlyAccess", () => {
  const read = publishedOnlyAccess.read as (args: { req: { user: unknown } }) => unknown;
  const readVersions = publishedOnlyAccess.readVersions as (args: { req: { user: unknown } }) => unknown;

  it("lets a signed-in user read everything, drafts and versions included", () => {
    expect(read({ req: { user: { id: 1 } } })).toBe(true);
    expect(readVersions({ req: { user: { id: 1 } } })).toBe(true);
  });

  it("limits a visitor to the published version and hides the version history", () => {
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: "published" } });
    expect(readVersions({ req: { user: null } })).toBe(false);
  });
});

describe("revalidateOnPublish", () => {
  const run = (doc: Record<string, unknown>, tag = "about") => revalidateOnPublish(tag)({ doc } as never);

  it("clears the page's tag when a version is published", () => {
    const doc = { _status: "published" };
    expect(run(doc)).toBe(doc);
    expect(revalidateTag).toHaveBeenCalledWith("about", { expire: 0 });
  });

  it("does nothing for a draft (a draft changes nothing public)", () => {
    run({ _status: "draft" });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("does not fail outside a Next request (a script, the seed)", () => {
    vi.mocked(revalidateTag).mockImplementation(() => {
      throw new Error("Invariant: static generation store missing");
    });
    expect(() => run({ _status: "published" })).not.toThrow();
  });
});

describe("livePreviewAt", () => {
  const preview = livePreviewAt("/about-us");
  const url = (host: string | null) =>
    (preview.url as (args: { req: { headers: Headers } }) => string)({ req: { headers: new Headers(host ? { host } : {}) } });

  it("is the real page, on the host the admin was opened on", () => {
    expect(url("localhost:3000")).toBe("http://localhost:3000/about-us");
    expect(url("learning-paths-school.vercel.app")).toBe("https://learning-paths-school.vercel.app/about-us");
    expect(url(null)).toBe("http://localhost:3000/about-us");
  });

  it("has a mobile, a tablet and a desktop size", () => {
    expect(preview.breakpoints?.map((b) => b.name)).toEqual(["mobile", "tablet", "desktop"]);
  });
});
