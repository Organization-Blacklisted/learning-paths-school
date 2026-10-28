import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

// A link that looks like a button (4px corners, 15 x 13px padding, Plus Jakarta Sans 18px). Two looks from the Figma designs:
//   "primary": green, white text (the footer's "Begin an Admission Enquiry")
//   "light":   white, graphite text and a green external-link icon (the CTA band's "Explore Admissions")
// The footer still has its own copy of the primary look; switch it to this component when the footer is next touched.
// The label never wraps and the button never shrinks in a flex row (owner, 2026-10-28: "Explore Admissions" broke onto two lines at 1308px
// wide, where the CTA band's row gets tight): a button is as wide as its label, the text beside it gives way.
// All extra props (className, data attributes, aria-*) go to the <a>.

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & { variant?: "primary" | "light" };

const VARIANTS = {
  primary: "bg-brand-green text-white transition-[filter] hover:brightness-110 focus-visible:outline-white",
  light: "gap-[10px] bg-white text-brand-graphite transition-colors hover:bg-brand-mist focus-visible:outline-white",
};

export default function ButtonLink({ variant = "primary", className = "", children, ...rest }: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex shrink-0 items-center rounded-[4px] px-[15px] py-[13px] font-body text-body-lg leading-[1.4444] whitespace-nowrap capitalize focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
      {variant === "light" && <ExternalLinkIcon />}
    </Link>
  );
}

// "fi_376209": the Figma icon is two SVG pieces (the arrow and the open box) laid on a 24px square. Both files are
// the Figma exports, unmodified; the positions are the Figma insets (arrow: top right, 63.64%; box: from 18.2% down, left).
function ExternalLinkIcon() {
  return (
    <span aria-hidden="true" className="relative block size-6 shrink-0 overflow-clip">
      <Image
        src="/images/cta/external-link-arrow.svg"
        alt=""
        width={15}
        height={15}
        unoptimized
        className="absolute top-0 right-0 block size-[63.64%] max-w-none"
      />
      <Image
        src="/images/cta/external-link-box.svg"
        alt=""
        width={20}
        height={20}
        unoptimized
        className="absolute top-[18.2%] left-0 block h-[81.81%] w-[81.82%] max-w-none"
      />
    </span>
  );
}
