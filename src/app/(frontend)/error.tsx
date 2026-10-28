"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import Badge from "@/components/ui/Badge";

// What a visitor sees when something throws while a page of the site is being shown (a section that crashes, a failed data load).
// It replaces the page content only: the header, the footer and the rest of the layout stay, so the visitor can still navigate.
// (An error in the layout itself is caught by src/app/global-error.tsx.)
//
// Copy and layout are mine (no error design yet, see docs/07-decisions.md). The panel is dark blue because on the home page the header
// is transparent (white logo and links) and needs a dark background behind it; on other routes the solid header sits above it.
// Next 16.4 passes `retry` (re-fetch and re-render the page); `reset` is the older name.
// The message of the error is never shown to the visitor: in production it is a generic text anyway, and an error may carry details.
// The `digest` (an id that matches the server log) is shown as a reference to quote when reporting it.
export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Placeholder for an error reporting service (Sentry or similar, not set up yet): at least the browser console has it.
    console.error(error);
  }, [error]);

  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 items-center justify-center bg-linear-to-r from-brand-blue to-brand-blue-darker px-5 pt-40 pb-section outline-none"
    >
      <div className="flex max-w-[640px] flex-col items-center gap-4 text-center">
        <Badge>Something went wrong</Badge>
        <h1 className="font-heading text-h1 font-medium text-balance text-white">We couldn’t show this page</h1>
        <p className="font-body text-body-lg leading-[1.5] text-white/80">
          Something broke on our side. Please try again, and if it keeps happening, come back in a little while.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-[4px] bg-white px-[15px] py-[13px] font-body text-body-lg leading-[1.4444] text-brand-blue transition-colors hover:bg-brand-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-[4px] border border-white/60 px-[15px] py-[13px] font-body text-body-lg leading-[1.4444] text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Back to the home page
          </Link>
        </div>
        {digest ? <p className="mt-2 font-body text-body-sm text-white/60">Reference: {digest}</p> : null}
      </div>
    </main>
  );
}
