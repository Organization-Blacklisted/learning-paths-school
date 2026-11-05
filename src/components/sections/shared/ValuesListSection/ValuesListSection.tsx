"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Container from "@/components/layouts/Container";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { ValuesListSectionProps } from "./ValuesListSection.types";

// The reusable values list section: a heading on a navy band ("Guided by") and a list of blue slanted titles, ONE of them active at a time: the band sits behind
// the active title and its text shows at the right. The first one is active by default; hovering (a mouse), focusing (the keyboard) or tapping a title makes it the
// active one and the band slides to it. Figma "Group 150" (node 5688:14414) of the Welcome to LPS page: the "Guided by" band 131px high at the top (with the first
// value on it), then the other values under it, each with a thin line under it. Any page can use it for a short list of principles:
//
//   <ValuesListSection content={welcomeToLps.values} />
//
// The content is `ValuesListContent` (src/types/values-list.ts), from a page's data file or the CMS (the fields are in src/globals/WelcomeToLps.ts).
//
// LAYOUT, from lg (1024px), the design at 1920px: a full-width navy band, 131px high, with "Guided by" (38px, white) at the left of the 1520px container; the titles
// start 393px in (25.86%), 40px Lexend Medium slanted, blue (white while active); a title is 48px high and its line is 48px under it (95.5px from the title's top), the
// rows 60px apart (the first and the second 53.5px apart, as drawn); the active row's text sits at the right edge, 544px wide, 17px above its title, white at 80%; the
// band is centred on the active title (42px above its top) and is moved by script to the row that is active (measured, so it is right at any width and when the font
// has loaded). The active row has no line. The sizes of a row follow the heading size (em), so the rows stay together when the heading is smaller on a narrow screen.
// Below lg (my interpretation, only desktop is designed) it is a list: the navy band is a block with "Guided by" on top, then the titles with a line under each, and
// the text of the ACTIVE one opens under its title (an accordion, one open at a time).
//
// ACCESSIBILITY. Each title is a button (aria-expanded, aria-controls its text); the texts of the other rows are hidden from assistive technology. ArrowDown and ArrowUp
// move between the buttons (focus makes a row active). Without JavaScript the first row is active.
//
// ANIMATION (nothing in Figma; mine): the rows rise in one after the other when the section comes into view (once; quicker when it comes back); the band slides
// (0.5 s) and the title colours and texts cross-fade (0.3 s) when the active row changes. Reduced motion: no entrance, the band jumps.

/** The band's height, and where its centre is relative to the active title's centre: both from the design. */
const BAND_HEIGHT = 131;

export default function ValuesListSection({ content, className = "" }: ValuesListSectionProps) {
  const { label, title, items } = content;
  const [active, setActive] = useState(0);
  const [bandY, setBandY] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();

  // Entrance (once per entry into view): the rows rise in. The band and the heading are on the page from the start.
  useScrollReveal(
    wrapRef,
    ({ gsap, q }) => {
      const rows = q("[data-value-row]");
      gsap.set(rows, { autoAlpha: 0, y: 24 });
      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(rows, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0);
    },
    { start: "top 80%" },
  );

  // Put the band behind the active title: its centre on the centre of the title button. Measured (not worked out), so it follows the font loading and any resize.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const place = () => {
      const row = list.children[active] as HTMLElement | undefined;
      const button = row?.querySelector("button");
      if (!row || !button) return;
      setBandY(Math.max(0, row.offsetTop + button.offsetHeight / 2 - BAND_HEIGHT / 2));
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  const move = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = [...(listRef.current?.querySelectorAll("button") ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    buttons[(at + (event.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length].focus();
  };

  return (
    <section aria-label={label} className={className}>
      <div ref={wrapRef} className="relative">
        {/* The band: a block on top below lg, a layer behind the active title from lg */}
        <div
          className="bg-brand-navy py-8 lg:absolute lg:inset-x-0 lg:top-0 lg:h-[131px] lg:translate-y-(--band-y) lg:py-0 lg:transition-transform lg:duration-500 lg:ease-out motion-reduce:lg:transition-none"
          style={{ "--band-y": `${bandY}px` } as CSSProperties}
        >
          <Container>
            <h2 className="font-body text-[clamp(28px,1.9792vw,38px)] leading-[1.2] font-normal tracking-[-0.01em] text-white lg:pt-[37px]">
              {title}
            </h2>
          </Container>
        </div>

        <Container className="relative">
          <ul
            ref={listRef}
            onKeyDown={move}
            className="flex flex-col gap-6 pt-8 font-heading text-h2 leading-[1.2] lg:gap-[1.5em] lg:pt-[calc(65.5px_-_0.6em)] lg:pl-[25.855%]"
          >
            {items.map((item, index) => {
              const isActive = index === active;
              const textId = `${baseId}-${index}`;
              return (
                <li
                  key={`${item.title}-${index}`}
                  data-value-row
                  data-active={isActive}
                  className={`relative max-lg:border-b max-lg:border-brand-fog max-lg:pb-6 lg:h-[2.3875em] ${index === 0 ? "lg:-mb-[0.1625em]" : ""}`}
                  onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
                >
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={textId}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    className={`block w-full cursor-pointer text-left font-medium tracking-[-0.01em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue ${
                      isActive ? "text-brand-blue lg:text-white" : "text-brand-blue"
                    }`}
                  >
                    <span className="inline-block [transform:skewX(-8deg)_scaleY(0.99)]">{item.title}</span>
                  </button>

                  {/* The text: at the right of the band from lg (white on navy), under the title below it (opens when active) */}
                  <div
                    id={textId}
                    aria-hidden={!isActive}
                    inert={!isActive}
                    className={`transition-[grid-template-rows,opacity] duration-300 max-lg:grid ${
                      isActive ? "max-lg:grid-rows-[1fr]" : "max-lg:grid-rows-[0fr]"
                    } lg:absolute lg:-top-[17px] lg:right-0 lg:w-[min(544px,calc(100%_-_12.5em))] ${isActive ? "opacity-100" : "opacity-0"}`}
                  >
                    <div className="overflow-hidden lg:overflow-visible">
                      <p className="font-body text-body-lg leading-[1.5] tracking-[-0.01em] text-brand-navy/80 max-lg:pt-3 lg:text-white/80">
                        {item.text}
                      </p>
                    </div>
                  </div>

                  {/* The thin line under the row (from lg; the active row, on the band, has none) */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 hidden h-px bg-brand-fog transition-opacity duration-300 lg:block ${isActive ? "opacity-0" : "opacity-100"}`}
                  />
                </li>
              );
            })}
          </ul>
        </Container>
      </div>
    </section>
  );
}
