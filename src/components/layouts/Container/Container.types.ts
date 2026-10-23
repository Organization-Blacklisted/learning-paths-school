import type { ReactNode } from "react";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** Width of the content area in px once the viewport is wide enough. Default: the main container (1520). See CONTAINER_WIDTH. */
  contentWidth?: number;
};
