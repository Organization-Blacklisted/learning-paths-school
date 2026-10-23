/** One of the seven PIONEER outcomes around the LPS 360 ring. All positions are Figma px inside the 1228 x 773 diagram. */
export type FrameworkItem = {
  id: string;
  /** The letter in the circle (P, I, O, N, E, E, R). */
  letter: string;
  label: string;
  description: string;
  /** Pills on the left of the ring have the letter circle on the right (the Figma pill is mirrored). */
  mirrored: boolean;
  pill: { x: number; y: number; width: number; height: number };
  /** Pill colour (a design-system colour key). */
  tone: "blue" | "deep";
  /** Label colour. */
  labelTone: "blue" | "deep" | "night";
  /** Where the letter and the label are centred, in the pill's own (un-mirrored) coordinates, and their top offsets. */
  letterX: number;
  letterTop: number;
  labelX: number;
  labelTop: number;
  /** Short line from the pill to the ring (SVG, unmodified). */
  line: { src: string; x: number; y: number; width: number; vertical?: boolean };
  /** Dot on the ring where the line ends (SVG, unmodified). */
  dot: { src: string; x: number; y: number };
  /** The description text beside the pill. */
  text: { x: number; y: number; width: number; align: "left" | "right" | "center" };
};

export type FrameworkContent = {
  label: string;
  badge: string;
  /** Heading: grey part and blue italic part. */
  titleLead: string;
  titleAccent: string;
  intro: string;
  /** Size of the Figma diagram, in px. */
  stage: { width: number; height: number };
  ring: { src: string; x: number; y: number; width: number; height: number };
  photo: { src: string; alt: string; x: number; y: number; width: number; height: number };
  centreLabel: { text: string; x: number; y: number; width: number };
  items: FrameworkItem[];
};
