import type { SectionProps } from "@/components/layouts/Section/Section.types";
import type { CrestCardsContent } from "@/types/crest-cards";

export type CrestCardsSectionProps = {
  content: CrestCardsContent;
  /** The space above (and, last on the page, below) the section: see <Section>. Default "inner" (120px at desktop). */
  spacing?: SectionProps["spacing"];
  className?: string;
};
