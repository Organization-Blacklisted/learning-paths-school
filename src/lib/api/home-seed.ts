import { defaultHomeSections, type HomeSections } from "@/data/home-page";

// The INVERSE of src/lib/api/home-map.ts: today's content (the files in src/data) as the data of the CMS's home page, so the first version
// in the CMS is exactly the current site. Used by the seed script (scripts/seed-home.ts, which uploads each photo and passes the media ids)
// and by the test that proves `mapHome(homeDocFromData(...))` gives the default content back (src/lib/api/home-map.test.ts).
//
// Pure: `photo` turns the path of a photo under /public into whatever the caller stores for an upload field (an id, or a media document).

export type PhotoRef = (src: string) => unknown;

/** Every photo path the home page uses, once each, in page order. The seed uploads these. */
export function homePhotoPaths(sections: HomeSections = defaultHomeSections): { src: string; alt: string }[] {
  const all: { src: string; alt: string }[] = [
    ...sections.hero.slides.map((s) => ({ src: s.image.src, alt: s.image.alt })),
    ...sections.courage.photos.map((p) => ({ src: p.src, alt: p.alt })),
    ...sections.journey.stages.map((s) => ({ src: s.photo.src, alt: s.photo.alt })),
    { src: sections.framework.photo.src, alt: sections.framework.photo.alt },
    ...sections.ecosystem.tabs.map((t) => ({ src: t.photo.src, alt: t.photo.alt })),
    ...sections.alumni.people.map((p) => ({ src: p.photo.src, alt: p.photo.alt })),
    { src: sections.campus.media.poster, alt: sections.campus.media.alt },
    // The news photos are decorative on the page (empty alt); the library needs a description anyway.
    ...sections.news.items.map((n) => ({ src: n.photo, alt: `${n.title} (news photo)` })),
    ...sections.marquee.images.map((m) => ({ src: m.src, alt: m.alt })),
  ];
  const seen = new Set<string>();
  return all.filter(({ src }) => (seen.has(src) ? false : (seen.add(src), true)));
}

export function homeDocFromData(photo: PhotoRef, sections: HomeSections = defaultHomeSections) {
  const s = sections;
  return {
    hero: {
      slides: s.hero.slides.map((slide) => ({ image: photo(slide.image.src), title: slide.title, lead: slide.lead, quote: slide.quote })),
    },
    vision: { items: s.vision.items.map((item) => ({ title: item.title, text: item.text })) },
    courage: {
      titleLead: s.courage.titleLead,
      titleAccent: s.courage.titleAccent,
      rotatingWords: (s.courage.rotatingWords ?? []).map((word) => ({ word })),
      photos: s.courage.photos.map((p) => ({ slot: p.id, image: photo(p.src) })),
    },
    journey: {
      badge: s.journey.badge,
      titleLead: s.journey.titleLead,
      titleAccent: s.journey.titleAccent,
      intro: s.journey.intro,
      stages: s.journey.stages.map((st) => ({
        level: st.level,
        range: st.range,
        pathPrefix: st.pathPrefix,
        path: st.path,
        image: photo(st.photo.src),
      })),
    },
    framework: {
      badge: s.framework.badge,
      titleLead: s.framework.titleLead,
      titleAccent: s.framework.titleAccent,
      intro: s.framework.intro,
      centrePhoto: photo(s.framework.photo.src),
      centreLabel: s.framework.centreLabel.text,
      items: s.framework.items.map((i) => ({ label: i.label, description: i.description })),
    },
    ecosystem: {
      badge: s.ecosystem.badge,
      titleLead: s.ecosystem.titleLead,
      titleAccent: s.ecosystem.titleAccent,
      intro: s.ecosystem.intro,
      tabs: s.ecosystem.tabs.map((t) => ({
        label: t.label,
        image: photo(t.photo.src),
        title: t.title,
        text: t.text,
        bullets: t.bullets.map((text) => ({ text })),
      })),
    },
    alumni: {
      badge: s.alumni.badge,
      titleStart: s.alumni.titleStart,
      titleAccent: s.alumni.titleAccent,
      titleSecondLine: s.alumni.titleSecondLine,
      paragraphs: s.alumni.paragraphs.map((text) => ({ text })),
      people: s.alumni.people.map((p) => ({ name: p.name, institution: p.institution, image: photo(p.photo.src) })),
    },
    campus: {
      badge: s.campus.badge,
      titleStart: s.campus.titleStart,
      titleAccent: s.campus.titleAccent,
      titleEnd: s.campus.titleEnd,
      intro: s.campus.intro,
      poster: photo(s.campus.media.poster),
      tag: s.campus.media.tag,
    },
    news: {
      badge: s.news.badge,
      titleLead: s.news.titleLead,
      titleAccent: s.news.titleAccent,
      intro: s.news.intro,
      items: s.news.items.map((n) => ({ date: n.date, title: n.title, excerpt: n.excerpt, href: n.href, image: photo(n.photo) })),
    },
    cta: {
      badge: s.cta.badge,
      titleLead: s.cta.titleLead,
      titleAccent: s.cta.titleAccent,
      text: s.cta.text,
      buttonLabel: s.cta.button.label,
      buttonHref: s.cta.button.href,
    },
    marquee: { images: s.marquee.images.map((m) => ({ image: photo(m.src) })) },
  };
}
