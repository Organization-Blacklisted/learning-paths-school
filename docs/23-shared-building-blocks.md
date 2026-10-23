# Shared building blocks (structure refactor, 2026-10-22)

After the home page was complete, the code was reviewed for repetition. Everything that was written out in several sections is now one shared piece. **Nothing on the page changed**: the refactor was verified against screenshots of the whole page before and after (see [24-qa-suite.md](24-qa-suite.md): all 152 screenshots at five screen sizes match, plus the functional and interaction checks).

## What was repeated, and where it lives now

| Was repeated | Now | Used by |
| --- | --- | --- |
| The one-off entrance of a section: `useEffect`, GSAP, media query, hide the elements, paused timeline, `ScrollTrigger` with `once`, clean-up (about 15 lines per section) | **`useScrollReveal(rootRef, build, { media?, start? })`**, `src/lib/useScrollReveal.ts` | News, CTA, Framework, Ecosystem, Campus, and the phone entrances of Courage and Alumni |
| Media query strings (`"(max-width: 1023px) and (prefers-reduced-motion: no-preference)"` and others, 20+ times), and the 1024px breakpoint living separately in CSS and JS | **`src/lib/motion.ts`**: `MOTION_OK`, `MOTION_REDUCED`, `DESKTOP`, `PHONE`, `DESKTOP_MOTION`, `PHONE_MOTION`, `prefersReducedMotion()` | every section, `HorizontalScene`, `SmoothScroll`, `useIdleReady` |
| `useIdleReady` + `{ready && <Image unoptimized loading="eager" draggable={false} …>}` (20 times) | **`<Photo ready={…} …>`**, `src/components/ui/Photo` | all photos below the first screen |
| The h2 classes (nearly identical in six sections) and the blue slanted word (`skewX(-8deg) scaleY(0.99)`) | **`<SectionTitle>`** and **`<Accent>`**, `src/components/ui/` | News, Alumni, Campus, Framework, Ecosystem, Journey |
| The large body paragraph (`font-body text-body-lg leading-[1.5]`) | **`<BodyText>`**, `src/components/ui/BodyText` (colour, width and alignment go in `className`) | the same sections |
| Arbitrary font sizes (`text-[14px]`, `text-[18px]`, …) | tokens **`text-px-12/14/16/17/18/20`** in `src/styles/typography.css` (size only, no line height) | cards, labels, captions, pills |
| The tab bar with its sliding highlight, phone auto-scroll and keyboard handling (inside the Ecosystem section) | **`<TabBar>`**, `src/components/ui/TabBar` | Ecosystem (any page can use it) |
| The "play only while on screen" video with a pause button (inside Campus) | **`useViewportVideo(enabled)`**, `src/lib/useViewportVideo.ts` | Campus |
| The scroll parallax (inside Campus) | **`useParallax(rootRef, selector, percent)`**, `src/lib/useParallax.ts` | Campus |
| `types/home.ts` (one growing file) | **`types/home/`**: one file per section (`hero.ts`, `courage.ts`, …) and an `index.ts`; `import … from "@/types/home"` is unchanged | all sections |
| (new, 2026-10-22) a word that swaps inside a heading | **`<RotatingWord words interval>`**, `src/components/ui/RotatingWord` | the Courage heading's `"rotate"` option (the typewriter is in use now) |
| The home page written out by hand in `page.tsx` | the page is **data**: `src/data/home-page.ts` is a list of blocks, rendered by **`<BlockRenderer>`** (`src/components/blocks`); types in `src/types/page.ts` | the home page, and every page to come |

## How to use them

### A one-off entrance

```tsx
const rootRef = useRef<HTMLDivElement>(null);
useScrollReveal(rootRef, ({ gsap, q }) => {
  const heads = q("[data-news-intro]");
  gsap.set(heads, { autoAlpha: 0, y: 24 });                       // hidden by JS only, so without JS everything shows
  return gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
    .to(heads, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0);   // return the PAUSED timeline
});
```

The hook adds what used to be copied: no entrance with reduced motion (everything just shows), a ScrollTrigger that plays the timeline once (`start` defaults to `"top 75%"`), clean-up on unmount. For a phone-only entrance (a section that is part of a sideways scene on desktop) pass `{ media: PHONE_MOTION }`. Sections that follow the scroll (the sideways scenes, the typing in the Courage section) still use `useSceneTimeline`; sections with their own special animation keep it.

### A heading

```tsx
<SectionTitle data-news-intro className="tracking-normal whitespace-nowrap capitalize">
  What&apos;s New <Accent className="-ml-[0.118em] tracking-[-0.01em]">At LPS</Accent>
</SectionTitle>
<BodyText data-news-intro className="max-w-[471px] text-brand-graphite">…</BodyText>
```

The small margins and offsets differ from heading to heading in the Figma designs, so they stay in `className` at the place of use; what is shared is the typography. (The CTA band's heading and the Vision/Mission/Values titles are different designs and keep their own markup.)

### A photo that waits for the page

```tsx
const ready = useIdleReady(800, rootRef);
<div className="relative aspect-[4/3]"><Photo ready={ready} src="/images/…avif" alt="…" fill sizes="…" className="object-cover" /></div>
```

`Photo` holds the decision "these AVIFs are already compressed, so next/image must not re-encode them" in one file. The first screen (the hero) uses next/image's `priority` directly.

### A new page

Add a list of blocks, no hand-written markup:

```ts
// src/data/about-page.ts
export const aboutPage: PageBlock[] = [
  { blockType: "news", content: aboutNews },
  { blockType: "cta" },                                  // the standard band
  { blockType: "marquee", attachToFooter: true },
];
// the page:  <main …><BlockRenderer blocks={aboutPage} /></main>
```

A new kind of section is added in one place: its entry in `renderSection` in `BlockRenderer.tsx` (TypeScript refuses to compile when a block type has no renderer). A block is `{ blockType, content }`, the shape a Payload "blocks" field gives, so a page can later come from the database instead of a data file without changing a component: the data files become the seed and the fallback.

## Deliberately not done

- **Splitting sections into a server part and a client part.** Section markup could be a server component with only the animation as a client wrapper. It was measured first: **all the section code of the home page is one 14 KB (gzipped) chunk** (51 KB raw), out of about 330 KB of JavaScript the page loads (React 70 KB, GSAP 43 KB, Next and the rest). The split could save about 10 KB at best, and it is a large change (animation callbacks and the "photo is ready" state cannot be passed from a server component to a client one). Not worth the risk. If JavaScript weight becomes a concern, the real levers are elsewhere (GSAP and ScrollTrigger are 43 KB, React 70 KB).
- **A single `SectionHeading` component with props for everything**: the designs differ per section in margins, wrapping and line breaks, and one component with a dozen switches is harder to read than three small ones.
- **Extracting the Campus media box as a component**: only the behaviour is reusable (now two hooks); the box itself is tied to the entrance animation of that section.
