/**
 * One sentence the whole bundle agrees on: "the session this request needed is
 * gone, and a refresh could not bring it back".
 *
 * The http client has no way to draw anything — it is not a component — so it
 * says so with an event and `AuthDialogProvider` decides how to ask. Letting
 * each screen handle its own 401 is how a workspace ends up showing five
 * "Please sign in to continue." toasts and no way to sign in.
 */
export const SESSION_EXPIRED_EVENT = "arvent:session-expired";

/** A burst of parallel requests fails together; one dialog is enough. */
const QUIET_MS = 4000;

let lastNotified = 0;

/**
 * Whether this tab has actually been signed in.
 *
 * `/auth/me` is called on every page as the session probe, so a visitor who was
 * never signed in fails it on every load — with the same `401` that a real
 * expiry produces. Only the second one is news. `useAuth` reports what the probe
 * answered: until it has answered with a user, there is no session to expire and
 * nothing to say.
 */
let sessionPresent = false;

export function setSessionPresent(present: boolean) {
  sessionPresent = present;
}

export function notifySessionExpired() {
  if (typeof window === "undefined") return;

  // A signed-out visitor losing a request is not a session ending.
  if (!sessionPresent) return;

  const now = Date.now();
  if (now - lastNotified < QUIET_MS) return;
  lastNotified = now;

  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}
