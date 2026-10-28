"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo } from "react";
import BlockRenderer from "@/components/blocks";
import { buildHomePage } from "@/data/home-page";
import { takeFirstSections } from "@/lib/blocks";
import { mapHome } from "@/lib/api/home-map";
import type { Home } from "@/payload-types";

// The sections of the home page. A client component so that the admin's Live Preview (an iframe of this page next to the edit form) can
// update it while an editor types: `useLivePreview` returns the saved data until the admin sends changes, and then the data with them. The
// mapper is pure (no Payload runtime), so it runs here as well as on the server. The sections themselves were already client components.
//
// An empty home page: what the mapper gets when the CMS could not be read (it then returns the default content).
const EMPTY_HOME = {} as Home;

// `sectionLimit` comes from the server (src/lib/site.ts reads an environment variable that the browser cannot see).
export default function HomePageClient({ initialData, sectionLimit }: { initialData: Home | null; sectionLimit: number | null }) {
  const { data } = useLivePreview<Home>({
    initialData: initialData ?? EMPTY_HOME,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1,
  });
  const blocks = useMemo(() => takeFirstSections(buildHomePage(mapHome(data)), sectionLimit), [data, sectionLimit]);
  return <BlockRenderer blocks={blocks} />;
}
