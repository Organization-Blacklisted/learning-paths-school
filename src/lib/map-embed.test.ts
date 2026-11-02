import { describe, expect, it } from "vitest";
import { mapEmbedSrc } from "./map-embed";

const SRC = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3431.358040222468!2d76.728955!3d30.6802!5e0!3m2!1sen!2sin";

describe("mapEmbedSrc", () => {
  it("accepts a bare Google Maps embed address", () => {
    expect(mapEmbedSrc(SRC)).toBe(SRC);
    expect(mapEmbedSrc(`  ${SRC}  `)).toBe(SRC);
  });

  it("takes the src out of a pasted iframe tag, with either kind of quote", () => {
    expect(mapEmbedSrc(`<iframe src="${SRC}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`)).toBe(
      SRC,
    );
    expect(mapEmbedSrc(`<iframe width="600" src='${SRC}' loading="lazy"></iframe>`)).toBe(SRC);
  });

  it("turns &amp; (how an & is written inside a tag) back into &", () => {
    expect(mapEmbedSrc('<iframe src="https://www.google.com/maps/embed?pb=a&amp;b=c"></iframe>')).toBe(
      "https://www.google.com/maps/embed?pb=a&b=c",
    );
  });

  it("refuses anything that is not a Google Maps embed, so nothing else is ever put in the page's iframe", () => {
    expect(mapEmbedSrc("https://evil.example/maps/embed?pb=1")).toBeNull();
    expect(mapEmbedSrc("https://www.google.com/maps/embedx")).toBeNull();
    expect(mapEmbedSrc("https://www.google.com.evil.example/maps/embed?pb=1")).toBeNull();
    expect(mapEmbedSrc("http://www.google.com/maps/embed?pb=1")).toBeNull();
    expect(mapEmbedSrc("javascript:alert(1)")).toBeNull();
    expect(mapEmbedSrc('<iframe src="https://evil.example/x"></iframe>')).toBeNull();
    expect(mapEmbedSrc("<iframe></iframe>")).toBeNull();
  });

  it("returns null for nothing", () => {
    expect(mapEmbedSrc("")).toBeNull();
    expect(mapEmbedSrc("   ")).toBeNull();
    expect(mapEmbedSrc(null)).toBeNull();
    expect(mapEmbedSrc(undefined)).toBeNull();
  });
});
