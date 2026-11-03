import type { ReactNode } from "react";
import ContactForm from "@/components/sections/contact/ContactForm";
import { contactLabels } from "@/data/contact";
import { phoneDigits } from "@/lib/contact-form";
import type { ContactPageContent } from "@/types/contact";

// The contact details (left) and the form (right) of the Contact page. Figma "Frame 1618876497" (node 5644:9571), 1521 x 629px at 1920px.
//
// Desktop (from lg): the details column is 452px and the form 784px, the gap between them (285px at 1920px) shrinks with the screen. The
// details are three groups 51px apart (heading 20px bold, then the lines 12px apart, 18px, navy at 80%). Below lg (my interpretation, only
// desktop is designed) the form comes FIRST and fills the width, and the details go under it (owner, 2026-11-02). It is done with CSS `order`, so
// the keyboard still meets the details' links before the form: the order stays meaningful, and it is the desktop reading order.

const linkClass =
  "hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-body text-px-20 leading-[1.5] font-bold tracking-[-0.01em] text-brand-navy/80">{title}</h2>
      {children}
    </div>
  );
}

const listClass = "flex flex-col gap-3 font-body text-px-18 leading-[1.5] tracking-[-0.01em] text-brand-navy/80";

export default function ContactSection({ details }: Pick<ContactPageContent, "details">) {
  const { emails, phones, location } = details;
  const headings = contactLabels.detailHeadings;
  return (
    // `grid-cols-1` is minmax(0, 1fr): a grid column's automatic width never shrinks below the minimum content width of what is in it, and the form's
    // phone row (a fixed flag box and an input with its own default width) asked for more than a phone has, so the form stuck out of the page.
    <div className="grid grid-cols-1 gap-[clamp(56px,6vw,80px)] lg:grid-cols-[452fr_784fr] lg:gap-x-[clamp(48px,14.84vw,285px)]">
      <address className="order-2 flex flex-col gap-[clamp(36px,2.66vw,51px)] not-italic lg:order-1">
        <Group title={headings.email}>
          <ul className={listClass}>
            {emails.map((email) => (
              <li key={email.address}>
                <a href={`mailto:${email.address}`} className={linkClass}>
                  {email.address}
                </a>
                {email.note ? ` (${email.note})` : null}
              </li>
            ))}
          </ul>
        </Group>
        <Group title={headings.contact}>
          <ul className={listClass}>
            {phones.map((phone) => (
              <li key={phone.number}>
                <a href={`tel:${phoneDigits(phone.number)}`} className={linkClass}>
                  {phone.number}
                </a>
                {phone.note ? ` (${phone.note})` : null}
              </li>
            ))}
          </ul>
        </Group>
        <Group title={headings.location}>
          <p className={listClass}>{location}</p>
        </Group>
      </address>

      <ContactForm fallback={{ email: emails[0]?.address ?? "", phone: phones[0]?.number ?? "" }} />
    </div>
  );
}
