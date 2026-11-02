import { describe, expect, it } from "vitest";
import { photoFromMedia } from "./media-map";

const fallback = { src: "/images/default.avif", alt: "Default photo", width: 1000, height: 800 };

describe("photoFromMedia", () => {
  it("takes the address, size and alt text of the photo in the media library", () => {
    const media = { id: 5, url: "/api/media/file/new.avif", alt: "New photo", width: 2000, height: 1500 } as never;
    expect(photoFromMedia(media, fallback)).toEqual({ src: "/api/media/file/new.avif", alt: "New photo", width: 2000, height: 1500 });
  });

  it("keeps the default alt text and size when the library has none", () => {
    const media = { id: 5, url: "/api/media/file/new.avif", alt: "", width: null, height: null } as never;
    expect(photoFromMedia(media, fallback)).toEqual({ src: "/api/media/file/new.avif", alt: "Default photo", width: 1000, height: 800 });
  });

  it("is the default when nothing is chosen, or when only an id came back (the photo was not loaded)", () => {
    expect(photoFromMedia(null, fallback)).toBe(fallback);
    expect(photoFromMedia(undefined, fallback)).toBe(fallback);
    expect(photoFromMedia(7, fallback)).toBe(fallback);
    expect(photoFromMedia({ id: 7, url: null } as never, fallback)).toBe(fallback);
  });
});
