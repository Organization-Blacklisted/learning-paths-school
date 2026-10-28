"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Container, { CONTAINER_WIDTH } from "@/components/layouts/Container";
import { headerContent } from "@/data/header";
import { initialHeaderScroll, nextHeaderScroll } from "@/lib/headerVisibility";
import { SHOW_HOME_SECTIONS } from "@/lib/site";
import type { HeaderProps } from "./Header.types";

// Figma: node 6282:929 (transparent, over the hero) and node 5688:14371 (solid), 1920px frames.
//
// transparent: content column 1740px (90px margins), 40px from the top of the page, 60px row.
// solid:       content column 1520px (200px margins), 74px bar in brand blue, 45px row starting 14px from the top.
//
// SCROLL-UP HEADER (owner, 2026-10-28): on every page the header slides away while the visitor scrolls DOWN and comes back the moment
// they scroll UP (the rule is in src/lib/headerVisibility.ts; it never hides near the top of the page). It also comes back when a keyboard
// user tabs into it. Two variants, one behaviour:
//  - solid pages: `sticky top-0` as before (it keeps its 74px in the page flow, so nothing moves); it only slides up and down.
//  - the home page: `fixed` (it used to be `absolute` and scrolled away with the hero, so it could not come back later). It LOOKS transparent
//    only while it is over the hero (the section marked data-header-overlay, pinned for the whole hero scroll); anywhere after the hero it
//    takes the solid look, the same blue bar as on the other pages, because white text on a transparent bar is unreadable over the
//    white sections. The change between the two looks is a short transition of the background, the padding, the row height and the
//    content width (and the menu icon cross-fades), not a jump.
//
// The logo (353px wide, about 52px tall) is taller than the solid row (45px) and is centred on it, as in Figma.
// The menu button has no action yet: the off-canvas menu is not designed.

const linkClass = "hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
// Once the bottom of the hero is above this line (the height of the solid bar) the header is no longer over the hero.
const SOLID_BAR_HEIGHT = 74;

export default function Header({ variant }: HeaderProps) {
  const pathname = usePathname();
  // The transparent header only works over the home hero: with the home sections switched off (SHOW_HOME_SECTIONS) it is solid.
  const resolved = variant ?? (pathname === "/" && SHOW_HOME_SECTIONS ? "transparent" : "solid");
  const transparentVariant = resolved === "transparent";
  const { logo, admissions, menu } = headerContent;

  const [hidden, setHidden] = useState(false);
  // Is the header (when it is the transparent variant) over the hero? True at the top of the page.
  const [overHero, setOverHero] = useState(true);
  const scrollState = useRef(initialHeaderScroll());

  useEffect(() => {
    scrollState.current = initialHeaderScroll(window.scrollY);
    let frame = 0;
    const update = () => {
      frame = 0;
      scrollState.current = nextHeaderScroll(scrollState.current, window.scrollY);
      setHidden(scrollState.current.hidden);
      if (transparentVariant) {
        const hero = document.querySelector("[data-header-overlay]");
        // With no hero on the page only the very top counts as "over the hero".
        setOverHero(hero ? hero.getBoundingClientRect().bottom > SOLID_BAR_HEIGHT : window.scrollY < 10);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll(); // the first reading, also after a client-side navigation or a reload part way down the page
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname, transparentVariant]);

  // A keyboard user who tabs into a hidden header must see it.
  const showOnFocus = () => {
    scrollState.current = { ...scrollState.current, hidden: false };
    setHidden(false);
  };

  const solidLook = !transparentVariant || !overHero;
  const morph = "transition-[padding,max-width,height] duration-300 ease-out motion-reduce:transition-none";

  return (
    <header
      data-variant={resolved}
      data-look={solidLook ? "solid" : "transparent"}
      data-hidden={hidden ? "" : undefined}
      onFocus={showOnFocus}
      className={`${transparentVariant ? "fixed inset-x-0 top-0" : "sticky top-0"} z-50 transition-[translate,background-color] duration-300 ease-out motion-reduce:transition-none ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${solidLook ? "bg-brand-blue" : "bg-transparent"}`}
    >
      <Container
        contentWidth={solidLook ? CONTAINER_WIDTH.main : CONTAINER_WIDTH.wide}
        className={`${morph} ${solidLook ? "pt-[14px] pb-[15px]" : "pt-6 pb-0 md:pt-10"}`}
      >
        <div className={`flex items-center justify-between ${morph} ${solidLook ? "h-[45px]" : "h-11 md:h-[60px]"}`}>
          <Link
            href="/"
            aria-label={logo.homeLabel}
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Image src={logo.src} alt="" width={logo.width} height={logo.height} priority className="h-auto w-[259px] md:w-[353px]" />
          </Link>

          <div className="flex items-center gap-8">
            <Link href={admissions.href} className={`hidden text-body-lg leading-[normal] text-white capitalize sm:block ${linkClass}`}>
              {admissions.label}
            </Link>
            <button
              type="button"
              aria-label={menu.openLabel}
              className="relative size-[37px] shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {/* Both icons are always there, one on top of the other: the one that is not wanted is transparent. Cross-fades with the look. */}
              <Image
                src="/images/header/menu-light.svg"
                alt=""
                width={37}
                height={37}
                className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${solidLook ? "opacity-0" : "opacity-100"}`}
              />
              <Image
                src="/images/header/menu-green.svg"
                alt=""
                width={37}
                height={37}
                className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${solidLook ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
