import Container from "@/components/layouts/Container";
import type { SectionProps } from "./Section.types";

// The standard page section: consistent vertical spacing and the main content container, in one place.
// Brief: main container 1520px, section-to-section spacing 200px (desktop). Both come from shared tokens,
// so changing them changes every section.
//
//   <Section label="Our values">…</Section>
//   <Section spacing="none" contained={false}>…full-bleed…</Section>
//
// Spacing: every section starts one --spacing-section (200px at desktop) below whatever is above it
// (the hero, or the previous section), and the LAST section on a page also gets one --spacing-section
// below it, before the footer (`last:pb-section`, which applies when the section is the last child of
// its parent, normally <main>). So between two sections there is exactly one gap, never two.
export default function Section({ children, label, className = "", spacing = "default", contained = true, contentWidth }: SectionProps) {
  return (
    <section aria-label={label} className={`${spacing === "default" ? "pt-section last:pb-section" : ""} ${className}`}>
      {contained ? <Container contentWidth={contentWidth}>{children}</Container> : children}
    </section>
  );
}
