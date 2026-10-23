import type { ComponentPropsWithoutRef } from "react";

// The h2 of a section: Lexend Regular at the fluid h2 size, graphite grey. Alignment, tracking, wrapping and the data attributes for the
// animation go in `className` and the other props (they differ per design). Put an <Accent> inside it for the blue slanted word.
//
//   <SectionTitle className="text-center tracking-[-0.01em] text-balance">Vision <Accent>To Life</Accent></SectionTitle>
export default function SectionTitle({ className = "", ...rest }: ComponentPropsWithoutRef<"h2">) {
  return <h2 className={`font-heading text-h2 font-normal text-brand-graphite ${className}`} {...rest} />;
}
