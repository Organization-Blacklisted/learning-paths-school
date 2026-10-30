export type MenuLink = {
  id: string;
  label: string;
  href: string;
};

/** One main item of the menu ("About Us") and the links shown when it is chosen. */
export type MenuSection = {
  id: string;
  label: string;
  links: MenuLink[];
};

/** The mega menu that opens from the header's menu button. Managed in the codebase (src/data/menu.ts), not in the CMS. */
export type MenuContent = {
  /** Accessible name of the menu (a dialog). */
  label: string;
  /** Accessible name of the close button. */
  closeLabel: string;
  sections: MenuSection[];
  /** The two small links above the lists, next to the close button. */
  utility: { parentLogin: MenuLink; contact: MenuLink };
  /** The two buttons under the lists. */
  actions: { enquiry: MenuLink; career: MenuLink };
};
