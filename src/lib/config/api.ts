/**
 * The API's address, in one place.
 *
 * Two surfaces ask the same question and need two different answers.
 *
 * The browser asks relatively: every call goes to the same-origin prefix below,
 * which `next.config.ts` rewrites to `API_URL`. Same-origin keeps the session
 * cookie first-party, so there is no CORS preflight to answer and no
 * `SameSite=None` cookie for a browser to drop.
 *
 * The server (the route proxy's session check, link previews) has no origin to
 * be relative to, so it uses the absolute `API_URL`. That variable is not
 * `NEXT_PUBLIC_*`: the browser bundle has no business knowing the API's host.
 */

/** Same-origin prefix the browser uses. Keep in sync with the rewrite. */
export const API_PROXY_PATH = "/backend";

/**
 * The same-origin root, for the few paths that must be called **as themselves**.
 *
 * The API scopes its own cookies: `arvent_rt` is `Path=/auth` and `arvent_pass`
 * is `Path=/public/guest`. A browser sends a cookie only when the address it
 * requested starts with the cookie's path, and `/backend/auth/refresh` does not
 * start with `/auth` — the refresh cookie would never leave the browser, and the
 * pass cookie would be missing on the read that needs it. So these two calls use
 * this prefix (nothing, i.e. `/auth/refresh` as written) instead of
 * `API_PROXY_PATH`, and `next.config.ts` rewrites them to the API from there.
 */
export const API_SAME_ORIGIN = "/";

/** The API's origin as configured, normalised, or `null` when unset. */
export function apiOrigin(): string | null {
  const origin = process.env.API_URL?.trim().replace(/\/+$/, "");

  return origin ? origin : null;
}

/**
 * An absolute URL for a server-side `fetch`. Returns `null` when `API_URL` is
 * unset so callers can degrade instead of fetching a relative path that cannot
 * resolve outside a browser.
 */
export function serverApiUrl(path: string): string | null {
  const origin = apiOrigin();

  if (!origin) return null;

  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
