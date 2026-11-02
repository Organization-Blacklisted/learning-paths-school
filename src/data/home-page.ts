import { defaultCta } from "@/data/cta";
import { homeAlumni } from "@/data/home-alumni";
import { homeCampus } from "@/data/home-campus";
import { homeCourage } from "@/data/home-courage";
import { homeEcosystem } from "@/data/home-ecosystem";
import { homeFramework } from "@/data/home-framework";
import { homeHero } from "@/data/home-hero";
import { homeJourney } from "@/data/home-journey";
import { homeNews } from "@/data/home-news";
import { homeVision } from "@/data/home-vision";
import { defaultMarquee } from "@/data/marquee";
import { takeFirstSections, withoutSections } from "@/lib/blocks";
import { HIDDEN_HOME_SECTIONS, HOME_SECTION_LIMIT } from "@/lib/site";
import type { CtaContent } from "@/types/cta";
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
import type { MarqueeContent } from "@/types/marquee";
import type { PageBlock } from "@/types/page";

/**
 * The content of every section of the home page. The files in src/data are the DEFAULT (and the fallback when the CMS cannot be read);
 * the home page of the CMS (Payload global "home") overrides the editable parts of it (src/lib/api/home-map.ts). Design values (positions,
 * widths, tones, timings) only live in these defaults.
 */
export type HomeSections = {
  hero: HeroContent;
  vision: VisionMissionValuesContent;
  courage: CourageContent;
  journey: JourneyContent;
  framework: FrameworkContent;
  ecosystem: EcosystemContent;
  alumni: AlumniContent;
  campus: CampusContent;
  news: NewsContent;
  cta: CtaContent;
  marquee: MarqueeContent;
};

export const defaultHomeSections: HomeSections = {
  hero: homeHero,
  vision: homeVision,
  courage: homeCourage,
  journey: homeJourney,
  framework: homeFramework,
  ecosystem: homeEcosystem,
  alumni: homeAlumni,
  campus: homeCampus,
  news: homeNews,
  cta: defaultCta,
  marquee: defaultMarquee,
};

/**
 * The home page, top to bottom (Figma "Homepage Version 2"), from the content of its sections. Rendered by <BlockRenderer>; the order here is
 * the order on the page.
 */
export function buildHomePage(sections: HomeSections): PageBlock[] {
  return [
    { blockType: "hero", content: sections.hero },
    // Scene 1: Vision/Mission/Values, The Courage To Find Your Path to its right, Our Learning Journey to the right of that. The page
    // scrolls down to the first, then pans sideways across the others. The gap before the Journey panel (360px at 1920px wide) is
    // measured from the Figma overview.
    {
      blockType: "scene",
      id: "vision-courage-journey",
      panels: [
        { id: "vision", contentWidth: 715, block: { blockType: "vision", content: sections.vision } },
        { id: "courage", contentWidth: 1520, block: { blockType: "courage", content: sections.courage } },
        { id: "journey", contentWidth: 1520, gapBefore: 360, block: { blockType: "journey", content: sections.journey } },
      ],
    },
    // After the pan ends on the Journey section the page continues down to this (Figma: below the Journey frame).
    { blockType: "framework", content: sections.framework },
    // Scene 2: The Ecosystem Behind LPS 360, then the view pans right to the campus video (Figma canvas: the alumni were to its right; owner,
    // 2026-11-02: the campus video and "Beyond the school gate" swapped places). The gap before the video (200px at 1920px wide) is the one
    // that was measured from the canvas overview for the alumni.
    {
      blockType: "scene",
      id: "ecosystem-campus",
      // On a phone the Ecosystem (one tall column) would have to be shrunk to about 75% to fit the pinned screen, leaving empty bands at the
      // sides (owner, 2026-10-28): there the two sections are an ordinary stack.
      stackOnPhones: true,
      panels: [
        { id: "ecosystem", contentWidth: 1520, block: { blockType: "ecosystem", content: sections.ecosystem } },
        { id: "campus", contentWidth: 1520, gapBefore: 200, block: { blockType: "campus", content: sections.campus } },
      ],
    },
    // Below the scene: "Beyond the school gate" (the alumni, an ordinary section), then the news.
    { blockType: "alumni", content: sections.alumni },
    { blockType: "news", content: sections.news },
    // The shared call to action that closes most pages, and the shared photo strip directly above the footer.
    { blockType: "cta", content: sections.cta },
    { blockType: "marquee", content: sections.marquee, attachToFooter: true },
  ];
}

/** The whole home page from the default content (the files in src/data). */
export const homePageAll: PageBlock[] = buildHomePage(defaultHomeSections);

/** What the home page shows now from the default content: the full page without the hidden sections, cut to the first HOME_SECTION_LIMIT (see src/lib/site.ts). */
export const homePage: PageBlock[] = takeFirstSections(withoutSections(homePageAll, HIDDEN_HOME_SECTIONS), HOME_SECTION_LIMIT);
