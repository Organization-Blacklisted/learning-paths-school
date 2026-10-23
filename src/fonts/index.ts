import localFont from "next/font/local";

// Only .woff2 is shipped. Every browser released since ~2016 supports it,
// so the legacy .woff fallbacks were removed.
//
// ONLY THE WEIGHTS THE DESIGN USES ARE DECLARED. next/font preloads every declared file on every page, so each
// extra weight costs a download (all 23 files were 775 KB on every first visit; these 8 are about 270 KB).
// Used so far (checked in the code and in the Figma frames): Lexend Deca 400, 500, 600; Plus Jakarta Sans 300 (news
// card text), 400, 500, 600, 700, all upright. The other files stay in the folders next to this file (supplied by the school),
// so using another weight is one more line here: { path: "./lexend/LexendDeca-Light.woff2", weight: "300", style: "normal" }.
// Available: Lexend Deca 100 to 900 (no italics); Plus Jakarta Sans 200 to 800, each also as Italic.

// Lexend Deca (headings).
export const lexendDeca = localFont({
  src: [
    { path: "./lexend/LexendDeca-Regular.woff2", weight: "400", style: "normal" },
    { path: "./lexend/LexendDeca-Medium.woff2", weight: "500", style: "normal" },
    { path: "./lexend/LexendDeca-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-lexend-deca",
  display: "swap",
});

// Plus Jakarta Sans (body).
export const plusJakartaSans = localFont({
  src: [
    { path: "./plus-jakarta/PlusJakartaSans-Light.woff2", weight: "300", style: "normal" },
    { path: "./plus-jakarta/PlusJakartaSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./plus-jakarta/PlusJakartaSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./plus-jakarta/PlusJakartaSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./plus-jakarta/PlusJakartaSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});
