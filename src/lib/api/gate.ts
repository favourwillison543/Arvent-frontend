import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CheckInInput,
  CreateGateAccessInput,
  GateAccess,
  GateGuest,
  GateGuestRow,
  GateListResponse,
  GateSession,
  WalkInInput,
} from "@/lib/types/gate";
import { asPage, ContractError } from "@/lib/utils/list";

/**
 * `POST /gate/session { code }`.
 *
 * The gate is cookie-authenticated: this exchange sets a short-lived httpOnly
 * gate cookie, and every gate call after it rides that cookie. There is no
 * `X-Gate-Token` header in the contract — the code is sent exactly once, here.
 *
 * The answer names the event the code opens (verified live: `{ expiresAt,
 * permissions, label, event: { id, name, … } }`), which is how a link without a
 * usable `?eventId=` still reaches the right door.
 */
export function openGateSession(code: string) {
  return http.post<GateSession>(endpoints.gate.session, { code });
}

/**
 * `POST /events/{id}/gate-access` — mint a door link.
 *
 * The answer carries the secret the link is built from. The contract does not
 * publish a response schema, so both names are read (`code`, then the older
 * `gateToken`) rather than asserted.
 */
export function createGateAccess(
  eventId: string,
  data: CreateGateAccessInput,
) {
  return http.post<GateAccess & { code?: string; gateToken?: string }>(
    endpoints.events.gateAccess(eventId),
    data,
  );
}

export async function getGateAccess(eventId: string) {
  // `{ items, nextCursor }` — the same shape as every other list.
  return asPage<GateAccess>(
    await http.get<unknown>(endpoints.events.gateAccess(eventId)),
    `GET ${endpoints.events.gateAccess(eventId)}`,
  );
}

export function deleteGateAccess(
  eventId: string,
  accessId: string,
) {
  return http.delete<void>(
    endpoints.events.gateAccessItem(eventId, accessId),
  );
}

/**
 * The API counts arrivals in seats (`checkedInSeats`); the door UI needs a
 * number it can subtract. One fill, here, so no component has to remember.
 */
export function normaliseDoorGuest(guest: GateGuestRow): GateGuest {
  return {
    ...guest,
    checkedInCount: guest.checkedInSeats ?? guest.checkedInCount ?? 0,
  };
}

export type GateListParams = {
  /** Search by name or phone digits — the endpoint calls it `q`. */
  search?: string;
  cursor?: string;
  limit?: number;
  category?: "expected" | "checked_in" | "waitlisted" | "pending" | "not_eligible";
};

/**
 * The first array inside a list-bearing object, under any of the names this API
 * has used for rows — or, failing those, the first array it does carry.
 */
function arrayIn(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return undefined;

  const record = value as Record<string, unknown>;

  for (const key of ["guests", "items", "guestList", "rows", "results"] as const) {
    if (Array.isArray(record[key])) return record[key];
  }

  return Object.values(record).find(Array.isArray);
}

/**
 * Where the rows live in the body.
 *
 * The contract says `guests`, and the deployed API has answered `guests` — but
 * the endpoint is cursor-paginated like every other list, and a deployment that
 * wraps the rows in `items` (or in a `{ data: … }` envelope) made the door
 * screen read `undefined` and refuse to open at all. When nothing in the body is
 * an array the whole body is handed to `asArray`, so the console names the keys
 * that actually arrived instead of blaming the reader.
 */
function gateRows(body: unknown): unknown {
  return arrayIn(body) ?? arrayIn((body as Record<string, unknown>)?.data) ?? body;
}

export async function getGateList(
  eventId: string,
  params: GateListParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("q", params.search);
  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.category) searchParams.set("category", params.category);

  const query = searchParams.toString();
  const path = `${endpoints.events.gateList(eventId)}${query ? `?${query}` : ""}`;

  const data = await http.get<GateListResponse>(path);
  const rows = gateRows(data as unknown);

  /*
   * An empty door list and an unreadable one must not look alike at 9pm on the
   * night. `asArray` is deliberately quiet in production (a broken list must not
   * cost a guest the page), but the door is the one screen where "no guests" is
   * worse than an error: the door staff would send people away. So a missing
   * array is a `ContractError` here in every environment, and `describeError`
   * turns it into "We couldn't load the door list" while the console keeps the
   * body's keys.
   */
  if (!Array.isArray(rows)) {
    const keys =
      rows && typeof rows === "object"
        ? Object.keys(rows as Record<string, unknown>).join(", ")
        : String(rows);

    throw new ContractError(
      `GET ${path} carried no guest array (body keys: [${keys}]) where an array ` +
        'was expected. The door screen must not read that as "no guests".',
    );
  }

  /*
   * The live body counts under `summary` (`{ expected, checkedIn, … }`) and has
   * no `attendance` block. Filling it here keeps `GateHeader` on the event-wide
   * totals instead of the first page of rows, and lets a deployment that still
   * sends the PRD's older `attendance` keep working unchanged.
   */
  const attendance =
    data.attendance ??
    (data.summary
      ? { expected: data.summary.expected, checkedIn: data.summary.checkedIn }
      : undefined);

  return {
    ...data,
    attendance,
    guests: (rows as GateGuestRow[]).map(normaliseDoorGuest),
  };
}

/**
 * `POST /events/{id}/guests/{guestId}/check-in` (PRD §7).
 *
 * Partial arrivals: `data.seats` is how many are arriving now. The retry guard
 * is the `Idempotency-Key` **header**, so a dropped response can be retried
 * with the same key without counting anybody twice.
 */
export function checkInGuest(
  eventId: string,
  guestId: string,
  data: CheckInInput,
  idempotencyKey?: string,
) {
  return http.post<{ guest: GateGuestRow }>(
    endpoints.events.checkIn(eventId, guestId),
    data,
    idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined,
  );
}

/** `POST /events/{id}/walk-ins` — `{ name, phone?, seats }`. */
export function addWalkIn(
  eventId: string,
  data: WalkInInput,
  idempotencyKey?: string,
) {
  return http.post<GateGuestRow>(
    endpoints.events.walkIns(eventId),
    data,
    idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined,
  );
}
