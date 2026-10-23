import type { JourneyContent } from "@/types/home";

// Content from the Figma frame "Frame 1618876734" (node 6547:5798), "Our Learning Journey". Alt texts are
// descriptions written for the site (the design has none).
export const homeJourney: JourneyContent = {
  label: "Our learning journey",
  badge: "The 15-Year Journey",
  titleLead: "Our Learning",
  titleAccent: "Journey",
  intro: "Learning at LPS evolves with every stage, helping our students move from curiosity to independence and informed choices.",
  stages: [
    {
      id: "pre-primary",
      level: "Pre-Primary",
      range: "(Pre-Nursery to UKG)",
      pathPrefix: "The Path of",
      path: "Discovery",
      photo: { src: "/images/home/journey/discovery.avif", alt: "A young child in school uniform wearing a lanyard and a backpack" },
      tone: "mist",
      captionWidth: 130,
      smallLastPrefixLetter: true,
    },
    {
      id: "primary",
      level: "Primary",
      range: "(Classes I to V)",
      pathPrefix: "The Path of",
      path: "Foundation",
      photo: { src: "/images/home/journey/foundation.avif", alt: "A smiling primary school girl sitting at her desk in class" },
      tone: "steel",
      captionWidth: 130,
    },
    {
      id: "secondary",
      level: "Secondary",
      range: "(Classes VI to X)",
      pathPrefix: "The Path of",
      path: "Independence",
      photo: { src: "/images/home/journey/independence.avif", alt: "A smiling secondary school boy wearing safety glasses in a lab" },
      tone: "slate",
      captionWidth: 172,
    },
    {
      id: "senior-secondary",
      level: "Senior Secondary",
      range: "(Classes XI and XII)",
      pathPrefix: "The Path of",
      path: "Direction",
      photo: { src: "/images/home/journey/direction.avif", alt: "A senior school girl in a blazer holding a folder" },
      tone: "blue",
      captionWidth: 172,
    },
  ],
};
