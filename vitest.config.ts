import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit and component tests (`npm test`). They run in jsdom, so they cover logic (hooks, rendering of blocks), not layout or animation:
// those are checked in a real browser by the QA suite in tests/ (see docs/24-qa-suite.md).
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
  },
});
