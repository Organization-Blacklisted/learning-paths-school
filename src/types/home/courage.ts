/**
 * One photo of "The Courage To Find Your Path" collage. Positions and sizes are the Figma pixels inside the
 * 1548 x 747.865 collage frame; the component turns them into percentages so the collage scales as one piece.
 */
export type CouragePhoto = {
  id: string;
  /** Path under /public (AVIF, compressed from the Figma originals). */
  src: string;
  /** Natural size of the file, for next/image. */
  width: number;
  height: number;
  alt: string;
  left: number;
  top: number;
  boxWidth: number;
  boxHeight: number;
  /**
   * How the photo fills its box in the Figma design:
   * - "cover": cropped to fill (centre).
   * - "stretch": the whole photo stretched to the box (Figma does this for the chess photo, so it looks squashed).
   * - "crop": the photo is wider than its box and shifted; `imageWidth` and `imageLeft` are % of the box width.
   */
  fit: "cover" | "stretch" | "crop";
  imageWidth?: number;
  imageLeft?: number;
  /** Photo drawn above the heading text (the slide photo covers part of "Courage" in the design). */
  aboveText?: boolean;
};

export type CourageContent = {
  label: string;
  /** Grey part of the heading. Capitalised by CSS, as in the design. */
  titleLead: string;
  /** Blue part of the heading. */
  titleAccent: string;
  /**
   * How the heading comes in:
   * - "rotate": the heading is fully visible and its LAST word swaps among `rotatingWords`, like boltonschool.org (the client’s reference).
   * - "typewriter": the heading types itself, letter by letter, as the view pans to it. Kept for a possible return; not used now.
   */
  headingEffect: "rotate" | "typewriter";
  /** For "rotate": the words that take turns as the last word of `titleAccent`; the first is the real word. Fewer than two: no rotation. */
  rotatingWords?: string[];
  /** Size of the Figma collage frame, in px. */
  frame: { width: number; height: number };
  /** Figma heading: font size and top offset inside the frame, in px. */
  heading: { fontSize: number; top: number };
  photos: CouragePhoto[];
};
