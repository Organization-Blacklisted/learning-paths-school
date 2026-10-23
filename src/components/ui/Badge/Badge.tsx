import type { ComponentPropsWithoutRef } from "react";

// The green pill that introduces a section ("The 15-Year Journey", "The LPS 360 Framework"): Plus Jakarta Sans
// SemiBold 18px, uppercase, white at 97%, 35px high, fully rounded (Figma "Frame 1618876268").
// size="compact" is the variant on the CTA band (Figma "Frame 1618876269"): Regular 17px, 33px high, text as written.
// The height is a minimum: on a narrow screen a long text wraps onto two lines and the pill grows.
// Extra props (className for spacing, data attributes for animation) go to the <p>.
const SIZES = {
  default: "min-h-[35px] text-px-18 font-semibold uppercase",
  compact: "min-h-[33px] text-px-17 font-normal",
};

export default function Badge({
  children,
  className = "",
  size = "default",
  ...rest
}: ComponentPropsWithoutRef<"p"> & { size?: keyof typeof SIZES }) {
  return (
    <p
      className={`inline-flex items-center rounded-[54px] text-center bg-brand-green px-4 py-1.5 font-body leading-[normal] text-white/97 ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </p>
  );
}
