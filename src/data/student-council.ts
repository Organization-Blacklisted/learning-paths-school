import type { SplitFeatureDesign } from "@/types/split-features";
import type { StudentCouncilContent } from "@/types/student-council";

// The Student Council page (Figma node 5896:2063, 1920px frame). These are the defaults: the CMS (src/globals/StudentCouncil.ts) overrides what an editor
// changes (src/lib/api/student-council-map.ts), and this is what the page shows when the CMS has nothing or cannot be read.
//
// Text from the design as written (including "Head Boy and Head Girl And Student President and Vice President" and the last paragraph that ends without a
// full stop: an editor can change them in the CMS). Mine, not from the design: the accessible names (the sections' names and the photos' descriptions) and
// the page's title and description for search engines.
//
// Each row's `design` is where Figma puts that row's text: the third row's column is wider and a little further from its photo (the author placed them by
// hand). The values are used by index; a row an editor adds after the third gets GENERIC_FEATURE_DESIGN.

const IMAGES = "/images/student-council";

/** The design values of a row that has none of its own (a row an editor adds): the values of the first two designed rows. */
export const GENERIC_FEATURE_DESIGN: SplitFeatureDesign = { gap: 81, textWidth: 532 };

export const defaultStudentCouncil: StudentCouncilContent = {
  hero: {
    label: "Student council",
    badge: "STUDENT COUNCIL",
    titleLead: "Nurturing Leadership and",
    titleAccent: "Growth",
    subtitle: "Empowering students to lead, represent and inspire",
  },
  intro: {
    label: "Early leadership",
    image: {
      src: `${IMAGES}/early-leadership.avif`,
      alt: "Four students in navy blazers sit and stand around a smiling teacher in a grey jacket and pink scarf, talking, in a school hall",
      width: 2000,
      height: 951,
    },
    titleAccent: "Early Leadership",
    titleRest: "With Learning Paths School Student Council",
    text: "Leadership takes root in the early years of development at Learning Paths School, where we are committed to nurturing qualities that shape exceptional individuals. Guided by our core values of Courage, Commitment, Excellence, Respect, and Opportunity, we illuminate the path to holistic development. This commitment comes to life through our Student Council at 3 levels – primary, secondary and senior secondary.",
    titlePosition: "below",
    photoHeight: 723,
  },
  features: {
    label: "How the Student Council works",
    rows: [
      {
        image: {
          src: `${IMAGES}/democracy.avif`,
          alt: "A teacher in a turban speaks to a classroom of girls in school uniform, who sit with their backs to the camera, beside a microphone on a stand",
          width: 1554,
          height: 1130,
        },
        title: "Fostering Democracy and Responsibility",
        text: "Comprising representatives elected by their peers and nominated by our dedicated House Masters and teachers, the Council embodies our commitment to respect and opportunity. Each elected student is given ten days to engage with their peers and advocate for their positions.",
        design: { gap: 81, textWidth: 532 },
      },
      {
        image: {
          src: `${IMAGES}/voting.avif`,
          alt: "Students in uniform stand and sit on the stage of a school auditorium in front of a projected screen, with blue steps and speakers in front of the stage",
          width: 1400,
          height: 1018,
        },
        title: "Voting for Voices, Electing Change",
        text: "On a designated day, our students exercise their voices electronically, casting their votes for the candidates of their choice. This empowering practice cultivates the values of courage and commitment as our students actively participate in the process of change and leadership, making them feel valued and integral to the school’s operations.",
        design: { gap: 81, textWidth: 532 },
      },
      {
        image: {
          src: `${IMAGES}/student-experience.avif`,
          alt: "The Learning Paths School crest, with its laurel leaves and the words Courage Conquers All, on a wooden lectern, with students on the stage behind it",
          width: 1554,
          height: 1130,
        },
        title: "Guiding the Student Experience",
        text: "At the helm of the Students’ Council stand the Head Boy and Head Girl And Student President and Vice President. They exemplify excellence and embody the values that define our school. Their role extends Student Council beyond titles—they act as a bridge between the student body and the school authorities, fostering mutual understanding and collaboration",
        design: { gap: 88, textWidth: 572 },
      },
    ],
  },
  gallery: {
    label: "The Student Council",
    image: {
      src: `${IMAGES}/student-council.avif`,
      alt: "The whole Student Council: students in navy blazers standing in rows and teachers seated in front, under a green Learning Paths School banner",
      width: 1720,
      height: 885,
    },
    titleAccent: "LPS Student",
    titleRest: "Council",
    titlePosition: "above",
    photoHeight: 782,
  },
};

export const defaultStudentCouncilSeo = {
  title: "Student Council | Learning Paths School",
  description:
    "The Student Council of Learning Paths School, Mohali: representatives elected by their peers at three levels, voting online, and led by the Head Boy, Head Girl, Student President and Vice President.",
};
