// The guard every seed script (seed-*.ts) imports FIRST, before Payload and the config (imports run in order, and src/payload.config.ts reads the
// environment when it loads). The rules are in src/lib/seed-guard.ts, where they are unit tested. This file does the two things that need the real
// process:
//
//  1. SEED_PRODUCTION=1 switches the seed to "migrating" mode (PAYLOAD_MIGRATING=true, the same switch `payload migrate` uses in
//     scripts/vercel-build.mjs): the direct database connection and NO schema push. In its normal (development) mode Payload changes the database schema
//     on its own and leaves a "dev" row in the migrations table, which on production made the next deploy stop on an interactive question
//     (2026-11-02). A seed only fills content; the tables of production come from the migrations files, so if they are behind, the seed fails
//     instead of changing the live schema, and no "dev" row is left behind.
//  2. guardSeed() runs the rules and prints a one-line banner: which branch, which mode. It never prints a connection string or a key.
import { planSeed, type SeedPlan } from "../src/lib/seed-guard";

if (process.env.SEED_PRODUCTION === "1") process.env.PAYLOAD_MIGRATING = "true";

/** Call at the start of a seed's main(): throws (with what to fix) when the environment is not safe to seed, else says where it is seeding. */
export function guardSeed(what: string): SeedPlan {
  const plan = planSeed(process.env);
  const mode = plan.production ? "PRODUCTION: direct connection, no schema push" : "development";
  const overwrite = plan.overwrite ? ", OVERWRITING existing content" : "";
  console.log(`Seeding ${what} on Neon branch: ${plan.branch} (${mode}${overwrite})`);
  return plan;
}
