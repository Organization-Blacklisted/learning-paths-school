"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A muted, looping, inline video that plays only while it is on screen, with a play/pause toggle for a button (WCAG 2.2.2: moving
 * content longer than 5 seconds needs a way to stop it).
 *
 *   const { videoRef, paused, toggle, handlers } = useViewportVideo(Boolean(video));
 *   <video ref={videoRef} muted loop playsInline preload="none" {...handlers}>…</video>
 *   <button onClick={toggle}>{paused ? "Play" : "Pause"}</button>
 *
 * It plays while at least 35% of the video is visible and pauses otherwise; it never starts by itself with reduced motion (the poster
 * stays). `paused` follows the video's real state (its play and pause events), so the button always says the right thing, also when the
 * video starts and stops by itself. Pass `enabled` false while there is no video element yet.
 */
export function useViewportVideo(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    if (prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [enabled]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  return {
    videoRef,
    paused,
    toggle,
    /** Spread on the <video>: keeps `paused` in step with the video. */
    handlers: { onPlay: () => setPaused(false), onPause: () => setPaused(true) },
  };
}
