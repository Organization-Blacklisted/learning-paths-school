import type { Metadata } from "next";
import { defaultStudentCouncilSeo } from "@/data/student-council";
import { getStudentCouncil } from "@/lib/api/student-council";
import { buildPageMetadata } from "@/lib/metadata";
import StudentCouncilPageClient from "./StudentCouncilPageClient";

// The Student Council page (Figma node 5896:2063), edited in the CMS (Payload global "student-council", docs/32-student-council.md) and served
// as static HTML: read once through a tagged cache (src/lib/api/cached-global.ts), publishing clears the tag. If the CMS cannot be read, the default
// content in src/data/student-council.ts is shown. `revalidate` is a safety net: a page built while the database was down repairs itself within the hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStudentCouncil();
  const meta = page?.meta;
  // What the SEO tab holds wins; a blank field gets this page's own default (not the home page's).
  return buildPageMetadata(
    {
      title: meta?.title?.trim() || defaultStudentCouncilSeo.title,
      description: meta?.description?.trim() || defaultStudentCouncilSeo.description,
      image: meta?.image,
      noIndex: meta?.noIndex,
      canonical: meta?.canonical,
    },
    "/student-council",
  );
}

export default async function StudentCouncilPage() {
  const page = await getStudentCouncil();
  return (
    // id + tabIndex: the target of the "Skip to main content" link.
    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <StudentCouncilPageClient initialData={page} />
    </main>
  );
}
