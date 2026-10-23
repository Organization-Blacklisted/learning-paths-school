// The 404 page for every URL that matches no route. It bypasses the layouts, so it brings its own <html>, fonts,
// styles, header and footer (next.config.ts: experimental.globalNotFound).
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import Badge from "@/components/ui/Badge";
import { lexendDeca, plusJakartaSans } from "@/fonts";
import "./(frontend)/globals.css";

export const metadata: Metadata = {
  title: "Page not found | Learning Paths School",
  description: "This page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${lexendDeca.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <Header variant="solid" />
        <main id="main-content" className="flex flex-1 items-center justify-center px-5 py-section">
          {/* Copy is mine (no 404 design yet, see docs/07-decisions.md). */}
          <div className="flex max-w-[640px] flex-col items-center gap-4 text-center">
            <Badge>Error 404</Badge>
            <h1 className="font-heading text-h1 font-medium text-brand-blue">This path doesn’t lead anywhere</h1>
            <p className="font-body text-body-lg leading-[1.5] text-brand-graphite">
              The page you are looking for has moved or does not exist. Let’s take you back to where the learning begins.
            </p>
            <Link
              href="/"
              className="mt-4 rounded-[4px] bg-brand-green px-[15px] py-[13px] font-body text-body-lg leading-[26px] text-white transition-colors hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Back to the home page
            </Link>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
