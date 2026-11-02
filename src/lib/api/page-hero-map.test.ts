import { describe, expect, it } from "vitest";
import type { PageHeroContent } from "@/types/page-hero";
import { pageHeroFromDoc } from "./page-hero-map";

const withPhoto: PageHeroContent = {
  label: "L",
  badge: "Badge",
  titleLead: "Lead",
  titleAccent: "Accent",
  subtitle: "Subtitle",
  image: { src: "/default.avif", alt: "Default", width: 1920, height: 736 },
};
const textOnly: PageHeroContent = { label: "L", badge: "Badge", titleLead: "Lead", titleAccent: "Accent", subtitle: "Subtitle" };
const newPhoto = { id: 3, url: "/api/media/file/x.avif", alt: "X", width: 2000, height: 700 } as never;

describe("pageHeroFromDoc", () => {
  it("is the defaults when there is no document", () => {
    expect(pageHeroFromDoc(null, withPhoto)).toBe(withPhoto);
    expect(pageHeroFromDoc(undefined, textOnly)).toBe(textOnly);
  });

  it("takes the words an editor wrote and keeps the rest", () => {
    const result = pageHeroFromDoc({ badge: "New pill", titleLead: "", titleAccent: null, subtitle: "New line" }, withPhoto);
    expect(result).toMatchObject({ label: "L", badge: "New pill", titleLead: "Lead", titleAccent: "Accent", subtitle: "New line" });
    expect(result.image).toEqual(withPhoto.image);
  });

  it("takes the editor's photo when the defaults have one", () => {
    expect(pageHeroFromDoc({ image: newPhoto }, withPhoto).image).toEqual({
      src: "/api/media/file/x.avif",
      alt: "X",
      width: 2000,
      height: 700,
    });
  });

  it("never gives a text-only hero a photo, even if the document somehow has one", () => {
    expect(pageHeroFromDoc({ badge: "Pill", image: newPhoto }, textOnly).image).toBeUndefined();
  });
});
