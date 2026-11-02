import type { CtaContent } from "@/types/cta";

export type CtaSectionProps = {
  /** Defaults to the school's standard admissions call to action (src/data/cta.ts). */
  content?: CtaContent;
  /** "default": 200px above (the home page). "inner": 120px, for the inner pages whose design draws 120px between sections. */
  spacing?: "default" | "inner";
};
