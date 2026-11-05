import type { CrestCardDesign } from "@/types/crest-cards";
import type { WelcomeToLpsContent } from "@/types/welcome-to-lps";

// The Welcome to LPS page (Figma node 5688:14367, 1920px frame). These are the defaults: the CMS (src/globals/WelcomeToLps.ts) overrides what an editor changes
// (src/lib/api/welcome-to-lps-map.ts), and this is what the page shows when the CMS has nothing or cannot be read.
//
// Text from the design as written (including "others –friends" in the first value). The texts of the other three values are the school's current website's
// (the owner sent them as a screenshot, 2026-11-04). The STORY's three slides are real: the first is the design's; the second and third are the owner's (2026-11-05: the
// texts and the two photos, Figma nodes 6983:584 and 6983:587). Mine, not from the design: the accessible names (the sections' names and the
// photos' descriptions) and the page's title and description for search engines.
//
// Each crest card's `design` is where Figma puts that card's title and paragraph: the "Our Vision" title is in a narrow box so it breaks on two lines, the
// "Our Mission" one is wider so it stays on one (the author set them by hand). The values are used by index; a card an editor adds after the second gets
// GENERIC_CREST_DESIGN.

const IMAGES = "/images/welcome";

/** The design values of a card that has none of its own (a card an editor adds): the title in a box as wide as "Our Mission", the paragraph as wide as its column. */
export const GENERIC_CREST_DESIGN: CrestCardDesign = { titleWidth: 200.79, textWidth: 365 };

export const defaultWelcomeToLps: WelcomeToLpsContent = {
  hero: {
    label: "About us",
    badge: "ABOUT US",
    titleLead: "A Legacy of",
    titleAccent: "Purposeful Learning",
    subtitle: "Inspiring curiosity, capability and confidence",
    image: {
      src: `${IMAGES}/hero.avif`,
      alt: "Rows of students in blue uniforms stand on a school field; at the front one carries a blue flag and another a sign that reads JAL HOUSE",
      width: 1880,
      height: 720,
    },
  },
  intro: {
    label: "About Learning Paths School",
    paragraphs: [
      "A place founded by a passionate team of Social Entrepreneurs who believe in the power of education. More than just a school, we are a community dedicated to shaping the future of our students.",
      "Located on a sprawling 3-acre campus, Learning Paths School (LPS) Mohali is renowned as one of the finest CBSE schools, offering high-quality education from Pre-Nursery to Class XII. With top-notch facilities, a comprehensive academic program, and a strong team of dedicated teachers, LPS Mohali has become the preferred choice for families in and around Mohali. Our focus on holistic development, supported by a wide range of extracurricular activities, ensures that students thrive academically, socially, and emotionally.",
    ],
  },
  banner: {
    label: "The LPS community",
    image: {
      src: `${IMAGES}/choir.avif`,
      alt: "Young students in white shirts and navy uniforms stand in rows on a stage, singing, beside a wooden lectern with the school crest",
      width: 1800,
      height: 873,
    },
    titlePosition: "below",
    photoHeight: 737,
  },
  crests: {
    label: "Our vision and mission",
    cards: [
      {
        image: {
          src: `${IMAGES}/vision.avif`,
          alt: "A blue shield with an eye on it, between two laurel branches",
          width: 730,
          height: 626,
        },
        title: "Our Vision",
        text: "To create responsible, independent individuals who have the knowledge, attitude, and courage to be successful in an ever-changing world.",
        design: { titleWidth: 132.36, textWidth: 423 },
      },
      {
        image: {
          src: `${IMAGES}/mission.avif`,
          alt: "A blue shield with a flag on a mountain top, between two laurel branches",
          width: 730,
          height: 626,
        },
        title: "Our Mission",
        text: "We aim to empower all students to be independent thinkers, lifelong learners, and responsible citizens.",
        design: { titleWidth: 200.79, textWidth: 365 },
      },
    ],
  },
  welcome: {
    label: "Welcome to Learning Paths School",
    image: {
      src: `${IMAGES}/principal.avif`,
      alt: "Mrs. Vandana Saxena, the Principal, stands in a striped shirt and a navy waistcoat in front of a framed painting",
      width: 1203,
      height: 1263,
    },
    titleLead: "Welcome To",
    titleAccent: "Learning Paths School",
    paragraphs: [
      "At LPS, we believe in preparing learners for the world they aspire to shape. Join us as we foster a generation of dreamers, thinkers, and changemakers who will reimagine the future.",
    ],
    signatory: { name: "Mrs. Vandana Saxena", role: "Principal" },
  },
  values: {
    label: "Our values",
    title: "Guided by",
    items: [
      {
        title: "Courage & Commitment",
        text: "We value the courage required for one to find their path and the ability to commit to it while also lending a helping hand to others –friends and colleagues – who need it.",
      },
      {
        title: "Courage & Respect",
        text: "We value the courage that is required to be respectful and mindful of differing opinions, cultures and traditions. We value those who respect the school, its properties and its environs.",
      },
      {
        title: "Courage & Excellence",
        text: "We value the courage required to dedicate pursue excellence in all facets of life. We respect the drive for distinction that results in a well-rounded personality.",
      },
      {
        title: "Courage & Opportunity",
        text: "We value the courage required to go out of comfort zones and grab opportunities no matter how daunting they may seem. We value the ability to recognise strengths, as well as, that of recognising weaknesses and improving upon them.",
      },
    ],
  },
  story: {
    label: "Our story",
    titleLead: "A Story",
    titleAccent: "That Keeps Growing",
    slides: [
      {
        image: {
          src: `${IMAGES}/story-2008.avif`,
          alt: "A woman in a blue shawl receives a trophy from two men in dark suits, with a man in a turban beside them, in front of a blue backdrop marked 2013",
          width: 1260,
          height: 675,
        },
        period: "2008–2016",
        text: "Learning Paths School, originally established as The Millennium School in Sector 67, Mohali, began its journey on April 7, 2008, with 150 students and 16 dedicated teachers under the leadership of Principal Mrs. Komal Singh.\nBy 2010, the school earned CBSE affiliation, marking a significant milestone. In 2012, the school celebrated its first batch of Board exam results, showcasing outstanding academic performance. The same year, it received the prestigious International School Award and an ‘Award of Honour’ from the Punjab Pollution Control Board.\nIn 2013, the school’s commitment to sustainability and technological advancement gained national acclaim, earning the ‘Shiksha Ratan Award’ for IT excellence.",
      },
      {
        image: {
          src: `${IMAGES}/story-2016.avif`,
          alt: "Four women and a man stand together on a stage; the woman at the left holds a framed International School Award certificate, in front of a backdrop that reads International School Award, 2018–2021",
          width: 1260,
          height: 675,
        },
        period: "2016–2021",
        text: "Learning Paths School underwent a significant transformation in 2016 when it rebranded itself and introduced Class XI Commerce, quickly earning the title of the No. 1 school in Mohali. In 2017, the school expanded its academic offerings by launching Class XI Humanities and hosted a successful Alumni Meet, further solidifying its reputation.\nIn 2018, under the visionary leadership of Mrs. Nutan Budhiraja, the school not only retained its No. 1 ranking in Mohali but also achieved re-certification for the British Council’s International School Award (2018-2021), showcasing its commitment to global standards in education.\nIn 2020, amid the challenges of the pandemic, the school demonstrated resilience and innovation by seamlessly transitioning to online education, placing a strong emphasis on technology and adaptability to ensure uninterrupted learning.",
      },
      {
        image: {
          src: `${IMAGES}/story-2021.avif`,
          alt: "A woman in a peach saree and a man in a dark suit hold a round award plaque together on a stage, in front of a purple backdrop and a banner of partners",
          width: 1260,
          height: 675,
        },
        period: "2021–Onwards",
        text: "In 2021, Learning Paths School introduced the science stream for Classes 11 and 12 under the AGILE framework, offering a comprehensive CBSE curriculum. By 2023, the first Nursery batch graduated from Class 12, and Ms. Vandana Saxena assumed the role of School Principal. The school celebrated its 15th anniversary, now educating over 2,000 students and employing more than 300 staff members.",
      },
    ],
  },
};

export const defaultWelcomeToLpsSeo = {
  title: "Welcome to LPS | Learning Paths School",
  description:
    "Learning Paths School, Mohali: a CBSE school from Pre-Nursery to Class XII on a 3-acre campus, founded by social entrepreneurs in 2008. Our vision, our mission, our values and the story of how the school keeps growing.",
};
