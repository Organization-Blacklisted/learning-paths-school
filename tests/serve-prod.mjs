// Builds the production site into its own folder (.next-prod) and serves it on port 3002, WITHOUT touching `.next` (the folder of
// `npm run dev`). `next build` rewrites tsconfig.json and next-env.d.ts for the other folder, so both are restored afterwards.
// next-env.d.ts is not in git, so a fresh checkout (CI) has none: it is then deleted again instead of restored.
//
//   npm run qa:serve            build + serve (stays running; stop with Ctrl+C)
//   npm run qa:serve -- --skip-build   only serve what is already built
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = process.env.QA_PORT ?? "3002";
// HOME_SECTION_LIMIT=all: the checks always test the WHOLE home page, also while some sections are hidden on the live site (src/lib/site.ts).
const env = { ...process.env, NEXT_DIST_DIR: ".next-prod", HOME_SECTION_LIMIT: "all" };
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const shell = process.platform === "win32";

if (!process.argv.includes("--skip-build")) {
  const backup = mkdtempSync(join(tmpdir(), "lps-build-"));
  const saved = ["tsconfig.json", "next-env.d.ts"].filter((file) => existsSync(file));
  for (const file of saved) copyFileSync(file, join(backup, file));
  const build = spawnSync(npx, ["next", "build"], { env, stdio: "inherit", shell });
  for (const file of saved) copyFileSync(join(backup, file), file);
  if (!saved.includes("next-env.d.ts")) rmSync("next-env.d.ts", { force: true });
  rmSync(backup, { recursive: true, force: true });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const server = spawn(npx, ["next", "start", "-p", PORT], { env, stdio: "inherit", shell });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill());
server.on("exit", (code) => process.exit(code ?? 0));
