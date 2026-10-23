export type HeaderVariant = "transparent" | "solid";

export type HeaderContent = {
  logo: {
    src: string;
    /** The SVG's own width/height in px. */
    width: number;
    height: number;
    /** Accessible name of the home link (the logo image itself is decorative). */
    homeLabel: string;
  };
  admissions: { label: string; href: string };
  menu: { openLabel: string };
};
