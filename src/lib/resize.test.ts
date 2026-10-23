import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { refreshOnRealResize } from "@/lib/resize";

// The window size is set by hand and the clock is fake: "scrolling" is a scroll event, "time passing" is the fake clock.
function resizeTo(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: height, configurable: true });
  window.dispatchEvent(new Event("resize"));
}
const scroll = () => window.dispatchEvent(new Event("scroll"));

let refresh: Mock<() => void>;
let stop: () => void;

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, "innerWidth", { value: 1326, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: 792, configurable: true });
  refresh = vi.fn<() => void>();
  stop = refreshOnRealResize(refresh);
});
afterEach(() => {
  stop();
  vi.useRealTimers();
});

describe("refreshOnRealResize", () => {
  it("refreshes after the window is resized while the page is still (DevTools docked at the bottom: height only)", () => {
    resizeTo(1326, 672);
    expect(refresh).not.toHaveBeenCalled(); // not at once: it waits for the resizing to stop
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("refreshes after a resize that changes the width too", () => {
    resizeTo(900, 640);
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("a whole drag of the window edge (many resize events) refreshes once, after it stops", () => {
    for (const width of [1300, 1250, 1200, 1150, 1100]) {
      resizeTo(width, 700);
      vi.advanceTimersByTime(100); // shorter than the wait, so the burst continues
    }
    expect(refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("ignores the height changing WHILE scrolling (a phone's address bar sliding away: the pinned scenes must not be measured again)", () => {
    scroll();
    vi.advanceTimersByTime(100);
    resizeTo(1326, 880); // the bar collapsed: the window got taller
    vi.advanceTimersByTime(1000);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("ignores repeated address-bar changes during one long scroll", () => {
    for (let i = 0; i < 5; i++) {
      scroll();
      vi.advanceTimersByTime(80);
      resizeTo(1326, i % 2 ? 792 : 860);
    }
    vi.advanceTimersByTime(1000);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("does refresh when the WIDTH changes while scrolling (the phone was rotated)", () => {
    scroll();
    vi.advanceTimersByTime(100);
    resizeTo(792, 1326);
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("treats a resize as real again once the scrolling has stopped for a while", () => {
    scroll();
    vi.advanceTimersByTime(700); // quiet for longer than the 600 ms window
    resizeTo(1326, 672);
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("measures the width change against the width at the last refresh, so a second rotation still counts", () => {
    resizeTo(900, 640);
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
    scroll();
    vi.advanceTimersByTime(100);
    resizeTo(900, 700); // height only, while scrolling: ignored
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
    scroll();
    vi.advanceTimersByTime(100);
    resizeTo(640, 900); // width changed again: refreshes
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("stops watching when told to (no refresh after cleanup, nothing left pending)", () => {
    resizeTo(1326, 672);
    stop();
    vi.advanceTimersByTime(1000);
    expect(refresh).not.toHaveBeenCalled();
    resizeTo(1000, 600);
    vi.advanceTimersByTime(1000);
    expect(refresh).not.toHaveBeenCalled();
  });
});
