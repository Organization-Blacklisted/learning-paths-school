import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/layouts/Container";
import { footerContent } from "@/data/footer";

// Layout notes (Figma node 6282:795, 1920px frame). The Figma content column is 1530px; the footer uses
// the standard 1520px main container instead (a 10px difference, accepted), so edges are 5px further in:
// - Below 1200px the three info columns stack, separated by horizontal rules.
//   The Figma file only has the desktop design; tablet/mobile is an interpretation.
// - From 1200px (owner, 2026-10-24: laptops keep the desktop design; it was 1400px) the info row is a 3-column grid
//   `1fr 548px 1fr` with a gap that grows from 40px to 146px (340 / 548 / 340 at 1520px, 345 / 548 / 345 in Figma;
//   vertical dividers in the gaps). At 1200px the content is 1120px wide, so the side columns are 246px.
// - The call to action row on top is also the desktop row (heading left, text and button right) from 1200px; its right column
//   takes the room that is left of the 528px heading column (up to the 619px Figma width).
// - Rules are CSS borders (white at 16% opacity), not the exported line SVGs,
//   because they have to stretch with the layout.

const linkClass = "hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function FooterColumn({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative border-t border-white/16 pt-8 min-[1200px]:border-t-0 min-[1200px]:pt-[60px] ${className}`}>
      <h3 className="font-body text-body-lg font-bold leading-7">{title}</h3>
      <div className="mt-6">{children}</div>
    </div>
  );
}

// Vertical divider that sits in the grid gap to the left of a column (>= 1200px only).
const dividerClass =
  "min-[1200px]:before:absolute min-[1200px]:before:top-0 min-[1200px]:before:left-[calc(var(--info-gap)_/_-2_-_1px)] min-[1200px]:before:h-[316px] min-[1200px]:before:border-l min-[1200px]:before:border-white/16";

export default function Footer() {
  const { cta, contact, usefulLinks, connect, legal } = footerContent;

  return (
    <footer className="bg-brand-navy text-white">
      {/* The md-only classes stop below 1200px (md:max-[1200px]:) because a min-[1200px]: class does not reliably sort after a plain md: one. */}
      <Container className="flex flex-col gap-12 py-12 md:max-[1200px]:gap-14 md:max-[1200px]:py-16 min-[1200px]:gap-[72px] min-[1200px]:py-20">
        {/* Call to action */}
        <div className="flex flex-col gap-8 md:max-[1200px]:grid md:max-[1200px]:grid-cols-2 md:max-[1200px]:items-end md:max-[1200px]:gap-x-10 min-[1200px]:flex min-[1200px]:min-h-[150px] min-[1200px]:flex-row min-[1200px]:items-end min-[1200px]:justify-between">
          <div className="min-[1200px]:w-[528px] min-[1200px]:shrink-0 min-[1200px]:self-start">
            <div className="flex items-start gap-[9px]">
              {/* mt-[11px] centres the rule on the first text line (23px line box), even when the eyebrow wraps. */}
              <span aria-hidden="true" className="mt-[11px] h-px w-[39px] shrink-0 bg-white" />
              <p className="text-body-lg leading-[normal] text-white/97 capitalize">{cta.eyebrow}</p>
            </div>
            <h2 className="mt-5 font-heading text-h2 font-medium text-white">
              {cta.headingStart}
              <span className="text-brand-green-light">{cta.headingHighlight}</span>
              {cta.headingEnd}
            </h2>
          </div>

          <div className="flex flex-col items-start gap-8 min-[1200px]:max-[1650px]:w-[min(619px,calc(100%_-_552px))] min-[1200px]:shrink-0 min-[1650px]:-mr-[13px] min-[1650px]:w-[590px]">
            {/* 619px is the Figma text box (wider than its 590px column). Applied from 1650px so it can't overflow the viewport. */}
            <p className="text-body-lg leading-[26px] text-white/80 min-[1650px]:w-[619px]">{cta.description}</p>
            <Link
              href={cta.buttonHref}
              className="rounded-[4px] bg-brand-green px-[15px] py-[13px] text-body-lg leading-[26px] text-white capitalize transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {cta.buttonLabel}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-8 min-[1200px]:gap-0">
          {/* Info columns */}
          <div className="relative flex flex-col gap-8 min-[1200px]:grid min-[1200px]:h-[316px] min-[1200px]:grid-cols-[1fr_548px_1fr] min-[1200px]:gap-x-[var(--info-gap)] min-[1200px]:[--info-gap:clamp(40px,calc(39vw_-_482px),146px)] min-[1200px]:before:absolute min-[1200px]:before:top-[29px] min-[1200px]:before:right-0 min-[1200px]:before:left-px min-[1200px]:before:border-t min-[1200px]:before:border-white/16">
            <FooterColumn title={contact.title}>
              <address className="not-italic">
                <ul className="flex flex-col gap-3 text-body-lg leading-[1.5]">
                  <li>
                    <a href={contact.phone.href} className={linkClass}>
                      {contact.phone.label}
                    </a>
                  </li>
                  <li>
                    <a href={contact.email.href} className={linkClass}>
                      {contact.email.label}
                    </a>
                  </li>
                  <li>{contact.address}</li>
                </ul>
              </address>
            </FooterColumn>

            <FooterColumn title={usefulLinks.title} className={dividerClass}>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                {usefulLinks.columns.map((column, index) => (
                  <ul
                    key={index}
                    role="list"
                    className={`flex flex-col gap-3 text-body-lg leading-[1.5] ${
                      index === 0 ? "sm:w-[208px]" : "sm:w-[270px] sm:whitespace-nowrap"
                    }`}
                  >
                    {column.map((link) => (
                      // Custom bullet: Figma's dot is 6px, 2.5px right of the browser's default marker.
                      <li
                        key={link.label}
                        className="relative ms-[27px] before:absolute before:top-[13.2px] before:-left-[16.5px] before:size-[6px] before:rounded-full before:bg-white"
                      >
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </FooterColumn>

            <FooterColumn title={connect.title} className={dividerClass}>
              <ul className="flex items-center gap-[14px]">
                {connect.social.map((item) => (
                  <li key={item.label}>
                    {item.framed ? (
                      <a
                        href={item.href}
                        aria-label={item.label}
                        className="block size-10 rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <Image src={item.icon} alt="" width={item.size} height={item.size} />
                      </a>
                    ) : (
                      <a
                        href={item.href}
                        aria-label={item.label}
                        className="flex size-10 items-center justify-center rounded-[4px] border border-white/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <Image src={item.icon} alt="" width={item.size} height={item.size} className="shrink-0" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/16 pt-5">
            <div className="flex flex-col items-center gap-3 text-center text-body-lg leading-[26px] text-white/80 lg:flex-row lg:justify-between lg:text-left">
              <p>{legal.copyright}</p>
              <nav aria-label="Legal">
                {legal.links.map((link, index) => (
                  <span key={link.label}>
                    {index > 0 && <span aria-hidden="true"> | </span>}
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </span>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
