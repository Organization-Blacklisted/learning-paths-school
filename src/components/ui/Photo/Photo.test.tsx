import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Photo, { photoSrc } from "@/components/ui/Photo";

describe("Photo", () => {
  it("renders nothing until it is ready (the box around it keeps the space)", () => {
    const { container } = render(<Photo ready={false} src="/images/a.avif" alt="A" width={10} height={10} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the image once ready, loading right away, not draggable, not selectable, not re-encoded", () => {
    const { getByAltText } = render(<Photo ready src="/images/a.avif" alt="A" width={10} height={10} className="object-cover" />);
    const img = getByAltText("A");
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("draggable")).toBe("false");
    expect(img.className).toContain("select-none");
    expect(img.className).toContain("object-cover");
    // unoptimized: the file is used as it is, not sent through /_next/image
    expect(img.getAttribute("src")).toBe("/images/a.avif");
  });

  it("is ready by default (load it now)", () => {
    const { getByAltText } = render(<Photo src="/images/b.avif" alt="B" width={10} height={10} />);
    expect(getByAltText("B")).toBeTruthy();
  });

  it("keeps an empty alt for decorative photos", () => {
    const { container } = render(<Photo src="/images/c.avif" alt="" width={10} height={10} />);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });
});

describe("photoSrc", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is the address the <img> of a Photo really uses, for a site file and for a media file", () => {
    for (const src of ["/images/a.avif", "/api/media/file/home-ecosystem-sports.avif"]) {
      const { getByAltText, unmount } = render(<Photo src={src} alt="x" fill />);
      expect(photoSrc(src)).toBe(getByAltText("x").getAttribute("src"));
      unmount();
    }
  });

  it("is still the address the <img> uses when Vercel gives the deployment an id (Next.js then adds ?dpl=...: a preload of the bare address is another photo for the browser)", () => {
    vi.stubEnv("NEXT_DEPLOYMENT_ID", "dpl_test123");
    const src = "/api/media/file/home-ecosystem-sports.avif";
    const { getByAltText } = render(<Photo src={src} alt="y" fill />);
    expect(photoSrc(src)).toBe(getByAltText("y").getAttribute("src"));
  });
});
