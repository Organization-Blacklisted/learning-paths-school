import type { FooterContent } from "@/types/footer";

// Copy and structure are from the Figma footer (node 6282:795).
// TODO: every href marked "#" is a placeholder until the page list (docs/03-sitemap.md)
// and the school's social profile URLs are confirmed.
export const footerContent: FooterContent = {
  cta: {
    eyebrow: "THE NEXT PATH COULD BEGIN HERE",
    headingStart: "Where Could Your Child’s Learning ",
    headingHighlight: "Lead",
    headingEnd: "?",
    description:
      "Visit Learning Paths School and discover an environment where strong foundations, wider experiences and thoughtful guidance come together.",
    buttonLabel: "Begin an Admission Enquiry",
    buttonHref: "#",
  },
  contact: {
    title: "Contact info",
    phone: { label: "+91-0172-5134300", href: "tel:+91-0172-5134300" },
    email: { label: "contact@learningpaths.in", href: "mailto:contact@learningpaths.in" },
    address: "Sec 67, Mohali, (Punjab), Pin-160062",
  },
  usefulLinks: {
    title: "Useful links",
    columns: [
      [
        { label: "School Timings", href: "#" },
        { label: "Holiday List", href: "#" },
        { label: "School Rules", href: "#" },
        { label: "Books List", href: "#" },
      ],
      [
        { label: "Child Safety & Well-being", href: "#" },
        { label: "Book and Uniform Design", href: "#" },
        { label: "RTI Compliance / CBSE Disclosure", href: "#" },
        { label: "School Calendar", href: "#" },
      ],
    ],
  },
  connect: {
    title: "Connect",
    social: [
      { label: "Facebook", href: "#", icon: "/images/footer/facebook.svg", size: 40, framed: true },
      { label: "YouTube", href: "#", icon: "/images/footer/youtube.svg", size: 22, framed: false },
      { label: "X", href: "#", icon: "/images/footer/x.svg", size: 20, framed: false },
      { label: "Instagram", href: "#", icon: "/images/footer/instagram.svg", size: 40, framed: true },
    ],
  },
  legal: {
    // The year is the build year (the page is prerendered), so it never goes stale after a redeploy. Figma says 2025.
    copyright: `Copyright © ${new Date().getFullYear()} Learning Paths School. All rights reserved.`,
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
  },
};
