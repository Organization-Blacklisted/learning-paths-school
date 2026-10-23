/** One photo of the scrolling photo strip (src/components/sections/shared/MarqueeSection). */
export type MarqueeImage = {
  id: string;
  /** Path under /public: a square (640 x 640, shown at up to 320px), already compressed. */
  src: string;
  alt: string;
};

export type MarqueeContent = {
  /** Accessible name of the strip. */
  label: string;
  images: MarqueeImage[];
};
