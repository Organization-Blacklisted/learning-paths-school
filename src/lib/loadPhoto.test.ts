import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forgetPhotos, loadPhoto } from "./loadPhoto";

// A fake browser Image: the test decides what happens to each request (answer(src) is called when src is set).
type Answer = "load" | "error" | "never";
let answers: Answer[] = [];
let requests: { src: string; fetchPriority?: string }[] = [];
let decodeFails = false;

class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  fetchPriority?: string;
  decode = vi.fn(() => (decodeFails ? Promise.reject(new Error("decode")) : Promise.resolve()));
  set src(value: string) {
    requests.push({ src: value, fetchPriority: this.fetchPriority });
    const answer = answers.shift() ?? "load";
    if (answer === "load") queueMicrotask(() => this.onload?.());
    if (answer === "error") queueMicrotask(() => this.onerror?.());
  }
}

beforeEach(() => {
  answers = [];
  requests = [];
  decodeFails = false;
  forgetPhotos();
  vi.useFakeTimers();
  vi.stubGlobal("Image", FakeImage);
  (window as unknown as { Image: unknown }).Image = FakeImage;
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("loadPhoto", () => {
  it("resolves true when the photo loads", async () => {
    await expect(loadPhoto("/a.avif")).resolves.toBe(true);
    expect(requests).toEqual([{ src: "/a.avif", fetchPriority: undefined }]);
  });

  it("asks for low priority when it is a warm-up", async () => {
    await loadPhoto("/a.avif", { lowPriority: true });
    expect(requests[0].fetchPriority).toBe("low");
  });

  it("still resolves true when the photo loaded but could not be decoded ahead (it is decoded when it is painted)", async () => {
    decodeFails = true;
    await expect(loadPhoto("/a.avif")).resolves.toBe(true);
  });

  it("shares one request between calls for the same photo, and remembers a photo it has had", async () => {
    const [first, second] = [loadPhoto("/a.avif"), loadPhoto("/a.avif")];
    await Promise.all([first, second]);
    await loadPhoto("/a.avif");
    expect(requests).toHaveLength(1);
  });

  it("does not give up early: a slow photo is waited for (no time limit)", async () => {
    answers = ["never"];
    let settled = false;
    void loadPhoto("/slow.avif").then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(settled).toBe(false);
  });

  it("tries again after a failure, up to three attempts, then resolves false", async () => {
    answers = ["error", "error", "error"];
    const result = loadPhoto("/bad.avif");
    await vi.advanceTimersByTimeAsync(600);
    await vi.advanceTimersByTimeAsync(2500);
    await expect(result).resolves.toBe(false);
    expect(requests).toHaveLength(3);
  });

  it("succeeds when a later attempt works", async () => {
    answers = ["error", "load"];
    const result = loadPhoto("/flaky.avif");
    await vi.advanceTimersByTimeAsync(600);
    await expect(result).resolves.toBe(true);
    expect(requests).toHaveLength(2);
  });

  it("forgets a photo that failed, so the next call tries again", async () => {
    answers = ["error", "error", "error"];
    const first = loadPhoto("/bad.avif");
    await vi.advanceTimersByTimeAsync(3100);
    await expect(first).resolves.toBe(false);
    await vi.advanceTimersByTimeAsync(0);
    answers = ["load"];
    await expect(loadPhoto("/bad.avif")).resolves.toBe(true);
    expect(requests).toHaveLength(4);
  });
});
