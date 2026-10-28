import type { GlobalConfig } from "payload";
import { revalidateTag } from "next/cache";
import { alumniTab } from "./home/alumni";
import { campusTab } from "./home/campus";
import { courageTab } from "./home/courage";
import { ctaTab } from "./home/cta";
import { ecosystemTab } from "./home/ecosystem";
import { frameworkTab } from "./home/framework";
import { heroTab } from "./home/hero";
import { journeyTab } from "./home/journey";
import { marqueeTab } from "./home/marquee";
import { newsTab } from "./home/news";
import { visionTab } from "./home/vision";

// The home page. One document (a Global), like the pages of the Giada project: an editor changes the TEXT and PHOTOS of each section, not the
// layout, the order or the number of sections (those are design, they live in code: src/data/home-page.ts and the section components).
// Plan, decisions and what is and is not editable: docs/26-cms-home-plan.md.
//
// The SEO tab is added by the SEO plugin (payload.config.ts), next to Content.
//
// Drafts: Save draft keeps a change private (visible in the admin's Live Preview only); Publish makes it live. Editors may publish (as Giada).
// A published change clears the cache tag "home", so the page shows it within seconds (src/lib/api/home.ts).
export const Home: GlobalConfig = {
  slug: "home",
  label: "Home page",
  admin: {
    group: "Pages",
    description: "The text and photos of every section of the home page, and its search-engine settings (SEO tab).",
    livePreview: {
      // Built from the request's host, so it works on localhost, a preview deployment and the live site.
      url: ({ req }) => {
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.startsWith("localhost") ? "http" : "https";
        return `${protocol}://${host}/`;
      },
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 667 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
    },
  },
  access: {
    // Anyone reads the PUBLISHED page; only signed-in users can read drafts and the version history. The constraint matters: with a plain
    // `read: () => true` anyone could add ?draft=true to /api/globals/home and read the unpublished text (found in testing, 2026-10-28).
    // (The website itself reads through the Local API, which is not subject to this and asks for the published version.)
    read: ({ req: { user } }) => (user ? true : { _status: { equals: "published" } }),
    readVersions: ({ req: { user } }) => Boolean(user),
  },
  versions: { drafts: true, max: 50 },
  hooks: {
    afterChange: [
      ({ doc }) => {
        // A draft changes nothing public.
        if (doc._status !== "published") return doc;
        try {
          revalidateTag("home", { expire: 0 });
        } catch {
          // Not inside a Next request (a script, the seed): the page refreshes on its own schedule.
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          description: "The sections, in page order. Open one to change its text and photos.",
          fields: [
            {
              type: "tabs",
              tabs: [
                heroTab,
                visionTab,
                courageTab,
                journeyTab,
                frameworkTab,
                ecosystemTab,
                alumniTab,
                campusTab,
                newsTab,
                ctaTab,
                marqueeTab,
              ],
            },
          ],
        },
      ],
    },
  ],
};
