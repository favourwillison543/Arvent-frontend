import type { NextConfig } from "next";

/**
 * The API's origin. Server-only: read here and in `src/lib/config/api.ts`, never
 * inlined into a browser bundle (that is why it is not `NEXT_PUBLIC_*`).
 *
 * The browser never talks to the API's origin. It talks to this app:
 * `GET /backend/events` is rewritten to `${API_URL}/events`. That makes the
 * session cookie first-party — no CORS preflight, no `SameSite=None`, nothing
 * for a browser's third-party cookie rules to break. Pointing the bundle at the
 * API's origin directly is what makes "logged in" turn into "logged out on the
 * next page load" once the two hosts differ.
 */
const API_ORIGIN = process.env.API_URL?.trim().replace(/\/+$/, "");

if (!API_ORIGIN) {
  throw new Error(
    "API_URL is not set. Copy .env.example to .env and point API_URL at the Arvent API (for example http://localhost:3000).",
  );
}

const nextConfig: NextConfig = {
  reactCompiler: false,
  // `next build` and `next dev` write into the same `.next`, and a dev server
  // running at the same time gets its generated route types truncated mid-write
  // — which then fails `tsc` with syntax errors in files nobody wrote. Set
  // `NEXT_DIST_DIR=.next-build` to build beside a running dev server instead.
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
      /*
       * The two families the API scopes its own cookies to.
       *
       * A browser only attaches a cookie to a path that starts with that
       * cookie's `Path`, and it compares against the address *it* asked for —
       * not against what a rewrite turns it into. The refresh cookie is
       * `Path=/auth` and the pass cookie is `Path=/public/guest`, so a request
       * to `/backend/auth/refresh` carries neither: the browser would never send
       * the one cookie that can renew a session, and the session would die with
       * the 15-minute access cookie. These two paths are therefore rewritten at
       * the address the cookie names, so the cookie is sent by the browser and
       * still reaches the same API.
       */
      {
        source: "/auth/:path*",
        destination: `${API_ORIGIN}/auth/:path*`,
      },
      {
        source: "/public/guest/:path*",
        destination: `${API_ORIGIN}/public/guest/:path*`,
      },
    ];
  },
};

export default nextConfig;
