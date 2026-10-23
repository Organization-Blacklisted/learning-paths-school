import type { ReactNode } from "react";

export type HorizontalScenePanel = {
  id: string;
  /** The panel's content. Normally one <section> with its own aria-label. */
  content: ReactNode;
  /**
   * Width of the panel's CONTENT in px when the panels sit side by side (the panel itself adds the 40px
   * gutters of <Container> on each side). On narrow screens it shrinks to the screen.
   */
  contentWidth: number;
  /**
   * Empty space between the previous panel's content and this one's, in px on a 1920px wide screen (it scales
   * with the screen width). Ignored for the first panel. Default 153 (Vision/Mission/Values to Courage, Figma).
   */
  gapBefore?: number;
};

export type HorizontalSceneProps = {
  panels: HorizontalScenePanel[];
};
