import type { NewsContent } from "@/types/home";

// Content from the Figma frame "Frame 1618876584" (node 6282:899), "What's New At LPS". The three cards are the PLACEHOLDERS of
// the design (same date, title and text three times); the real news will come from the CMS.
// TODO: the href values are placeholders until the news pages exist (docs/03-sitemap.md).
const excerpt =
  "Be it history or looking ahead in technological advance, the love of science is something that should be embraced by all. It is very import";

export const homeNews: NewsContent = {
  label: "What’s new at LPS",
  badge: "BEYOND THE SCHOOL GATE",
  titleLead: "What’s New",
  titleAccent: "At LPS",
  intro: "From student achievements and signature events to new experiences across campus, discover what is shaping our school life today.",
  items: [
    {
      id: "news-1",
      date: "September 6, 2023",
      title: "Inter House Business Conclave",
      excerpt,
      href: "#",
      photo: "/images/home/news/news-1.avif",
    },
    {
      id: "news-2",
      date: "September 6, 2023",
      title: "Inter House Business Conclave",
      excerpt,
      href: "#",
      photo: "/images/home/news/news-1.avif",
    },
    {
      id: "news-3",
      date: "September 6, 2023",
      title: "Inter House Business Conclave",
      excerpt,
      href: "#",
      photo: "/images/home/news/news-2.avif",
    },
  ],
};
