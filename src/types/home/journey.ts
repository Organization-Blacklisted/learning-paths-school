export type JourneyStage = {
  id: string;
  /** "Pre-Primary" (capitalised by CSS, as in the design). */
  level: string;
  /** "(Pre-Nursery to UKG)", uppercased by CSS. */
  range: string;
  /** Caption, small spaced capitals, e.g. "The Path of". */
  pathPrefix: string;
  /** Caption, the word below it, e.g. "Discovery". */
  path: string;
  photo: {
    /** Path under /public: the Figma photo cropped to its 171 x 343 slot at 2x, AVIF. */
    src: string;
    alt: string;
  };
  /** Column colour. The key is a name for a colour in the design system (see JourneySection). */
  tone: "mist" | "steel" | "slate" | "blue";
  /** Width of the caption in px at desktop, from the design (it decides where the caption wraps). */
  captionWidth: number;
  /**
   * The Figma caption of the first column has its last letter ("f" of "Path of") one size smaller than the rest
   * (12px, other letters 14px), probably a slip in the design. It is reproduced to match; set false to drop it.
   */
  smallLastPrefixLetter?: boolean;
};

export type JourneyContent = {
  label: string;
  /** Green pill above the heading. */
  badge: string;
  /** Heading: grey part and blue italic part ("Our Learning" + "Journey"). */
  titleLead: string;
  titleAccent: string;
  intro: string;
  stages: JourneyStage[];
};
