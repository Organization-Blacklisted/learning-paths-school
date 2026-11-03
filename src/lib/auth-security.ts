// The security settings of the admin login (Payload's `users` collection and the global `csrf` list), kept here, away from Payload, so they can be unit tested.
// Docs: docs/10-payload-cms.md, "Admin login security".
import { resolveSiteUrl } from "./site";

type Env = Record<string, string | undefined>;

/** Running on Vercel (its system variables are there): every address it serves is https. */
function onVercel(env: Env): boolean {
  return Boolean(env.VERCEL_URL || env.VERCEL_BRANCH_URL || env.VERCEL_PROJECT_PRODUCTION_URL);
}

/** "https://a.b/c" or "a.b" (as Vercel's system variables give hosts) becomes "https://a.b"; null when it is not an address. */
function toOrigin(value: string | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  try {
    return new URL(text.includes("://") ? text : `https://${text}`).origin;
  } catch {
    return null;
  }
}

/**
 * The login cookie (`payload-token`) is only sent over HTTPS when the site is served over HTTPS: on Vercel always (whatever NEXT_PUBLIC_SITE_URL says),
 * and wherever NEXT_PUBLIC_SITE_URL is https.
 * Not tied to NODE_ENV: a production build on http://localhost (the browser checks, `next start`) must still be able to log in.
 * (Payload already makes the cookie HttpOnly, and SameSite=Lax; both are written out in Users.ts so they stay if its defaults change.)
 */
export function cookieSecure(env: Env): boolean {
  return onVercel(env) || resolveSiteUrl(env).startsWith("https://");
}

/**
 * The origins a logged-in admin may send requests from: Payload's `csrf` list. A request that carries the login cookie is only accepted when its
 * `Origin` header is in the list (or, with no Origin, when the browser says `Sec-Fetch-Site: same-origin | same-site | none`). The list is
 * the site's own address, the addresses Vercel gives this deployment (the deployment, its branch, the project's production domain) and
 * CSRF_EXTRA_ORIGINS (comma separated, for another domain or alias that the admin is opened at).
 *
 * Empty (no check, Payload's default) on a local setup: no https address and no Vercel variables, where there is no other site to protect from.
 */
export function allowedOrigins(env: Env): string[] {
  const site = resolveSiteUrl(env);
  if (!onVercel(env) && !site.startsWith("https://")) return [];

  const origins = new Set<string>();
  for (const value of [
    site,
    env.VERCEL_URL,
    env.VERCEL_BRANCH_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
    ...(env.CSRF_EXTRA_ORIGINS?.split(",") ?? []),
  ]) {
    const origin = toOrigin(value);
    if (origin) origins.add(origin);
  }
  return [...origins];
}
