"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import Container from "@/components/layouts/Container";
import { registerGsap } from "@/lib/gsap";
import { DESKTOP, MOTION_OK } from "@/lib/motion";
import type { HorizontalSceneProps } from "./HorizontalScene.types";
import { SceneContext, type SceneCallback, type SceneRegistry } from "./scene-context";

// A scene where the page first scrolls DOWN to the first panel, then, as the user keeps scrolling, the view
// pans RIGHT to the next panel(s), like the Figma "Homepage Version 2" canvas (the Vision/Mission/Values column
// with "The Courage To Find Your Path" to its right) and the ESPN feature the owner referenced.
//
// How: the scene is one screen tall and pinned (ScrollTrigger). The panels sit in a row (the "track"), the first
// one centred on screen. While pinned, vertical scroll moves the track left, one pixel of scroll per pixel of
// movement, until the last panel is centred. Then the pin is released and the page scrolls on.
//
// The layout is plain CSS so the server-rendered page is already right: from md up (and when the user has not
// asked for reduced motion) the panels are a row inside a clipped, screen-high stage; otherwise (phones, reduced
// motion) they are an ordinary vertical stack with the section spacing between them and no pin.
// The JS only adds the pin and the movement, and only in the row layout (gsap.matchMedia with the same query).
//
// Panels taller than the screen are scaled down to fit it while the scene is pinned (see `fit` below).
//
// Panel widths: each panel is `contentWidth` plus the gutters of <Container> (var(--spacing-gutter), fluid) on both sides, capped at the
// stage width (100cqw, the stage is a container so this excludes the scrollbar). The gap between the content of
// two panels is 153px at a 1920px screen (Figma), fluid with the screen width.

// The row layout and the pin are on at EVERY screen width (owner, 2026-10-22: tablets and phones get the same scroll effect as desktop).
// Only "reduce motion" turns them off.
const ROW_QUERY = MOTION_OK;
// A scene with `stackOnPhones` is only a row on a screen at least 640px wide AND 500px high; below that (a phone, upright or on its side) the
// panels are an ordinary vertical stack, no pin, no scaling, no pan (owner, 2026-10-28: the Ecosystem panel was shrunk to about 75% on a
// phone, which left empty bands left and right).
const ROOMY = "(min-width: 640px) and (min-height: 500px)";
const ROW_QUERY_ROOMY = `${MOTION_OK} and ${ROOMY}`;
// The class strings are written out whole because Tailwind only finds complete class names: the same classes with `motion-safe:` (a row
// at every size) or with `motion-safe:` plus the ROOMY media query above (the underscores are spaces).
const ROW_CLASSES = {
  always: {
    stage: "motion-safe:flex motion-safe:h-svh motion-safe:items-center motion-safe:overflow-clip",
    track:
      "motion-safe:h-full motion-safe:w-max motion-safe:will-change-transform motion-safe:flex-row motion-safe:items-center motion-safe:pl-[max(0px,calc((100cqw-var(--first-panel))/2))]",
    panel: "motion-safe:ml-(--gap-before) motion-safe:w-(--panel-w) motion-safe:shrink-0 motion-safe:first:ml-0",
  },
  roomy: {
    stage:
      "motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:flex motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:h-svh motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:items-center motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:overflow-clip",
    track:
      "motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:h-full motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:w-max motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:will-change-transform motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:flex-row motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:items-center motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:pl-[max(0px,calc((100cqw-var(--first-panel))/2))]",
    panel:
      "motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:ml-(--gap-before) motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:w-(--panel-w) motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:shrink-0 motion-safe:[@media(min-width:640px)_and_(min-height:500px)]:first:ml-0",
  },
} as const;
// The gutter of <Container> on each side: a CSS variable now (it is fluid), so every width below is a CSS calc() and not a number.
const GUTTER = "var(--spacing-gutter)";
const DEFAULT_GAP = 153; // px at 1920 wide, between Vision/Mission/Values and Courage in Figma
// A panel taller than the screen is shrunk to fit it, but never below this (a pinned scene must show a whole panel).
const MIN_FIT_SCALE = 0.5;
// The room (px) kept free above AND below a panel that is fitted to the screen, so it never touches the top or bottom edge of the window
// (owner, 2026-10-28: the Ecosystem badge touched the top and its last text lines the bottom on laptops).
const FIT_MARGIN = 32;

export default function HorizontalScene({ panels, stackOnPhones = false }: HorizontalSceneProps) {
  const rowQueryText = stackOnPhones ? ROW_QUERY_ROOMY : ROW_QUERY;
  const rowClasses = stackOnPhones ? ROW_CLASSES.roomy : ROW_CLASSES.always;
  // A scene with ONE panel has nothing to pan to (the home page shows only part of its sections for now, see HOME_SECTION_LIMIT, so a scene
  // can be cut down to its first panel). Then there is no pin and no row: the panel is an ordinary section at its natural size. Without this
  // it would still be squeezed into a screen-high, clipped stage and scaled down to fit (a phone showed the Ecosystem at 60% of its width).
  const sideways = panels.length > 1;
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef(new Set<SceneCallback>());
  // Panels register their animations here (see scene-context.ts). Child effects run before this component's
  // effect, so every callback is already registered when the timeline is built below.
  const registry = useMemo<SceneRegistry>(
    () => ({
      register: (callback) => {
        callbacks.current.add(callback);
        return () => callbacks.current.delete(callback);
      },
    }),
    [],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track || !sideways) return;

    const { gsap, ScrollTrigger } = registerGsap();

    // FIT TO THE SCREEN. The stage is pinned for the whole pan, so a panel taller than the screen would have its bottom cut off for
    // the entire time. In the row layout every panel taller than the window is scaled down (about its top centre) to the window
    // height, and its box gets the scaled height, so the stage never grows past the screen. Panels that fit are untouched. Run before
    // every ScrollTrigger measurement (the refreshInit event), so a resize, a font or an image loading is always taken into account.
    const rowQuery = window.matchMedia(rowQueryText);
    // What the last fit() decided (the scale of every panel), to notice when a later pass decides differently.
    let fitted = "";
    const fit = () => {
      const scales: string[] = [];
      track.querySelectorAll<HTMLElement>("[data-scene-panel]").forEach((panel) => {
        const inner = panel.firstElementChild as HTMLElement | null;
        if (!inner) return;
        inner.style.scale = "";
        panel.style.height = "";
        panel.style.alignSelf = "";
        panel.removeAttribute("data-tall");
        if (!rowQuery.matches) return;
        const natural = inner.offsetHeight;
        // No margin on a phone: there the stacked columns are far taller than the screen, and every px taken off shrinks (and narrows) them more.
        const margin = window.innerWidth >= 640 && window.innerHeight >= 500 ? FIT_MARGIN : 0;
        const ratio = (window.innerHeight - 2 * margin) / natural;
        // A panel that would have to be shrunk below MIN_FIT_SCALE to fit (on a phone, a section that stacks its columns) is NOT shrunk:
        // it keeps its normal size, starts at the top of the screen, and the pinned view scrolls DOWN through it after the sideways pan.
        const tall = ratio < MIN_FIT_SCALE;
        const scale = tall ? 1 : Math.min(1, ratio);
        scales.push(tall ? "tall" : scale.toFixed(4));
        if (tall) {
          panel.setAttribute("data-tall", "");
          panel.style.alignSelf = "flex-start";
        } else if (scale < 1) {
          inner.style.transformOrigin = "50% 0";
          inner.style.scale = String(scale);
          panel.style.height = `${natural * scale}px`;
        }
      });
      fitted = scales.join(",");
    };
    // How far the LAST panel reaches below the screen when it is a tall one (see fit): the pinned view scrolls down this far once the pan is done.
    const tallExtra = () => {
      const last = track.lastElementChild as HTMLElement | null;
      const inner = last?.firstElementChild as HTMLElement | null;
      if (!last || !inner || !rowQuery.matches || !last.hasAttribute("data-tall")) return 0;
      return Math.max(0, inner.offsetHeight - stage.clientHeight);
    };
    fit();
    ScrollTrigger.addEventListener("refreshInit", fit);

    // The stage width and the downward distance the scene was built for (see settle below).
    let builtFor = 0;
    let builtExtra = 0;
    const build = () => {
      builtFor = stage.clientWidth;
      builtExtra = tallExtra();
      const first = track.firstElementChild as HTMLElement | null;
      const last = track.lastElementChild as HTMLElement | null;
      if (!first || !last || first === last) return;

      // How far the track has to move: from "first panel centred" to "last panel centred".
      // offsetLeft/offsetWidth ignore transforms, so this stays right while the track is moving.
      const distance = () => last.offsetLeft + last.offsetWidth / 2 - (first.offsetLeft + first.offsetWidth / 2);
      // How many pixels of scrolling one pixel of panning takes. 1 on a wide screen. On a narrow one the pan is only one panel wide (390px on a
      // phone), which would fly by in under half a screen of scrolling and leave no time for the panels' own animations, so it is stretched:
      // about 1100px of scrolling for the whole pan, never more than 2.5 times slower. Only below 1024px: desktop widths keep 1 to 1.
      const scrollFactor = () => (window.matchMedia(DESKTOP).matches ? 1 : Math.max(1, Math.min(2.5, 1100 / stage.clientWidth)));

      const total = distance();
      // The scene's one timeline, scrubbed by scroll. Time 0 to 1 is the sideways pan (distance() * scrollFactor() px of scrolling); panels
      // add their own tweens at positions between 0 and 1 (see scene-context.ts). When the last panel is taller than the screen, the
      // timeline goes on after 1: the track moves UP by that panel's extra height, one pixel per pixel of scrolling, and then the pin ends.
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${distance() * scrollFactor() + tallExtra()}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      timeline.to(track, { x: () => -distance(), duration: 1 }, 0);
      if (builtExtra > 0) timeline.to(track, { y: () => -tallExtra(), duration: builtExtra / (total * scrollFactor()) }, 1);
      // Progress (0..1, can be outside) at which the point `offset` px from the left of `el` reaches screen x `screenX`.
      // Reads the track's current x, so it is right even if the page was reloaded part way through the pan.
      const progressAt = (el: HTMLElement, offset: number, screenX: number) => {
        const trackX = Number(gsap.getProperty(track, "x")) || 0;
        const left = el.getBoundingClientRect().left - stage.getBoundingClientRect().left - trackX + offset;
        return (left - screenX) / total;
      };
      callbacks.current.forEach((callback) => callback(timeline, { stage, distance: total, stageWidth: stage.clientWidth, progressAt }));
    };
    let mm = gsap.matchMedia();
    mm.add(rowQueryText, build);

    // After every refresh, check two things against the layout that is now really in place:
    // 1. FIT. ScrollTrigger sends refreshInit BEFORE it unpins the scenes, so after a resize fit() may have measured the panels inside the
    //    OLD size (the pinned stage still has the old width fixed). If measuring again gives other scales, refresh once more.
    // 2. TIMING. The panels' own tweens are placed on the pan as fractions, worked out for the stage width at the time the scene was built.
    //    After a resize they would start too early or too late, so when the width changed the scene is built again.
    // Fresh page loads never differ (nothing pinned yet, width unchanged), so they never loop; both steps are capped.
    let again = 0;
    let rebuilds = 0;
    const settle = () => {
      const before = fitted;
      fit();
      if (fitted !== before && again++ < 3) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return;
      }
      if (fitted === before) again = 0;
      const changed = Math.abs(stage.clientWidth - builtFor) > 1 || Math.abs(tallExtra() - builtExtra) > 1;
      if (rowQuery.matches && builtFor && changed && rebuilds++ < 3) {
        mm.revert();
        mm = gsap.matchMedia();
        mm.add(rowQueryText, build);
        requestAnimationFrame(() => ScrollTrigger.refresh());
      } else if (!changed) {
        rebuilds = 0;
      }
    };
    ScrollTrigger.addEventListener("refresh", settle);

    return () => {
      mm.revert();
      ScrollTrigger.removeEventListener("refreshInit", fit);
      ScrollTrigger.removeEventListener("refresh", settle);
      fit(); // clears the scaling (the query no longer applies to a torn-down scene)
    };
  }, [sideways, rowQueryText]);

  const firstWidth = `calc(${panels[0].contentWidth}px + 2 * ${GUTTER})`;

  return (
    <SceneContext.Provider value={registry}>
      <div className="pt-section last:pb-section">
        <div
          ref={stageRef}
          className={`@container ${sideways ? rowClasses.stage : ""}`}
          style={{ "--first-panel": firstWidth } as CSSProperties}
        >
          <div ref={trackRef} className={`relative flex flex-col gap-section ${sideways ? rowClasses.track : ""}`}>
            {panels.map((panel) => (
              <div
                key={panel.id}
                data-scene-panel
                className={sideways ? rowClasses.panel : ""}
                style={
                  {
                    "--panel-w": `min(calc(${panel.contentWidth}px + 2 * ${GUTTER}), 100cqw)`,
                    // The panels add one gutter each side, so that much is taken off the gap between the contents.
                    "--gap-before": `max(0px, calc(${((panel.gapBefore ?? DEFAULT_GAP) / 1920) * 100}cqw - 2 * ${GUTTER}))`,
                  } as CSSProperties
                }
              >
                {/* The inner box is what `fit` scales; the box around it takes the scaled height. */}
                <div>
                  <Container contentWidth={panel.contentWidth}>{panel.content}</Container>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneContext.Provider>
  );
}
