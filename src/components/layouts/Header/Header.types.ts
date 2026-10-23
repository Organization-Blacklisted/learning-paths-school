import type { HeaderVariant } from "@/types/header";

export type HeaderProps = {
  /**
   * "transparent": overlays the top of the page (for pages that open with a hero image).
   * "solid": a 74px blue bar that stays at the top of the viewport.
   * Omit to pick automatically: the home page ("/") is transparent, every other page is solid.
   */
  variant?: HeaderVariant;
};
