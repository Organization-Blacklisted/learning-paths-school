"use client";

import { useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type KeyboardEvent } from "react";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

// An accessible tab bar (WAI-ARIA tabs) in the style of the site: a row of text buttons with ONE blue highlight that slides from tab to tab.
// It only renders the tabs; the panel under it belongs to the page, and points back with aria-labelledby={`${idPrefix}-${tab.id}`}:
//
//   <TabBar label="Foundations" tabs={tabs} active={active} onChange={setActive} idPrefix="eco-tab" panelId="eco-panel" data-eco-bar />
//   <div role="tabpanel" id="eco-panel" aria-labelledby={`eco-tab-${tabs[active].id}`}>…</div>
//
// - Keyboard, as for any tab list: arrows move and select, Home and End jump to the ends.
// - Layout: ALWAYS ONE ROW, at every width. Centred when the tabs fit, otherwise the bar scrolls sideways (no scrollbar; a fade at an end shows
//   that more tabs are hidden there). From 1600px each tab can have its own `width` (the design gives every tab its own); from 1024 to 1599px
//   the tabs are a little tighter so more of them fit. The tabs are 8px apart, so the highlight and the hover background of neighbours never touch;
//   from 1600px each fixed width is 6.4px narrower (4 gaps of 8px shared by 5 tabs), so the five tabs still add up to the design’s 1483px.
// - When the bar scrolls (any width): choosing a tab slides it to the LEFT edge of the bar, so the tabs after it show (choosing the second
//   reveals the third; near the end the bar simply stops at its end).
// - The highlight is placed in the bar’s own pixels, so it stays exact when the section is scaled down to fit a short window, and it is placed
//   again whenever the bar, a tab, the fonts or the scroll position change.
// - Before JS the active tab paints its own blue background; after the first placement (one frame later) the highlight takes over on the
//   same rectangle, so nothing jumps. With reduced motion the highlight jumps instead of sliding.

export type TabBarItem = { id: string; label: string; /** Width in px from 1600px wide (optional). */ width?: number };

type TabBarProps = Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
  /** Accessible name of the tab list. */
  label: string;
  tabs: TabBarItem[];
  active: number;
  onChange: (index: number) => void;
  /** Tab buttons get the id `${idPrefix}-${tab.id}`. */
  idPrefix: string;
  /** The id of the tab panel the tabs control. */
  panelId: string;
};

const wrap = (index: number, length: number) => (index + length) % length;
/** Left padding of the tab bar in px (the first tab sits this far in, and a chosen tab slides to this distance from the left). */
const TAB_BAR_PADDING = 14;

export default function TabBar({ label, tabs, active, onChange, idPrefix, panelId, className = "", ...rest }: TabBarProps) {
  const [indicatorReady, setIndicatorReady] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Put the sliding highlight under the active tab. `animate` is false on the first placement and on resize.
  const placeIndicator = useCallback(
    (animate: boolean) => {
      const indicator = indicatorRef.current;
      const tabEl = tabRefs.current[active];
      if (!indicator || !tabEl) return;
      const { gsap } = registerGsap();
      // Measured from the real rectangles (offsetLeft rounds to whole pixels), relative to the scrolled tab list.
      const list = tabEl.parentElement as HTMLElement;
      const box = tabEl.getBoundingClientRect();
      const listBox = list.getBoundingClientRect();
      // The rectangles are in screen pixels, but the highlight is placed in the list's own pixels. They are the same unless the section
      // is scaled: the sideways scene shrinks a panel taller than the window to fit it (HorizontalScene), and without this correction the
      // highlight came out smaller than its tab and off to one side. (A scale within 0.2% of 1 is just rounding: ignored.)
      const measured = listBox.width / list.offsetWidth || 1;
      const scale = Math.abs(measured - 1) < 0.002 ? 1 : measured;
      const to = {
        x: (box.left - listBox.left) / scale + list.scrollLeft,
        y: (box.top - listBox.top) / scale + list.scrollTop,
        width: box.width / scale,
        height: box.height / scale,
      };
      if (animate && !prefersReducedMotion()) gsap.to(indicator, { ...to, duration: 0.45, ease: "power3.out", overwrite: true });
      else gsap.set(indicator, to);
    },
    [active],
  );

  const placed = useRef(false);
  useEffect(() => {
    placeIndicator(placed.current);
    if (placed.current) return;
    const frame = requestAnimationFrame(() => {
      placed.current = true;
      setIndicatorReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [placeIndicator]);

  // Slide the chosen tab to the left edge of a swiping bar (not on the first render; nothing when all tabs fit).
  const scrolledFor = useRef(0);
  useEffect(() => {
    if (scrolledFor.current === active) return;
    scrolledFor.current = active;
    const tabEl = tabRefs.current[active];
    const list = tabEl?.parentElement;
    if (!tabEl || !list || list.scrollWidth <= list.clientWidth + 1) return;
    const target = tabEl.offsetLeft - TAB_BAR_PADDING;
    const left = Math.max(0, Math.min(target, list.scrollWidth - list.clientWidth));
    list.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [active]);

  // Everything that moves a tab: place the highlight again, and refresh the fades at the ends. That is the bar changing size (a resize), but
  // also any single tab changing size (a font arriving, the fixed widths from 1600px wide switching on) and the bar being scrolled.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const tabEls = tabRefs.current;
    const sizes = () => [bar.offsetWidth, ...tabEls.map((tab) => tab?.offsetWidth ?? 0)].join(",");
    let lastSizes = sizes();

    // A fade at an end where more tabs are hidden: the bar has no scrollbar, so this is what shows that it can be moved.
    const updateFades = () => {
      const hidden = bar.scrollWidth - bar.clientWidth;
      bar.toggleAttribute("data-overflow", hidden > 1);
      bar.style.setProperty("--fade-start", bar.scrollLeft > 1 ? "36px" : "0px");
      bar.style.setProperty("--fade-end", hidden - bar.scrollLeft > 1 ? "36px" : "0px");
    };
    // Place the highlight again ONLY when a size really changed. (This effect also runs when the active tab changes, and the observer
    // reports once when it starts: placing the highlight then, instantly, would cancel the slide to the new tab.) Scrolling needs no
    // re-placing: the highlight scrolls with the tabs.
    const onSizes = () => {
      const now = sizes();
      if (now !== lastSizes) {
        lastSizes = now;
        placeIndicator(false);
      }
      updateFades();
    };
    updateFades();
    const observer = new ResizeObserver(onSizes);
    observer.observe(bar);
    tabEls.forEach((tab) => tab && observer.observe(tab));
    bar.addEventListener("scroll", updateFades, { passive: true });
    document.fonts?.ready.then(onSizes);
    return () => {
      observer.disconnect();
      bar.removeEventListener("scroll", updateFades);
    };
  }, [placeIndicator]);

  const select = (index: number, focus = false) => {
    onChange(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? wrap(index + 1, tabs.length)
        : event.key === "ArrowLeft"
          ? wrap(index - 1, tabs.length)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  };

  return (
    // Hairline above and below (black at 13%); `rest` takes data attributes for the page's animation.
    <div className={`w-full border-y border-black/[0.13] ${className}`} {...rest}>
      <div
        ref={barRef}
        role="tablist"
        aria-label={label}
        className="relative flex justify-center-safe gap-2 overflow-x-auto px-[14px] py-[11px] [scrollbar-width:none] data-[overflow]:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start,0px),#000_calc(100%-var(--fade-end,0px)),transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {/* The one blue highlight that slides under the active tab (positioned by JS; hidden until placed) */}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 left-0 rounded-[8px] bg-brand-blue ${indicatorReady ? "" : "invisible"}`}
        />
        {tabs.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`${idPrefix}-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`relative z-10 shrink-0 rounded-[8px] px-4 py-4 font-body text-px-14 leading-[1.4286] font-semibold sm:px-[25px] sm:text-px-16 sm:leading-[1.25] lg:max-[1599px]:px-4 whitespace-nowrap capitalize transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue min-[1600px]:w-[calc(var(--tab-w)-6.4px)] ${
                selected ? "text-white/97" : "text-brand-blue hover:bg-brand-mist/60"
              } ${selected && !indicatorReady ? "bg-brand-blue" : ""}`}
              style={item.width ? ({ "--tab-w": `${item.width}px` } as CSSProperties) : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
