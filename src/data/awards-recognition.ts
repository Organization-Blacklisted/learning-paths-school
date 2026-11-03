import type { AwardDesign } from "@/types/awards";
import type { AwardsRecognitionContent } from "@/types/awards-recognition";

// The Awards & Recognition page (Figma node 5893:1651, 1920px frame). These are the defaults: the CMS (src/globals/AwardsRecognition.ts) overrides what
// an editor changes (src/lib/api/awards-recognition-map.ts), and this is what the page shows when the CMS has nothing or cannot be read.
//
// Text from the design as written, with these exceptions:
//  - "Achievers' Awards" has a typographic apostrophe, like the paragraph under it and the rest of the site.
//  - The paragraph of "Student Awards" is CUT OFF in the design ("... showcasing their e"). It ends here with "exceptional talents": MINE, to be confirmed
//    with the school (an editor can change it in the CMS).
// Mine, not from the design: the accessible names (the section's name and the photos' descriptions) and the page's title and description for search engines.
//
// Each block's `design` is where Figma puts that block's text and laurels (the author nudged them by hand, so the values differ from block to block). They
// are used by index; a block an editor adds after the third gets GENERIC_DESIGN.

const AWARDS = "/images/awards";

/** The design values of a block that has none of its own (an award an editor adds): the values of the last designed block. */
export const GENERIC_DESIGN: AwardDesign = { textWidth: 659, textTop: 7, laurelTop: 0 };

export const defaultAwardsRecognition: AwardsRecognitionContent = {
  hero: {
    label: "Awards and recognition",
    badge: "AWARDS & RECOGNITION",
    titleLead: "Celebrating Excellence,",
    titleAccent: "Impact and Achievement",
    subtitle: "Recognising milestones that reflect our commitment",
  },
  awards: {
    label: "Our awards",
    awards: [
      {
        image: {
          src: `${AWARDS}/school-awards.avif`,
          alt: "A framed Education World India School Rankings 2023-24 certificate naming Learning Paths School, Mohali, fourth among the co-ed day schools of Punjab",
          width: 1848,
          height: 1170,
        },
        title: "School Awards",
        text: "Learning Paths School (LPS) has consistently maintained its position as the No. 1 CBSE school for the last five years, as given by India’s leading education magazine – Education World. With this recognition, our journey unfolds with additional accolades in various other domains in Mohali, showcasing our unwavering commitment to excellence in education",
        design: { textWidth: 643, textTop: 0, laurelTop: 12 },
      },
      {
        image: {
          src: `${AWARDS}/student-awards.avif`,
          alt: "A smiling student holding two award certificates in front of a wall of event logos",
          width: 1848,
          height: 1170,
        },
        title: "Student Awards",
        text: "Our students continually shine on regional, state, and national platforms. They’ve garnered acclaim at district and interschool competitions, showcasing their exceptional talents.",
        design: { textWidth: 642, textTop: 13, laurelTop: 0 },
      },
      {
        image: {
          src: `${AWARDS}/achievers-awards.avif`,
          alt: "A young student smiling and holding an award plaque between two guests at an awards ceremony",
          width: 1848,
          height: 1170,
        },
        title: "Achievers’ Awards",
        text: "At Learning Paths School, we nurture excellence within our students. Our Achievers’ Awards program is a powerful motivator, encouraging students to excel academically and in extracurricular activities. These awards boost confidence and foster healthy competition among our students.",
        design: { textWidth: 659, textTop: 7, laurelTop: 0 },
      },
    ],
  },
};

/** The page’s own title and description for search engines, used while the SEO tab of the CMS is empty. */
export const defaultAwardsRecognitionSeo = {
  title: "Awards & Recognition | Learning Paths School",
  description:
    "Learning Paths School, Mohali, has been ranked the No. 1 CBSE school for five years running. See the school’s awards, its students’ achievements and the Achievers’ Awards programme.",
};
