export type VisionItem = {
  id: string;
  title: string;
  text: string;
  /** Width of the paragraph in px at desktop, from the design (it sets where the lines wrap). */
  textWidth: number;
};

export type VisionMissionValuesContent = {
  label: string;
  shield: { src: string; width: number; height: number };
  items: VisionItem[];
};
