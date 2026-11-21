/**
 * Which auth transport this app asks the API for, and why it is not the default.
 *
 * The API can serve a session two ways, chosen per request. Send nothing and it
 * takes the default: the token comes back in the JSON body, the client keeps it
 * and sends `Authorization: Bearer …` on every later call. Send the header below
 * on a *session-starting* call and it answers with an HttpOnly cookie instead —
 * no token in the body, and nothing for JavaScript to read.
 *
 * This app can only use the cookie. The token in that body would have to live in
 * a store the route proxy cannot see, and the proxy is what guards `/settings`
 * and `/events` before a single component renders: with a bearer token in
 * `localStorage` the server would answer "signed out" to every navigation, and
 * `POST /auth/register` would sign the new organizer in for the client alone.
 * Cookie mode is also what makes the `/backend` rewrite worth having — the
 * browser sees one origin, so the cookie is first-party and Safari's block on
 * cross-site cookies never applies.
 *
 * Only the calls that *start* a session need it (`/auth/login`,
 * `/auth/register`, `/auth/refresh`). Once the cookie exists the browser attaches
 * it by itself, and `GET /auth/me` has nothing to opt into. The guest and gate
 * sessions (`/public/events/:slug/rsvp`, `/public/guest/session`,
 * `/gate/session`) will need the same header when those flows are built.
 */
export const COOKIE_TRANSPORT = { "X-Auth-Transport": "cookie" } as const;
