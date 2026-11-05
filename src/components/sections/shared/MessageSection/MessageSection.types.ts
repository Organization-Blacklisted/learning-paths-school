import type { MessageContent } from "@/types/message";

export type MessageSectionProps = {
  content: MessageContent;
  /**
   * "letter" (default): the Principal's Welcome page's design, a quotation heading on one line and a letter. "welcome": the Welcome to LPS page's design (Figma node
   * 5688:14367): a bigger portrait on a white band, the heading on two lines and a short text. Design, so a page chooses it, not the CMS.
   */
  variant?: "letter" | "welcome";
};
