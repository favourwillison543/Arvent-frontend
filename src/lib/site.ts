/* This app's own address. Emails, share previews and canonical links all put a
   path behind it, so it must be the web app (port 3000 in development) and never
   the API. */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://arvent-frontend.vercel.app")
).replace(/\/$/, "");

/** A full URL for a path on this app. */
export function sitePath(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
