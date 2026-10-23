import type { MarqueeContent } from "@/types/marquee";

export type MarqueeSectionProps = {
  /** Defaults to the school's standard photo strip (src/data/marquee.ts). */
  content?: MarqueeContent;
  /**
   * Leave out the space BELOW the strip so it touches the footer. Use it only when the strip is the last thing before
   * the footer (the home page). Default false: the strip is a normal section that can go anywhere on a page, with the
   * standard 200px above it and (if it is the last section) 200px below it, like every other section.
   */
  attachToFooter?: boolean;
};
