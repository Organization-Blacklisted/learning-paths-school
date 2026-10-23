"use client";

import type gsap from "gsap";
import { createContext, useContext, useEffect, useRef } from "react";

// How a panel animates with the scene's sideways scroll.
//
// <HorizontalScene> owns ONE scrubbed timeline of duration 1: 0 is "the pin has just started", 1 is "the last panel
// is centred", and scroll moves it. A panel adds its own tweens to that timeline with `useSceneTimeline`, using
// positions between 0 and 1 (a fraction of the whole pan), so its animation follows the scroll exactly and
// reverses when the user scrolls back. The callback only runs when the scene is in its pinned row layout (from
// 1024px, motion allowed); everywhere else the panel stays in its normal, finished state.
//
//   useSceneTimeline((tl, { stage, distance }) => {
//     tl.from(box, { autoAlpha: 0, duration: 0.2 }, 0.3);   // from 30% to 50% of the pan
//   });

export type SceneInfo = {
  /** The pinned stage element (the visible screen of the scene). */
  stage: HTMLElement;
  /** How many px the track moves left over the whole pan (= how many px of scroll the pan takes). */
  distance: number;
  /** Width of the visible screen of the scene, in px. */
  stageWidth: number;
  /**
   * Scroll progress of the scene (0 = pan starts, 1 = last panel centred; can be below 0 or above 1) at which the
   * point `offset` px from the left edge of `el` reaches screen x `screenX` (px from the left of the stage). Use it
   * to start an animation when something comes into view. Call it BEFORE you hide or scale the element.
   */
  progressAt: (el: HTMLElement, offset: number, screenX: number) => number;
};

export type SceneCallback = (timeline: gsap.core.Timeline, info: SceneInfo) => void;

export type SceneRegistry = {
  register: (callback: SceneCallback) => () => void;
};

export const SceneContext = createContext<SceneRegistry | null>(null);

/**
 * Add animations to the scene's scroll timeline. Call it in a client component rendered inside <HorizontalScene>.
 * Put `gsap.set` for the starting state inside the callback too, so it is undone when the row layout ends.
 */
export function useSceneTimeline(callback: SceneCallback) {
  const scene = useContext(SceneContext);
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  });
  useEffect(() => {
    if (!scene) return;
    return scene.register((tl, info) => latest.current(tl, info));
  }, [scene]);
}
