// The safety rules of the seed scripts (scripts/seed-*.ts), kept here, away from Payload, so they can be unit tested. A seed writes into whichever database
// the environment points at, so it must be sure which one that is BEFORE it writes. Every rule fails closed: when something is unclear it refuses.
//
// It never returns or prints a connection string, a host or a key: the messages only name the Neon branch and the variables.

export type SeedEnv = Partial<Record<string, string | undefined>>;

export type SeedPlan = {
  /** The Neon branch the environment points at (`NEON_BRANCH`). */
  branch: string;
  /** Seeding the live site (`SEED_PRODUCTION=1`, and the branch is `production`). */
  production: boolean;
  /** Replace a page that already has content (`SEED_OVERWRITE=1`): this DISCARDS what editors wrote. */
  overwrite: boolean;
};

/** The database server of a connection string, without Neon's "-pooler" marker: the pooled and the direct string of one branch give the same value. null when it cannot be read. */
export function databaseEndpoint(connectionString: string | undefined): string | null {
  if (!connectionString) return null;
  try {
    return new URL(connectionString).hostname.toLowerCase().replace("-pooler", "");
  } catch {
    return null;
  }
}

/**
 * Decides whether a seed may run with this environment, and how. Throws an Error that says what to fix.
 *
 *  1. Never in CI or on Vercel (a seed is a deliberate act of a person on their own computer).
 *  2. DATABASE_URL and NEON_BRANCH must both be set: without the branch name nobody can tell which database this is, so it is refused (not guessed).
 *  3. The branch `production` is only seeded with SEED_PRODUCTION=1, and SEED_PRODUCTION=1 only works when the environment really is the
 *     `production` branch (so a stale .env.local, still on `dev`, cannot make anyone believe the live site was seeded).
 *  4. The pooled and the direct connection string must name the same database (a half-switched environment would read one and write the other).
 *     Seeding production also needs the direct one: it runs like a migration (no schema push, see the note in scripts/seed-guard.ts).
 *  5. Replacing a page that has content on production needs a second, spelled-out confirmation (SEED_CONFIRM=overwrite-production).
 */
export function planSeed(env: SeedEnv): SeedPlan {
  if (env.CI || env.VERCEL) {
    throw new Error("Seeding is refused in CI and on Vercel: run it by hand, on your own computer, on purpose.");
  }
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set (run `neon checkout dev`, or fill .env.local).");
  const branch = env.NEON_BRANCH?.trim();
  if (!branch) {
    throw new Error(
      "NEON_BRANCH is not set, so it is not known which database DATABASE_URL is. `neon checkout <branch>` or `neon env pull` writes it; set it to the real branch name.",
    );
  }

  const production = env.SEED_PRODUCTION === "1";
  if (branch === "production" && !production) {
    throw new Error("The Neon branch is `production`. Set SEED_PRODUCTION=1 to seed it on purpose.");
  }
  if (production && branch !== "production") {
    throw new Error(
      `SEED_PRODUCTION=1 is set, but the environment points at the Neon branch \`${branch}\`, not \`production\`. Wrong .env.local? Nothing was changed.`,
    );
  }

  const pooled = databaseEndpoint(env.DATABASE_URL);
  if (!pooled) throw new Error("DATABASE_URL is not a readable connection string.");
  if (env.DATABASE_URL_UNPOOLED) {
    const direct = databaseEndpoint(env.DATABASE_URL_UNPOOLED);
    if (!direct) throw new Error("DATABASE_URL_UNPOOLED is not a readable connection string.");
    if (direct !== pooled) {
      throw new Error(
        "DATABASE_URL and DATABASE_URL_UNPOOLED point at different databases (a half-switched environment). Pull both again with `neon env pull --branch <branch>`.",
      );
    }
  } else if (production) {
    throw new Error("Seeding production needs DATABASE_URL_UNPOOLED (the direct connection), which is not set.");
  }

  const overwrite = env.SEED_OVERWRITE === "1";
  if (overwrite && production && env.SEED_CONFIRM !== "overwrite-production") {
    throw new Error(
      "SEED_OVERWRITE=1 on production would DISCARD what the editors wrote. If that is really what is wanted, also set SEED_CONFIRM=overwrite-production.",
    );
  }

  return { branch, production, overwrite };
}
