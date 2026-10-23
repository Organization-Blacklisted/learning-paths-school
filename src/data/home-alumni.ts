import type { AlumniContent } from "@/types/home";

// Content from the Figma frame "Frame 1618876383" (node 6282:755), "Their Paths Continue Long After They Leave". The two alumni are
// the ones in the design (names and universities as shown there).
export const homeAlumni: AlumniContent = {
  label: "Alumni: their paths continue long after they leave",
  badge: "BEYOND THE SCHOOL GATE",
  titleStart: "Their",
  titleAccent: "Paths Continue",
  titleSecondLine: "Long After They Leave",
  paragraphs: [
    "Achievement is not treated as a finish line. It becomes the confidence to begin again.",
    "Through alumni experiences and guidance, current students can see that there is no single definition of success. There are many meaningful paths towards it.",
  ],
  people: [
    {
      id: "maitreya-grylls",
      name: "Maitreya Grylls",
      institution: "University of Saskatchewan",
      photo: { src: "/images/home/alumni/alumnus-1.avif", alt: "Portrait of Maitreya Grylls, wearing glasses and a brown blazer" },
    },
    {
      id: "aastha-walia",
      name: "Aastha Walia",
      institution: "Michigan State University",
      photo: { src: "/images/home/alumni/alumna-1.avif", alt: "Portrait of Aastha Walia, smiling, with long dark hair" },
    },
  ],
};
