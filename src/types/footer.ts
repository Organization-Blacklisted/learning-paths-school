export type FooterLink = {
  label: string;
  href: string;
};

export type FooterSocialLink = {
  label: string;
  href: string;
  /** Path under /public. */
  icon: string;
  /** Icon box size in px (the SVG's own width/height). */
  size: number;
  /**
   * true: the SVG already includes the 40px bordered box (Facebook, Instagram).
   * false: the SVG is a bare glyph and the border box is drawn in CSS (YouTube, X).
   */
  framed: boolean;
};

export type FooterContent = {
  cta: {
    eyebrow: string;
    headingStart: string;
    headingHighlight: string;
    headingEnd: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
  };
  contact: {
    title: string;
    phone: { label: string; href: string };
    email: { label: string; href: string };
    address: string;
  };
  usefulLinks: {
    title: string;
    columns: [FooterLink[], FooterLink[]];
  };
  connect: {
    title: string;
    social: FooterSocialLink[];
  };
  legal: {
    copyright: string;
    links: FooterLink[];
  };
};
