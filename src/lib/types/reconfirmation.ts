/**
 * Reconfirmation and attendance — the shape **verified against the live API**
 * (`GET /events/{id}/attendance` and `POST /events/{id}/reconfirmation/start`,
 * 20 Nov 2026).
 *
 * The PRD's older body (`guests.going`, `seats.given`, `reconfirmedHeadcount`)
 * is not what the API answers. The live summary is built out of **tallies** —
 * every count arrives as `{ guests, seats }` — and the reconfirmation block
 * keeps the wire's snake-case `not_asked`. Reading the PRD names is exactly how
 * the dashboard modal rendered "Request confirmation from undefined" above four
 * blank statistics.
 */

/** Guest records and the seats they hold. */
export type SeatTally = {
  guests: number;
  seats: number;
};

/** Where the current reconfirmation round stands. */
export type ReconfirmationProgress = {
  /** `0` before the first round, then `1`, `2`, … */
  round: number;
  /** When the latest round started; `null` if none ever did. */
  startedAt: string | null;
  /** Guests nobody has asked yet. */
  not_asked: number;
  /** Guests who were asked and have not answered yet. */
  asked: number;
  confirmed: number;
  /** Guests who answered "still coming, details changed". */
  changed: number;
};

/**
 * `GET /events/{id}/attendance` — the authoritative headcount.
 *
 * Capacity is measured in seats, not people: one guest record can hold several
 * seats (their additional guests), and a party may arrive in parts.
 */
export type Attendance = {
  eventId: string;
  capacity: number | null;
  totalGuestRecords: number;
  /** Guests who are coming, and the seats they hold. */
  confirmed: SeatTally;
  remainingCapacity: number | null;
  overCapacityBy: number;
  byStatus: {
    going: SeatTally;
    maybe: SeatTally;
    notGoing: SeatTally;
    pendingApproval: SeatTally;
    waitlisted: SeatTally;
    noResponse: SeatTally;
  };
  reconfirmation: ReconfirmationProgress;
  checkedIn: {
    guests: number;
    seats: number;
    /** Seats still to arrive for parties already partially checked in. */
    pendingSeats: number;
  };
  walkIns: SeatTally;
  generatedAt: string;
};

/**
 * `StartReconfirmationDto`.
 *
 * Both fields are optional on the wire, and the API asks the guests who are
 * going — nobody else — unless told otherwise. They are sent explicitly, so the
 * defaults are chosen here rather than inherited from a deployment's mood.
 */
export type StartReconfirmationInput = {
  /** Also ask guests who answered "maybe". */
  includeMaybe?: boolean;
  /** Email every guest who has an address. */
  notifyByEmail?: boolean;
};

/**
 * `POST /events/{id}/reconfirmation/start` — verified live:
 * `{ askedCount, round, startedAt, emailsQueued }`.
 *
 * A second call opens a new round and asks everyone again (`round` + 1), which
 * is why the panel offers it as "start another round", not "ask the leftovers".
 */
export type ReconfirmationStartResponse = {
  /** Guest records asked in this round. */
  askedCount: number;
  round: number;
  startedAt: string;
  /** Emails the API queued; `0` when `notifyByEmail` is off. */
  emailsQueued: number;
};
