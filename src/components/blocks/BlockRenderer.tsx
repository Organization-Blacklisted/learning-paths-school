import { Fragment, type ReactNode } from "react";
import Container from "@/components/layouts/Container";
import HorizontalScene from "@/components/layouts/HorizontalScene";
import AlumniSection from "@/components/sections/home/AlumniSection";
import CampusSection from "@/components/sections/home/CampusSection";
import CourageSection from "@/components/sections/home/CourageSection";
import EcosystemSection from "@/components/sections/home/EcosystemSection";
import FrameworkSection from "@/components/sections/home/FrameworkSection";
import HeroSlideshowSection from "@/components/sections/home/HeroSlideshowSection";
import JourneySection from "@/components/sections/home/JourneySection";
import NewsSection from "@/components/sections/home/NewsSection";
import VisionMissionValuesSection from "@/components/sections/home/VisionMissionValuesSection";
import CtaSection from "@/components/sections/shared/CtaSection";
import MarqueeSection from "@/components/sections/shared/MarqueeSection";
import type { PageBlock, SectionBlock } from "@/types/page";

// Turns a page's list of blocks into its sections, so a page is DATA (a list of blocks) and not hand-written markup:
//
//   <main id="main-content">…<BlockRenderer blocks={blocks} /></main>
//
// A new section type is added in one place: its entry in `renderSection` (TypeScript flags a block type that has no renderer).
// Sideways scenes ("scene" blocks) wrap their panels' sections in <HorizontalScene>.

/**
 * The Alumni section has no container or spacing of its own (it was a panel of a sideways scene, and the scene gave it both); below the scene it is
 * an ordinary section and gets the same 1520px container and 200px spacing as the sections that bring their own.
 */
function Contained({ children }: { children: ReactNode }) {
  return (
    <div className="pt-section last:pb-section">
      <Container>{children}</Container>
    </div>
  );
}

/** One renderer per section type. `satisfies` makes TypeScript require an entry for every block type. */
const renderSection = {
  hero: (b) => <HeroSlideshowSection content={b.content} />,
  vision: (b) => <VisionMissionValuesSection content={b.content} />,
  courage: (b) => <CourageSection content={b.content} />,
  journey: (b) => <JourneySection content={b.content} />,
  framework: (b) => <FrameworkSection content={b.content} />,
  ecosystem: (b) => <EcosystemSection content={b.content} />,
  alumni: (b) => (
    <Contained>
      <AlumniSection content={b.content} />
    </Contained>
  ),
  campus: (b) => <CampusSection content={b.content} />,
  news: (b) => <NewsSection content={b.content} />,
  cta: (b) => <CtaSection content={b.content} />,
  marquee: (b) => <MarqueeSection content={b.content} attachToFooter={b.attachToFooter} />,
} satisfies { [K in SectionBlock["blockType"]]: (block: Extract<SectionBlock, { blockType: K }>) => ReactNode };

function renderBlock(block: SectionBlock): ReactNode {
  // The lookup loses the link between the block type and its renderer, so one cast here keeps every call site fully typed.
  return (renderSection[block.blockType] as (b: SectionBlock) => ReactNode)(block);
}

export default function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        block.blockType === "scene" ? (
          <HorizontalScene
            key={block.id}
            stackOnPhones={block.stackOnPhones}
            panels={block.panels.map(({ id, contentWidth, gapBefore, block: panel }) => ({
              id,
              contentWidth,
              gapBefore,
              content: renderBlock(panel),
            }))}
          />
        ) : (
          <Fragment key={`${block.blockType}-${index}`}>{renderBlock(block)}</Fragment>
        ),
      )}
    </>
  );
}
