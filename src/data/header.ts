import type { HeaderContent } from "@/types/header";

// Content from the Figma header (nodes 6282:929 transparent, 5688:14371 solid).
// TODO: the admissions href is a placeholder until the page list (docs/03-sitemap.md) is confirmed.
export const headerContent: HeaderContent = {
  logo: {
    src: "/images/header/lps-logo-v2.svg",
    width: 353,
    height: 52,
    homeLabel: "Learning Paths School, home",
  },
  admissions: { label: "Admissions Open", href: "#" },
  menu: { openLabel: "Open menu" },
};
