import type { MenuContent, MenuLink, MenuSection } from "@/types/menu";

// Content of the mega menu (Figma node 6783:1333, 1920px frame). Managed from the codebase only (owner, 2026-10-29), not in the CMS.
//
// The eight main items and every link under them are the owner's final list (2026-10-29). Spelling and capitals are the owner's, as given.
//
// TODO: every `href` is "#" until the pages exist (docs/03-sitemap.md); then they become the real addresses. "Contact us" (twice) is /contact-us and "Principal’s Welcome" is /principals-welcome "Partnerships" is /partnerships and "Awards & Recognition" is /awards-recognition since 2026-11-02.

const link = (id: string, label: string): MenuLink => ({ id, label, href: "#" });

const sections: MenuSection[] = [
  {
    id: "about-us",
    label: "About Us",
    links: [
      link("welcome", "Welcome to LPS"),
      { ...link("principal", "Principal’s Welcome"), href: "/principals-welcome" },
      { ...link("partnerships", "Partnerships"), href: "/partnerships" },
      link("campus", "Campus Experience"),
      { ...link("awards", "Awards & Recognition"), href: "/awards-recognition" },
      link("signature-events", "Signature Events"),
      link("student-council", "Student Council"),
      link("information-desk", "Information Desk"),
    ],
  },
  {
    id: "admissions",
    label: "Admissions",
    links: [
      link("why-lps", "Why LPS"),
      link("overview", "Admissions Overview"),
      link("class-xi", "Admission to Class XI"),
      link("student-services", "Student Services"),
      link("enquire", "Enquire Now"),
    ],
  },
  {
    id: "pre-primary",
    label: "Pre-Primary",
    links: [
      link("welcome", "Welcome to LPS Pre-Primary"),
      link("learning", "Learning Approach"),
      link("student-life", "Student Life"),
      link("events", "Events & Celebrations"),
    ],
  },
  {
    id: "primary",
    label: "Primary",
    links: [
      link("welcome", "Welcome to LPS Primary"),
      link("learning", "Learning Approach"),
      link("student-life", "Student Life"),
      link("events", "Events & Celebrations"),
      link("inter-house", "Inter House Activities"),
    ],
  },
  {
    id: "secondary",
    label: "Secondary",
    links: [
      link("welcome", "Welcome to LPS Secondary"),
      link("learning", "Learning Approach"),
      link("student-life", "Student Life"),
      link("clubs", "Clubs"),
      link("events", "Events & Celebrations"),
      link("inter-house", "Inter House Activities"),
    ],
  },
  {
    id: "xi-xii",
    label: "XI & XII",
    links: [
      link("welcome", "Welcome to LPS Senior Secondary"),
      link("academic-framework", "Academic Framework"),
      link("commerce", "Department of Commerce"),
      link("humanities", "Department of Humanities"),
      link("science", "Department of Science"),
      link("business-conclave", "LPS Business Conclave"),
      link("career-readiness", "Career Readiness Programme"),
    ],
  },
  {
    id: "alumni",
    label: "Alumni",
    links: [link("guidance", "Alumni Guidance"), link("stories", "Success Stories")],
  },
  {
    id: "connect",
    label: "Connect",
    links: [link("news", "News & Events"), link("careers", "Careers"), { ...link("contact", "Contact Us"), href: "/contact-us" }],
  },
];

export const menuContent: MenuContent = {
  label: "Main menu",
  closeLabel: "Close menu",
  sections,
  utility: { parentLogin: link("parent-login", "Parent Login"), contact: { ...link("contact", "Contact us"), href: "/contact-us" } },
  actions: { enquiry: link("enquiry", "Begin an Admission Enquiry"), career: link("career", "Career") },
};
