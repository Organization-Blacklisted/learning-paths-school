import { defaultWelcomeToLps, GENERIC_CREST_DESIGN } from "@/data/welcome-to-lps";
import { text } from "@/lib/api/home-map";
import { photoFromMedia } from "@/lib/api/media-map";
import { pageHeroFromDoc } from "@/lib/api/page-hero-map";
import type { WelcomeToLps } from "@/payload-types";
import type { CrestCard } from "@/types/crest-cards";
import type { StorySlide } from "@/types/story-swipe";
import type { ValuesListItem } from "@/types/values-list";
import type { WelcomeToLpsContent } from "@/types/welcome-to-lps";

// Turns the Welcome to LPS page of the CMS (Payload global "welcome-to-lps") into the content the page takes. PURE (no Payload runtime), so the Live Preview (a Client
// Component) can use it too. Same rule as the home page's mapper (src/lib/api/home-map.ts): the defaults (src/data/welcome-to-lps.ts) are the base, the CMS overrides
// what an editor wrote, and anything it lacks (an empty field, an empty list, no document, the database down) is the default for that field, so the page is never blank.
//
// The lists are flexible: when the CMS has rows, THEY are the rows, in the editor's order. What is design stays as designed: the widths of a crest card's title and
// paragraph come from the default card at the same position (the first two), a card beyond them gets the generic ones; the photos' heights and where things sit are in
// the components. A row without a readable photo (a crest card, a slide) is left out.

const NO_PHOTO = { src: "", alt: "", width: 0, height: 0 };

/** The paragraphs of a list as typed: trimmed, the empty ones dropped, the inner line breaks kept; the defaults when there are none. */
const paragraphsOf = (rows: { text?: string | null }[] | null | undefined, fallback: string[]) => {
  const shown = (rows ?? []).map((row) => (row.text ?? "").trim()).filter(Boolean);
  return shown.length ? shown : fallback;
};

export function mapWelcomeToLps(
  doc: WelcomeToLps | null | undefined,
  defaults: WelcomeToLpsContent = defaultWelcomeToLps,
): WelcomeToLpsContent {
  if (!doc) return defaults;
  const { hero, intro, banner, crests, welcome, values, story } = doc;

  const cards: CrestCard[] = (crests?.cards ?? []).flatMap((card, index) => {
    const base = defaults.crests.cards[index];
    const image = photoFromMedia(card.image, base?.image ?? NO_PHOTO);
    if (!image.src) return [];
    return [
      {
        image,
        title: text(card.title, base?.title ?? ""),
        text: text(card.text, base?.text ?? ""),
        design: base?.design ?? GENERIC_CREST_DESIGN,
      },
    ];
  });

  const items: ValuesListItem[] = (values?.items ?? []).flatMap((item, index) => {
    const base = defaults.values.items[index];
    const title = text(item.title, base?.title ?? "");
    return title ? [{ title, text: text(item.text, base?.text ?? "") }] : [];
  });

  const slides: StorySlide[] = (story?.slides ?? []).flatMap((slide, index) => {
    const base = defaults.story.slides[index];
    const image = photoFromMedia(slide.image, base?.image ?? NO_PHOTO);
    if (!image.src) return [];
    return [{ image, period: text(slide.period, base?.period ?? ""), text: text(slide.text, base?.text ?? "") }];
  });

  const d = defaults;
  return {
    hero: pageHeroFromDoc(hero, d.hero),
    intro: { ...d.intro, paragraphs: paragraphsOf(intro?.paragraphs, d.intro.paragraphs) },
    banner: { ...d.banner, image: photoFromMedia(banner?.image, d.banner.image) },
    crests: { ...d.crests, cards: cards.length ? cards : d.crests.cards },
    welcome: {
      ...d.welcome,
      image: photoFromMedia(welcome?.image, d.welcome.image),
      titleLead: text(welcome?.titleLead, d.welcome.titleLead),
      titleAccent: text(welcome?.titleAccent, d.welcome.titleAccent),
      paragraphs: paragraphsOf(welcome?.paragraphs, d.welcome.paragraphs),
      signatory: {
        name: text(welcome?.signatoryName, d.welcome.signatory.name),
        role: text(welcome?.signatoryRole, d.welcome.signatory.role),
      },
    },
    values: { ...d.values, title: text(values?.title, d.values.title), items: items.length ? items : d.values.items },
    story: {
      ...d.story,
      titleLead: text(story?.titleLead, d.story.titleLead),
      titleAccent: text(story?.titleAccent, d.story.titleAccent),
      slides: slides.length ? slides : d.story.slides,
    },
  };
}
