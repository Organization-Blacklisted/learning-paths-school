import type { CtaContent } from "@/types/cta";

export type CtaSectionProps = {
  /** Defaults to the school's standard admissions call to action (src/data/cta.ts). */
  content?: CtaContent;
};
