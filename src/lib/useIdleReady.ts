"use client";

import { useEffect, useState, type RefObject } from "react";
import { PHONE } from "@/lib/motion";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * False on the server and during the first render, then true when the images of a part of the page should be requested. Use it to
 * hold back images that are not needed for the first screen:
 *
 *   const rootRef = useRef<HTMLElement>(null);
 *   const ready = useIdleReady(800, rootRef);
 *   {ready && <Image ... />}   // the box around it keeps its size, so nothing jumps when it appears
 *
 * Two policies, chosen when the page loads:
 * - **Normal (a desktop-width screen on a good connection):** once the page has finished loading AND the browser is idle (plus
 *   `extraDelayMs`). Everything below the fold then arrives in the background, in time for the sideways scenes (which bring content
 *   in from the side, where the browser cannot know it is about to be needed).
 * - **Careful (a screen under 1024px wide, "save data" on, or a 2G/3G connection), when \`nearRef\` is given:** only when the
 *   element is within about two screens of the viewport. A phone's page is one long column, so proximity is a good signal, and the
 *   visitor does not download the whole page's 4 MB of photos (the lower half may never be scrolled to).
 *
 * Why not just \`loading="lazy"\`: it still loads anything within about 1250px of the screen, and everything requested at the start shared the
 * bandwidth with the first hero photo (measured: slide 1 finished at 10 s on a throttled phone).
 */
export function useIdleReady(extraDelayMs = 0, nearRef?: RefObject<Element | null>): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const careful = window.matchMedia(PHONE).matches || !!connection?.saveData || /(^|-)(2|3)g$/.test(connection?.effectiveType ?? "");
    const target = nearRef?.current;

    if (careful && target && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setReady(true);
            observer.disconnect();
          }
        },
        { rootMargin: "1800px" },
      );
      observer.observe(target);
      return () => observer.disconnect();
    }

    let timer: number | undefined;
    const afterIdle = () => {
      timer = window.setTimeout(() => setReady(true), extraDelayMs);
    };
    const onLoaded = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(afterIdle, { timeout: 3000 });
      else window.setTimeout(afterIdle, 300); // Safari has no requestIdleCallback
    };

    if (document.readyState === "complete") onLoaded();
    else window.addEventListener("load", onLoaded, { once: true });
    return () => {
      window.removeEventListener("load", onLoaded);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [extraDelayMs, nearRef]);

  return ready;
}
