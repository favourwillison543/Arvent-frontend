import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  Attendance,
  ReconfirmationProgress,
  ReconfirmationStartResponse,
  SeatTally,
  StartReconfirmationInput,
} from "@/lib/types/reconfirmation";
import { ContractError, describeShape, isRecord } from "@/lib/utils/list";

/**
 * The defaults this app chooses. The DTO's fields are optional, so sending
 * nothing also works — but then which guests get asked is a fact about a
 * deployment rather than a decision of ours.
 */
const START_DEFAULTS: StartReconfirmationInput = {
  includeMaybe: false,
  notifyByEmail: false,
};

function zeroTally(): SeatTally {
  return { guests: 0, seats: 0 };
}

/** A `{ guests, seats }` block, or `undefined` when it is not one. */
function tally(value: unknown): SeatTally | undefined {
  if (!isRecord(value)) return undefined;

  const { guests, seats } = value;

  if (typeof guests !== "number" || typeof seats !== "number") return undefined;

  return { guests, seats };
}

function count(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function optionalCount(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * The reconfirmation block, or `undefined` when the counts the panel reads are
 * not numbers.
 *
 * `not_asked` keeps its wire spelling: renaming it to `notAsked` is how the
 * modal came to display `undefined`.
 */
function progress(value: unknown): ReconfirmationProgress | undefined {
  if (!isRecord(value)) return undefined;

  const { not_asked, asked, confirmed, changed } = value;

  if (
    typeof not_asked !== "number" ||
    typeof asked !== "number" ||
    typeof confirmed !== "number" ||
    typeof changed !== "number"
  ) {
    return undefined;
  }

  return {
    round: count(value.round),
    startedAt: typeof value.startedAt === "string" ? value.startedAt : null,
    not_asked,
    asked,
    confirmed,
    changed,
  };
}

/**
 * Reads `GET /events/{id}/attendance`, and refuses a body the panel cannot
 * render.
 *
 * Tolerating a missing block is how a broken contract becomes a screen of
 * blanks: the host cannot tell "nobody has been asked" from "we read the wrong
 * key". The two blocks the panel is built on — `confirmed` and
 * `reconfirmation` — must be there and must be numeric; everything else is
 * filled from what arrived, with `0` where a tally is absent.
 */
export function asAttendance(value: unknown, endpoint: string): Attendance {
  const body = isRecord(value) ? value : undefined;
  const confirmed = body ? tally(body.confirmed) : undefined;
  const reconfirmation = body ? progress(body.reconfirmation) : undefined;

  if (!body || !confirmed || !reconfirmation) {
    throw new ContractError(
      `${endpoint} returned ${describeShape(value)} where an attendance summary ` +
        "with { confirmed: { guests, seats }, reconfirmation: { not_asked, … } } " +
        "was expected. The panel would otherwise show blanks, so this is a " +
        'contract error, not "nobody to ask".',
    );
  }

  const byStatus = isRecord(body.byStatus) ? body.byStatus : {};
  const checkedIn = isRecord(body.checkedIn) ? body.checkedIn : {};

  return {
    eventId: text(body.eventId),
    capacity: optionalCount(body.capacity),
    totalGuestRecords: count(body.totalGuestRecords),
    confirmed,
    remainingCapacity: optionalCount(body.remainingCapacity),
    overCapacityBy: count(body.overCapacityBy),
    byStatus: {
      going: tally(byStatus.going) ?? zeroTally(),
      maybe: tally(byStatus.maybe) ?? zeroTally(),
      notGoing: tally(byStatus.notGoing) ?? zeroTally(),
      pendingApproval: tally(byStatus.pendingApproval) ?? zeroTally(),
      waitlisted: tally(byStatus.waitlisted) ?? zeroTally(),
      noResponse: tally(byStatus.noResponse) ?? zeroTally(),
    },
    reconfirmation,
    checkedIn: {
      guests: count(checkedIn.guests),
      seats: count(checkedIn.seats),
      pendingSeats: count(checkedIn.pendingSeats),
    },
    walkIns: tally(body.walkIns) ?? zeroTally(),
    generatedAt: text(body.generatedAt),
  };
}

export async function getAttendance(eventId: string) {
  const path = endpoints.events.attendance(eventId);

  return asAttendance(await http.get<unknown>(path), `GET ${path}`);
}

/**
 * `POST /events/{id}/reconfirmation/start` — one round of "are you still
 * coming?".
 *
 * The body is `StartReconfirmationDto`, and the answer is
 * `{ askedCount, round, startedAt, emailsQueued }`. Only a **published** event
 * can be asked (`409 EVENT_INVALID_TRANSITION`), which `describeError` turns
 * into the API's own sentence.
 */
export function startReconfirmation(
  eventId: string,
  input: StartReconfirmationInput = START_DEFAULTS,
) {
  return http.post<ReconfirmationStartResponse>(
    endpoints.events.reconfirmation(eventId),
    input,
  );
}
