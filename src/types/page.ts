import type { CtaContent } from "@/types/cta";
import type { MarqueeContent } from "@/types/marquee";
import type {
  AlumniContent,
  CampusContent,
  CourageContent,
  EcosystemContent,
  FrameworkContent,
  HeroContent,
  JourneyContent,
  NewsContent,
  VisionMissionValuesContent,
} from "@/types/home";

/**
 * A page is a list of blocks, each one a section with its content. The shape is the one a CMS gives (Payload "blocks": a `blockType` plus
 * the block's own fields), so a page can later be read from the database instead of a data file without changing any component.
 * Rendered by <BlockRenderer> (src/components/blocks).
 */
export type SectionBlock =
  | { blockType: "hero"; content: HeroContent }
  | { blockType: "vision"; content: VisionMissionValuesContent }
  | { blockType: "courage"; content: CourageContent }
  | { blockType: "journey"; content: JourneyContent }
  | { blockType: "framework"; content: FrameworkContent }
  | { blockType: "ecosystem"; content: EcosystemContent }
  | { blockType: "alumni"; content: AlumniContent }
  | { blockType: "campus"; content: CampusContent }
  | { blockType: "news"; content: NewsContent }
  /** Without `content` the standard admissions band is used. */
  | { blockType: "cta"; content?: CtaContent }
  /** Without `content` the standard photo strip is used. `attachToFooter`: touches the footer (only as the last block). */
  | { blockType: "marquee"; content?: MarqueeContent; attachToFooter?: boolean };

/** One panel of a sideways scene: a section, plus how it sits in the row (see HorizontalScenePanel). */
export type ScenePanelBlock = {
  /** Unique within the page. */
  id: string;
  /** Width of the panel's content in px when the panels sit side by side. */
  contentWidth: number;
  /** Space before this panel in px at 1920px wide (default 153). */
  gapBefore?: number;
  block: SectionBlock;
};

/** A pinned scene that pans sideways across its panels while the page scrolls down. */
export type SceneBlock = {
  blockType: "scene";
  id: string;
  panels: ScenePanelBlock[];
  /** Below 640px wide or 500px high the panels are a plain vertical stack, not a pinned sideways scene (see HorizontalSceneProps). */
  stackOnPhones?: boolean;
};

export type PageBlock = SectionBlock | SceneBlock;
