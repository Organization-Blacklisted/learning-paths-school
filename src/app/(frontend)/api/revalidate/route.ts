import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// Clears the cache of a part of the site by hand (POST). Publishing in the CMS already does it; this is for a script, a deploy hook or a
// change made straight in the database.
//
//   curl -X POST https://<site>/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET" -H "content-type: application/json" -d '{"tag":"home"}'
//
// The secret is the environment variable REVALIDATE_SECRET. Without it set, every call is refused. Only the tags listed here can be cleared.
export const ALLOWED_TAGS = ["home"] as const;

function sameSecret(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !sameSecret(request.headers.get("x-revalidate-secret"), expected)) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tag?: unknown; tags?: unknown };
  const asked = [body.tag, ...(Array.isArray(body.tags) ? body.tags : [])].filter((t): t is string => typeof t === "string");
  const tags = asked.length ? asked : [...ALLOWED_TAGS];
  const unknown = tags.filter((tag) => !(ALLOWED_TAGS as readonly string[]).includes(tag));
  if (unknown.length) return Response.json({ error: `Unknown tag: ${unknown.join(", ")}` }, { status: 400 });

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}
