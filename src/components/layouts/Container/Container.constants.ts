// Content widths (px, at desktop) used on the site. Pass one to <Container contentWidth={...}> or <Section contentWidth={...}>.
//
// main: the main content container. The project brief: "1520 px for most sections (desktop)". This is the
//       default, and it is also what the footer and the solid header use.
// wide: the homepage hero text and the transparent header (Figma: 1740px, 90px margins at 1920px).
export const CONTAINER_WIDTH = {
  main: 1520,
  wide: 1740,
} as const;
