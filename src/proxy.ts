import { NextResponse, type NextRequest } from "next/server";

import {
  parseSetCookie,
  SESSION_COOKIE,
  verifySession,
  type SessionCheck,
} from "@/lib/auth/session";
import { appearanceFromCookie } from "@/lib/theme/appearance";

/**
 * `/events/*` doubles as the folder that holds the landing-page photos in
 * `public/events`, so `GET /events/owambe.jpg` reaches this proxy too. A request
 * that names a file is never a page — treating it as protected sent the browser
 * to `/login?returnTo=%2Fevents%2Fowambe.jpg` and the <img> got HTML back.
 */
const STATIC_FILE = /\.[a-z0-9]+$/i;

function isProtectedRoute(pathname: string) {
  if (STATIC_FILE.test(pathname)) return false;

  // `/home` is deliberately absent: an organizer without a session sees the
  // workspace's own "create an account or log in" screen there, which explains
  // what is behind the door instead of bouncing them to a bare login card.
  return (
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/events" ||
    pathname.startsWith("/events/")
  );
}

/** The log in / sign up pages: nothing to do there once someone is signed in. */
function isAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/register" ||
    pathname.startsWith("/register/")
  );
}

function getSignInUrl(request: NextRequest) {
  const signInUrl = new URL("/login", request.url);

  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  signInUrl.searchParams.set("returnTo", returnTo);

  return signInUrl;
}

/**
 * Writes the session back to the browser.
 *
 * A renewal happens between the browser and the proxy, so the API's `Set-Cookie`
 * would otherwise be addressed to a response the visitor never sees: the proxy
 * has to copy it onto whatever it is about to send — the page, the redirect to
 * the form, or the redirect home. Expiring the rejected pair matters just as
 * much: the API answers 401 without clearing the cookies it has given up on, so
 * a stale `access_token` would be sent on every request until it aged out.
 */
function applySessionCookies(response: NextResponse, check: SessionCheck) {
  for (const raw of check.setCookies ?? []) {
    const cookie = parseSetCookie(raw);

    if (cookie) response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  for (const name of check.clearCookies ?? []) {
    // Clearing only needs the name and path to match; the API sets both at "/".
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }

  return response;
}

/** Every interpolated value in the error page comes from the request URL. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The session could not be verified: the API is down, a gateway answered with
 * an error, or the check timed out. Rendering the protected page would show it
 * to someone we cannot identify, so the route answers 503 — with a page the
 * organizer can act on instead of a bare line of text.
 */
function unverifiedSessionPage(request: NextRequest) {
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const appearance = appearanceFromCookie(request.headers.get("cookie") ?? "");
  const retryHref = escapeHtml(target);
  const signInHref = escapeHtml(
    `/login?returnTo=${encodeURIComponent(target)}`,
  );

  // Self-contained on purpose: a failed navigation should not depend on the
  // stylesheet or JS bundle it just failed to reach.
  const html = `<!doctype html>
<html lang="en" data-appearance="${appearance}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Arvent · Connection problem</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4eb; --fg: #18181b; --muted: #6b6b66;
        --border: #d8d8d0; --surface: #fcfcf9;
        --brand: #dcf91c; --brand-fg: #18181b;
      }
      :root[data-appearance="dark"] {
        color-scheme: dark;
        --bg: #101013; --fg: #f5f4ef; --muted: #a5a4a0;
        --border: #2f2f35; --surface: #17171a;
      }
      @media (prefers-color-scheme: dark) {
        :root[data-appearance="system"] {
          color-scheme: dark;
          --bg: #101013; --fg: #f5f4ef; --muted: #a5a4a0;
          --border: #2f2f35; --surface: #17171a;
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100dvh; display: grid; place-items: center;
        padding: 24px; background: var(--bg); color: var(--fg);
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      main {
        width: 100%; max-width: 27rem; padding: 28px;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 24px;
      }
      .eyebrow {
        margin: 0 0 14px; font-size: 11px; font-weight: 600;
        letter-spacing: .16em; text-transform: uppercase; color: var(--muted);
      }
      h1 { margin: 0; font-size: 1.5rem; line-height: 1.15; letter-spacing: -.02em; }
      .body { margin: 12px 0 0; font-size: .9375rem; line-height: 1.55; color: var(--muted); }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
      a {
        display: inline-flex; align-items: center; justify-content: center;
        height: 44px; padding: 0 20px; border-radius: 999px;
        font-size: .9375rem; font-weight: 600; text-decoration: none;
        border: 2px solid var(--fg); color: var(--fg);
      }
      a.primary { background: var(--brand); color: var(--brand-fg); }
      a.secondary { border-color: var(--border); }
      a:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
      .foot { margin: 18px 0 0; font-size: .75rem; color: var(--muted); }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Connection problem</p>
      <h1>We couldn’t verify your session.</h1>
      <p class="body">
        The Arvent API didn’t answer, so this page is staying locked for a
        moment. Nothing was lost — your drafts and RSVPs are safe.
      </p>
      <div class="actions">
        <a class="primary" href="${retryHref}">Try again</a>
        <a class="secondary" href="${signInHref}">Log in again</a>
      </div>
      <p class="foot">If this keeps happening, the Arvent API may be down.</p>
    </main>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": "5",
    },
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.headers.get("cookie");

  // Log in / sign up: someone who is already signed in goes straight home.
  // The session is verified first — a stale access cookie with a live refresh
  // cookie is renewed here, so the form is only shown to someone who really is
  // signed out (otherwise /home -> /login -> /home would loop forever).
  if (isAuthRoute(pathname)) {
    const check = cookie
      ? await verifySession(cookie)
      : ({ verdict: "unauthenticated" } as SessionCheck);

    /*
     * `/login?registered=1` is the hand-off from sign-up, and sign-up ends the
     * session it started. If the API's logout cleared only the access cookie,
     * a surviving refresh cookie would renew the session right here and send
     * the new organizer to /home — past the notice that tells them to log in,
     * and signed in on a password they typed once. The notice wins: the form
     * renders, and the login that follows overwrites whatever is left.
     */
    const handOffFromSignUp =
      request.nextUrl.searchParams.get("registered") === "1";

    if (check.verdict === "authenticated" && !handOffFromSignUp) {
      return applySessionCookies(
        NextResponse.redirect(new URL("/home", request.url)),
        check,
      );
    }

    // The form itself is also the moment the rejected cookies stop being sent.
    return applySessionCookies(NextResponse.next(), check);
  }

  /*
   * The landing page is for visitors, so a signed-in host who opens it — a
   * bookmark from before they joined, the back button, a typo — is sent to
   * `/home`. The decision is made here, not by the page's `SignedInRedirect`,
   * because that component can only run once the marketing bundle has
   * downloaded and hydrated: on a phone the host then waited seconds on a page
   * they did not ask for while `/auth/me` — and, once the 45-minute access
   * cookie had aged out, a refresh and a replay behind it — went out. Here it
   * is one check before the first byte is sent, and a renewal it performs is
   * written onto the redirect.
   *
   * Only a request that actually carries the access cookie is worth the check:
   * the appearance preference is a cookie too, so the mere presence of a
   * `cookie` header says nothing about a session. Everyone else passes
   * straight through — and so does a check that could not reach the API, since
   * the marketing page must never lock up behind an unreachable `/auth/me`.
   * The client-side fallback still covers a browser that kept only the refresh
   * cookie.
   */
  if (pathname === "/") {
    if (!request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

    const check = await verifySession(cookie);

    if (check.verdict !== "authenticated") {
      return applySessionCookies(NextResponse.next(), check);
    }

    return applySessionCookies(
      NextResponse.redirect(new URL("/home", request.url)),
      check,
    );
  }

  // Public pages don't require authentication.
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // No cookies means there is no session to validate.
  if (!cookie) {
    return NextResponse.redirect(getSignInUrl(request));
  }

  const check = await verifySession(cookie);

  switch (check.verdict) {
    case "authenticated":
      return applySessionCookies(NextResponse.next(), check);
    case "unauthenticated":
      return applySessionCookies(NextResponse.redirect(getSignInUrl(request)), check);
    default:
      return unverifiedSessionPage(request);
  }
}

export const config = {
  matcher: [
    "/",
    "/settings/:path*",
    "/events/:path*",
    "/login/:path*",
    "/register/:path*",
  ],
};