/** One tab of "The Ecosystem Behind LPS 360": its label and the content shown under the tabs. */
export type EcosystemTab = {
  id: string;
  label: string;
  /** Width of the tab button in px from lg (Figma gives each tab its own width). */
  width: number;
  /** Photo under the tabs (path under /public, already compressed). */
  photo: { src: string; alt: string };
  title: string;
  text: string;
  bullets: string[];
};

export type EcosystemContent = {
  label: string;
  badge: string;
  /** Heading: grey part and blue slanted part ("Five Foundations That Bring The" + "Vision To Life"). */
  titleLead: string;
  titleAccent: string;
  intro: string;
  /** Accessible name of the tab list. */
  tabsLabel: string;
  tabs: EcosystemTab[];
};
