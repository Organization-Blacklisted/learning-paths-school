import type { RefObject } from "react";

export type MegaMenuProps = {
  open: boolean;
  /** Called by the close button, the Escape key, a click on any link and a page change. */
  onClose: () => void;
  /** The element to give the focus back to when the menu closes (the header's menu button). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** The visitor is about to open the menu (the pointer is on the button): the photo can be requested now. */
  warm?: boolean;
  /** The id the menu button points at with aria-controls. */
  id?: string;
};
