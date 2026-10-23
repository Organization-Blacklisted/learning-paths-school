import type { ComponentPropsWithoutRef } from "react";

// The paragraph text of the sections: Plus Jakarta Sans at the fluid large body size with 1.5 line height. The colour is not set here
// (it is graphite, navy at 80% or white at 80% depending on the background): pass it in `className`, with the width and alignment.
//
//   <BodyText className="max-w-[471px] text-brand-graphite">…</BodyText>
export default function BodyText({ className = "", ...rest }: ComponentPropsWithoutRef<"p">) {
  return <p className={`font-body text-body-lg leading-[1.5] ${className}`} {...rest} />;
}
