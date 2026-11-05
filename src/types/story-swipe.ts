export type StorySlide = {
  image: { src: string; alt: string; width: number; height: number };
  /** The period the slide tells about, in green over the timeline ("2008–2016"). */
  period: string;
  /** The story of the period. A line break starts a new line without the space between paragraphs. */
  text: string;
};

/** The reusable story swipe section: a heading and slides of a photo and a story along a timeline; pinned while the page scrolls sideways through the slides. */
export type StorySwipeContent = {
  /** Accessible name of the section. */
  label: string;
  /** First part of the heading (grey). */
  titleLead: string;
  /** Last part of the heading (blue, slanted). */
  titleAccent: string;
  slides: StorySlide[];
};
