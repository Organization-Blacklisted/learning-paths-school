"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import ButtonLink from "@/components/ui/ButtonLink";
import Photo from "@/components/ui/Photo";
import { menuContent } from "@/data/menu";
import { lockScroll } from "@/lib/scroll";
import type { MegaMenuProps } from "./MegaMenu.types";

// The mega menu: opened by the header's menu button, it comes in from the RIGHT and covers the whole screen. Figma node 6783:1333 (1920px).
// The content is in src/data/menu.ts (managed in the codebase, not in the CMS).
//
// DESKTOP (from 1280px, the Figma design): the screen is split in two halves. Left: a photo of the embossed school crest. Right: a white panel
// with "Parent Login" and "Contact us" and the round close button at the top, the main items in a column (30px, light), a thin vertical
// divider, the links of the chosen main item in a second column (16px), and the two green buttons at the bottom. The chosen main item has a
// green mark at its left and slides 12px to the right. The first one ("About Us") is chosen when the menu opens. Pointing at a main item
// with a mouse, clicking it, or pressing Enter on it chooses it; the other lists cross-fade away.
//
// TABLET (768 to 1279px, my design, only desktop is in Figma): the same two columns on the white panel, without the photo (a tablet does not
// need to download it).
//
// PHONE (below 768px, my design): the white panel with the close button at the top right, the main items stacked, and the chosen one OPENS
// downward showing its links (an accordion; tapping it again closes it); "Parent Login" and "Contact us" are under the list, then the two
// buttons, one under the other. The panel scrolls if the screen is too short.
//
// ONE set of elements serves all three: the main items and their link lists are the same <ul>, laid out as a grid with a column per list from
// 768px and as an accordion below it, so a screen reader and the keyboard get the same menu everywhere.
//
// Closed, the menu is in the page (the links can be read by search engines) but off screen, `inert` (not focusable, not announced) and invisible.
// Open: it is a modal dialog: the focus moves to the close button and is kept inside (Tab cycles), Escape closes it and the focus goes back to
// the menu button, the page behind cannot scroll (lockScroll), and a click on any link closes it. Motion: the panel slides in (1000 ms, an even
// ease-in-out with no abrupt start; 700 ms out), the photo stays still (a zoom while sliding looked like shaking), the items rise slowly (900 ms each) in one after another once the panel has nearly arrived; with prefers-reduced-motion nothing moves (the menu just appears).

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window.matchMedia !== "function") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => (typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false),
    () => false,
  );
}

// VERTICAL SPACING. Figma's values are for a 993px high screen; on a shorter one (a 768px laptop) the same spacing would not fit, so every gap
// shrinks evenly with the screen height: at 993px and above it is exactly the Figma value, at 768px it is about 63% of it (the buttons, the
// text lines and the close button keep their size). The whole menu then fits a 768px laptop without scrolling (and a 720px one); only a
// screen shorter than about 680px scrolls the panel. 0.001636 = the share of each gap lost per px of screen height below 993.
const fit = (design: number, min: number) =>
  `clamp(${min}px, calc(${design}px - (993px - 100svh) * ${(design * 0.001636).toFixed(4)}), ${design}px)`;
const spacing = {
  "--menu-top": fit(50, 16), // above the close button
  "--menu-nav": fit(85, 24), // between the close button and the lists
  "--menu-gap": fit(29, 9), // between the main items
  "--menu-actions": fit(105, 28), // between the lists and the buttons
  "--menu-bottom": fit(109, 24), // under the buttons
  "--menu-row": "clamp(36px, calc(41px - (993px - 100svh) * 0.0222), 41px)", // height of a main item (41px: the first row in Figma, which carries the mark)
} as CSSProperties;

const rise = "transition-[opacity,translate] ease-out motion-reduce:transition-none";
// the main items fade in AND change colour on hover: one transition declaration for both
const riseAndColour = "transition-[color,opacity,translate] ease-out motion-reduce:transition-none";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue";
const utilityClass = `flex items-center gap-2 font-body text-px-16 leading-[1.2] font-semibold tracking-[0.16em] max-sm:text-px-14 max-sm:tracking-[0.1em] max-[359px]:text-px-12 whitespace-nowrap text-brand-navy uppercase hover:text-brand-blue ${focusRing}`;

export default function MegaMenu({ open, onClose, returnFocusRef, warm = false, id = "site-menu" }: MegaMenuProps) {
  const { label, closeLabel, sections, utility, actions } = menuContent;
  const pathname = usePathname();
  const baseId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // The latest onClose, read by the effects below without restarting them when the parent hands over a new function.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const wide = useMediaQuery("(min-width: 1280px)");
  const sideBySide = useMediaQuery("(min-width: 768px)");

  // The chosen main item. Side by side the first one is chosen when the menu opens; on a phone every item starts closed.
  const [activeId, setActiveId] = useState<string | null>(sections[0].id);
  const [wasOpen, setWasOpen] = useState(open);
  // false while the menu is still coming in (the first links wait for the panel), true from about a second after it opened
  const [entered, setEntered] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    setEntered(false);
    if (open) setActiveId(sideBySide ? sections[0].id : null);
  }
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setEntered(true), 1200);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Open: the page stops scrolling, Escape closes, the focus goes to the close button; closed again: the focus goes back to the menu button.
  useEffect(() => {
    if (!open) return;
    const unlock = lockScroll();
    // the menu button, read now (the lint rule wants the node copied before the cleanup runs; the button is the same node while the menu is open)
    const returnTo = returnFocusRef?.current;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      returnTo?.focus();
    };
  }, [open, returnFocusRef]);

  // A page change (a link was followed) closes the menu.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    onCloseRef.current();
  }, [pathname]);

  // Keep the focus inside the open menu: Tab on the last element goes to the first, Shift+Tab on the first goes to the last.
  const keepFocusInside = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
      (element) => !element.closest("[inert]"),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const choose = (sectionId: string) => setActiveId((current) => (sideBySide ? sectionId : current === sectionId ? null : sectionId));
  // The entrance of the small links, the main items and the buttons: slow (900 ms each), one after another (70 ms apart), starting when the
  // panel has nearly arrived (700 ms of its 1000). Closing: no delay and a quick fade. The main items also change colour on hover, so their
  // colour transition has its own short duration and no delay (the lists follow the order of transition-[color,opacity,translate]).
  const riseMs = open ? 900 : 250;
  const startAt = (index: number) => (open ? 700 + index * 70 : 0);
  const delay = (index: number): CSSProperties => ({ transitionDelay: `${startAt(index)}ms`, transitionDuration: `${riseMs}ms` });
  const delayItem = (index: number): CSSProperties => ({
    transitionDelay: `0ms, ${startAt(index)}ms, ${startAt(index)}ms`,
    transitionDuration: `250ms, ${riseMs}ms, ${riseMs}ms`,
  });
  const shown = open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0";
  const showPhoto = wide && (open || warm);

  return (
    <div
      id={id}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      inert={!open}
      data-open={open ? "" : undefined}
      onKeyDown={keepFocusInside}
      className={`fixed inset-0 z-[60] flex bg-white transition-[translate,visibility] ease-[cubic-bezier(0.65,0,0.35,1)] will-change-[translate] motion-reduce:transition-none ${
        open ? "visible translate-x-0 duration-[1000ms]" : "invisible translate-x-full duration-[700ms]"
      }`}
    >
      {/* Left half (desktop only): the photo */}
      <div aria-hidden="true" className="relative hidden w-1/2 shrink-0 overflow-hidden bg-brand-navy xl:block">
        <Photo ready={showPhoto} src="/images/menu/menu-crest.avif" alt="" fill sizes="50vw" className="object-cover" />
      </div>

      {/* The white panel */}
      <div
        style={spacing}
        data-lenis-prevent=""
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden bg-white px-6 pt-5 pb-8 max-sm:pb-6 md:pt-[var(--menu-top)] md:pb-[var(--menu-bottom)] sm:px-[clamp(32px,6vw,81px)] xl:pr-[clamp(32px,4.2vw,80px)] xl:pl-[clamp(40px,4.2vw,81px)]"
      >
        {/* Phone only: the crest photo across the top (a smaller, wider cut than the desktop one); the close button sits on it */}
        <div aria-hidden="true" className="relative order-0 aspect-[780/358] shrink-0 overflow-hidden bg-brand-navy sm:hidden">
          <Photo
            ready={!sideBySide && (open || warm)}
            src="/images/menu/menu-crest-wide.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Top row: Parent Login, Contact us, the close button (on a phone the close button is on the photo and the two links are under it, in one row) */}
        <div className="flex items-center justify-end gap-[clamp(20px,2.8vw,53px)] max-sm:contents">
          <ul
            className={`flex items-center gap-[clamp(16px,1.7vw,32px)] max-sm:order-1 max-sm:mt-5 max-sm:gap-x-5 max-[359px]:gap-x-4 ${rise} ${shown}`}
            style={delay(0)}
          >
            <li>
              <Link href={utility.parentLogin.href} onClick={onClose} className={utilityClass}>
                <Image src="/images/menu/account.svg" alt="" width={24} height={24} />
                {utility.parentLogin.label}
              </Link>
            </li>
            <li>
              <Link href={utility.contact.href} onClick={onClose} className={utilityClass}>
                <Image src="/images/menu/mail.svg" alt="" width={24} height={24} />
                {utility.contact.label}
              </Link>
            </li>
          </ul>
          <button
            ref={closeRef}
            type="button"
            data-menu-close=""
            aria-label={closeLabel}
            onClick={onClose}
            className={`grid size-12 shrink-0 place-items-center rounded-full bg-brand-blue transition-colors hover:bg-brand-blue-darker sm:size-14 max-sm:absolute max-sm:top-8 max-sm:right-9 max-sm:size-8 ${focusRing}`}
          >
            <Image src="/images/menu/close.svg" alt="" width={24} height={24} className="max-sm:size-4" />
          </button>
        </div>

        {/* The lists */}
        <nav aria-label={label} className="mt-6 max-sm:order-2 max-sm:mt-4 sm:mt-10 md:mt-[var(--menu-nav)]">
          <ul
            style={{ "--rows": sections.length } as CSSProperties}
            className="flex flex-col md:relative md:grid md:grid-cols-[minmax(0,259px)_minmax(0,1fr)] md:gap-x-[74px] md:gap-y-[var(--menu-gap)] md:pb-[5px] md:before:absolute md:before:top-0 md:before:bottom-0 md:before:left-[calc(259px+37px)] md:before:w-px md:before:bg-brand-silver"
          >
            {sections.map((section, index) => {
              const active = activeId === section.id;
              const listId = `${baseId}-${section.id}`;
              return (
                <li key={section.id} className="max-md:border-b max-md:border-brand-silver/70 md:contents">
                  <button
                    type="button"
                    data-menu-parent=""
                    aria-expanded={active}
                    aria-controls={listId}
                    onClick={() => choose(section.id)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse" && sideBySide) setActiveId(section.id);
                    }}
                    style={delayItem(index + 1)}
                    className={`relative flex w-full items-center py-1.5 text-left font-body text-px-30 max-md:py-3.5 max-md:text-px-20 leading-[1.2] font-light text-brand-charcoal hover:text-brand-blue md:col-start-1 md:min-h-[var(--menu-row)] md:py-0 ${riseAndColour} ${shown} ${focusRing} max-md:after:mr-1 max-md:after:ml-auto max-md:after:size-2.5 max-md:after:shrink-0 max-md:after:border-r-2 max-md:after:border-b-2 max-md:after:transition-[rotate,translate] max-md:after:duration-300 ${
                      active
                        ? "max-md:after:translate-y-0.5 max-md:after:-rotate-[135deg]"
                        : "max-md:after:-translate-y-0.5 max-md:after:rotate-45"
                    }`}
                  >
                    {/* the green mark of the chosen item (Figma: a 41px line) */}
                    <span
                      aria-hidden="true"
                      className={`absolute top-1/2 left-0 block h-[41px] w-[2px] -translate-y-1/2 max-md:h-7 transition-opacity duration-300 motion-reduce:transition-none ${active ? "opacity-100" : "opacity-0"}`}
                    >
                      <Image
                        src="/images/menu/marker.svg"
                        alt=""
                        width={41}
                        height={2}
                        className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-90 max-md:w-7"
                      />
                    </span>
                    <span
                      className={`block transition-[translate] duration-300 ease-out motion-reduce:transition-none ${active ? "translate-x-3" : "translate-x-0"}`}
                    >
                      {section.label}
                    </span>
                  </button>

                  {/* The links of this item: the column on the right from 768px, an accordion under the item below it */}
                  <div
                    id={listId}
                    inert={!active}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:col-start-2 md:row-start-1 md:[grid-row-end:span_var(--rows)] md:grid-rows-none md:self-start ${
                      active ? "opacity-100 max-md:grid-rows-[1fr] md:duration-0" : "opacity-0 max-md:grid-rows-[0fr] md:duration-200"
                    }`}
                  >
                    {/* the padding is on the <ul>, inside a box that clips: padding on the clipping box itself would stay when the item is closed */}
                    <div className="min-h-0 overflow-hidden md:overflow-visible">
                      <ul className="flex flex-col gap-[18px] max-md:pt-2 max-md:pb-3 max-md:pl-5">
                        {section.links.map((link, linkIndex) => (
                          <li
                            key={link.id}
                            style={{ animationDelay: `${(entered ? 60 : 950) + linkIndex * 80}ms` }}
                            className={open && active ? "md:animate-menu-link motion-reduce:animate-none" : undefined}
                          >
                            <Link
                              href={link.href}
                              onClick={onClose}
                              data-menu-sub=""
                              className={`block font-body text-px-16 leading-[1.5] font-normal tracking-[-0.01em] text-brand-graphite capitalize hover:text-brand-blue hover:underline underline-offset-4 ${focusRing}`}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* The two buttons */}
        <div
          className={`mt-6 flex flex-wrap items-center gap-[18px] max-sm:order-4 max-sm:mt-4 max-sm:flex-col max-sm:items-stretch sm:mt-10 md:mt-[var(--menu-actions)] ${rise} ${shown}`}
          style={delay(sections.length + 1)}
        >
          <ButtonLink href={actions.enquiry.href} onClick={onClose} className="max-sm:justify-center">
            {actions.enquiry.label}
          </ButtonLink>
          <ButtonLink href={actions.career.href} onClick={onClose} className="min-w-[133px] justify-center">
            {actions.career.label}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
