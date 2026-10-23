"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { lexendDeca, plusJakartaSans } from "@/fonts";
import "./(frontend)/globals.css";

// The last resort: shown only when the ROOT layout itself fails (anything below it is handled by (frontend)/error.tsx). It replaces the
// whole document, so it brings its own <html>, fonts and styles, and nothing else from the site (no header, footer or smooth scrolling):
// the fewer things it depends on, the less likely it is to fail itself. It is a plain page with a hard reload, not a client navigation.
// Copy is mine (no error design yet, see docs/07-decisions.md). `metadata` is not allowed here, so the title is React's <title>.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Placeholder for an error reporting service (not set up yet): at least the browser console has it.
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={`${lexendDeca.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col items-center justify-center bg-brand-blue px-5 text-center">
        <title>Something went wrong | Learning Paths School</title>
        <main id="main-content" className="flex max-w-[640px] flex-col items-center gap-4">
          <p className="font-body text-body-lg font-semibold tracking-wide text-white/80 uppercase">Learning Paths School</p>
          <h1 className="font-heading text-h1 font-medium text-balance text-white">We couldn’t load this page</h1>
          <p className="font-body text-body-lg leading-[1.5] text-white/80">
            Something broke on our side. Please try again, and if it keeps happening, come back in a little while.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => retry()}
              className="rounded-[4px] bg-white px-[15px] py-[13px] font-body text-body-lg leading-[26px] text-brand-blue transition-colors hover:bg-brand-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Try again
            </button>
            {/* A plain link (full page load): after a root failure a client navigation may not work. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="rounded-[4px] border border-white/60 px-[15px] py-[13px] font-body text-body-lg leading-[26px] text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Back to the home page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
