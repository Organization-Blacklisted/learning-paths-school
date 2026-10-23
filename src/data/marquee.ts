import type { MarqueeContent } from "@/types/marquee";

// The photo strip above the footer (Figma "Group 143", node 6282:891): six square photos in a row, 320px each at
// 1920px wide, scrolling sideways forever. Alt texts are descriptions written for the site (the design has none).
export const defaultMarquee: MarqueeContent = {
  label: "Life at Learning Paths School in pictures",
  images: [
    { id: "skating", src: "/images/marquee/skating.avif", alt: "Students roller skating on the school court" },
    { id: "stage", src: "/images/marquee/stage.avif", alt: "Students performing together on a stage" },
    { id: "race", src: "/images/marquee/race.avif", alt: "Students racing across the school sports court" },
    { id: "play", src: "/images/marquee/play.avif", alt: "A young child on a playground climbing frame" },
    { id: "music", src: "/images/marquee/music.avif", alt: "Students playing drums and keyboard in the music room" },
    { id: "parade", src: "/images/marquee/parade.avif", alt: "A school house parade marching behind a red flag" },
  ],
};
