import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import BlockRenderer from "@/components/blocks";
import { homePageAll as homePage } from "@/data/home-page";
import type { PageBlock, SectionBlock } from "@/types/page";

// Every section component is replaced by a marker that shows which section it is and the props it received. The sections themselves are
// checked in a real browser (docs/24-qa-suite.md); this file is about the wiring: which block becomes which section, in which order,
// with which props, and how a sideways scene is put together.
vi.mock("@/components/sections/home/HeroSlideshowSection", async () => ({ default: (await import("./section-stub")).sectionStub("hero") }));
vi.mock("@/components/sections/home/VisionMissionValuesSection", async () => ({
  default: (await import("./section-stub")).sectionStub("vision"),
}));
vi.mock("@/components/sections/home/CourageSection", async () => ({ default: (await import("./section-stub")).sectionStub("courage") }));
vi.mock("@/components/sections/home/JourneySection", async () => ({ default: (await import("./section-stub")).sectionStub("journey") }));
vi.mock("@/components/sections/home/FrameworkSection", async () => ({
  default: (await import("./section-stub")).sectionStub("framework"),
}));
vi.mock("@/components/sections/home/EcosystemSection", async () => ({
  default: (await import("./section-stub")).sectionStub("ecosystem"),
}));
vi.mock("@/components/sections/home/AlumniSection", async () => ({ default: (await import("./section-stub")).sectionStub("alumni") }));
vi.mock("@/components/sections/home/CampusSection", async () => ({ default: (await import("./section-stub")).sectionStub("campus") }));
vi.mock("@/components/sections/home/NewsSection", async () => ({ default: (await import("./section-stub")).sectionStub("news") }));
vi.mock("@/components/sections/shared/CtaSection", async () => ({ default: (await import("./section-stub")).sectionStub("cta") }));
vi.mock("@/components/sections/shared/MarqueeSection", async () => ({ default: (await import("./section-stub")).sectionStub("marquee") }));
vi.mock("@/components/layouts/HorizontalScene", () => ({
  default: ({
    panels,
    stackOnPhones,
  }: {
    panels: { id: string; contentWidth: number; gapBefore?: number; content: ReactNode }[];
    stackOnPhones?: boolean;
  }) => (
    <div data-scene data-stack-on-phones={stackOnPhones ? "true" : "false"}>
      {panels.map((panel) => (
        <div key={panel.id} data-panel={panel.id} data-width={panel.contentWidth} data-gap={panel.gapBefore ?? "default"}>
          {panel.content}
        </div>
      ))}
    </div>
  ),
}));

const sections = (container: HTMLElement) => [...container.querySelectorAll("[data-section]")].map((el) => el.getAttribute("data-section"));
const any = {} as never; // the stubs ignore the content, so an empty object stands in for it

describe("BlockRenderer", () => {
  it("renders the blocks in the order given", () => {
    const blocks: PageBlock[] = [
      { blockType: "news", content: any },
      { blockType: "hero", content: any },
      { blockType: "campus", content: any },
    ];
    const { container } = render(<BlockRenderer blocks={blocks} />);
    expect(sections(container)).toEqual(["news", "hero", "campus"]);
  });

  it("renders nothing for an empty page", () => {
    const { container } = render(<BlockRenderer blocks={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("has a renderer for every section type (each one turns into its own section)", () => {
    const types: SectionBlock["blockType"][] = [
      "hero",
      "vision",
      "courage",
      "journey",
      "framework",
      "ecosystem",
      "alumni",
      "campus",
      "news",
      "cta",
      "marquee",
    ];
    const blocks = types.map((blockType) => ({ blockType, content: any }) as SectionBlock);
    const { container } = render(<BlockRenderer blocks={blocks} />);
    expect(sections(container)).toEqual(types);
  });

  it("the same section type can appear twice on a page", () => {
    const { container } = render(
      <BlockRenderer blocks={[{ blockType: "cta" }, { blockType: "news", content: any }, { blockType: "cta" }]} />,
    );
    expect(sections(container)).toEqual(["cta", "news", "cta"]);
  });

  it("passes the content on, and leaves it out for the CTA and the marquee so they use their standard content", () => {
    const { container } = render(
      <BlockRenderer blocks={[{ blockType: "news", content: any }, { blockType: "cta" }, { blockType: "marquee" }]} />,
    );
    const flags = [...container.querySelectorAll("[data-section]")].map((el) => el.getAttribute("data-has-content"));
    expect(flags).toEqual(["yes", "no", "no"]);
  });

  it("passes the marquee's attachToFooter flag through", () => {
    const { container } = render(<BlockRenderer blocks={[{ blockType: "marquee", attachToFooter: true }, { blockType: "marquee" }]} />);
    const attach = [...container.querySelectorAll("[data-section=marquee]")].map((el) => el.getAttribute("data-attach"));
    expect(attach).toEqual(["true", "unset"]);
  });

  describe("scenes", () => {
    const scene: PageBlock = {
      blockType: "scene",
      id: "demo",
      panels: [
        { id: "first", contentWidth: 715, block: { blockType: "vision", content: any } },
        { id: "second", contentWidth: 1520, gapBefore: 360, block: { blockType: "courage", content: any } },
      ],
    };

    it("wraps its panels in one sideways scene, each panel holding its section", () => {
      const { container } = render(<BlockRenderer blocks={[scene]} />);
      expect(container.querySelectorAll("[data-scene]")).toHaveLength(1);
      const panels = [...container.querySelectorAll("[data-panel]")];
      expect(panels.map((p) => p.getAttribute("data-panel"))).toEqual(["first", "second"]);
      expect(panels[0].querySelector("[data-section=vision]")).not.toBeNull();
      expect(panels[1].querySelector("[data-section=courage]")).not.toBeNull();
    });

    it("passes each panel's width and gap on (the gap stays unset when not given, so the scene's default applies)", () => {
      const { container } = render(<BlockRenderer blocks={[scene]} />);
      const panels = [...container.querySelectorAll("[data-panel]")];
      expect(panels.map((p) => [p.getAttribute("data-width"), p.getAttribute("data-gap")])).toEqual([
        ["715", "default"],
        ["1520", "360"],
      ]);
    });

    it("passes `stackOnPhones` on to the scene (off unless the block asks for it)", () => {
      const stacked: PageBlock = { ...(scene as Extract<PageBlock, { blockType: "scene" }>), stackOnPhones: true };
      expect(
        render(<BlockRenderer blocks={[scene]} />)
          .container.querySelector("[data-scene]")
          ?.getAttribute("data-stack-on-phones"),
      ).toBe("false");
      expect(
        render(<BlockRenderer blocks={[stacked]} />)
          .container.querySelector("[data-scene]")
          ?.getAttribute("data-stack-on-phones"),
      ).toBe("true");
    });

    it("keeps sections before and after a scene in order, and renders two scenes independently", () => {
      const second: PageBlock = {
        blockType: "scene",
        id: "other",
        panels: [{ id: "x", contentWidth: 1520, block: { blockType: "alumni", content: any } }],
      };
      const { container } = render(
        <BlockRenderer
          blocks={[{ blockType: "hero", content: any }, scene, { blockType: "framework", content: any }, second, { blockType: "cta" }]}
        />,
      );
      expect(container.querySelectorAll("[data-scene]")).toHaveLength(2);
      expect(sections(container)).toEqual(["hero", "vision", "courage", "framework", "alumni", "cta"]);
    });
  });
});

describe("the home page (src/data/home-page.ts)", () => {
  it("renders every block as the sections the design has, in the design's order", () => {
    const { container } = render(<BlockRenderer blocks={homePage} />);
    expect(sections(container)).toEqual([
      "hero",
      "vision",
      "courage",
      "journey", // scene 1
      "framework",
      "ecosystem",
      "alumni", // scene 2
      "campus",
      "news",
      "cta",
      "marquee",
    ]);
    expect(container.querySelectorAll("[data-scene]")).toHaveLength(2);
  });

  it("ends with the marquee attached to the footer, and nothing after it", () => {
    const last = homePage[homePage.length - 1];
    expect(last).toMatchObject({ blockType: "marquee", attachToFooter: true });
  });

  it("has unique scene and panel ids (they are React keys and scroll-trigger names)", () => {
    const scenes = homePage.filter((block) => block.blockType === "scene");
    const ids = scenes.flatMap((block) => [block.id, ...block.panels.map((panel) => panel.id)]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("stacks the Ecosystem and Alumni scene on phones (pinned, the tall Ecosystem would be shrunk and narrowed), and no other scene", () => {
    const stacked = homePage.flatMap((block) => (block.blockType === "scene" && block.stackOnPhones ? [block.id] : []));
    expect(stacked).toEqual(["ecosystem-alumni"]);
  });

  it("gives every scene at least two panels (a one-panel scene would pin the page for nothing)", () => {
    for (const block of homePage) if (block.blockType === "scene") expect(block.panels.length).toBeGreaterThanOrEqual(2);
  });

  it("never puts a scene inside a scene (the type forbids it; this guards data coming from a CMS)", () => {
    for (const block of homePage) {
      if (block.blockType !== "scene") continue;
      for (const panel of block.panels) expect((panel.block as { blockType: string }).blockType).not.toBe("scene");
    }
  });
});
