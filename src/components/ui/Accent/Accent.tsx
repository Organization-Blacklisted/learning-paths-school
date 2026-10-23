import type { ComponentPropsWithoutRef } from "react";

// The blue slanted word inside a heading ("Our Learning *Journey*", "A *Campus* Built Around Possibility"): Lexend Medium, blue, slanted
// by skewX(-8deg) and squashed to 99% (the font has no italic, the design's italic look is made this way).
// The small margins and nudges differ from heading to heading in the designs: they go in `className` (margin, tracking, translate).
export default function Accent({ className = "", ...rest }: ComponentPropsWithoutRef<"span">) {
  return <span className={`inline-block font-medium text-brand-blue [transform:skewX(-8deg)_scaleY(0.99)] ${className}`} {...rest} />;
}
