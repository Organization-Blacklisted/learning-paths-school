"use client";

import { useEffect, useReducer, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// One word of a line that changes by itself, like the strapline of boltonschool.org (the client's reference): the rest of the line stays
// fully visible and only this word swaps. The new word fades in while sliding in from 10% to its left, the old one fades out while sliding
// 10% to the right (0.5 s, ease in-out). Used for the last word of the Courage heading.
//
//   The courage to find your <RotatingWord words={["Path", "Purpose", "Voice"]} />
//
// - All the words sit in ONE grid cell, so the slot is as wide as the widest word and the text around it never moves.
// - It rotates only while it is on screen (an IntersectionObserver), stops while the pointer is over it, and not at all with reduced motion
//   (the first word stays). The whole thing is aria-hidden: put the real sentence in text for screen readers next to it, with the FIRST word.
// - Each word has data-rotating-word and data-state="active" | "old" | "idle" (for tests, and to freeze it in screenshots).
type State = { active: number; previous: number | null };

export default function RotatingWord({
  words,
  interval = 3500,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [state, next] = useReducer((s: State) => ({ active: (s.active + 1) % words.length, previous: s.active }), {
    active: 0,
    previous: null,
  });
  const rootRef = useRef<HTMLSpanElement>(null);
  const hovered = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || words.length < 2 || prefersReducedMotion()) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        timer = undefined;
        if (entry.isIntersecting) {
          timer = window.setInterval(() => {
            if (!hovered.current) next();
          }, interval);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [words.length, interval]);

  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      className={`inline-grid align-baseline ${className}`}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      {words.map((word, index) => {
        const status = index === state.active ? "active" : index === state.previous ? "old" : "idle";
        return (
          <span
            key={word}
            data-rotating-word
            data-state={status}
            className="col-start-1 row-start-1 -translate-x-[10%] justify-self-start opacity-0 transition-[opacity,translate] duration-500 ease-in-out data-[state=active]:translate-x-0 data-[state=active]:opacity-100 data-[state=old]:translate-x-[10%] motion-reduce:transition-none"
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
