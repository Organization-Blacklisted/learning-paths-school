import BlockRenderer from "@/components/blocks";
import { homePage } from "@/data/home-page";
import { SHOW_HOME_SECTIONS } from "@/lib/site";

export default function Home() {
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      {/* The hero slides use display text, so the page's one h1 is kept for screen readers and search engines. */}
      <h1 className="sr-only">Learning Paths School</h1>
      {/* All home sections, in the order of src/data/home-page.ts: switched on and off with SHOW_HOME_SECTIONS in src/lib/site.ts. */}
      {SHOW_HOME_SECTIONS && <BlockRenderer blocks={homePage} />}
    </main>
  );
}
