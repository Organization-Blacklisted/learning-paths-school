import { CONTAINER_WIDTH } from "./Container.constants";
import type { ContainerProps } from "./Container.types";

// Centred content column with side gutters. The default width is the brief's main container (1520px).
// The max width is contentWidth + 2 * 40px gutter, so the content area is exactly contentWidth once the
// viewport is wide enough. Gutters: 20px on mobile, 40px from md up. See CONTAINER_WIDTH for the other widths.
const GUTTER = 40;

export default function Container({ children, className = "", contentWidth = CONTAINER_WIDTH.main }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-5 md:px-10 ${className}`} style={{ maxWidth: contentWidth + GUTTER * 2 }}>
      {children}
    </div>
  );
}
