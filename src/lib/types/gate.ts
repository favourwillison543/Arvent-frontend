/** What a gate link may do (PRD §9). `permissions` is required on creation. */
export type GatePermission = "check_in" | "walk_in" | "override_capacity";

export type GateAccess = {
  id: string;
  eventId: string;
  label: string;
  permissions: GatePermission[];
  /** Defaults to one day after the event ends (max 30 days from now). */
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

/** `CreateGateAccessDto`: `label` 1–80 and at least one permission. */
export type CreateGateAccessInput = {
  label: string;
  permissions: GatePermission[];
  expiresAt?: string;
};

/** `GateSessionDto`: the gate code from the organiser (dashes/case optional). */
export type GateSessionInput = {
  code: string;
};

/**
 * A row on the door list, exactly as the API sends it.
 *
 * Verified against the live API: arrivals are counted in **seats**
 * (`checkedInSeats`), because a party of four may arrive 2 + 2.
 */
export type GateGuestRow = {
  id: string;
  name: string;
  seats: number;
  /** Seats that have arrived so far. */
  checkedInSeats?: number;
  /** @deprecated Not returned by the v2.2 API; read `checkedInSeats`. */
  checkedInCount?: number;
  remainingSeats?: number;
  checkedInAt: string | null;
  /** `expected`, `checked_in`, `waitlisted`, `pending` or `not_eligible`. */
  category?: string;
  /** The reference the door can type or read out. */
  passReference?: string;
  /** Masked phone, for telling two guests with the same name apart. */
  phoneLast4?: string | null;
};

/**
 * A row as the door UI consumes it: `checkedInCount` is always a number, so
 * `seats - checkedInCount` can never be `NaN`. `normaliseDoorGuest` is the only
 * place that fill happens.
 */
export type GateGuest = GateGuestRow & { checkedInCount: number };

/**
 * `POST /gate/session { code }` — verified against the live API on 20 Nov 2026.
 *
 * The exchange answers the gate's own labels and the event it opens, so the
 * door screen can title itself without a second read of `/events/{id}`.
 */
export type GateSession = {
  expiresAt?: string;
  permissions?: GatePermission[];
  label?: string;
  event?: {
    id: string;
    name: string;
    slug?: string;
    date?: string;
    venueName?: string;
    location?: string;
    capacity?: number | null;
  } | null;
};

/** The `summary` block the live gate list carries. */
export type GateListSummary = {
  expected: number;
  checkedIn: number;
  checkedInSeats?: number;
  confirmedSeats?: number;
  capacity?: number | null;
  spotsLeft?: number | null;
};

/**
 * `GET /events/{id}/gate-list` — verified against the live API on 20 Nov 2026:
 * `{ items, nextCursor, summary }`.
 *
 * There is **no `event` block** (the event comes from `POST /gate/session`) and
 * no `attendance` block — the counts live under `summary`. Both are kept
 * optional so a deployment that still sends the PRD's older shape keeps
 * working, and so no screen can mistake a missing block for a revoked link.
 */
export type GateListResponse = {
  items: GateGuestRow[];
  nextCursor: string | null;
  summary?: GateListSummary;
  /** Older deployments sent the event with the list. */
  event?: { id: string; name: string } | null;
  /** Older deployments sent the counts under `attendance`. */
  attendance?: { expected: number; checkedIn: number } | null;
};

/**
 * `CheckInDto` (PRD §7): partial arrivals. A guest with four seats may arrive
 * as 2 + 2, so `seats` is the count arriving *now*, not a boolean.
 * Retries are keyed with the `Idempotency-Key` header, not a body field.
 */
export type CheckInInput = {
  /** 1–51. Omitted = all remaining seats. */
  seats?: number;
  /** Admit somebody who is not "going" (maybe / waitlisted / pending). */
  admit?: boolean;
  /** Exceed capacity on purpose (organiser, or gate with `override_capacity`). */
  overrideCapacity?: boolean;
};

/** `WalkInDto`: no email required. `seats` includes the walk-in themselves. */
export type WalkInInput = {
  name: string;
  phone?: string;
  /** 1–51 people arriving together. */
  seats: number;
  email?: string;
  overrideCapacity?: boolean;
};
