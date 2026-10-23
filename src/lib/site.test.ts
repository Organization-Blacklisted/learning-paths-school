import { describe, expect, it } from "vitest";
import { resolveSectionLimit, resolveSiteUrl } from "@/lib/site";

describe("resolveSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL when it is set, without a trailing slash", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.lps.edu.in/" })).toBe("https://www.lps.edu.in");
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.lps.edu.in" })).toBe("https://www.lps.edu.in");
  });

  it("falls back to localhost for local development", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });

  it("an explicit NEXT_PUBLIC_SITE_URL wins over what Vercel provides", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://www.lps.edu.in",
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "lps.vercel.app",
        VERCEL_URL: "lps-abc123.vercel.app",
      }),
    ).toBe("https://www.lps.edu.in");
  });

  it("on a Vercel production build without the variable, uses the production domain", () => {
    expect(
      resolveSiteUrl({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "lps.vercel.app", VERCEL_URL: "lps-abc123.vercel.app" }),
    ).toBe("https://lps.vercel.app");
  });

  it("on a Vercel preview, uses the preview's own address (never the live domain)", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: "lps.vercel.app",
        VERCEL_URL: "lps-git-feature-team.vercel.app",
      }),
    ).toBe("https://lps-git-feature-team.vercel.app");
  });

  it("falls back to the deployment address when Vercel gives no production domain", () => {
    expect(resolveSiteUrl({ VERCEL_ENV: "production", VERCEL_URL: "lps-abc123.vercel.app" })).toBe("https://lps-abc123.vercel.app");
  });
});

describe("resolveSectionLimit", () => {
  it("uses the fallback when nothing is set", () => {
    expect(resolveSectionLimit(undefined, 3)).toBe(3);
    expect(resolveSectionLimit("", 3)).toBe(3);
    expect(resolveSectionLimit("   ", null)).toBeNull();
  });

  it('"all" means no limit, whatever the fallback is', () => {
    expect(resolveSectionLimit("all", 3)).toBeNull();
    expect(resolveSectionLimit(" ALL ", 3)).toBeNull();
  });

  it("a whole number is the limit (0 shows no section)", () => {
    expect(resolveSectionLimit("5", 3)).toBe(5);
    expect(resolveSectionLimit("0", 3)).toBe(0);
  });

  it("anything else is ignored, so a typo cannot hide or show the wrong thing", () => {
    expect(resolveSectionLimit("three", 3)).toBe(3);
    expect(resolveSectionLimit("2.5", 3)).toBe(3);
    expect(resolveSectionLimit("-1", 3)).toBe(3);
  });
});
