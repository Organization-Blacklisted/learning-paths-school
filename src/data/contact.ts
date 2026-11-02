import type { ContactPageContent } from "@/types/contact";

// The Contact page (Figma node 5644:9493, 1920px frame). These are the defaults: the CMS (src/globals/Contact.ts) overrides what an editor
// changes (src/lib/api/contact-map.ts), and this is what the page shows when the CMS has nothing or cannot be read.
//
// Text from the design as written. Two things are mine, not from the design, and are marked: the accessible names (the photo's description,
// the map's title).

export const defaultContact: ContactPageContent = {
  hero: {
    label: "Contact us",
    badge: "Contact us",
    titleLead: "Let’s Begin a",
    titleAccent: "Conversation",
    subtitle: "Reach out for admissions, enquiries and assistance",
    image: {
      src: "/images/contact/hero.avif",
      alt: "A group of Learning Paths School students in navy blazers, smiling at the camera while one of them waves",
      width: 1920,
      height: 736,
    },
  },
  details: {
    emails: [
      { address: "admn@learningpaths.in", note: "admissions" },
      { address: "principal@learningpaths.in" },
      { address: "contact@learningpaths.in" },
    ],
    phones: [{ number: "0172-5134300" }, { number: "098-780-07553", note: "for admissions only" }],
    // The design has a double space between "3" and "Sec" (no comma): kept as written, a browser shows it as one space.
    location: "Site No 66, Plot No 3  Sec 67, Mohali",
  },
  map: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3431.358040222468!2d76.728955!3d30.680200799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390feda6178c691f%3A0x7eeacdb62d1dd702!2sLearning%20Paths%20School!5e0!3m2!1sen!2sin!4v1793600150175!5m2!1sen!2sin",
    title: "Map showing Learning Paths School in Sector 67, Mohali",
  },
};

/** The page’s own title and description for search engines, used while the SEO tab of the CMS is empty. */
export const defaultContactSeo = {
  title: "Contact Us | Learning Paths School",
  description:
    "Contact Learning Paths School in Sector 67, Mohali: email, phone numbers, address, a message form and a map. Reach out for admissions, enquiries and assistance.",
};

/** The fixed words of the page (not editable): the three headings of the details and the labels of the form. */
export const contactLabels = {
  detailHeadings: { email: "Email", contact: "Contact", location: "Location" },
  form: {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone Number (optional)",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    sending: "Sending…",
  },
} as const;
