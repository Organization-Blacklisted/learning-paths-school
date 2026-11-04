import type { SectionProps } from "@/components/layouts/Section/Section.types";
import type { PhotoBannerContent } from "@/types/photo-banner";

export type PhotoBannerSectionProps = {
  content: PhotoBannerContent;
  /** The space above (and, last on the page, below) the section: see <Section>. Default "inner" (120px at desktop). */
  spacing?: SectionProps["spacing"];
  /** Extra classes of the <section> (the page's first section sets its own, smaller, space above this way). */
  className?: string;
  /** The photo is the biggest thing on the first screen: request it right away. */
  priority?: boolean;
};
