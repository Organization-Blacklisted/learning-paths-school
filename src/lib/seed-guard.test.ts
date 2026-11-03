import { describe, expect, it } from "vitest";
import { databaseEndpoint, planSeed, type SeedEnv } from "./seed-guard";

// A development environment as `neon checkout dev` leaves it (fake hosts: the real strings are secrets).
const dev: SeedEnv = {
  DATABASE_URL: "postgres://u:p@ep-dev-123-pooler.eu-central-1.aws.neon.tech/db?sslmode=require",
  DATABASE_URL_UNPOOLED: "postgres://u:p@ep-dev-123.eu-central-1.aws.neon.tech/db?sslmode=require",
  NEON_BRANCH: "dev",
};
const live: SeedEnv = {
  DATABASE_URL: "postgres://u:p@ep-live-456-pooler.eu-central-1.aws.neon.tech/db?sslmode=require",
  DATABASE_URL_UNPOOLED: "postgres://u:p@ep-live-456.eu-central-1.aws.neon.tech/db?sslmode=require",
  NEON_BRANCH: "production",
};

describe("databaseEndpoint", () => {
  it("is the same for the pooled and the direct string of one branch", () => {
    expect(databaseEndpoint(dev.DATABASE_URL)).toBe(databaseEndpoint(dev.DATABASE_URL_UNPOOLED));
  });
  it("differs between two branches, and is null for nothing or nonsense", () => {
    expect(databaseEndpoint(dev.DATABASE_URL)).not.toBe(databaseEndpoint(live.DATABASE_URL));
    expect(databaseEndpoint(undefined)).toBeNull();
    expect(databaseEndpoint("not a url")).toBeNull();
  });
});

describe("planSeed", () => {
  it("lets a development seed through, without overwriting", () => {
    expect(planSeed(dev)).toEqual({ branch: "dev", production: false, overwrite: false });
  });

  it("lets a development seed overwrite without any further confirmation", () => {
    expect(planSeed({ ...dev, SEED_OVERWRITE: "1" })).toMatchObject({ overwrite: true, production: false });
  });

  it("is refused in CI and on Vercel, whatever else is set", () => {
    expect(() => planSeed({ ...dev, CI: "true" })).toThrow(/CI and on Vercel/);
    expect(() => planSeed({ ...live, SEED_PRODUCTION: "1", VERCEL: "1" })).toThrow(/CI and on Vercel/);
  });

  it("is refused without a database, and without a branch name (it does not guess which database it is)", () => {
    expect(() => planSeed({ ...dev, DATABASE_URL: undefined })).toThrow(/DATABASE_URL is not set/);
    expect(() => planSeed({ ...dev, NEON_BRANCH: undefined })).toThrow(/NEON_BRANCH is not set/);
    expect(() => planSeed({ ...dev, NEON_BRANCH: "  " })).toThrow(/NEON_BRANCH is not set/);
  });

  it("refuses the production branch without SEED_PRODUCTION=1, and any other value of it", () => {
    expect(() => planSeed(live)).toThrow(/SEED_PRODUCTION=1/);
    expect(() => planSeed({ ...live, SEED_PRODUCTION: "true" })).toThrow(/SEED_PRODUCTION=1/);
  });

  it("seeds production with SEED_PRODUCTION=1", () => {
    expect(planSeed({ ...live, SEED_PRODUCTION: "1" })).toEqual({ branch: "production", production: true, overwrite: false });
  });

  it("refuses SEED_PRODUCTION=1 on any other branch (a stale .env.local must not pass for the live site)", () => {
    expect(() => planSeed({ ...dev, SEED_PRODUCTION: "1" })).toThrow(/points at the Neon branch `dev`, not `production`/);
  });

  it("refuses a pooled and a direct string that name different databases, in both modes", () => {
    const mixed = { ...dev, DATABASE_URL_UNPOOLED: live.DATABASE_URL_UNPOOLED };
    expect(() => planSeed(mixed)).toThrow(/different databases/);
    expect(() => planSeed({ ...live, SEED_PRODUCTION: "1", DATABASE_URL_UNPOOLED: dev.DATABASE_URL_UNPOOLED })).toThrow(
      /different databases/,
    );
  });

  it("refuses an unreadable connection string, without printing it", () => {
    let message = "";
    try {
      planSeed({ ...dev, DATABASE_URL: "secret-without-a-scheme" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/not a readable connection string/);
    expect(message).not.toContain("secret-without-a-scheme");
  });

  it("needs the direct connection to seed production (it runs like a migration), but not for development", () => {
    expect(() => planSeed({ ...live, SEED_PRODUCTION: "1", DATABASE_URL_UNPOOLED: undefined })).toThrow(/needs DATABASE_URL_UNPOOLED/);
    expect(planSeed({ ...dev, DATABASE_URL_UNPOOLED: undefined })).toMatchObject({ branch: "dev" });
  });

  it("refuses to overwrite production without the spelled-out confirmation, and allows it with it", () => {
    const wipe = { ...live, SEED_PRODUCTION: "1", SEED_OVERWRITE: "1" };
    expect(() => planSeed(wipe)).toThrow(/SEED_CONFIRM=overwrite-production/);
    expect(() => planSeed({ ...wipe, SEED_CONFIRM: "yes" })).toThrow(/SEED_CONFIRM=overwrite-production/);
    expect(planSeed({ ...wipe, SEED_CONFIRM: "overwrite-production" })).toEqual({
      branch: "production",
      production: true,
      overwrite: true,
    });
  });

  it("never puts a connection string or a host into a message", () => {
    const attempts: SeedEnv[] = [
      live,
      { ...dev, SEED_PRODUCTION: "1" },
      { ...dev, DATABASE_URL_UNPOOLED: live.DATABASE_URL_UNPOOLED },
      { ...live, SEED_PRODUCTION: "1", SEED_OVERWRITE: "1" },
    ];
    for (const env of attempts) {
      let message = "";
      try {
        planSeed(env);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message.length).toBeGreaterThan(0);
      expect(message).not.toMatch(/postgres:|neon\.tech|ep-(dev|live)/);
    }
  });
});
