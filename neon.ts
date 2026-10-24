import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: false,
  buckets: {
    // The Payload Media collection's bucket. The name is hard-coded in src/payload.config.ts (s3Storage), so change both together.
    // Private: Payload serves the files itself, so the public site does not need anonymous reads.
    "lps-media": { access: "private" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (branch.name === "dev") {
      // The long-lived branch for local work (decided 2026-10-24: needed for the whole project). No ttl: it is kept until deleted.
      // Other branches must not be pointed at production by `npm run dev`: Payload changes the schema on start in development.
      return {};
    }
    if (!branch.exists) {
      // Any other new branch (a feature or test branch) expires after a week.
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
