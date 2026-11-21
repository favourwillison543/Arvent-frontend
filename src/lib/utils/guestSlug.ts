/**
 * Which event this device's guest session belongs to.
 *
 * A guest session is a cookie the API namespaces per event (`arvent_g_<slug>`),
 * so the read that uses it (`GET /public/guest`) needs `X-Event-Slug` to know
 * which cookie it is being asked about. Without the header the API answers
 * `401 INVALID_TOKEN` on `/public/guest` even though the cookie is right there —
 * verified against the live API on 20 Nov 2026, same cookie: 401 without the
 * header, 200 with it.
 *
 * That is why a pass opened from an email (`/pass#token=agp_…`, which carries no
 * event in its address) has to remember the event from the invitation the guest
 * replied on. The slug is not a secret — it is in the invitation's own address —
 * so remembering it is safe. It is only a hint: every read is still authorised
 * by the guest cookie, never by this value.
 */
const KEY = "arvent.guest.slug";

/** Remember the event a guest session was created for. */
export function rememberGuestSlug(slug?: string | null) {
  if (!slug || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(KEY, slug);
  } catch {
    // Private mode, or a browser that has storage switched off: the read that
    // wants this falls back to whatever the claim and the address carry.
  }
}

/** The last event this device replied to, if it is still known. */
export function rememberedGuestSlug(): string | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    return window.localStorage.getItem(KEY) || undefined;
  } catch {
    return undefined;
  }
}
