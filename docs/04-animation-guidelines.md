# Animation Guidelines

The site is heavily animated, so these rules keep it fast, consistent and usable.

## Tooling

**GSAP + ScrollTrigger** (`gsap` ^3.15.0) and **Lenis** (`lenis` ^1.3.27, smooth scrolling) are installed and in use. Built so far: the scroll-driven [home hero](11-home-hero.md) and the [Vision/Mission/Values](12-home-vision-mission-values.md) staggered reveal (time-based, plays once when it comes into view). The patterns are under "How a scroll scene is built" below. Whether a second library (for example Motion for simple UI transitions) is also wanted is still open in [decisions](07-decisions.md).

## Direction (decided 2026-10-21)

Page animation is **scroll-controlled**: the animation follows how far the user has scrolled, as on the ESPN F1 feature the owner referenced, not "one wheel tick advances one scene". Natural on trackpads and phones. Scene boundaries can optionally snap.

Observed on that ESPN page (read from the live page in Chrome): the page does not scroll normally. A fixed full-screen stage holds a very large canvas (about 33,000 x 11,000px) and scroll moves a virtual camera across it; the scroll length is about 60,000px and acts as the timeline; scrolling is continuous (no snapping); it also uses a lead video, audio clips and iframes. Its animation library could not be identified (nothing exposed globally).

Planned toolkit for this site:
- **GSAP + ScrollTrigger** (installed): pinning, scrubbed timelines, optional snapping. Register the plugin once.
- **`@gsap/react`** (not installed): clean setup/cleanup in React.
- **Lenis** (installed, in use): smooth scrolling for mouse wheels, driven by the GSAP ticker so ScrollTrigger stays in step. Touch devices keep native scrolling. Off with reduced motion. Owner's choice (2026-10-21).
- A 360 viewer only if the "In-vision 360" campus tag in the homepage design means real 360 imagery (to confirm).
- **Embla** (installed) for ordinary drag/swipe carousels. The home hero used it briefly, but a scroll-driven hero cannot, because Embla cannot be driven by the scroll position. It is currently unused.

Rules for every scene: a reduced-motion version, content as real server-rendered HTML (the animation only enhances it), keyboard scrolling must still work, animate only `transform` and `opacity`, optimise the images, test on a weak phone. Each scene needs a short motion spec from the design (what changes over which scroll range, what stays pinned, the mobile behaviour). Figma only shows still frames. Start with a small 2 to 3 scene prototype to settle the scroll feel before building the whole page.

## How a scroll scene is built (patterns from the first two scenes)

Not every section is scroll-scrubbed. **Rule of thumb (owner feedback, 2026-10-21):** a pinned, scrubbed scene suits a full-screen image sequence like the hero. A text section should not be pinned for several screens (it left a mostly empty screen); it should play a short staggered reveal when it comes into view (pattern 9).

Files: `src/lib/gsap.ts` (`registerGsap()` registers ScrollTrigger once; call it inside an effect), `src/lib/scroll.ts` (`scrollToY(y, seconds)` scrolls via Lenis when active), `src/components/layouts/SmoothScroll/` (Lenis, mounted once in the `(frontend)` layout; it also refreshes ScrollTrigger after images and fonts load).

1. **Client component, GSAP in an effect.** `useEffect`, a `gsap.context(() => {...}, rootElement)` for a timeline (its `ctx.revert()` is the cleanup), or a plain `ScrollTrigger.create` that you `.kill()`. `@gsap/react` is not needed and is not installed.
2. **Pinned scene:** `ScrollTrigger` with `pin: true`, `start` ("center center" for a column that fits the screen, "top top" for a tall one, as a function so it re-measures), `end: () => "+=" + window.innerHeight * N` (N screens of scroll), `invalidateOnRefresh: true`, `anticipatePin: 1`. ScrollTrigger inserts a `.pin-spacer` around the pinned element; the page keeps its normal spacing around it.
3. **Scrubbed timeline** (`scrub: true`): animate only `opacity`/`autoAlpha`, `transform` and `clip-path`, so the layout never changes while it plays. Set the starting state with `gsap.set` inside the context.
4. **One progress value for a multi-part scene** (the hero): write a `render(progress)` that sets every visual from the value; scroll calls it from `onUpdate`, other inputs (dots, reduced motion) call it directly. Autoplay is then just a programmatic scroll to the next position, so the scroll position is always the single source of truth.
5. **Reduced motion:** read `prefers-reduced-motion` once at mount; if set, do not create the triggers and show the final, readable state (everything visible, no pinning, no autoplay).
6. **Content stays in the DOM** (opacity 0 is still readable by assistive technology and search engines). Where a state hides content from the accessibility tree on purpose (hero slides), use `aria-hidden` plus `inert`.
7. **Do not mix `window.scrollTo` with a pending wheel scroll in tests**: Lenis keeps gliding toward the wheel's target and pulls the page back. Use `scrollToY`/`lenis.scrollTo` in code, and in browser tests jump with `window.scrollTo` only when no wheel input is in flight.
9. **Staggered reveal (time-based):** a paused `gsap.timeline` of overlapping tweens ("-=0.3" positions), started by `playOnScroll(ScrollTrigger, trigger, tl, { start: "top 75%" })` (`src/lib/useScrollReveal.ts`). **It replays (owner, 2026-10-28):** the first time it plays in full; after that it plays the SAME timeline sped up to about 0.8 s (`REPLAY_SECONDS`, never slower than the original) every time the section becomes visible again (scrolling down it plays at `start`; otherwise as soon as it is visible: from above, or sliding back in from the side of a pinned scene). The section is put back to its hidden start state ONLY when NOTHING of it can be seen on the screen, so nothing is ever hidden while any part of it is visible. **"Can be seen" is decided by an `IntersectionObserver` (where the element really is), never by scroll positions:** the first version used a second ScrollTrigger from "top bottom" to "bottom top", which is wrong for the first panel of a pinned sideways scene (Vision, Ecosystem): the page scrolls past its unpinned position while the pinned panel is still on the screen, so it was hidden while still sliding out sideways (found by the owner, 2026-10-28). `playOnScroll` returns a function that stops the observer. Pass `replay: false` for a one-off. Because a replay rewinds the timeline to its start, build the hidden state with `gsap.set` BEFORE creating the timeline. A page loaded already past the trigger needs no special case: the section stays hidden while it is off the screen and plays, quickly, when it comes back into view. Used by Vision/Mission/Values, Ecosystem, Framework, Campus, News and the CTA. Resizing: pinned scenes are measured again on a real resize by `refreshOnRealResize` (`src/lib/resize.ts`); never rely on `ScrollTrigger`'s own resize handling alone, it ignores some resizes on touch devices (see the changelog entry of 2026-10-22). Since the structure refactor this is one hook, `useScrollReveal(rootRef, build, { media?, start?, replay? })` in `src/lib/useScrollReveal.ts` (it adds the reduced-motion media query, the triggers and the clean-up around your paused timeline); media queries come from `src/lib/motion.ts`. See [23-shared-building-blocks.md](23-shared-building-blocks.md).
10. **Sideways pan (`HorizontalScene`):** pin a screen-high stage, put the panels in a row inside it, and tween the track's `x` by the measured distance between the first and last panel centres (`ease: "none"`, `scrub: true`, `end: () => "+=" + distance`). The layout is CSS only (a row at EVERY width since 2026-10-22, `motion-safe`); `gsap.matchMedia` adds the pin only in that same case. The stage is one screen high (`svh`) and clips; on narrow screens the scroll length is stretched (`scrollFactor`); a last panel taller than the screen is not shrunk but scrolled DOWN through after the pan (`data-tall`, the timeline continues past 1 with a `y` tween). A resize measures everything again and rebuilds the scene when its width changed. Used for Vision/Mission/Values to Courage, and the two other scenes.
11. **A panel animating with the sideways pan:** call `useSceneTimeline((tl, { stageWidth, distance, progressAt }) => {...})` and add tweens to `tl` at positions between 0 and 1 (a fraction of the whole pan). `progressAt(el, offsetPx, screenX)` gives the scroll progress at which a point of an element reaches a screen x, so an animation can start exactly when something comes into view (call it before hiding or scaling the element). Keep every tween inside 0 to 1, or the timeline gets longer and the pan slows. Put the starting state (`gsap.set`) inside the callback so it is undone when the row layout ends. Phones, which have no pan, run the same builder on their own paused timeline started by a `ScrollTrigger` with `once: true`. Used for the Courage typewriter and photo pops and the Journey column reveals.
13. **Several scenes on one page, and tall panels:** a page can have more than one `HorizontalScene` (each is its own pin and context). A panel taller than the window is scaled down by the scene to fit while pinned (the `fit` step, run on `refreshInit`), so design panels to be roughly one screen high or less. **A scene with only ONE panel is not a scene** (2026-10-24: the home page can show a scene cut down to its first panel, see `HOME_SECTION_LIMIT`): no pin, no row, no scaling, the panel is an ordinary section at its natural size (`sideways` in `HorizontalScene.tsx`). In tests, find a scene's spacer with `section.closest(".pin-spacer")`, not by position.
12. **Rotating word (the client's reference, boltonschool.org):** all the words in one grid cell, so the slot is as wide as the longest; the active one is `opacity-100 translate-x-0`, the one that just left slides 10% to the right, the others wait 10% to the left (`transition-[opacity,translate] duration-500 ease-in-out`, Tailwind's `translate` property, so it never fights a GSAP transform). A timer runs only while an IntersectionObserver says the word is on screen; pause on hover; nothing with reduced motion. `<RotatingWord>`.
13. **Typewriter (kept, not used now):** one span per character (`aria-hidden`) plus a full-text `sr-only` copy; a proxy tween counts typed characters (`ease: "none"`) and only the characters that changed are touched. Do not use CSS `capitalize` on per-character spans.
8. **A dev server needs a restart after a new CSS file or a new package is added** (stale styles), see [05-design-system.md](05-design-system.md#spacing-and-layout).

## Principles

- Animation supports content and never blocks it.
- Reuse shared animation components and helpers rather than writing one-off animations per page.
- Keep timing and easing consistent. Define tokens (durations, easings) once and reference them.

## Performance

- Animate `transform` and `opacity` where possible. Avoid animating layout properties (`width`, `height`, `top`, `left`).
- Only client components that actually animate get `"use client"`.
- Lazy-load heavy animation code on pages that need it.
- Test on a low-end device or with CPU throttling.

## Accessibility

- Respect `prefers-reduced-motion`. Provide a reduced or disabled variant for every animation.
- No flashing content (max 3 flashes per second).
- Animation must never hide content from keyboard or screen reader users.

## Tokens

TBD (durations, easings, stagger values).

## Animation catalogue

| Name | Used on | Description |
| --- | --- | --- |
| (none yet) | | |
