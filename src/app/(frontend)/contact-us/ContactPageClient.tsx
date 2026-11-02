"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import Container from "@/components/layouts/Container";
import ContactMap from "@/components/sections/contact/ContactMap";
import ContactSection from "@/components/sections/contact/ContactSection";
import PageHero from "@/components/sections/shared/PageHero";
import { mapContact } from "@/lib/api/contact-map";
import type { Contact } from "@/payload-types";

// The Contact page's parts, in page order: the hero, the details and the form, the map. A client component for the same reason as the home
// page (HomePageClient): the admin's Live Preview shows the page next to the edit form and `useLivePreview` hands it the data as the editor types.
//
// Spacing from the design (1920px, scaled down with the screen): 87px from the hero card to the details, 125px from the form to the map (the
// design says 144px from the form’s frame, but its Send button hangs 19px out of that frame) and 84px under the map. The page's colour is snow (#f9f9f9), the colour of the hero card and of the labels of the form fields.
const EMPTY_CONTACT = {} as Contact;

export default function ContactPageClient({ initialData }: { initialData: Contact | null }) {
  const { data } = useLivePreview<Contact>({
    initialData: initialData ?? EMPTY_CONTACT,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const content = useMemo(() => mapContact(data), [data]);

  return (
    <div className="bg-brand-snow">
      <PageHero content={content.hero} />
      <Container className="pt-[clamp(48px,4.53125vw,87px)]">
        <ContactSection details={content.details} />
      </Container>
      <Container className="pt-[clamp(64px,6.5104vw,125px)] pb-[clamp(48px,4.375vw,84px)]">
        <ContactMap embedUrl={content.map.embedUrl} title={content.map.title} />
      </Container>
    </div>
  );
}
