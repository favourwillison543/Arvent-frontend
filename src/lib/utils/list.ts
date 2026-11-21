/**
 * List responses: the one shape, read once.
 *
 * Every cursor-paginated list endpoint answers with
 * `{ items: [...], nextCursor: string | null }` — verified against the live API
 * (`GET /public/events`). The previous version of this file returned `[]` for
 * anything that was not an array, which turned "the envelope is not unwrapped"
 * into "there are no events, no guests, no moments". A list that is empty
 * because of a contract change must never look like an empty list.
 *
 * So: parse strictly. In development a wrong shape **throws**, naming the
 * endpoint and the keys that actually arrived, because that is a bug to fix now.
 * In production it logs and returns an empty page, because a guest should not
 * get a stack trace instead of an invitation.
 *
 * Not every object-shaped list uses `items`: `GET /events/{id}/memories` answers
 * `{ photos, nextCursor, … }` and is modelled by `MemoryGallery`, not by this
 * helper. If a shape is wrong, the error below says so by name.
 */

/** A cursor-paginated page, as the API returns it. */
export type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

/**
 * A body that is not the shape the screen reads.
 *
 * It is a class, not a sentence, because two very different readers get this
 * error: the console (which wants the endpoint, the keys that arrived and the
 * word "undefined"), and the guest or host (who must never see any of that). A
 * type lets `describeError` swap it for a human sentence without having to
 * pattern-match English.
 */
export class ContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * What to say when a body is not the expected shape.
 *
 * Shared with the readers that guard a single object rather than a list
 * (`api/reconfirmation.ts`), so a contract failure always names the keys that
 * actually arrived, in the same words.
 */
export function describeShape(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return `a bare array of ${value.length} item(s)`;

  if (isRecord(value)) {
    const keys = Object.keys(value);

    return keys.length
      ? `an object with keys [${keys.join(", ")}]`
      : "an empty object";
  }

  return `a ${typeof value}`;
}

function reject(
  value: unknown,
  endpoint: string,
  expected: string,
): Page<never> {
  const message =
    `${endpoint} returned ${describeShape(value)} where ${expected} was expected. ` +
    "The screen would otherwise render as empty, so this is a contract " +
    'error, not "no results".';

  if (process.env.NODE_ENV !== "production") {
    throw new ContractError(message);
  }

  // Production: a broken list must not cost the user the screen. Loud in the
  // console (and in the platform's log drain), empty on the page.
  console.error(`[arvent] ${message}`);

  return { items: [], nextCursor: null };
}

/**
 * Reads the `{ items, nextCursor }` envelope.
 *
 * `nextCursor` may be absent on the last page; a non-string is treated as
 * "no more pages" rather than failing the whole list over a cursor.
 */
export function asPage<T>(value: unknown, endpoint: string): Page<T> {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return reject(value, endpoint, "an { items: [], nextCursor } envelope") as Page<T>;
  }

  return {
    items: value.items as T[],
    nextCursor:
      typeof value.nextCursor === "string" ? value.nextCursor : null,
  };
}

/** The items of a page, for the screens that do not page yet. */
export function pageItems<T>(value: unknown, endpoint: string): T[] {
  return asPage<T>(value, endpoint).items;
}

/**
 * A response that is *known* to be a bare array (no cursor), guarded the same
 * way so it cannot quietly become `[]` either.
 */
export function asArray<T>(value: unknown, endpoint: string): T[] {
  if (Array.isArray(value)) return value as T[];

  return reject(value, endpoint, "an array").items as T[];
}

