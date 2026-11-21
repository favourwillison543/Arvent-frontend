import axios from "axios";

import { endpoints } from "@/lib/api/endpoints";
import { API_SAME_ORIGIN } from "@/lib/config/api";
import { COOKIE_TRANSPORT } from "@/lib/http/transport";

/**
 * One refresh, shared by every request that needs it.
 *
 * The access cookie lives for 45 minutes (`JWT_EXPIRES_IN`), so an organiser
 * who leaves a tab open will have three hooks, a poll, and a mutation all get
 * `401 UNAUTHENTICATED` within the same second. Refreshing per failure would
 * race four rotations of the same refresh token against each other — the API
 * rate-limits `/auth/refresh` to 60 requests — and the losers would rotate the
 * winner's token out from under it and sign the organiser out.
 *
 * So: whoever gets there first starts the request; everyone else awaits that
 * same promise. It resolves to `true`/`false` and never rejects — callers only
 * need to know whether a retry is worth attempting.
 *
 * Deliberately *not* built on `http`: `http` calls this, and the retry must not
 * recurse back into the 401 handler.
 */
let inFlight: Promise<boolean> | null = null;

const REFRESH_TIMEOUT_MS = 8000;

async function attemptRefresh(): Promise<boolean> {
  try {
    // An empty body on purpose: in cookie mode the refresh token *is* the
    // cookie, and the header is what tells the API to read it from there.
    //
    // Addressed as `/auth/refresh`, not `/backend/auth/refresh`: the browser
    // only sends a cookie on a path that starts with the cookie's own `Path`,
    // and this one is `Path=/auth`. Under the `/backend` prefix the browser
    // would send no refresh cookie at all and every renewal would be a 401 —
    // the session would simply end with the access cookie, mid-edit.
    const response = await axios.post(
      endpoints.auth.refresh,
      undefined,
      {
        baseURL: API_SAME_ORIGIN,
        withCredentials: true,
        timeout: REFRESH_TIMEOUT_MS,
        headers: { Accept: "application/json", ...COOKIE_TRANSPORT },
      },
    );

    return response.status >= 200 && response.status < 300;
  } catch {
    // A failed refresh is not an error to report: the original 401 already is.
    return false;
  }
}

/** `true` when a new access cookie was minted, so the request can be retried. */
export function refreshSession(): Promise<boolean> {
  // The cookies this works with exist only in the browser. On the server the
  // proxy has its own path (`lib/auth/session.ts`).
  if (typeof window === "undefined") return Promise.resolve(false);

  inFlight ??= attemptRefresh().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
