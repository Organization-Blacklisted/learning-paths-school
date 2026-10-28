import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Owner rule (2026-10-28): no font size on the site is a fixed number, every size is a clamp(), and a line height is a ratio, not px.
// This reads the source, so a new fixed value fails here instead of reaching a phone.

const SRC = path.resolve(import.meta.dirname, "..");
const typography = readFileSync(path.join(SRC, "styles/typography.css"), "utf8");

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });

describe("typography tokens (src/styles/typography.css)", () => {
  const sizes = [...typography.matchAll(/^\s*(--text-[a-z0-9-]+):\s*([^;]+);/gm)]
    .filter(([, name]) => !name.includes("--line-height") && !name.includes("--letter-spacing"))
    .map(([, name, value]) => ({ name, value: value.trim() }));

  it("finds the size tokens", () => {
    expect(sizes.length).toBeGreaterThanOrEqual(17);
  });

  it("makes every font size token a clamp(), none is a plain number", () => {
    const fixed = sizes.filter(({ value }) => !value.startsWith("clamp("));
    expect(fixed).toEqual([]);
  });

  it("has a minimum below its maximum in every clamp (otherwise it is fixed in disguise)", () => {
    const rem = (v: string) => parseFloat(v);
    for (const { name, value } of sizes) {
      const [min, , max] = value.slice(value.indexOf("(") + 1, value.lastIndexOf(")")).split(/,\s*/);
      expect(rem(min), name).toBeLessThan(rem(max));
    }
  });
});

describe("the source", () => {
  const files = sourceFiles(SRC);
  const offenders = (pattern: RegExp, only: RegExp = /./) =>
    files
      .filter((file) => only.test(file))
      .flatMap((file) => {
        const text = readFileSync(file, "utf8");
        return [...text.matchAll(pattern)].map((m) => `${path.relative(SRC, file)}: ${m[0]}`);
      });

  it("has no font size written as a fixed number (text-[17px], text-[1.1rem] ...)", () => {
    // text-[0px] is the whitespace trick in the Journey section (the text inside sets its own size) and text-[length:...] is a clamp or var.
    expect(offenders(/\btext-\[(?!0px\])\d[^\]]*\]/g)).toEqual([]);
  });

  it("has no inline fontSize as a number in a component (data files hold the design sizes that components turn into percentages)", () => {
    expect(offenders(/fontSize:\s*["'`]?\d+(\.\d+)?(px|rem)?["'`]?/g, /\.tsx$/)).toEqual([]);
  });

  it("has no line height in px or rem (leading-[26px], leading-5): use a ratio so it follows the font size", () => {
    expect(offenders(/\bleading-(\[\d+(\.\d+)?(px|rem)\]|\d+)\b/g)).toEqual([]);
  });
});
