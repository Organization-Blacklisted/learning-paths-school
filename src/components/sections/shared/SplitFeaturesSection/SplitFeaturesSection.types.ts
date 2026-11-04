import type { SectionProps } from "@/components/layouts/Section/Section.types";
import type { SplitFeaturesContent } from "@/types/split-features";

export type SplitFeaturesSectionProps = {
  content: SplitFeaturesContent;
  /** The space above (and, last on the page, below) the section: see <Section>. Default "inner" (120px at desktop). */
  spacing?: SectionProps["spacing"];
};
