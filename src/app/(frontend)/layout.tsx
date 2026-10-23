import type { Metadata, Viewport } from "next";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import SmoothScroll from "@/components/layouts/SmoothScroll";
import { footerContent } from "@/data/footer";
import { lexendDeca, plusJakartaSans } from "@/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    url: "/",
    // TODO: add an Open Graph image (1200 x 630, JPG or PNG; social sites do not read AVIF) once the school provides one.
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

// Structured data for search engines: the school, with the contact details already in the footer.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  telephone: footerContent.contact.phone.label,
  email: footerContent.contact.email.label,
  address: { "@type": "PostalAddress", streetAddress: footerContent.contact.address, addressCountry: "IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lexendDeca.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      {/* min-h-dvh, not min-h-full: Lenis makes html height:auto, so a percentage min-height collapsed and a short page left a white gap under the footer. */}
      <body className="flex min-h-dvh flex-col">
        {/* First thing a keyboard user reaches: jumps over the header to the page content. Only visible on focus. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-brand-blue focus:px-5 focus:py-2.5 focus:font-body focus:text-body-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          // Escaping "<" keeps the JSON from ever closing the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
