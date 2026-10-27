import type { FrameworkContent } from "@/types/home";

// Content from the Figma frame "Frame 1618876729" (node 6529:1879), "The LPS 360 Framework". The diagram is 1319 x 773px
// ("Group 241"; it was 1228 wide until the design of 2026-10-27, which widened it so the 422px Resilient description fits);
// every x / y below is in Figma px from its top left corner. The seven pills spell PIONEER.
// Pill, line and dot positions: the Figma group position plus each part's offset inside the group. The right-hand
// groups (Enterprising, Ethical, Resilient) are mirror images of the left-hand ones: the dot is at the group's left
// edge, the pill at its right, so the dot and line are on the ring side of the pill, as on the left.
//
// ORDER ON THE RING (new design, 2026-10-27): the letters must spell PIONEER going round from the top left: P, I, O down the left side,
// N at the bottom, then up the right side: E (bottom right, Ethical), E (middle right, Enterprising), R (top right, Resilient). Before,
// the right side ran Enterprising, Ethical, Resilient from the top, which spelled PIONREE. The array keeps the school's order
// (P I O N, Enterprising, Ethical, Resilient), which is also the reading order on a phone; only the positions on the ring changed.
// Every number of the three right-hand groups below was checked against Figma node 6282:930 on 2026-10-27: each group is laid out
// mirrored (the design context gives its left edge, the pill sits at the group's right edge, the dot at its left edge); the
// descriptions are not mirrored and sit at the group's left edge plus their own offset.
const BASE = "/images/home/framework";

export const homeFramework: FrameworkContent = {
  label: "The LPS 360 framework",
  badge: "The LPS 360 Framework",
  titleLead: "By the end of 15 years at LPS,",
  titleAccent: "your child becomes a Pioneer",
  intro:
    "Seven interconnected outcomes, channelized through one holistic ecosystem  LPS 360 that integrates curriculum, wellbeing, and character across a child’s entire school life.",
  stage: { width: 1319, height: 773 },
  ring: { src: `${BASE}/ring.svg`, x: 358, y: 10, width: 525, height: 592 },
  photo: {
    src: `${BASE}/pioneers.avif`,
    alt: "Two LPS students in school blazers, a boy in a blue turban waving and a girl smiling",
    x: 431.19,
    y: 71.82,
    width: 377.065,
    height: 463.233,
  },
  centreLabel: { text: "LPS 360", x: 581.62, y: 0, width: 77.949 },
  items: [
    {
      id: "proficient",
      letter: "P",
      label: "PROFICIENT",
      description: "Learner-centred approach for robust competency and skills.",
      mirrored: true,
      pill: { x: 195.6, y: 57, width: 219, height: 55 },
      tone: "blue",
      labelTone: "blue",
      letterX: 28.13,
      letterTop: 13.66,
      labelX: 141,
      labelTop: 16.75,
      line: { src: `${BASE}/line135.svg`, x: 415.02, y: 83.48, width: 32.347 },
      dot: { src: `${BASE}/dot221.svg`, x: 439.24, y: 77.96 },
      text: { x: 43.52, y: 131.47, width: 314.365, align: "right" },
    },
    {
      id: "inclusive",
      letter: "I",
      label: "INCLUSIVE",
      description: "SEN-SEL-parenting support for every child to know “I AM ENOUGH”",
      mirrored: true,
      pill: { x: 109.6, y: 254, width: 219, height: 55 },
      tone: "deep",
      labelTone: "deep",
      letterX: 28.22,
      letterTop: 13.66,
      labelX: 134.14,
      labelTop: 16.75,
      line: { src: `${BASE}/line136.svg`, x: 328.18, y: 280.63, width: 32.347 },
      dot: { src: `${BASE}/dot222.svg`, x: 352.4, y: 275.11 },
      text: { x: 0, y: 341.71, width: 311.103, align: "right" },
    },
    {
      id: "open-minded",
      letter: "O",
      label: "OPEN-MINDED",
      description: "Choice and collaboration to enable Critical Thinking and Decision Making.",
      mirrored: true,
      pill: { x: 193.6, y: 497, width: 219, height: 55 },
      tone: "blue",
      labelTone: "blue",
      letterX: 29.27,
      letterTop: 14.66,
      labelX: 154.44,
      labelTop: 17.75,
      line: { src: `${BASE}/line137.svg`, x: 413, y: 523.6, width: 32.347 },
      dot: { src: `${BASE}/dot223.svg`, x: 437.22, y: 518.07 },
      text: { x: 80.99, y: 579.39, width: 314.365, align: "right" },
    },
    {
      id: "novel",
      letter: "N",
      label: "NOVEL",
      description: "STEAM driven innovation, problem-solving, and holistic thinking to drive creative, independent learning.",
      mirrored: false,
      pill: { x: 535.6, y: 634, width: 219, height: 55 },
      tone: "deep",
      labelTone: "deep",
      letterX: 27.38,
      letterTop: 13.66,
      labelX: 119.12,
      labelTop: 16.75,
      line: { src: `${BASE}/line138.svg`, x: 627.46, y: 601.65, width: 32.368, vertical: true },
      dot: { src: `${BASE}/dot224.svg`, x: 621.42, y: 595.25 },
      text: { x: 399.98, y: 719, width: 490.229, align: "center" },
    },
    {
      id: "enterprising",
      letter: "E",
      label: "ENTERPRISING",
      description: "Resourcefulness and initiatives to develop Agents of Change",
      mirrored: false,
      // Middle slot of the right side (Figma group "Group 246", left edge 878, top 254).
      pill: { x: 914.06, y: 254, width: 219, height: 55 },
      tone: "blue",
      labelTone: "night",
      letterX: 28.53,
      letterTop: 13.66,
      labelX: 152,
      labelTop: 16.75,
      line: { src: `${BASE}/line140.svg`, x: 881.87, y: 281.36, width: 32.347 },
      dot: { src: `${BASE}/dot222.svg`, x: 878, y: 274.96 },
      text: { x: 966.72, y: 324.06, width: 314.365, align: "left" },
    },
    {
      id: "ethical",
      letter: "E",
      label: "ETHICAL",
      description: "Promotes Sustainability to inculcate socially responsible citizens",
      mirrored: false,
      // Bottom slot of the right side (Figma group "Group 245", left edge 792.12, top 497.16).
      pill: { x: 828.06, y: 497.16, width: 219, height: 55 },
      tone: "blue",
      labelTone: "blue",
      letterX: 27.65,
      letterTop: 13.66,
      labelX: 127.04,
      labelTop: 16.75,
      line: { src: `${BASE}/line135.svg`, x: 795.99, y: 524.67, width: 32.347 },
      dot: { src: `${BASE}/dot226.svg`, x: 792.12, y: 518.27 },
      text: { x: 836.36, y: 589.27, width: 311.103, align: "left" },
    },
    {
      id: "resilient",
      letter: "R",
      label: "RESILIENT",
      description: "Sports Excellence and Wellness to promote Self-governance, Anti-fragility, and physical fitness.",
      mirrored: false,
      // Top slot of the right side (Figma group "Group 247", left edge 789.54, top 57). Its description is 422px wide (two lines) and
      // reaches the diagram's right edge, which is why the diagram is 1319px wide.
      pill: { x: 825.75, y: 57, width: 219.296, height: 54.64 },
      tone: "blue",
      labelTone: "blue",
      letterX: 28.65,
      letterTop: 13.66,
      labelX: 131.51,
      labelTop: 16.75,
      line: { src: `${BASE}/line139.svg`, x: 793.4, y: 84.32, width: 32.347 },
      dot: { src: `${BASE}/dot225.svg`, x: 789.54, y: 77.91 },
      text: { x: 897, y: 146, width: 422, align: "left" },
    },
  ],
};
