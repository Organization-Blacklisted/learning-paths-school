import { defaultWelcomeToLps } from "@/data/welcome-to-lps";
import type { WelcomeToLpsContent } from "@/types/welcome-to-lps";

// The INVERSE of src/lib/api/welcome-to-lps-map.ts: the current content (src/data/welcome-to-lps.ts) as the data of the CMS's page, so the first version in the CMS is
// exactly the current page. Used by the seed script (scripts/seed-welcome-to-lps.ts, which uploads the photos and passes their media ids) and by the test that proves
// `mapWelcomeToLps(welcomeToLpsDocFromData(...))` gives the default content back. Pure.

export type PhotoRef = (src: string) => unknown;

/** The photos the page uses, once each (the seed uploads these). */
export const welcomeToLpsPhotoPaths = (content: WelcomeToLpsContent = defaultWelcomeToLps): { src: string; alt: string }[] => {
  const all = [
    content.hero.image,
    content.banner.image,
    ...content.crests.cards.map((card) => card.image),
    content.welcome.image,
    ...content.story.slides.map((slide) => slide.image),
  ];
  return all.filter((image, index) => all.findIndex((other) => other.src === image.src) === index).map(({ src, alt }) => ({ src, alt }));
};

export function welcomeToLpsDocFromData(photo: PhotoRef, content: WelcomeToLpsContent = defaultWelcomeToLps) {
  const { hero, intro, banner, crests, welcome, values, story } = content;
  return {
    hero: {
      badge: hero.badge,
      titleLead: hero.titleLead,
      titleAccent: hero.titleAccent,
      subtitle: hero.subtitle,
      image: photo(hero.image.src),
    },
    intro: { paragraphs: intro.paragraphs.map((text) => ({ text })) },
    banner: { image: photo(banner.image.src) },
    crests: { cards: crests.cards.map(({ image, title, text }) => ({ image: photo(image.src), title, text })) },
    welcome: {
      image: photo(welcome.image.src),
      titleLead: welcome.titleLead,
      titleAccent: welcome.titleAccent,
      paragraphs: welcome.paragraphs.map((text) => ({ text })),
      signatoryName: welcome.signatory.name,
      signatoryRole: welcome.signatory.role,
    },
    values: { title: values.title, items: values.items.map(({ title, text }) => ({ title, text })) },
    story: {
      titleLead: story.titleLead,
      titleAccent: story.titleAccent,
      slides: story.slides.map(({ image, period, text }) => ({ image: photo(image.src), period, text })),
    },
  };
}
