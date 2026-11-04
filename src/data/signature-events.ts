import type { AlternatingRowDesign } from "@/types/alternating-rows";
import type { SignatureEventsContent } from "@/types/signature-events";

// The Signature Events page (Figma node 5894:1875, 1920px frame). These are the defaults: the CMS (src/globals/SignatureEvents.ts) overrides what an editor
// changes (src/lib/api/signature-events-map.ts), and this is what the page shows when the CMS has nothing or cannot be read.
//
// Text from the design as written (including the closing quote mark after the first paragraph, the capital letters of the last one and the Company
// Program paragraph that repeats the Primary School Annual Show's: an editor can change them in the CMS). Mine, not from the design: the accessible names
// (the section's name and the photos' descriptions) and the page's title and description for search engines.
//
// Each row's `design.titleWidth` is the width the author gave that heading's text in Figma (which decides where it breaks). The values are used by index;
// a row an editor adds after the ninth gets GENERIC_EVENT_DESIGN (the width of the text column).

const IMAGES = "/images/signature-events";

/** The design values of a row that has none of its own (a row an editor adds): the heading as wide as the text column. */
export const GENERIC_EVENT_DESIGN: AlternatingRowDesign = { titleWidth: 564 };

export const defaultSignatureEvents: SignatureEventsContent = {
  hero: {
    label: "Signature events",
    badge: "SIGNATURE EVENTS",
    titleLead: "Moments",
    titleAccent: "That Inspire",
    subtitle: "Celebrating moments of learning, creativity and connection",
  },
  events: {
    label: "The signature events of Learning Paths School",
    rows: [
      {
        image: {
          src: `${IMAGES}/pre-primary-show.avif`,
          alt: "Young children in colourful costumes perform on a stage in front of a screen showing the Learning Paths School crest and fireworks",
          width: 960,
          height: 614,
        },
        title: "Pre-Primary Annual Show",
        text: "Our Pre-Primary Annual Show is a delightful extravaganza that captures the innocence and imagination of our youngest learners. Year after year, this event becomes truly special as you witness adorable performances and heartwarming moments that leave a lasting impression.”",
        design: { titleWidth: 505.68 },
      },
      {
        image: {
          src: `${IMAGES}/primary-show.avif`,
          alt: "Students in leaf and animal costumes act out a scene on a dark stage with a painted mountain backdrop, lit in red and blue",
          width: 1636,
          height: 1046,
        },
        title: "Primary School Annual Show",
        text: "At our Primary School Annual Show, our young talents take center stage to showcase their creativity and skills. These enchanting performances are a celebration of the vibrant spirit of our students, making it an unforgettable experience.",
        design: { titleWidth: 420.57 },
      },
      {
        image: {
          src: `${IMAGES}/world-scholars-cup.avif`,
          alt: "Two teachers and four students in school uniform hold up a golden trophy in front of a red World Scholar’s Cup qualifiers banner",
          width: 1080,
          height: 690,
        },
        title: "World Scholar’s Cup- Regional Round",
        text: "World Scholars Cup at Learning Paths School is a remarkable event that mirrors the spirit of global learning and camaraderie. With students hailing from diverse backgrounds, this annual international academic program is a testament to our commitment to providing unique educational experiences.",
        design: { titleWidth: 528.6 },
      },
      {
        image: {
          src: `${IMAGES}/athletic-meet.avif`,
          alt: "Students in sports kit and teachers stand in a line on a red carpet on the grass, holding trophies, under the Learning Paths School Annual Athletic Meet 2023 banner",
          width: 1000,
          height: 639,
        },
        title: "School Athletic Meet",
        text: "Our Annual Athletic Meet embodies the true spirit of sportsmanship and athleticism. Students compete in various events, showcasing dedication and teamwork while fostering a culture of sportsmanship, team spirit, and physical fitness within our school community.",
        design: { titleWidth: 417.99 },
      },
      {
        image: {
          src: `${IMAGES}/club-explorama.avif`,
          alt: "A guest in a brown cardigan and a student in a navy blazer look at a science exhibit at a club stall, in a warmly lit hall",
          width: 1636,
          height: 1046,
        },
        title: "Club Explorama - Showcase of club activities",
        text: "Club Explorama is where talents flourish and passions ignite. It’s our annual captivating showcase of diverse club activities, where students display their creativity, leadership, and teamwork, exemplifying the essence of holistic education.",
        design: { titleWidth: 558.69 },
      },
      {
        image: {
          src: `${IMAGES}/achievers-day.avif`,
          alt: "Students in white shirts sit in two rows with teachers in the middle, posing together on a stage",
          width: 1636,
          height: 1046,
        },
        title: "Achiever’s Day",
        text: "Achiever’s Day is a day of recognition and inspiration where we celebrate the accomplishments of our students. It’s a day to honor their hard work, determination, and commitment to excellence, serving as a source of motivation for the next generation of high achievers.",
        design: { titleWidth: 417.99 },
      },
      {
        image: {
          src: `${IMAGES}/company-program.avif`,
          alt: "Smiling students in school uniform stand behind baskets and trays of rolled newspaper crafts they made",
          width: 1124,
          height: 719,
        },
        title: "Company Program",
        text: "At our Primary School Annual Show, our young talents take center stage to showcase their creativity and skills. These enchanting performances are a celebration of the vibrant spirit of our students, making it an unforgettable experience.",
        design: { titleWidth: 374.68 },
      },
      {
        image: {
          src: `${IMAGES}/community-service.avif`,
          alt: "Students in light shirts and navy trousers kneel and stand in rows in a classroom in front of a green board that reads Community Service Project",
          width: 1024,
          height: 655,
        },
        title: "Community service program",
        text: "World Scholars Cup at Learning Paths School is a remarkable event that mirrors the spirit of global learning and camaraderie. With students hailing from diverse backgrounds, this annual international academic program is a testament to our commitment to providing unique educational experiences.",
        design: { titleWidth: 567.68 },
      },
      {
        image: {
          src: `${IMAGES}/business-conclave.avif`,
          alt: "Tall purple and pink letters spelling LPS Business Conclave stand on a paved courtyard in front of a school building",
          width: 960,
          height: 614,
        },
        title: "LPS Business Conclave",
        text: "In Today’s Scenario Where Times And Issues Have Changed And Affected The Way We Think, Live And Work, A Student’s Experience Of A School Life Can’t Be Left Limited To Purely Academic Activities And Doing Well In The Examination. With An Alarming Increase In Proportion Of Unemployable Graduates Across Majority Of The Industries, It’s High Time That We Realise Sooner Than Later That We Need To Change Drastically The Way We Educate Our Children, Else, We Will Remain In The Business Of Producing Redundant Students.",
        design: { titleWidth: 511.84 },
      },
    ],
  },
};

export const defaultSignatureEventsSeo = {
  title: "Signature Events | Learning Paths School",
  description:
    "The signature events of Learning Paths School, Mohali: the Pre-Primary and Primary Annual Shows, World Scholar’s Cup, the Athletic Meet, Club Explorama, Achiever’s Day, the Company and Community Service programmes and the LPS Business Conclave.",
};
