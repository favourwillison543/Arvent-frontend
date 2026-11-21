export type GuestRsvpStatus =
  | "going"
  | "maybe"
  | "not_going"
  | "pending_approval"
  | "waitlisted";

export type GuestSource =
  | "link"
  | "import"
  | "organizer"
  | "walk_in";

export type ReconfirmationStatus =
  | "not_asked"
  | "asked"
  | "confirmed"
  | "changed";

export type CheckedInByType = "organizer" | "gate";

/**
 * A guest, as the API returns it.
 *
 * Verified against a real `GET /events/{id}/guests` body on 19 Nov 2026 (the
 * deployed v2.2 API). The checked-in number is `checkedInSeats` — a seat count,
 * because arrivals are partial (PRD §7); `checkedInCount` is kept optional only
 * so older cached bodies keep typing.
 */
export type Guest = {
  id: string;
  eventId: string;
  name: string;
  email: string | null;
  phone: string | null;
  /** `null` = invited, no response yet. */
  rsvpStatus: GuestRsvpStatus | null;
  additionalGuestCount: number;
  /** The ceiling this person may bring. */
  seatLimit: number;
  /** 1 + additionalGuestCount. */
  seats?: number;
  reconfirmationStatus: ReconfirmationStatus;
  reconfirmedAt: string | null;
  /** Seats that have actually arrived. */
  checkedInSeats?: number;
  /** @deprecated Not returned by the v2.2 API; read `checkedInSeats`. */
  checkedInCount?: number;
  checkedInAt: string | null;
  consent: boolean;
  consentAt: string | null;
  source?: GuestSource;
  note?: string | null;
  capacityOverride?: boolean;
  customSeatLimit?: boolean;
  requestDecision?: string | null;
  selfServiceAvailable?: boolean;
  /** The reference the pass and the door use (`6VFP-NM7M`). */
  passReference?: string;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * `SubmitRsvpDto` (PRD §6.2).
 *
 * A guest-submitted RSVP must carry a name, at least one of email or phone, the
 * status, and a deliberately given consent — `consent` is **required and must
 * be true**; the API rejects the request without it.
 *
 * `emailConsent` is the separate "email me updates" opt-in: `true` = explicit
 * opt-in, `false` = essential emails only, omitted = opted in for this event.
 */
export type SubmitRsvpInput = {
  /** 1–120 characters. */
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: "going" | "maybe" | "not_going";
  /** Only valid for "going"; at most the event's `maxAdditionalGuests`. */
  additionalGuestCount?: number;
  /** The consent checkbox. Must be `true`. */
  consent: boolean;
  /** "Email me updates and reminders about this event". */
  emailConsent?: boolean;
};

/**
 * `UpdateOwnRsvpDto`. No `email`: the guest is already identified by their session
 * or link, so the API does not take the address again.
 */
export type UpdateRsvpInput = {
  rsvpStatus?: "going" | "maybe" | "not_going";
  additionalGuestCount?: number;
  name?: string;
  phone?: string | null;
};


/**
 * `POST /public/events/{slug}/rsvp`, as the deployed API answers it.
 *
 * Verified against a live 201 on 20 Nov 2026: the body is `{ guest,
 * guestTokenExpiresAt }`. `manageUrl`/`guestToken`/`attendance` belong to an
 * older shape of this endpoint and are kept optional so a link they *do* carry
 * still works — but nothing may require them, because in cookie mode the guest
 * identity is the cookie the same response sets, not a token in the body. The
 * pass link is then read from `GET /public/guest/pass`, which is the one
 * endpoint that returns it.
 */
export type RsvpResponse = {
  guest: Guest;
  guestToken?: string;
  manageUrl?: string;
  /** When the guest cookie this response set stops being accepted. */
  guestTokenExpiresAt?: string;
  attendance?: {
    capacity: number | null;
    confirmedSeats: number;
    remainingSeats: number | null;
  };
};