/** The content of the reusable message section (src/components/sections/shared/MessageSection): a portrait beside a letter. */
export type MessageContent = {
  /** Accessible name of the section. */
  label: string;
  /** The portrait (777 x 816 in the design). */
  image: { src: string; alt: string; width: number; height: number };
  /** First part of the heading (grey), for example the start of a quotation. */
  titleLead: string;
  /** Last part of the heading (blue, slanted). */
  titleAccent: string;
  /** The paragraphs of the letter. A line break inside a paragraph is kept (it starts a new line, with no extra space). */
  paragraphs: string[];
  /** Who it is from: a name (bold italic, blue) and a role under it. */
  signatory: { name: string; role: string };
};
