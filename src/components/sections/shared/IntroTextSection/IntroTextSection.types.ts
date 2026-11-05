import type { SectionProps } from "@/components/layouts/Section/Section.types";
import type { IntroTextContent } from "@/types/intro-text";

export type IntroTextSectionProps = {
  content: IntroTextContent;
  /** The space above (and, last on the page, below) the section: see <Section>. Default "inner" (120px at desktop). */
  spacing?: SectionProps["spacing"];
  /** Extra classes of the <section> (a page sets its own space above this way). */
  className?: string;
};
