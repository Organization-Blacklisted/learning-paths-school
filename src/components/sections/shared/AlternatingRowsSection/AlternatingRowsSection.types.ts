import type { SectionProps } from "@/components/layouts/Section/Section.types";
import type { AlternatingRowsContent } from "@/types/alternating-rows";

export type AlternatingRowsSectionProps = {
  content: AlternatingRowsContent;
  /** The space above (and, last on the page, below) the section: see <Section>. Default "inner" (120px at desktop). */
  spacing?: SectionProps["spacing"];
  /** Extra classes for the <section> (the Signature Events page uses it to set its own space under the hero). */
  className?: string;
  /** Load the first row’s photo right away (the biggest thing on the first screen): the page passes it when this section is first. */
  priority?: boolean;
};
