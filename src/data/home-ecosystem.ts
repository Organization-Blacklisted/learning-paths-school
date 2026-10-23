import type { EcosystemContent } from "@/types/home";

// Content from the Figma frame "Frame 1618876359" (node 6282:975), "The Ecosystem Behind LPS 360", and, since 2026-10-23, the school's own text
// for all five tabs (title, paragraph and five or four bullets each; pasted by the owner) and a photo for each tab.
//
// PHOTOS. Tab 1: the choir (cropped from the Figma image at 1.25x, compressed more than the others because it is noisy). Tabs 2 to 5: the Figma
// frames 6651:585, :586, :588 and :590, each a 1520 x 531 crop, exported at 2x and compressed to AVIF 1900 x 664 at about 45 dB (see
// scripts/README.md). Alt texts are descriptions written for the site.
//
// TAB LABELS are the school’s names (owner, 2026-10-23), which differ from the Figma design in three tabs: "Academic Framework" (Figma: "Academic
// Excellence Framework"), "Overall Well-Being Ecosystem" (Figma: "Sports and Well-Being Ecosystem") and "Social Impact and Initiatives" (Figma: "Social
// Impact and Advocacy Initiatives"). The widths are still Figma’s (fixed from 1600px wide); the new names are shorter, so they fit.
export const homeEcosystem: EcosystemContent = {
  label: "The ecosystem behind LPS 360",
  badge: "The Ecosystem Behind LPS 360",
  titleLead: "Five Foundations That Bring The",
  titleAccent: "Vision To Life",
  // Figma says "journey at PLS": a typo for LPS, corrected here (confirmed by the owner, 2026-10-23).
  intro:
    "The pillars behind the LPS360 approach, bringing together academics, wellbeing, innovation, leadership and social responsibility across a child’s journey at LPS.",
  tabsLabel: "The five foundations",
  tabs: [
    {
      id: "academic",
      label: "Academic Framework",
      width: 325,
      photo: { src: "/images/home/ecosystem/choir.avif", alt: "A school choir of students in uniform singing on a stage" },
      title: "Building strong foundations through a structured learning system.",
      text: "A 15-year academic framework connects curriculum, teaching, assessment, teacher development and student support, aligned with the NEP 2020 5+3+3+4 structure.",
      bullets: [
        "Competency-based learning and assessment",
        "LPS Teacher Standards and continuous upskilling",
        "Technology-enabled classrooms",
        "SAFAL, PISA and ASSET benchmarking",
        "Remediation, SEN support and parent partnership",
      ],
    },
    {
      id: "sports",
      label: "Overall Well-Being Ecosystem",
      width: 326,
      photo: {
        src: "/images/home/ecosystem/sports.avif",
        alt: "Students in red school polo shirts playing catch next to a yellow school bus",
      },
      title: "Developing strength, resilience and wellbeing together.",
      text: "With 100% student participation in sport, we combine structured physical development with emotional and mental wellbeing throughout the school journey.",
      bullets: [
        "Indoor and outdoor sports specialisations",
        "Morning and evening academies",
        "Zonal to international-level participation",
        "Mindfulness, counselling and life-skills support",
        "Inclusive support for diverse learning needs",
      ],
    },
    {
      id: "co-scholastic",
      label: "Co-Scholastic Programmes",
      width: 274,
      photo: {
        src: "/images/home/ecosystem/coscholastic.avif",
        alt: "Students performing in a row on a school stage, with classmates seated at the left watching",
      },
      title: "Expanding learning through exposure, choice and participation.",
      text: "Co-scholastic experiences connect classroom learning with creativity, critical thinking, collaboration and wider cultural and global exposure.",
      bullets: [
        "Business Conclave",
        "World Scholar’s Cup",
        "G20 Youth Summit",
        "Clubs Explorama with 15 specialised streams",
        "Theatre, arts, exhibitions and cultural experiences",
      ],
    },
    {
      id: "capstone",
      label: "Capstone Projects",
      width: 198,
      photo: {
        src: "/images/home/ecosystem/capstone.avif",
        alt: "Students working at computers in a school computer lab",
      },
      title: "Turning ideas and knowledge into real-world solutions.",
      text: "Students bring together independent learning, innovation and entrepreneurial thinking through projects that encourage them to solve problems, build prototypes and take ownership of ideas.",
      bullets: [
        "Vigyan Visionaries and Scintellect for STEM innovation",
        "Company programme for business and entrepreneurial exposure",
        "Technology-led real-world problem-solving",
        "Phygital Baseline integrating AI, digital and human experiences",
      ],
    },
    {
      id: "social",
      label: "Social Impact and Initiatives",
      width: 360,
      photo: {
        src: "/images/home/ecosystem/social-impact.avif",
        alt: "A young student in a red and blue padded headband speaking into a microphone in front of a painted poster",
      },
      title: "Preparing students to participate responsibly in the wider world.",
      text: "Students move from understanding social issues to taking ethical and meaningful action through service, design thinking and community participation.",
      bullets: [
        "Design thinking and innovation",
        "Student-led community service",
        "NSS and Bharat Scouts and Guides",
        "House system for belonging and collaboration",
        "Parenting community and alumni engagement",
      ],
    },
  ],
};
