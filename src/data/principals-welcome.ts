import type { PrincipalsWelcomeContent } from "@/types/principals-welcome";

// The Principal's Welcome page (Figma node 5748:2, 1920px frame). These are the defaults: the CMS (src/globals/PrincipalsWelcome.ts) overrides what
// an editor changes (src/lib/api/principals-welcome-map.ts), and this is what the page shows when the CMS has nothing or cannot be read.
//
// Text from the design as written (typographic quotes and apostrophes included). Mine, not from the design: the accessible names (the section's
// name and the portrait's description). The call to action and the photo strip are the site's standard ones (src/data/cta.ts, marquee.ts).

export const defaultPrincipalsWelcome: PrincipalsWelcomeContent = {
  hero: {
    label: "From the Principal’s desk",
    badge: "FROM THE PRINCIPAL’S DESK",
    titleLead: "Leading with Purpose",
    titleAccent: "Inspiring Growth.",
    subtitle: "A vision for meaningful learning and lifelong growth",
  },
  message: {
    label: "A message from the Principal",
    image: {
      src: "/images/principal/portrait.avif",
      alt: "Mrs. Vandana Saxena, the Principal of Learning Paths School, standing with her arms folded and smiling",
      width: 1166,
      height: 1224,
    },
    titleLead: "“How can I win medals,",
    titleAccent: "Ma’am?”",
    paragraphs: [
      "This question from an eight-year-old during a casual corridor walk left a lasting impression on me. It reminded me of the immense potential within every child and inspired my mission to create education systems that unlock dreams and possibilities.",
      "At LPS, we believe in preparing learners for the world they aspire to shape. Grounded in universal human values, our journey began with a vision: to make values the foundation of education. These values have since guided every aspect of our learning environment, from academic innovation to emotional and social growth.",
      "One transformative step was reimagining our counseling cell—not just as a support system but as a space to empower every child with the belief, “I am enough.” By championing initiatives like student-led anti-bullying campaigns and fostering resilience, we equip learners to navigate life with confidence.",
      "We’ve also enriched our curriculum by integrating art into STEAM learning and shifting to student-led classrooms. These innovations spark curiosity, critical thinking, and joy in learning. At the same time, we prioritize teacher well-being and work-life balance, nurturing a culture where creativity thrives.",
      // The design's last paragraph is two lines of text with no space between them: "Join us ..." starts a new line.
      "Collaboration with parents, through workshops and shared goals, strengthens our efforts to raise resilient, capable learners ready to embrace challenges. Together, we celebrate the magic of “Aha!” moments that fuel inspiration and growth.\nJoin us as we foster a generation of dreamers, thinkers, and changemakers who will reimagine the future.",
    ],
    signatory: { name: "Mrs. Vandana Saxena", role: "Principal" },
  },
};

/** The page’s own title and description for search engines, used while the SEO tab of the CMS is empty. */
export const defaultPrincipalsWelcomeSeo = {
  title: "Principal’s Welcome | Learning Paths School",
  description:
    "A message from Mrs. Vandana Saxena, the Principal of Learning Paths School, Mohali: a vision for meaningful learning, values at the heart of education and lifelong growth.",
};
