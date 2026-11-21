import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";
import { API_SAME_ORIGIN } from "@/lib/config/api";
import type { Event } from "@/lib/types/event";
import type {
  Guest,
  GuestRsvpStatus,
  RsvpResponse,
  SubmitRsvpInput,
  UpdateRsvpInput,
} from "@/lib/types/guest";
import type { EventUpdate } from "@/lib/types/update";
import { asPage } from "@/lib/utils/list";

export type PublicEvent = Event & {
  updates?: EventUpdate[];
  memoriesEnabled?: boolean;
  memoriesAccess?: "invitees" | "public";
};

/**
 * A guest and the event their session belongs to — the one shape every guest
 * screen reads, whatever answered it.
 *
 * `reference` is the pass's own printed code (`MHAM-NX81`). It travels beside
 * the guest because the pass endpoint returns it instead of the guest id, and
 * the card must print what the door will look for.
 */
export type GuestSession = {
  guest: Guest;
  event: PublicEvent;
  reference?: string;
};

/**
 * The pass, as the API actually answers it (`GET /public/guest/pass`,
 * `POST /public/guest/pass/session`).
 *
 * Verified against a live 200 on 20 Nov 2026. It is **not** `{ guest, event }`:
 * the envelope is `{ pass, passUrl }`, and the guest inside it is the pass's
 * projection of the guest — name, answer, seats, arrival — with no id, no email
 * and no consent, because the pass is shown at a door.
 */
export type GuestPassRecord = {
  reference: string;
  state: string;
  valid: boolean;
  guest: {
    name: string;
    rsvpStatus: GuestRsvpStatus | null;
    additionalGuestCount: number;
    seats: number;
    checkedInAt: string | null;
  };
  event: PublicEvent;
};

export type GuestPassAnswer = {
  pass: GuestPassRecord;
  /** `/pass#token=agp_…` — absolute, and the only place the pass token appears. */
  passUrl?: string;
};

/**
 * The pass answer in the session shape the screens read.
 *
 * The pass is a projection, so the fields it omits are left unknown (`""`,
 * `null`, `false`) rather than guessed: no screen renders them from this shape,
 * and inventing a consent or a timestamp would be a lie told in the guest's
 * name. The reference is kept beside the guest so the card prints the API's
 * code, not one derived from a placeholder id.
 */
export function passSession(answer: GuestPassAnswer): GuestSession {
  const { pass } = answer;
  // `seats` counts the guest plus everyone they bring. A pass that does not say
  // (or says zero) still covers its guest.
  const seats =
    pass.guest.seats > 0
      ? pass.guest.seats
      : Math.max(1, 1 + (pass.guest.additionalGuestCount ?? 0));

  const guest: Guest = {
    // The pass names the guest by its reference; that is the id this shape has.
    id: pass.reference,
    eventId: pass.event?.id ?? "",
    name: pass.guest.name,
    email: null,
    phone: null,
    rsvpStatus: pass.guest.rsvpStatus,
    additionalGuestCount: pass.guest.additionalGuestCount,
    seatLimit: seats,
    seats,
    reconfirmationStatus: "not_asked",
    reconfirmedAt: null,
    checkedInSeats: undefined,
    checkedInAt: pass.guest.checkedInAt,
    consent: false,
    consentAt: null,
    passReference: pass.reference,
    createdAt: "",
    updatedAt: "",
  };

  return {
    guest,
    // `eventToDraft` defaults everything the pass does not carry (no colours, no
    // capacity): the pass needs the invitation's facts, not its settings.
    event: pass.event,
    reference: pass.reference,
  };
}

/** `{ guest }` on the wire, a bare guest from older deployments. */
function guestOf(answer: Guest | { guest?: Guest }): Guest {
  return (answer as { guest?: Guest }).guest ?? (answer as Guest);
}

/**
 * Guest identity is an **httpOnly cookie**, not a `X-Guest-Token` header
 * (PRD §14, and the backend's own note on the deployment).
 *
 * - `POST /public/events/{slug}/rsvp` and `POST /public/guest/session` set it.
 * - `GET /public/guest`, `PATCH /public/guest/rsvp` and the reconfirm call ride
 *   it; a guest who belongs to more than one event picks one with `X-Event-Slug`.
 *
 * Nothing in this file ever stores or replays a raw token.
 */

/** `{ items, nextCursor }` — the same envelope as every other list. */
export async function getPublicEvents() {
  return asPage<PublicEvent>(
    await http.get<unknown>(endpoints.public.events),
    `GET ${endpoints.public.events}`,
  );
}

export function getPublicEvent(slug: string) {
  return http.get<PublicEvent>(endpoints.public.event(slug));
}

export async function getPublicEventUpdates(slug: string) {
  return asPage<EventUpdate>(
    await http.get<unknown>(endpoints.public.eventUpdates(slug)),
    `GET ${endpoints.public.eventUpdates(slug)}`,
  );
}

/** The cookie is set by this response; `guestToken` in the body is the manage link's. */
export function submitRsvp(slug: string, data: SubmitRsvpInput) {
  return http.post<RsvpResponse>(endpoints.public.rsvp(slug), data);
}

/**
 * `POST /public/guest/session { token }` — the access code from the host (or
 * from a manage link) is traded for the guest cookie. It is sent once.
 */
export function claimGuestSession(token: string) {
  return http.post<{ guest?: Guest }>(endpoints.public.guestSession, { token });
}

/** `DELETE /public/guest/session` — sign this device out. */
export function endGuestSession() {
  return http.delete<void>(endpoints.public.guestSession);
}

/** `GET /public/guest`; `slug` tells the API which event's cookie to use. */
export function getGuest(slug?: string) {
  return http.get<{
    guest: Guest;
    event: PublicEvent;
  }>(
    endpoints.public.guest,
    slug ? { headers: { "X-Event-Slug": slug } } : undefined,
  );
}

/**
 * `POST /public/guest/pass/session { token }` — the `agp_…` pass link.
 *
 * Addressed at `/public/guest/...` rather than under `/backend`: the cookie this
 * sets is `Path=/public/guest`, and a cookie is only sent back on a path that
 * starts with its own `Path`. Under the `/backend` prefix the pass session the
 * claim just created would be invisible to the read that follows it.
 */
export function claimGuestPass(token: string) {
  return http.post<GuestPassAnswer>(
    endpoints.public.passSession,
    { token },
    { baseURL: API_SAME_ORIGIN },
  );
}

/** `GET /public/guest/pass` — the pass for the cookie this device holds. */
export function getGuestPass(slug?: string) {
  return http.get<GuestPassAnswer>(
    endpoints.public.pass,
    {
      baseURL: API_SAME_ORIGIN,
      ...(slug ? { headers: { "X-Event-Slug": slug } } : {}),
    },
  );
}

export function updateGuestRsvp(data: UpdateRsvpInput, slug?: string) {
  // The answer is `{ guest }`; unwrapped here so every caller keeps one shape.
  return http
    .patch<Guest | { guest: Guest }>(
      endpoints.public.guestRsvp,
      data,
      slug ? { headers: { "X-Event-Slug": slug } } : undefined,
    )
    .then(guestOf);
}

/**
 * `POST /public/guest/reconfirm { attending }`.
 *
 * Both answers this app offers — "still coming" and "still coming, details
 * changed" — are `attending: true`; declining is an RSVP change, not a
 * reconfirmation.
 */
export function reconfirmGuest(attending: boolean, slug?: string) {
  return http.post<Guest>(
    endpoints.public.reconfirm,
    { attending },
    slug ? { headers: { "X-Event-Slug": slug } } : undefined,
  );
}
