/**
 * The reusable "photo banner" section (src/components/sections/shared/PhotoBannerSection): one wide photo with a two-tone title, and a paragraph when there is
 * one. The title is the blue slanted words first, then the grey words, on one line ("Early Leadership With Learning Paths School Student Council").
 * The Student Council page uses it twice: the photo with the title and a paragraph UNDER it, and the title ABOVE a photo. The Welcome to LPS page uses it
 * with no title at all: just the wide photo.
 */
export type PhotoBannerContent = {
  /** Accessible name of the section. */
  label: string;
  image: { src: string; alt: string; width: number; height: number };
  /** The first words of the title: blue, slanted. Leave out both parts of the title for a photo with no title. */
  titleAccent?: string;
  /** The rest of the title: grey. */
  titleRest?: string;
  /** The paragraph under the title (the title and paragraph come after the photo). Leave it out for a title with no paragraph. */
  text?: string;
  /** Where the title is: above the photo, or under it. */
  titlePosition: "above" | "below";
  /** The photo's height in Figma pixels at the designed 1520px width (design, so it lives in code: 723 and 782 on the Student Council page). */
  photoHeight: number;
};
