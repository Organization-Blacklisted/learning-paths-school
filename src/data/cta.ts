import type { CtaContent } from "@/types/cta";

// The default content of the CTA band (Figma "Frame 1618876569", node 6106:1235), used when a page does not pass its own:
//   <CtaSection />                          this wording
//   <CtaSection content={{ ...defaultCta, text: "…" }} />     the same band with other copy
// TODO: the button href is a placeholder until the admissions page exists (docs/03-sitemap.md).
export const defaultCta: CtaContent = {
  label: "Admissions",
  badge: "THE NEXT CHAPTER IS STILL BEING WRITTEN",
  titleLead: "Every Generation Takes",
  titleAccent: "LPS Forward",
  // Two spaces after "more than", as in the design.
  text: "From 150 students in 2008 to a community of more than  4,000 today, the scale has changed.",
  button: { label: "Explore Admissions", href: "#" },
};
