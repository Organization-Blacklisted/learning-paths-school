import type { Metadata } from "next";
import { defaultContactSeo } from "@/data/contact";
import { getContact } from "@/lib/api/contact";
import { buildPageMetadata } from "@/lib/metadata";
import ContactPageClient from "./ContactPageClient";

// The Contact page (Figma node 5644:9493), edited in the CMS (Payload global "contact", docs/28-contact-page.md) and served as static HTML: read
// once through a tagged cache (src/lib/api/contact.ts), publishing clears the tag. If the CMS cannot be read, the default content in
// src/data/contact.ts is shown. `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact();
  const meta = contact?.meta;
  // What the SEO tab holds wins; a blank field gets this page's own default (not the home page's).
  return buildPageMetadata(
    {
      title: meta?.title?.trim() || defaultContactSeo.title,
      description: meta?.description?.trim() || defaultContactSeo.description,
      image: meta?.image,
      noIndex: meta?.noIndex,
      canonical: meta?.canonical,
    },
    "/contact-us",
  );
}

export default async function ContactPage() {
  const contact = await getContact();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <ContactPageClient initialData={contact} />
    </main>
  );
}
