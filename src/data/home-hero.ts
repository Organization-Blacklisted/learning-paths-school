import type { HeroContent } from "@/types/home";

// Content from the Figma hero component "Component 2" (variant set 6253:893, three variants).
// Timings are from its prototype: each variant changes to the next after 3.5s with a 0.4s linear
// smart-animate, looping 1 -> 2 -> 3 -> 1.
// The image alt texts are descriptions of the photos, not from Figma. Refine them with the school.
export const homeHero: HeroContent = {
  label: "Learning Paths School highlights",
  slideSeconds: 3.5,
  transitionSeconds: 0.4,
  slides: [
    {
      id: "courage",
      image: {
        src: "/images/home/hero/slide-1.avif",
        width: 1920,
        height: 993,
        alt: "A student in a red school polo running across the school sports courtyard, with classmates behind him",
      },
      title: "Courage",
      lead: "that",
      quote: "“I am enough.”",
      scale: "compact",
    },
    {
      id: "commitment",
      image: {
        src: "/images/home/hero/slide-2.avif",
        width: 1920,
        height: 993,
        alt: "Four students in navy blue school uniforms standing together",
      },
      title: "Commitment",
      lead: "that",
      quote: "“I can make an impact.”",
      scale: "large",
    },
    {
      id: "excellence",
      image: {
        src: "/images/home/hero/slide-3.avif",
        width: 1920,
        height: 993,
        alt: "A student playing an electric guitar on a stage",
      },
      title: "Excellence",
      lead: "that",
      quote: "“I can become better.”",
      scale: "large",
    },
  ],
};
