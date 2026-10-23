export type HeroSlide = {
  id: string;
  image: {
    /** Path under /public. Already compressed, with the design's dark gradients baked in. */
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  /** First word, shown large (e.g. "Courage"). */
  title: string;
  /** Small connecting word (e.g. "that"). */
  lead: string;
  /** Amber italic quote. */
  quote: string;
  /**
   * The Figma design uses two text scales: "compact" (first slide: 72 / 28 / 64px)
   * and "large" (other slides: 80 / 32 / 72px), with slightly different positions.
   */
  scale: "compact" | "large";
};

export type HeroContent = {
  label: string;
  slides: HeroSlide[];
  /** Seconds each slide stays on screen (Figma prototype: 3.5). */
  slideSeconds: number;
  /** Seconds the change between slides takes (Figma prototype: 0.4, linear). */
  transitionSeconds: number;
};
