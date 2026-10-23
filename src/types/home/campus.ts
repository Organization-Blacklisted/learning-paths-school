/** "A Campus Built Around Possibility": a heading, a paragraph and a 1200 x 594 media box (a poster image now, a video later). */
export type CampusContent = {
  label: string;
  badge: string;
  /** Heading: "A", the blue slanted "Campus", then "Built Around Possibility". */
  titleStart: string;
  titleAccent: string;
  titleEnd: string;
  intro: string;
  media: {
    /** Poster image, path under /public (AVIF, 1800 x 891). It is what shows until a video exists, and while it loads. */
    poster: string;
    alt: string;
    /** The video, when it exists (not yet). Plays muted, looping, only while on screen. */
    video?: { src: string; type?: string };
    /** Small label at the bottom right of the media ("In-vision 360"). */
    tag: string;
  };
};
