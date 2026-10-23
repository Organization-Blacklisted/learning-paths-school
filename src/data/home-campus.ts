import type { CampusContent } from "@/types/home";

// Content from the Figma frame "Frame 1618876520" (node 6282:783), "A Campus Built Around Possibility". The media box is a VIDEO in the
// design; the video does not exist yet, so a poster image (the video's frame in Figma) is shown. To add the video later: put the
// file in /public/videos/ and set `media.video` below, e.g. video: { src: "/videos/campus.mp4", type: "video/mp4" }.
export const homeCampus: CampusContent = {
  label: "A campus built around possibility",
  badge: "SPACE TO EXPLORE",
  titleStart: "A",
  titleAccent: "Campus",
  titleEnd: "Built Around Possibility",
  intro:
    "Across our three-acre campus, we bring academics, activities, collaboration and student experiences into one connected environment. Each space supports a clear purpose: helping students concentrate, participate, create, practise and connect.",
  media: {
    poster: "/images/home/campus/campus-poster.avif",
    alt: "An aerial view of the school campus: red-roofed white buildings among pine trees, with the sea beyond",
    // video: { src: "/videos/campus.mp4", type: "video/mp4" },
    tag: "In-vision 360",
  },
};
