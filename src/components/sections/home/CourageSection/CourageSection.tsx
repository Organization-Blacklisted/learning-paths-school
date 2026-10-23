"use client";

import type GSAP from "gsap";
import { useRef, type CSSProperties } from "react";
import { useSceneTimeline } from "@/components/layouts/HorizontalScene";
import Photo from "@/components/ui/Photo";
import RotatingWord from "@/components/ui/RotatingWord";
import { registerGsap } from "@/lib/gsap";
import { useIdleReady } from "@/lib/useIdleReady";
import type { CourageSectionProps } from "./CourageSection.types";

// Figma: "Group 237" (node 6529:1750). The heading "The Courage To Find Your Path" (102px, grey with a blue
// "your path") with a collage of eight photos around and over it. The group is 1548 x 747.865px.
//
// LAYOUT. DESKTOP (md and up): the collage scales as one piece. Every photo and the heading are positioned in % of
// the Figma frame, the frame keeps its aspect ratio, and the heading size is a share of the frame width
// (container query units), so all proportions of the design hold at any width. It sits in the shared main
// container (1520px, set by <HorizontalScene>), so at the widest it is 1520 / 1548 = 98.2% of the Figma size.
// PHONE (below md): the design only exists for desktop, so this is my interpretation: the heading wraps on its
// own, with the photos below it in a two column grid (the collage would be unreadably small).
// Layer order is the design's: photos, then the heading, then the slide photo on top (it covers the end of "Courage").
//
// ANIMATION (owner's brief: a highly interactive page). The photos POP in (scale up with a small overshoot), staggered, and the heading has
// one of two effects, chosen by `headingEffect` in src/data/home-courage.ts:
// - "rotate" (the default, since the client asked for it, 2026-10-22, with boltonschool.org as the reference): the heading is FULLY VISIBLE
//   from the start and its last word swaps among `rotatingWords` (see <RotatingWord>), only while it is on screen.
// - "typewriter" (kept, switched off for now): the heading TYPES itself, character by character, following the scroll.
// In both, the pops follow the SCROLL: this is the second panel of the home page's <HorizontalScene> (on every screen width), so each photo
// pops (over 20% of the pan) just as it comes into view on the right, and scrolling back un-pops them. With typewriter, typing runs from the
// start of the pan until 90% of it and scrolling back un-types it.
// - Reduced motion: no animation, everything shown, the first word stays.
// The photos (and the typewriter characters) are only hidden by JS, so without it (or before it runs) the section is fully visible.
// The visual heading is aria-hidden, with the whole heading as screen reader text (with the real, first word).

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

/** "The courage to find " -> "The Courage To Find ". Done in code, not CSS: capitalize would capitalise every one-letter span. */
const capitalizeWords = (text: string) =>
  text.replace(/(^|\s)(\p{L})/gu, (_, space: string, letter: string) => space + letter.toUpperCase());

// How the animation is spread over the stretch of the pan between "the collage starts to enter the screen" and
// "the collage is centred": typing takes the first 90% of it, each photo pop takes 20%.
const TYPING_SHARE = 0.9;
const POP_SHARE = 0.2;

type Timing = {
  /** All in the timeline's own unit: scene progress (0 to 1). */
  typingStart: number;
  typingEnd: number;
  popLength: number;
  popStarts: number[];
};

export default function CourageSection({ content }: CourageSectionProps) {
  const { label, titleLead, titleAccent, headingEffect, rotatingWords, frame, heading, photos } = content;
  const typewriter = headingEffect === "typewriter";
  const rootRef = useRef<HTMLElement>(null);
  // The photos are requested once the page has loaded and the browser is idle (see useIdleReady); each box keeps its size.
  const photosReady = useIdleReady(800, rootRef);

  const lead = capitalizeWords(titleLead);
  const accent = capitalizeWords(titleAccent);
  // typewriter: one span per character
  const chars = typewriter
    ? [
        ...[...lead].map((char, i) => ({ char, accent: false, key: `l${i}` })),
        ...[...accent].map((char, i) => ({ char, accent: true, key: `a${i}` })),
      ]
    : [];
  // rotate: the blue part is "your " + the rotating last word ("path"); the words are capitalised like the rest of the heading
  const accentWords = accent.trimEnd().split(" ");
  const accentStatic = accentWords.slice(0, -1).join(" ");
  const swapWords = (rotatingWords?.length ? rotatingWords : [accentWords[accentWords.length - 1]]).map(capitalizeWords);

  // Adds the typing and the pops to a timeline, at the given times.
  const addReveal = (gsap: typeof GSAP, tl: ReturnType<typeof GSAP.timeline>, timing: Timing) => {
    const root = rootRef.current;
    if (!root) return;
    const charEls = gsap.utils.toArray<HTMLElement>("[data-char]", root);
    const photoEls = gsap.utils.toArray<HTMLElement>("[data-photo]", root);

    gsap.set(photoEls, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });

    if (typewriter) {
      gsap.set(charEls, { opacity: 0 });
      // Typing: the proxy counts typed characters; only characters whose state changed are touched. The one just
      // typed carries the caret (a thin blue bar, drawn with a box-shadow so it never moves the text).
      const typed = { n: 0 };
      let shown = 0;
      const paint = () => {
        const next = Math.round(typed.n);
        if (next === shown) return;
        const from = Math.min(shown, next);
        const to = Math.max(shown, next);
        for (let i = from; i < to; i++) charEls[i].style.opacity = i < next ? "1" : "0";
        if (shown > 0) delete charEls[shown - 1].dataset.caret;
        if (next > 0 && next < charEls.length) charEls[next - 1].dataset.caret = "";
        shown = next;
      };
      tl.to(
        typed,
        { n: charEls.length, duration: timing.typingEnd - timing.typingStart, ease: "none", onUpdate: paint },
        timing.typingStart,
      );
    }

    photoEls.forEach((el, i) => {
      tl.to(el, { autoAlpha: 1, scale: 1, duration: timing.popLength, ease: "back.out(2)" }, timing.popStarts[i]);
    });
  };

  // Desktop: ride the sideways scroll. The collage is the second of several panels, so its animation is placed
  // where the collage itself comes into view: from its left edge reaching the right edge of the screen
  // (`entering`) to it being centred (`centred`), measured on the page.
  useSceneTimeline((tl, { stageWidth, progressAt }) => {
    const { gsap } = registerGsap();
    const root = rootRef.current;
    const frameEl = root?.querySelector<HTMLElement>("[data-frame]");
    if (!root || !frameEl) return;

    const entering = Math.max(0, progressAt(frameEl, 0, stageWidth));
    const centred = Math.min(1, progressAt(frameEl, frameEl.offsetWidth / 2, stageWidth / 2));
    const span = Math.max(0.05, centred - entering);
    const popLength = POP_SHARE * span;
    // A photo pops as its left side comes in from the right edge of the screen (measured before it is scaled).
    const popStarts = gsap.utils.toArray<HTMLElement>("[data-photo]", root).map((el) => {
      const arrives = progressAt(el, el.offsetWidth * 0.2, stageWidth);
      return Math.min(centred - popLength, Math.max(entering, arrives));
    });
    addReveal(gsap, tl, { typingStart: entering, typingEnd: entering + TYPING_SHARE * span, popLength, popStarts });
  });

  return (
    <section ref={rootRef} aria-label={label}>
      <div className="@container">
        <div
          data-frame
          className="relative md:aspect-(--frame-aspect)"
          style={{ "--frame-aspect": `${frame.width} / ${frame.height}` } as CSSProperties}
        >
          <h2
            className="mb-8 text-center font-heading text-h1 leading-[1.2] font-medium tracking-[-0.01em] text-brand-ghost md:absolute md:top-(--heading-top) md:left-0 md:z-10 md:mb-0 md:w-full md:text-(length:--heading-size) md:whitespace-nowrap md:text-left"
            style={
              {
                "--heading-size": `${(heading.fontSize / frame.width) * 100}cqw`,
                "--heading-top": pct(heading.top, frame.height),
              } as CSSProperties
            }
          >
            <span className="sr-only">{`${lead}${accent}`}</span>
            {typewriter ? (
              <span aria-hidden="true">
                {chars.map(({ char, accent: isAccent, key }) => (
                  <span
                    key={key}
                    data-char
                    className={`data-[caret]:shadow-[0.04em_0_0_0_var(--color-brand-blue)] ${isAccent ? "text-brand-blue" : ""}`}
                  >
                    {char}
                  </span>
                ))}
              </span>
            ) : (
              // Fully visible from the start; only the last word swaps (see <RotatingWord>).
              <span aria-hidden="true">
                {lead}
                <span className="text-brand-blue">
                  {accentStatic} <RotatingWord words={swapWords} />
                </span>
              </span>
            )}
          </h2>

          <div className="grid grid-cols-2 gap-3 md:contents">
            {photos.map((photo) => (
              <div
                key={photo.id}
                data-photo
                className={`relative aspect-[4/3] overflow-hidden md:absolute md:top-(--t) md:left-(--l) md:aspect-auto md:h-(--h) md:w-(--w) ${
                  photo.aboveText ? "md:z-20" : ""
                }`}
                style={
                  {
                    "--l": pct(photo.left, frame.width),
                    "--t": pct(photo.top, frame.height),
                    "--w": pct(photo.boxWidth, frame.width),
                    "--h": pct(photo.boxHeight, frame.height),
                  } as CSSProperties
                }
              >
                {/* Mounted once the page has loaded and the browser is idle (useIdleReady), so they are already in the cache when
                    the view pans onto them (no pop-in) without competing with the hero.
                    On a phone every photo is simply cropped to fill its tile (nothing is stretched). */}
                <Photo
                  ready={photosReady}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className={
                    photo.fit === "crop"
                      ? "size-full max-w-none object-cover md:absolute md:top-0 md:left-(--il) md:h-full md:w-(--iw) md:object-fill"
                      : photo.fit === "stretch"
                        ? "size-full max-w-none object-cover object-top md:object-fill"
                        : "size-full max-w-none object-cover"
                  }
                  style={
                    photo.fit === "crop" ? ({ "--iw": `${photo.imageWidth}%`, "--il": `${photo.imageLeft}%` } as CSSProperties) : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
