/**
 * Who is asking? Two surfaces need that answer *before* they render: the proxy
 * (which guards `/settings` and `/events`) and the public invitation,
 * which keeps the organizer's workspace rail for the host who opened it.
 * `/home` asks for itself instead: a guest is allowed to see what the workspace
 * is before signing in.
 *
 * The backend keeps the JWT in an HttpOnly `access_token` cookie, so the only
 * truthful answer comes from the API itself — the frontend can't read the
 * cookie's payload, and presence alone doesn't mean it is still valid.
 *
 * The access cookie lives 45 minutes while the refresh cookie outlives it, so
 * "rejected by `/auth/me`" is usually *not* "signed out": it is "the browser
 * arrived after lunch". This module therefore renews the session server-side
 * and hands the API's `Set-Cookie` headers back to the caller, which the proxy
 * writes onto the navigation response. Without that, a returning organizer got
 * a login form while holding a perfectly good refresh token.
 */

import { endpoints } from "@/lib/api/endpoints";
import { serverApiUrl } from "@/lib/config/api";
import { COOKIE_TRANSPORT } from "@/lib/http/transport";
import { SITE_URL } from "@/lib/site";

/** Must match the API's `SESSION_COOKIE_NAME`. */
export const SESSION_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export type SessionVerdict = "authenticated" | "unauthenticated" | "unreachable";

export type SessionCheck = {
  verdict: SessionVerdict;
  /** Raw `Set-Cookie` values from a renewal; the proxy must forward them. */
  setCookies?: string[];
  /** Cookies the API rejected; the proxy expires them in the browser. */
  clearCookies?: string[];
};

/**
 * A dropped connection or a gateway blip must not cost the organizer the page,
 * so the check gets one more try. Both attempts stay short: a hanging
 * `/auth/me` would hold the whole navigation.
 */
const ATTEMPTS = 2;
const ATTEMPT_TIMEOUT_MS = 4000;
const REFRESH_TIMEOUT_MS = 5000;

/** `Set-Cookie` as the browser will store it, minus the attributes we ignore. */
export type ParsedCookie = {
  name: string;
  value: string;
  options: {
    path?: string;
    /** Next's `cookies.set` takes seconds here, as `Set-Cookie` does. */
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  };
};

/**
 * One `Set-Cookie` line → the shape `NextResponse.cookies.set` accepts.
 *
 * Parsing rather than re-emitting the raw header keeps the attributes explicit:
 * a forwarded `Set-Cookie` must stay HttpOnly (it is the whole point of the
 * design) and must keep its path, or the renewal appears to work and the cookie
 * never comes back.
 */
export function parseSetCookie(raw: string): ParsedCookie | null {
  const [pair, ...attributes] = raw.split(";");
  const separator = pair.indexOf("=");

  if (separator <= 0) return null;

  const name = pair.slice(0, separator).trim();
  const value = pair.slice(separator + 1).trim();

  if (!name) return null;

  const options: ParsedCookie["options"] = {};

  for (const attribute of attributes) {
    const [rawKey, ...rest] = attribute.split("=");
    const key = rawKey.trim().toLowerCase();
    const attributeValue = rest.join("=").trim();

    if (key === "path" && attributeValue) {
      options.path = attributeValue;
    } else if (key === "max-age") {
      const maxAge = Number(attributeValue);
      if (Number.isFinite(maxAge)) options.maxAge = maxAge;
    } else if (key === "expires") {
      const expires = new Date(attributeValue);
      if (!Number.isNaN(expires.getTime())) options.expires = expires;
    } else if (key === "httponly") {
      options.httpOnly = true;
    } else if (key === "secure") {
      options.secure = true;
    } else if (key === "samesite") {
      const sameSite = attributeValue.toLowerCase();
      if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
        options.sameSite = sameSite;
      }
    }
  }

  return { name, value, options };
}

/** `Headers.getSetCookie()` where the runtime has it; one header otherwise. */
function setCookieHeaders(response: Response): string[] | undefined {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };

  const cookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter((value): value is string => Boolean(value));

  return cookies.length ? cookies : undefined;
}

/**
 * The access cookie was rejected. Spend one round trip on the refresh cookie:
 * if it is good the visitor never notices, and if it is not the API's 401 is
 * the truthful verdict — one the caller can act on by expiring both cookies.
 *
 * Two headers make this request possible from the server. `X-Auth-Transport`
 * picks the cookie route, exactly as the browser's own refresh does. `Origin`
 * stands in for the one a browser would have sent: the API refuses a
 * cookie-mode POST it cannot place (403 `CSRF_REJECTED`), and a proxy that let
 * that happen would expire a perfectly good session on every first navigation
 * after lunch. The app's own origin is the honest answer — this *is* the app.
 */
async function renewSession(
  cookieHeader: string,
  refreshEndpoint: string,
): Promise<SessionCheck> {
  let response: Response;

  try {
    response = await fetch(refreshEndpoint, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        accept: "application/json",
        ...COOKIE_TRANSPORT,
        origin: SITE_URL,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });
  } catch (error) {
    // A failed request is not a failed session: nothing may be cleared here, or
    // a flaky minute on the organizer's train would sign them out for good.
    console.error("Session refresh failed:", error);
    return { verdict: "unreachable" };
  }

  if (response.ok) {
    return { verdict: "authenticated", setCookies: setCookieHeaders(response) };
  }

  if (response.status === 401 || response.status === 403) {
    // The API does not clear the cookies it has rejected (verified: the 401
    // carries no `Set-Cookie`), so every later request would carry two corpses.
    // The proxy expires them instead.
    return {
      verdict: "unauthenticated",
      clearCookies: [SESSION_COOKIE, REFRESH_COOKIE],
    };
  }

  return response.status >= 500 || response.status === 429
    ? { verdict: "unreachable" }
    : { verdict: "unauthenticated" };
}

/**
 * Returns `unreachable` only when no answer could be read at all, which is the
 * one case where a caller must not claim the session ended.
 */
export async function verifySession(
  cookieHeader: string | null | undefined,
): Promise<SessionCheck> {
  const meEndpoint = serverApiUrl(endpoints.auth.currentUser);
  const refreshEndpoint = serverApiUrl(endpoints.auth.refresh);

  // Without auth configuration there is nothing to verify against.
  if (!meEndpoint || !refreshEndpoint) {
    console.error("API_URL is not configured.");
    return { verdict: "unauthenticated" };
  }

  if (!cookieHeader) return { verdict: "unauthenticated" };

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(meEndpoint, {
        method: "GET",
        headers: { cookie: cookieHeader, accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
    } catch (error) {
      console.error(`Session check failed (attempt ${attempt}):`, error);
      continue;
    }

    if (response.ok) return { verdict: "authenticated" };

    // The backend answered and rejected this cookie: the access token has
    // expired, which says nothing yet about the refresh token.
    if (response.status === 401 || response.status === 403) {
      return renewSession(cookieHeader, refreshEndpoint);
    }

    // A server-side fault may be a blip, so the loop retries it. Any other
    // rejection is the backend's verdict on the cookie, not a fault.
    if (response.status < 500 && response.status !== 429) {
      return { verdict: "unauthenticated" };
    }
  }

  return { verdict: "unreachable" };
}
