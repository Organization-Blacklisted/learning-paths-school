"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Accent from "@/components/ui/Accent";
import Badge from "@/components/ui/Badge";
import BodyText from "@/components/ui/BodyText";
import Photo, { photoSrc } from "@/components/ui/Photo";
import SectionTitle from "@/components/ui/SectionTitle";
import TabBar from "@/components/ui/TabBar";
import { registerGsap } from "@/lib/gsap";
import { PHONE, prefersReducedMotion } from "@/lib/motion";
import { loadPhoto } from "@/lib/loadPhoto";
import { useIdleReady } from "@/lib/useIdleReady";
import { useScrollReveal } from "@/lib/useScrollReveal";
import type { EcosystemSectionProps } from "./EcosystemSection.types";

// Figma: "Frame 1618876359" (node 6282:975), 1520 x 1036px, "The Ecosystem Behind LPS 360". From the top: green pill, heading
// "Five Foundations That Bring The *Vision To Life*", a 871px paragraph, a tab bar with five tabs (the first, active, is a blue
// rounded button), a 1520 x 531 photo, and a text row: bold title and paragraph on the left (648px), five bullets on the right
// (485px). It is the FIRST PANEL of the second sideways scene on the home page (after the LPS 360 Framework): <HorizontalScene> gives
// it the container and the 200px spacing, and the view pans right from it to the campus video (owner, 2026-11-02: the video and the alumni swapped places).
//
// HEIGHT. This panel is about 1026px high at 1520px wide. While the scene is pinned <HorizontalScene> scales it down to fit the window
// with 32px free above and below (the design stays whole, just smaller); from about 1100px of window height it is shown at the design size.
// To need less shrinking on laptops the photo is cropped a little on short windows (owner, 2026-10-28): 1520 x 531 from 1120px of window
// height (the design), 1520 x 440 from 900 to 1119px, 1520 x 400 below 900px. The photo fills its box (object-cover), so only the top and
// bottom edges are cut. Reduced motion (no pin, no fitting) keeps the design shape.
//
// ONLY THE FIRST TAB IS DESIGNED. Tabs 2 to 5 show the same placeholder photo and text until the school provides theirs (see
// src/data/home-ecosystem.ts). The tabs work: click or the arrow keys (Home and End too) switch the content.
//
// LAYOUT. From 1600px (the container is then the full 1520px): the design, each tab as wide as in Figma (325, 326, 274, 198 and 360px,
// centred, 1483px in all). From 1024 to 1599px (my interpretation, only desktop exists in Figma) the tabs keep their natural width, always in ONE row
// (the bar swipes sideways when they do not fit, at every width below 1600px). Below 640px the photo is 16:9. The text row has two columns
// from 1024px and stacks below it.
//
// ANIMATION ("as you think will suit it", like the other sections; nothing is specified in Figma):
// - On entering view (and, quicker, each time it comes back into view): the pill and heading rise in, the tab bar fades in, the photo is wiped open from the left while it
//   settles from a slight zoom, and the text row rises in. About 1.5 s.
// - The blue highlight of the active tab is one shape that SLIDES from tab to tab (position and width animated, 0.45 s).
// - On a tab change the photo CROSS-FADES (owner, 2026-10-24; it was a wipe from the left): the new photo is loaded first, then it fades in
//   over the old one (0.9 s) while it eases from a slight zoom (1.08) to its normal size (1.4 s), a calm "premium" settle. The old photo stays
//   under it until the fade is done, so there is never a blank frame. The title, text and bullets rise in one after another.
// - Reduced motion: nothing animated, the photo swaps at once, the highlight jumps, all shown. Everything is only hidden by JS.
//
// THE PHOTO IS A STACK OF LAYERS (see `layers`). Normally one. A tab change adds a layer on top once its photo has loaded (so a slow
// connection never fades in an empty box); the layers below it are dropped when the fade ends. Several quick clicks just stack more layers.
// Only the top layer carries `data-eco-photo` (the tests and the entrance animation look for it); the ones below are `data-eco-photo-old`.

// The photo box is a stack of layers: [{ id, tab }, …], the last one on top. Layer 0 is the first photo (the entrance animation plays on it).
type PhotoLayer = { id: number; tab: number };

export default function EcosystemSection({ content }: EcosystemSectionProps) {
  const { label, badge, titleLead, titleAccent, intro, tabsLabel, tabs } = content;
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The tab the content was last animated for: the change animation runs only when the tab really changes (not on mount, and not
  // on the repeated effect run of React Strict Mode in development).
  const animatedFor = useRef(0);
  // The photo is requested once the page has loaded and the browser is idle (see useIdleReady); its box keeps its size.
  const photoReady = useIdleReady(800, rootRef);
  // The photo layers (see the notes at the top), the id for the next layer, the tab whose photo is on top (or on its way there) and the
  // GSAP context that owns the fades (kept for the life of the section, so a new fade never cuts the one before it short).
  const [layers, setLayers] = useState<PhotoLayer[]>([{ id: 0, tab: 0 }]);
  const nextLayerId = useRef(1);
  const topTab = useRef(0);
  const fades = useRef<ReturnType<ReturnType<typeof registerGsap>["gsap"]["context"]> | null>(null);
  const topLayer = layers[layers.length - 1];

  const current = tabs[active];

  // Entrance when the section scrolls into view (and, quicker, each time it comes back: useScrollReveal).
  useScrollReveal(
    rootRef,
    ({ gsap, q }) => {
      const heads = q("[data-eco-head]");
      const bar = q("[data-eco-bar]");
      const photoClip = q("[data-eco-clip]");
      const photoImg = q("[data-eco-photo]");
      const texts = q("[data-eco-text]");

      gsap.set(heads, { autoAlpha: 0, y: 24 });
      gsap.set(bar, { autoAlpha: 0, y: 16 });
      gsap.set(photoClip, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(photoImg, { scale: 1.12 });
      gsap.set(texts, { autoAlpha: 0, y: 20 });

      return gsap
        .timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(heads, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0)
        .to(bar, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.3)
        .to(photoClip, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power3.inOut" }, 0.45)
        .to(photoImg, { scale: 1, duration: 1.3 }, 0.45)
        .to(texts, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 }, 1.0);
    },
    { start: "top 70%" },
  );

  // A tab change, step 1: get the new photo ready, then put it on the stack as a new top layer. Not on the first render, and not for the tab
  // that is already on top. With reduced motion the stack is simply replaced (an instant swap).
  useEffect(() => {
    if (topTab.current === active) return;
    let cancelled = false;
    const show = () => {
      if (cancelled) return;
      topTab.current = active;
      const layer = { id: nextLayerId.current++, tab: active };
      setLayers((stack) => (prefersReducedMotion() ? [layer] : [...stack, layer]));
    };
    // Reduced motion: no fade, so no reason to wait for the photo either (it loads in place like before).
    // Otherwise the tab's photo is waited for however long it takes (src/lib/loadPhoto.ts: no time limit, it is tried up to three times) and the old photo
    // stays until it is there. Showing the tab early dropped the old photo and left an empty box, for good when the request failed: a cold serverless
    // function has taken 15 seconds for one of these photos. If it cannot be had at all the old photo simply stays and a later click tries again.
    if (prefersReducedMotion()) show();
    else void loadPhoto(photoSrc(tabs[active].photo.src)).then((ok) => ok && show());
    return () => {
      cancelled = true;
    };
  }, [active, tabs]);

  // WARM-UP: once the section's own photo is on its way (photoReady), the other tabs' photos are fetched quietly, one at a time and at low priority, so a
  // click finds them ready: on the live site they come through a serverless function that can be cold (one took 15 s), and a visitor who clicked
  // through the tabs fast right after the page loaded got an empty box. Only in the normal case: not on a phone, not with "save data", not on 2G/3G (the
  // same policy as useIdleReady), where a photo is fetched when its tab is chosen.
  useEffect(() => {
    if (!photoReady) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (window.matchMedia(PHONE).matches || connection?.saveData || /(^|-)(2|3)g$/.test(connection?.effectiveType ?? "")) return;
    let cancelled = false;
    void (async () => {
      for (const tab of tabs.slice(1)) {
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        if (cancelled) return;
        await loadPhoto(photoSrc(tab.photo.src), { lowPriority: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoReady, tabs]);

  // A tab change, step 2 (before the browser paints the new layer): the top layer fades in while it settles from a slight zoom. When it is
  // fully opaque the layers below it are dropped. The fades live in one GSAP context so a quick second click never snaps the first one.
  useLayoutEffect(() => {
    // Layer 0 is the first photo (the entrance animation owns it); with reduced motion the swap already replaced the whole stack.
    if (topLayer.id === 0 || prefersReducedMotion()) return;
    const panel = panelRef.current;
    const el = panel?.querySelector<HTMLElement>(`[data-eco-layer="${topLayer.id}"]`);
    if (!panel || !el) return;
    const { gsap } = registerGsap();
    fades.current ??= gsap.context(() => {}, panel);
    fades.current.add(() => {
      // One timeline. The old photo is dropped only when BOTH the fade (0.9 s) and the settle (1.4 s) are done: dropping it while the new photo was still
      // settling made the picture jump. The new photo keeps its own layer afterwards (taking it off at the end of the settle made the picture snap:
      // docs/04-animation-guidelines.md); it goes with the layer when the next tab change drops it.
      gsap.set(el, { willChange: "transform, opacity" });
      gsap
        .timeline({ onComplete: () => setLayers((stack) => stack.filter((layer) => layer.id >= topLayer.id)) })
        .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power1.inOut" }, 0)
        .fromTo(el, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 0);
    });
  }, [topLayer.id]);

  // Leaving the page: stop whatever fade is still running.
  useEffect(
    () => () => {
      fades.current?.revert();
    },
    [],
  );

  // A tab change, step 3: the title, text and bullets of the chosen tab rise in. Not on the first render.
  useEffect(() => {
    if (animatedFor.current === active) return;
    animatedFor.current = active;
    const panel = panelRef.current;
    if (!panel) return;
    const { gsap } = registerGsap();
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // The texts sit on their own layer while this tab is shown (text that script moves is otherwise drawn on whole pixels and snaps when it stops:
      // docs/04-animation-guidelines.md). The clean-up of the next tab change reverts it.
      gsap.set("[data-eco-row][data-active] [data-eco-text]", { willChange: "transform, opacity" });
      gsap.fromTo(
        "[data-eco-row][data-active] [data-eco-text]",
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.07, delay: 0.2 },
      );
    }, panel);
    return () => ctx.revert();
  }, [active]);

  return (
    <section aria-label={label}>
      <div ref={rootRef} className="flex flex-col items-center gap-8">
        {/* Header: pill, heading, intro, then the tab bar. 15 / 28 / 39px between them, as in the design. */}
        <div className="flex w-full flex-col items-center gap-[39px]">
          <div className="flex w-full flex-col items-center gap-7">
            <div className="flex flex-col items-center gap-[15px]">
              <Badge data-eco-head>{badge}</Badge>
              {/* Grey part (Lexend Regular) and the blue slanted "Vision To Life" (Lexend Medium), like the other headings */}
              <SectionTitle data-eco-head className="text-center tracking-[-0.01em] text-balance lg:whitespace-nowrap">
                {titleLead} <Accent className="-ml-[0.118em]">{titleAccent}</Accent>
              </SectionTitle>
            </div>
            <BodyText data-eco-head className="max-w-[871.4px] text-center text-brand-graphite">
              {intro}
            </BodyText>
          </div>

          {/* Tab bar: 1520px wide with a hairline above and below, 14px and 11px of padding. Swipeable below lg. */}
          <TabBar data-eco-bar label={tabsLabel} tabs={tabs} active={active} onChange={setActive} idPrefix="eco-tab" panelId="eco-panel" />
        </div>

        {/* The active tab's content: photo (1520 x 531 from sm, 16:9 on a phone) and the text row */}
        <div
          ref={panelRef}
          id="eco-panel"
          role="tabpanel"
          aria-labelledby={`eco-tab-${current.id}`}
          tabIndex={0}
          className="flex w-full flex-col gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
        >
          {/* The photo is cropped (object-cover) a little on short windows while the scene is pinned, see HEIGHT at the top. Reduced motion: design shape. */}
          <div
            data-eco-clip
            className="relative aspect-video w-full overflow-hidden sm:aspect-[1520/531] motion-safe:sm:[@media(max-height:1119px)]:aspect-[1520/440] motion-safe:sm:[@media(max-height:899px)]:aspect-[1520/400]"
          >
            {layers.map((layer, index) => {
              const photo = tabs[layer.tab].photo;
              return (
                <div
                  key={layer.id}
                  data-eco-layer={layer.id}
                  {...(index === layers.length - 1 ? { "data-eco-photo": "" } : { "data-eco-photo-old": "", "aria-hidden": true })}
                  className="absolute inset-0"
                >
                  {/* Layer 0 waits for the idle moment like every photo below the first screen; the others are only added once loaded. */}
                  <Photo
                    ready={photoReady || layer.id > 0}
                    src={photo.src}
                    alt={index === layers.length - 1 ? photo.alt : ""}
                    fill
                    sizes="(min-width: 1600px) 1520px, 100vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>

          {/* The text of ALL the tabs sits in ONE grid cell and only the active tab's is visible (the others are invisible, inert and hidden
              from screen readers). So the panel is always as tall as the tallest tab: nothing jumps when a tab is chosen, and the sideways
              scene fits that height to the screen once (the tabs' texts differ in length, one is 27px taller than the others). */}
          {/* grid-cols-[minmax(0,1fr)]: without it the grid's one column grows to the text row's fixed 648 + 485 + 32px (1165px), so below
              about 1245px the row stuck out on the right (and was cut off by the scene's clip). Now the column is as wide as the panel and
              the two text columns shrink and wrap. */}
          <div className="grid w-full grid-cols-[minmax(0,1fr)]">
            {tabs.map((item, index) => {
              const isActive = index === active;
              return (
                <div
                  key={item.id}
                  data-eco-row
                  {...(isActive ? { "data-active": "" } : { inert: true, "aria-hidden": true })}
                  className={`col-start-1 row-start-1 flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 ${
                    isActive ? "" : "invisible"
                  }`}
                >
                  <div className="flex w-full flex-col gap-[18px] text-brand-graphite lg:w-[648px]">
                    <h3 data-eco-text className="font-body text-px-20 leading-[1.4] font-semibold">
                      {item.title}
                    </h3>
                    <p data-eco-text className="max-w-[485px] font-body text-body-lg leading-[1.5]">
                      {item.text}
                    </p>
                  </div>
                  <ul
                    data-eco-text
                    className="w-full list-disc pl-[27px] font-body text-body-lg leading-[1.5] text-brand-graphite lg:w-[485px]"
                  >
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
