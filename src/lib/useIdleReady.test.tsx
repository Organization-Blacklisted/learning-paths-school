import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { PHONE } from "@/lib/motion";
import { useIdleReady } from "@/lib/useIdleReady";

// The browser features the hook looks at are replaced by controllable fakes: the screen width (matchMedia), the connection
// (navigator.connection), IntersectionObserver, requestIdleCallback and document.readyState.

type ObserverRecord = { callback: IntersectionObserverCallback; options?: IntersectionObserverInit; disconnect: Mock<() => void> };
let observers: ObserverRecord[] = [];

function setScreen({ phone = false }: { phone?: boolean }) {
  window.matchMedia = vi.fn((query: string) => ({ matches: query === PHONE && phone })) as unknown as typeof window.matchMedia;
}
function setConnection(connection: { saveData?: boolean; effectiveType?: string } | undefined) {
  Object.defineProperty(navigator, "connection", { value: connection, configurable: true });
}
function setReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, "readyState", { value: state, configurable: true });
}
/** Mounts the hook. The ref is made ONCE (a new one on every render would restart the hook); `watch` false means no element to watch. */
function mount(extraDelayMs: number, watch = true) {
  const ref = { current: document.createElement("div") };
  return renderHook(() => useIdleReady(extraDelayMs, watch ? ref : undefined));
}
/** Tells the hook's IntersectionObserver that its element is (or is not) near the screen. */
const reportNear = (isIntersecting: boolean) =>
  act(() => observers[0].callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));

beforeEach(() => {
  vi.useFakeTimers();
  observers = [];
  setScreen({ phone: false });
  setConnection(undefined);
  setReadyState("complete");
  // requestIdleCallback: the browser is idle immediately
  vi.stubGlobal("requestIdleCallback", (callback: () => void) => {
    callback();
    return 1;
  });
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      record: ObserverRecord;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.record = { callback, options, disconnect: vi.fn<() => void>() };
        observers.push(this.record);
      }
      observe() {}
      disconnect() {
        this.record.disconnect();
      }
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  setReadyState("complete");
});

describe("useIdleReady, normal policy (desktop width, good connection)", () => {
  it("is false on the first render", () => {
    const { result } = mount(800);
    expect(result.current).toBe(false);
  });

  it("becomes true once the page has loaded and the browser is idle, plus the extra delay", () => {
    const { result } = mount(800);
    act(() => vi.advanceTimersByTime(799));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it("with no extra delay it is ready on the next tick after idle", () => {
    const { result } = mount(0);
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe(true);
  });

  it("waits for the window load event while the page is still loading", () => {
    setReadyState("loading");
    const { result } = mount(100);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("load"));
    });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe(true);
  });

  it("waits for the browser to be idle (requestIdleCallback), not just for the load event", () => {
    let runIdle: () => void = () => {};
    vi.stubGlobal("requestIdleCallback", (callback: () => void) => {
      runIdle = callback;
      return 1;
    });
    const { result } = mount(0);
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(false);
    act(() => runIdle());
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe(true);
  });

  it("falls back to a 300 ms wait (plus the extra delay) where requestIdleCallback does not exist (Safari)", () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    const { result } = mount(100);
    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it("does not use an IntersectionObserver", () => {
    mount(0);
    expect(observers).toHaveLength(0);
  });

  it("a fast connection (4g) is not a careful one", () => {
    setConnection({ effectiveType: "4g", saveData: false });
    mount(0);
    expect(observers).toHaveLength(0);
  });

  it("stops waiting when the component unmounts (no state change afterwards, no listener left)", () => {
    setReadyState("loading");
    const remove = vi.spyOn(window, "removeEventListener");
    const { result, unmount } = mount(500);
    unmount();
    expect(remove).toHaveBeenCalledWith("load", expect.any(Function));
    act(() => {
      window.dispatchEvent(new Event("load"));
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(false);
  });
});

describe("useIdleReady, careful policy (narrow screen, 'save data' or a slow connection) with an element to watch", () => {
  const careful: [string, () => void][] = [
    ["a screen under 1024px wide", () => setScreen({ phone: true })],
    ["'save data' on", () => setConnection({ saveData: true, effectiveType: "4g" })],
    ["a 3g connection", () => setConnection({ effectiveType: "3g" })],
    ["a 2g connection", () => setConnection({ effectiveType: "2g" })],
    ["a slow-2g connection", () => setConnection({ effectiveType: "slow-2g" })],
  ];

  it.each(careful)("%s: not ready by time alone", (_name, apply) => {
    apply();
    const { result } = mount(0);
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current).toBe(false);
    expect(observers).toHaveLength(1);
  });

  it.each(careful)("%s: ready when the element is within two screens", (_name, apply) => {
    apply();
    const { result } = mount(0);
    reportNear(true);
    expect(result.current).toBe(true);
  });

  it("watches with a 1800px margin on every side of the screen (panels of a sideways scene wait left and right of it)", () => {
    setScreen({ phone: true });
    mount(0);
    expect(observers[0].options).toMatchObject({ rootMargin: "1800px" });
  });

  it("stays false while the element is far away, and stops watching once it has been near", () => {
    setScreen({ phone: true });
    const { result } = mount(0);
    reportNear(false);
    expect(result.current).toBe(false);
    expect(observers[0].disconnect).not.toHaveBeenCalled();

    reportNear(true);
    expect(result.current).toBe(true);
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
  });

  it("disconnects its observer when the component unmounts", () => {
    setScreen({ phone: true });
    const { unmount } = mount(0);
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalled();
  });

  it("without an element to watch it falls back to the normal (time based) policy", () => {
    setScreen({ phone: true });
    const { result } = mount(0, false);
    expect(observers).toHaveLength(0);
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe(true);
  });

  it("without IntersectionObserver in the browser it falls back to the time based policy", () => {
    setScreen({ phone: true });
    vi.stubGlobal("IntersectionObserver", undefined);
    // `"IntersectionObserver" in window` must be false for the fallback
    delete (window as unknown as Record<string, unknown>).IntersectionObserver;
    const { result } = mount(0);
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe(true);
  });
});
