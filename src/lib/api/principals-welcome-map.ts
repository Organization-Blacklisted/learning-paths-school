import { defaultPrincipalsWelcome } from "@/data/principals-welcome";
import { text } from "@/lib/api/home-map";
import { photoFromMedia } from "@/lib/api/media-map";
import { pageHeroFromDoc } from "@/lib/api/page-hero-map";
import type { PrincipalsWelcome } from "@/payload-types";
import type { PrincipalsWelcomeContent } from "@/types/principals-welcome";

// Turns the Principal's Welcome page of the CMS (Payload global "principals-welcome") into the content the page takes. PURE (no Payload runtime), so
// the Live Preview (a Client Component) can use it too. Same rule as the home page's mapper (src/lib/api/home-map.ts): the defaults
// (src/data/principals-welcome.ts) are the base, the CMS overrides what an editor wrote, and anything it lacks (an empty field, an empty list, no
// document, the database down) is the default for that field, so the page is never blank.

export function mapPrincipalsWelcome(
  doc: PrincipalsWelcome | null | undefined,
  defaults: PrincipalsWelcomeContent = defaultPrincipalsWelcome,
): PrincipalsWelcomeContent {
  if (!doc) return defaults;
  const { hero, message } = doc;
  const d = defaults.message;

  // Each paragraph as typed: trimmed, its inner line breaks kept (the letter shows them), the empty ones dropped.
  const paragraphs = (message?.paragraphs ?? []).map((row) => (row.text ?? "").trim()).filter(Boolean);

  return {
    hero: pageHeroFromDoc(hero, defaults.hero),
    message: {
      ...d,
      image: photoFromMedia(message?.image, d.image),
      titleLead: text(message?.titleLead, d.titleLead),
      titleAccent: text(message?.titleAccent, d.titleAccent),
      paragraphs: paragraphs.length ? paragraphs : d.paragraphs,
      signatory: {
        name: text(message?.signatoryName, d.signatory.name),
        role: text(message?.signatoryRole, d.signatory.role),
      },
    },
  };
}
