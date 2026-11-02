import { describe, expect, it } from "vitest";
import { takeFirstSections, withoutSections } from "@/lib/blocks";
import type { PageBlock, SectionBlock } from "@/types/page";

const any = {} as never; // the content is never read here
const section = (blockType: SectionBlock["blockType"]) => ({ blockType, content: any }) as SectionBlock;
const scene = (id: string, ...types: SectionBlock["blockType"][]): PageBlock => ({
  blockType: "scene",
  id,
  panels: types.map((type) => ({ id: `${id}-${type}`, contentWidth: 1520, block: section(type) })),
});
/** hero, scene[vision, courage, journey], framework, scene[ecosystem, alumni], campus, news: 9 sections */
const page: PageBlock[] = [
  section("hero"),
  scene("one", "vision", "courage", "journey"),
  section("framework"),
  scene("two", "ecosystem", "alumni"),
  section("campus"),
  section("news"),
];

/** A readable list of what a page contains: block types, with scene panels in brackets. */
const outline = (blocks: PageBlock[]) =>
  blocks.map((b) => (b.blockType === "scene" ? `[${b.panels.map((p) => p.block.blockType).join(",")}]` : b.blockType)).join(" ");

describe("takeFirstSections", () => {
  it("null keeps the whole page, as it is", () => {
    expect(takeFirstSections(page, null)).toBe(page);
  });

  it("counts every block and every scene panel: the first 3 of this page are the hero and the first two panels", () => {
    expect(outline(takeFirstSections(page, 3))).toBe("hero [vision,courage]");
  });

  it("the first 1 is the hero alone, the first 0 is an empty page", () => {
    expect(outline(takeFirstSections(page, 1))).toBe("hero");
    expect(takeFirstSections(page, 0)).toEqual([]);
  });

  it("a scene is cut inside, and a scene that loses all its panels disappears", () => {
    expect(outline(takeFirstSections(page, 2))).toBe("hero [vision]");
    expect(outline(takeFirstSections(page, 4))).toBe("hero [vision,courage,journey]");
  });

  it("continues past a whole scene into the sections after it", () => {
    expect(outline(takeFirstSections(page, 5))).toBe("hero [vision,courage,journey] framework");
    expect(outline(takeFirstSections(page, 6))).toBe("hero [vision,courage,journey] framework [ecosystem]");
  });

  it("a limit larger than the page, or a negative one, behaves sensibly", () => {
    expect(outline(takeFirstSections(page, 99))).toBe(outline(page));
    expect(takeFirstSections(page, -3)).toEqual([]);
  });

  it("does not change the original page", () => {
    const before = outline(page);
    takeFirstSections(page, 2);
    expect(outline(page)).toBe(before);
  });
});

describe("withoutSections", () => {
  it("nothing hidden keeps the page as it is", () => {
    expect(withoutSections(page, [])).toBe(page);
  });

  it("drops a panel of a scene and the rest of the scene closes up", () => {
    expect(outline(withoutSections(page, ["courage"]))).toBe("hero [vision,journey] framework [ecosystem,alumni] campus news");
  });

  it("drops a plain block, wherever it is", () => {
    expect(outline(withoutSections(page, ["campus", "news"]))).toBe("hero [vision,courage,journey] framework [ecosystem,alumni]");
  });

  it("a scene that loses every panel disappears; one panel left stays (it is then just a section)", () => {
    expect(outline(withoutSections(page, ["ecosystem", "alumni"]))).toBe("hero [vision,courage,journey] framework campus news");
    expect(outline(withoutSections(page, ["alumni"]))).toBe("hero [vision,courage,journey] framework [ecosystem] campus news");
  });

  it("an unknown type hides nothing, and the original page is not changed", () => {
    const before = outline(page);
    expect(outline(withoutSections(page, ["nope"]))).toBe(before);
    withoutSections(page, ["courage"]);
    expect(outline(page)).toBe(before);
  });
});
