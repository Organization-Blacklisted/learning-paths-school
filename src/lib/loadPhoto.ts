// Fetches a photo ahead of time, so that showing it later (the Ecosystem tabs) never shows an empty box.
//
// It resolves true once the browser has the photo (and has decoded it, so the first frame of a fade does not wait for that), and false when it could not
// be had after the attempts. It never resolves early: a slow photo is simply waited for, because showing the tab before the photo is there (the first
// version waited 2 seconds and then did) drops the old photo and leaves an empty box, and a photo that fails then stays empty until a refresh. On the live
// site these photos come through a serverless function (/api/media/file/...) that can be cold: a first request has taken 15 seconds.
//
// One request per address: a call while another is running for the same photo shares it (a quick second click, or the warm-up), and a photo that was
// had is remembered. A failed one is forgotten, so the next call tries again.

const RETRY_AFTER_MS = [600, 2500]; // after the first failure, and after the second: three attempts in all

const known = new Map<string, Promise<boolean>>();

function attempt(src: string, lowPriority: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    if (lowPriority) img.fetchPriority = "low";
    img.onload = () => {
      // decode() can fail for a photo that loaded fine (then it is simply decoded when it is first painted)
      (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(true));
    };
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/** `lowPriority`: for the warm-up of photos nobody asked for yet, so they never compete with what the page needs. */
export function loadPhoto(src: string, { lowPriority = false } = {}): Promise<boolean> {
  const existing = known.get(src);
  if (existing) return existing;
  const promise = (async () => {
    for (let tries = 0; ; tries++) {
      if (await attempt(src, lowPriority)) return true;
      if (tries >= RETRY_AFTER_MS.length) return false;
      await new Promise((r) => window.setTimeout(r, RETRY_AFTER_MS[tries]));
    }
  })();
  known.set(src, promise);
  void promise.then((ok) => {
    if (!ok && known.get(src) === promise) known.delete(src); // forgotten: the next call tries again
  });
  return promise;
}

/** For the tests: forget everything. */
export function forgetPhotos() {
  known.clear();
}
