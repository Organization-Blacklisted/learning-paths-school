import type { VisionMissionValuesContent } from "@/types/home";

// Content from the Figma frame "Frame 1618876728" (node 6507:183). The paragraph widths are the
// widths in the design (511 / 509 / 565px), which decide where the lines break.
export const homeVision: VisionMissionValuesContent = {
  label: "Our vision, mission and values",
  shield: { src: "/images/home/vision/shield.svg", width: 56, height: 86 },
  items: [
    {
      id: "vision",
      title: "Our Vision",
      text: "To create responsible, independent individuals who have the knowledge, attitude, and courage to be successful in an ever-changing world.",
      textWidth: 511,
    },
    {
      id: "mission",
      title: "Our Mission",
      text: "We aim to empower all students to be independent thinkers, lifelong learners, and responsible citizens.",
      textWidth: 509,
    },
    {
      id: "values",
      title: "Our Values",
      text: "Through enquiry, hands-on experiences and connections across subjects, we help students move beyond knowing the answer to understanding the thinking behind it.",
      textWidth: 565,
    },
  ],
};
