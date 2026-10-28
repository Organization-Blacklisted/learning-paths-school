import { CONTAINER_WIDTH } from "./Container.constants";
import type { ContainerProps } from "./Container.types";

// Centred content column with side gutters. The default width is the brief's main container (1520px).
// The gutter is the fluid token --spacing-gutter (src/styles/spacing.css: 5% of the screen width, from 20px to 80px; it was a flat 20px /
// 40px). The max width is contentWidth + 2 gutters, so the content area is exactly contentWidth once the viewport is wide enough
// (1680px for the main container). See CONTAINER_WIDTH for the other widths.
export default function Container({ children, className = "", contentWidth = CONTAINER_WIDTH.main }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-gutter ${className}`} style={{ maxWidth: `calc(${contentWidth}px + 2 * var(--spacing-gutter))` }}>
      {children}
    </div>
  );
}
