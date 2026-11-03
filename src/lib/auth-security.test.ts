import { describe, expect, it } from "vitest";
import { allowedOrigins, cookieSecure } from "./auth-security";

// What Vercel gives a production deployment (the real values are different; these are made up).
const vercel = {
  VERCEL_ENV: "production",
  VERCEL_URL: "lps-abc123-team.vercel.app",
  VERCEL_BRANCH_URL: "lps-git-main-team.vercel.app",
  VERCEL_PROJECT_PRODUCTION_URL: "lps.vercel.app",
};

describe("cookieSecure", () => {
  it("is on for a site served over https: on Vercel (the site address comes from Vercel) and with an https NEXT_PUBLIC_SITE_URL", () => {
    expect(cookieSecure(vercel)).toBe(true);
    expect(cookieSecure({ NEXT_PUBLIC_SITE_URL: "https://www.example.com" })).toBe(true);
  });

  it("is on whenever the code runs on Vercel, even if NEXT_PUBLIC_SITE_URL says http (Vercel serves https only)", () => {
    expect(cookieSecure({ ...vercel, NEXT_PUBLIC_SITE_URL: "http://localhost:3002" })).toBe(true);
  });

  it("is off on a local setup (http://localhost), so a local production build can still log in", () => {
    expect(cookieSecure({})).toBe(false);
    expect(cookieSecure({ NODE_ENV: "production" })).toBe(false);
    expect(cookieSecure({ NEXT_PUBLIC_SITE_URL: "http://localhost:3002" })).toBe(false);
  });
});

describe("allowedOrigins", () => {
  it("is empty on a local setup (no check, Payload's default)", () => {
    expect(allowedOrigins({})).toEqual([]);
    expect(allowedOrigins({ NEXT_PUBLIC_SITE_URL: "http://localhost:3002" })).toEqual([]);
  });

  it("holds every address of a Vercel deployment: the project's production domain, this deployment, its branch", () => {
    expect(allowedOrigins(vercel).sort()).toEqual(
      ["https://lps-abc123-team.vercel.app", "https://lps-git-main-team.vercel.app", "https://lps.vercel.app"].sort(),
    );
  });

  it("holds the real domain when NEXT_PUBLIC_SITE_URL is set, next to Vercel's addresses (the admin keeps working on the Vercel address)", () => {
    const origins = allowedOrigins({ ...vercel, NEXT_PUBLIC_SITE_URL: "https://www.example.com/" });
    expect(origins).toContain("https://www.example.com");
    expect(origins).toContain("https://lps.vercel.app");
  });

  it("works with an https NEXT_PUBLIC_SITE_URL outside Vercel", () => {
    expect(allowedOrigins({ NEXT_PUBLIC_SITE_URL: "https://www.example.com" })).toEqual(["https://www.example.com"]);
  });

  it("adds CSRF_EXTRA_ORIGINS (hosts or whole addresses, with spaces, empty parts and duplicates dropped)", () => {
    const origins = allowedOrigins({
      ...vercel,
      CSRF_EXTRA_ORIGINS: " admin.example.com , https://other.example.org/path,, lps.vercel.app ",
    });
    expect(origins).toContain("https://admin.example.com");
    expect(origins).toContain("https://other.example.org");
    expect(origins.filter((o) => o === "https://lps.vercel.app")).toHaveLength(1);
  });

  it("holds origins only: no path, no trailing slash, no http address of a Vercel host", () => {
    for (const origin of allowedOrigins({ ...vercel, NEXT_PUBLIC_SITE_URL: "https://www.example.com/some/path/" })) {
      expect(origin).toMatch(/^https:\/\/[^/]+$/);
    }
  });

  it("ignores values that are not addresses", () => {
    expect(allowedOrigins({ ...vercel, CSRF_EXTRA_ORIGINS: "not an address, ::::" }).every((o) => o.startsWith("https://"))).toBe(true);
  });
});
