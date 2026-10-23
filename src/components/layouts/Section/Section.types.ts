import type { ReactNode } from "react";

export type SectionProps = {
  children: ReactNode;
  /** Accessible name of the section (use this or aria-labelledby for landmarks). */
  label?: string;
  className?: string;
  /**
   * "default": one --spacing-section (200px at desktop) above the section, and also below it when it is the last
   * section on the page. "none": no vertical spacing, for full-bleed sections that set their own height, such as the hero.
   */
  spacing?: "default" | "none";
  /** Wrap the children in a <Container> (gutters + max width). Default true. Turn off for full-bleed content. */
  contained?: boolean;
  /** Container content width in px. Default: the main container (1520). See CONTAINER_WIDTH. */
  contentWidth?: number;
};
