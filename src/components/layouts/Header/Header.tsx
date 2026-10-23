"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container, { CONTAINER_WIDTH } from "@/components/layouts/Container";
import { headerContent } from "@/data/header";
import { SHOW_HOME_SECTIONS } from "@/lib/site";
import type { HeaderProps } from "./Header.types";

// Figma: node 6282:929 (transparent, over the hero) and node 5688:14371 (solid), 1920px frames.
//
// transparent: content column 1740px (90px margins), 40px from the top of the page, 60px row.
//              Absolutely positioned so the hero starts at y=0 and scrolls away with the page.
// solid:       content column 1520px (200px margins), 74px bar in brand blue, 45px row
//              starting 14px from the top. Sticky, so it stays at the top while scrolling.
//
// The logo (60px tall) is taller than the solid row (45px) and is centred on it, as in Figma.
// The menu button has no action yet: the off-canvas menu is not designed.

const linkClass = "hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function Header({ variant }: HeaderProps) {
  const pathname = usePathname();
  // The transparent header only works over the home hero: with the home sections switched off (SHOW_HOME_SECTIONS) it is solid.
  const resolved = variant ?? (pathname === "/" && SHOW_HOME_SECTIONS ? "transparent" : "solid");
  const transparent = resolved === "transparent";
  const { logo, admissions, menu } = headerContent;

  return (
    <header data-variant={resolved} className={transparent ? "absolute inset-x-0 top-0 z-50" : "sticky top-0 z-50 bg-brand-blue"}>
      <Container
        contentWidth={transparent ? CONTAINER_WIDTH.wide : CONTAINER_WIDTH.main}
        className={transparent ? "pt-6 md:pt-10" : "pt-[14px] pb-[15px]"}
      >
        <div className={`flex items-center justify-between ${transparent ? "h-11 md:h-[60px]" : "h-[45px]"}`}>
          <Link
            href="/"
            aria-label={logo.homeLabel}
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Image src={logo.src} alt="" width={logo.width} height={logo.height} priority className="h-11 w-auto md:h-[60px]" />
          </Link>

          <div className="flex items-center gap-8">
            <Link href={admissions.href} className={`hidden text-body-lg leading-[normal] text-white capitalize sm:block ${linkClass}`}>
              {admissions.label}
            </Link>
            <button
              type="button"
              aria-label={menu.openLabel}
              className="shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Image src={transparent ? "/images/header/menu-light.svg" : "/images/header/menu-green.svg"} alt="" width={37} height={37} />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
