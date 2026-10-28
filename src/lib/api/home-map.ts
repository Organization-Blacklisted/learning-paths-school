import { defaultHomeSections, type HomeSections } from "@/data/home-page";
import type { Home, Media } from "@/payload-types";

// Turns the home page of the CMS (Payload global "home") into the content the sections already take. PURE: no Payload runtime import, so a
// Client Component (Live Preview) can use it too.
//
// The rule: the defaults (src/data/home-*.ts) are the base, the CMS overrides ONLY what an editor can change (text, lists, links, photos).
// Everything else (positions, widths, tones, timings, ids, the fixed rows) always comes from the defaults, and anything the CMS does not
// have (a field left empty, the whole global missing, the database down) falls back to the default for that field, so the page never goes
// blank or half-empty. Docs: docs/26-cms-home-plan.md.

type Ref = number | Media | null | undefined;
type Photo = { src: string; width?: number; height?: number; alt: string };

const squash = (value: string) => value.replace(/\s+/g, " ").trim();

/**
 * An editable piece of text. Empty: the default. The same words as the default (ignoring spaces): the default exactly (the design has
 * deliberate double spaces and spaces at the ends of the heading parts). Different words: the editor's, with the default's leading and
 * trailing space kept (a heading part that ends in a space still joins the next part).
 */
export function text(value: string | null | undefined, fallback: string): string {
  if (!value || squash(value) === "") return fallback;
  if (squash(value) === squash(fallback)) return fallback;
  const lead = /^\s*/.exec(fallback)?.[0] ?? "";
  const tail = /\s*$/.exec(fallback)?.[0] ?? "";
  return `${lead}${value.trim()}${tail}`;
}

/** The media document of an upload field, when it has been loaded (depth 1) and has a file. */
function media(ref: Ref): Media | null {
  return ref && typeof ref === "object" && ref.url ? ref : null;
}

/**
 * A photo: the editor's (its address and alt text from the media library) or the default. `width` and `height` mean two different things in
 * the defaults, so they are NOT taken from the file unless asked:
 *  - `natural: true`: the size of the image file itself (the hero and the Courage collage give it to next/image);
 *  - otherwise they are the size of the BOX the photo sits in (the Framework's centre photo is a box in the diagram) and stay as designed.
 *    (Taking the file's size there made the photo several times too big: found by comparing the CMS build with the default build, 2026-10-28.)
 */
function photo<T extends Photo>(ref: Ref, fallback: T, natural = false): T {
  const file = media(ref);
  if (!file) return fallback;
  const size = natural ? { width: file.width ?? fallback.width, height: file.height ?? fallback.height } : {};
  return { ...fallback, ...size, src: file.url as string, alt: file.alt || fallback.alt };
}

/** The address of a photo only (cards that have no alt text of their own). */
const photoSrc = (ref: Ref, fallback: string) => media(ref)?.url ?? fallback;

/** Rows of a FIXED list: row i of the editor is row i of the default (the layout is designed for that many). */
function fixed<D, C>(defaults: D[], rows: C[] | null | undefined, merge: (row: C, base: D) => D): D[] {
  return defaults.map((base, i) => (rows?.[i] ? merge(rows[i], base) : base));
}

const texts = (rows: { text?: string | null }[] | null | undefined): string[] =>
  (rows ?? []).map((row) => (row.text ?? "").trim()).filter(Boolean);

export function mapHome(home: Home | null | undefined, defaults: HomeSections = defaultHomeSections): HomeSections {
  if (!home) return defaults;
  const d = defaults;
  const { hero, vision, courage, journey, framework, ecosystem, alumni, campus, news, cta, marquee } = home;
  const words = (courage?.rotatingWords ?? []).map((row) => (row.word ?? "").trim()).filter(Boolean);

  return {
    hero: {
      ...d.hero,
      // A flexible list (2 to 6 slides): the design's first slide is "compact", every other slide "large".
      slides: hero?.slides?.length
        ? hero.slides.map((slide, i) => {
            const base = d.hero.slides[i] ?? { ...d.hero.slides[d.hero.slides.length - 1], id: `slide-${i + 1}`, scale: "large" as const };
            return {
              ...base,
              image: photo(slide.image, base.image, true),
              title: text(slide.title, base.title),
              lead: text(slide.lead, base.lead),
              quote: text(slide.quote, base.quote),
              scale: i === 0 ? ("compact" as const) : ("large" as const),
            };
          })
        : d.hero.slides,
    },

    vision: {
      ...d.vision,
      items: fixed(d.vision.items, vision?.items, (row, base) => ({
        ...base,
        title: text(row.title, base.title),
        text: text(row.text, base.text),
      })),
    },

    courage: {
      ...d.courage,
      titleLead: text(courage?.titleLead, d.courage.titleLead),
      titleAccent: text(courage?.titleAccent, d.courage.titleAccent),
      rotatingWords: words.length ? words : d.courage.rotatingWords,
      photos: fixed(d.courage.photos, courage?.photos, (row, base) => photo(row.image, base, true)),
    },

    journey: {
      ...d.journey,
      badge: text(journey?.badge, d.journey.badge),
      titleLead: text(journey?.titleLead, d.journey.titleLead),
      titleAccent: text(journey?.titleAccent, d.journey.titleAccent),
      intro: text(journey?.intro, d.journey.intro),
      stages: fixed(d.journey.stages, journey?.stages, (row, base) => ({
        ...base,
        level: text(row.level, base.level),
        range: text(row.range, base.range),
        pathPrefix: text(row.pathPrefix, base.pathPrefix),
        path: text(row.path, base.path),
        photo: photo(row.image, base.photo),
      })),
    },

    framework: {
      ...d.framework,
      badge: text(framework?.badge, d.framework.badge),
      titleLead: text(framework?.titleLead, d.framework.titleLead),
      titleAccent: text(framework?.titleAccent, d.framework.titleAccent),
      intro: text(framework?.intro, d.framework.intro),
      photo: photo(framework?.centrePhoto, d.framework.photo),
      centreLabel: { ...d.framework.centreLabel, text: text(framework?.centreLabel, d.framework.centreLabel.text) },
      items: fixed(d.framework.items, framework?.items, (row, base) => ({
        ...base,
        label: text(row.label, base.label),
        description: text(row.description, base.description),
      })),
    },

    ecosystem: {
      ...d.ecosystem,
      badge: text(ecosystem?.badge, d.ecosystem.badge),
      titleLead: text(ecosystem?.titleLead, d.ecosystem.titleLead),
      titleAccent: text(ecosystem?.titleAccent, d.ecosystem.titleAccent),
      intro: text(ecosystem?.intro, d.ecosystem.intro),
      tabs: fixed(d.ecosystem.tabs, ecosystem?.tabs, (row, base) => {
        const bullets = texts(row.bullets);
        return {
          ...base,
          label: text(row.label, base.label),
          photo: photo(row.image, base.photo),
          title: text(row.title, base.title),
          text: text(row.text, base.text),
          bullets: bullets.length ? bullets : base.bullets,
        };
      }),
    },

    alumni: {
      ...d.alumni,
      badge: text(alumni?.badge, d.alumni.badge),
      titleStart: text(alumni?.titleStart, d.alumni.titleStart),
      titleAccent: text(alumni?.titleAccent, d.alumni.titleAccent),
      titleSecondLine: text(alumni?.titleSecondLine, d.alumni.titleSecondLine),
      paragraphs: texts(alumni?.paragraphs).length ? texts(alumni?.paragraphs) : d.alumni.paragraphs,
      people: fixed(d.alumni.people, alumni?.people, (row, base) => ({
        ...base,
        name: text(row.name, base.name),
        institution: text(row.institution, base.institution),
        photo: photo(row.image, base.photo),
      })),
    },

    campus: {
      ...d.campus,
      badge: text(campus?.badge, d.campus.badge),
      titleStart: text(campus?.titleStart, d.campus.titleStart),
      titleAccent: text(campus?.titleAccent, d.campus.titleAccent),
      titleEnd: text(campus?.titleEnd, d.campus.titleEnd),
      intro: text(campus?.intro, d.campus.intro),
      media: {
        ...d.campus.media,
        poster: photoSrc(campus?.poster, d.campus.media.poster),
        alt: media(campus?.poster)?.alt || d.campus.media.alt,
        tag: text(campus?.tag, d.campus.media.tag),
      },
    },

    news: {
      ...d.news,
      badge: text(news?.badge, d.news.badge),
      titleLead: text(news?.titleLead, d.news.titleLead),
      titleAccent: text(news?.titleAccent, d.news.titleAccent),
      intro: text(news?.intro, d.news.intro),
      // A flexible list (1 to 6 cards).
      items: news?.items?.length
        ? news.items.map((row, i) => {
            const base = d.news.items[i] ?? d.news.items[d.news.items.length - 1];
            return {
              id: d.news.items[i]?.id ?? `news-${i + 1}`,
              date: text(row.date, base.date),
              title: text(row.title, base.title),
              excerpt: text(row.excerpt, base.excerpt),
              href: row.href?.trim() || base.href,
              photo: photoSrc(row.image, base.photo),
            };
          })
        : d.news.items,
    },

    cta: {
      ...d.cta,
      badge: text(cta?.badge, d.cta.badge),
      titleLead: text(cta?.titleLead, d.cta.titleLead),
      titleAccent: text(cta?.titleAccent, d.cta.titleAccent),
      text: text(cta?.text, d.cta.text),
      button: { label: text(cta?.buttonLabel, d.cta.button.label), href: cta?.buttonHref?.trim() || d.cta.button.href },
    },

    marquee: {
      ...d.marquee,
      // A flexible list (6 to 12 photos).
      images: marquee?.images?.length
        ? marquee.images.map((row, i) => {
            const base = d.marquee.images[i] ?? { id: `photo-${i + 1}`, src: "", alt: "" };
            const file = media(row.image);
            return { id: base.id, src: file?.url ?? base.src, alt: file?.alt || base.alt };
          })
        : d.marquee.images,
    },
  };
}
