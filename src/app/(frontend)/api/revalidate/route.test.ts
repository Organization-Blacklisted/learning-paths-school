import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));

const { POST } = await import("./route");

const call = (headers: Record<string, string>, body?: unknown) =>
  POST(
    new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body ?? {}),
    }),
  );

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    vi.stubEnv("REVALIDATE_SECRET", "s3cret-value");
  });

  it("refuses every call when no secret is configured", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    expect((await call({ "x-revalidate-secret": "" })).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses a missing or wrong secret", async () => {
    expect((await call({})).status).toBe(401);
    expect((await call({ "x-revalidate-secret": "nope" })).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("clears every page with the right secret (no tag means the allowed ones)", async () => {
    const response = await call({ "x-revalidate-secret": "s3cret-value" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revalidated: ["home", "contact", "principals-welcome", "partnerships", "awards-recognition"] });
    expect(revalidateTag).toHaveBeenCalledWith("home", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("contact", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("principals-welcome", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("partnerships", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("awards-recognition", { expire: 0 });
  });

  it("clears one page when asked for it", async () => {
    const response = await call({ "x-revalidate-secret": "s3cret-value" }, { tag: "contact" });
    expect(await response.json()).toEqual({ revalidated: ["contact"] });
    expect(revalidateTag).toHaveBeenCalledTimes(1);
  });

  it("only clears tags it knows", async () => {
    const response = await call({ "x-revalidate-secret": "s3cret-value" }, { tag: "everything" });
    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
