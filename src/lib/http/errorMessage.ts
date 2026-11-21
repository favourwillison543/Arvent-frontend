import { ApiError } from "./errors";
import { ContractError } from "@/lib/utils/list";

/** Copy shown when the API never answered (offline, DNS, CORS, timeout). */
export const NETWORK_ERROR_MESSAGE =
  "We couldn't reach Arvent. Check your connection and try again.";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

function asText(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();

  if (Array.isArray(value)) {
    const parts = value.map(asText).filter((item): item is string => !!item);

    return parts.length ? parts.join(". ") : undefined;
  }

  return undefined;
}

/**
 * The field-level sentences from an RFC 7807 `errors` array.
 *
 * A validation failure's `detail` is a summary — "Some fields are invalid." —
 * while `errors` is the part that says *what* to fix. Three of them is a
 * sentence; all ten is a stack trace in a toast.
 */
function fieldMessage(error: ApiError): string | undefined {
  if (!error.errors?.length) return undefined;

  const sentences = [
    ...new Set(
      error.errors
        .map((entry) => entry.message.trim())
        .filter((message) => Boolean(message)),
    ),
  ];

  return sentences.length ? sentences.slice(0, 3).join(" ") : undefined;
}

function isNetworkFailure(error: unknown) {
  if (error instanceof ApiError) return error.status === 0;

  const message = error instanceof Error ? error.message : "";

  return /network error|failed to fetch|timeout|ERR_NETWORK/i.test(message);
}

/** "43 minutes", "90 seconds" — never "2596 seconds". */
export function waitPhrase(seconds: number): string {
  const rounded = Math.max(1, Math.ceil(seconds));

  if (rounded < 60) return `${rounded} second${rounded === 1 ? "" : "s"}`;

  const minutes = Math.ceil(rounded / 60);

  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;

  const hours = Math.ceil(minutes / 60);

  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

/**
 * `429` says "Too many requests. Please slow down." — true, but it leaves the
 * visitor hammering the button. The problem document also carries
 * `retryAfterSeconds`, so the screen can say how long instead.
 */
function rateLimitMessage(error: ApiError): string | undefined {
  if (!error.retryAfterSeconds) return undefined;

  return `Too many requests. Try again in ${waitPhrase(error.retryAfterSeconds)}.`;
}

/**
 * Wording that belongs to the console, never to the screen: an endpoint name,
 * a status line, or a sentence about a JSON body's keys. A guest reading the
 * door list at 9pm cannot act on any of it, so it becomes the caller's fallback.
 */
const INTERNAL_MESSAGE =
  /where an array was expected|contract error|is not a function|cannot read propert|\bGET \/|\bPOST \/|\bPATCH \/|\bDELETE \/|status code \d+/i;

/**
 * Machine values, not copy: `email_code`, `GOOGLE_CALENDAR`, `not-found`.
 *
 * The API keeps these in `code` and in the `details` bag for the UI to branch
 * on. One of them reaching the screen is always a mapping bug — the RSVP 409
 * printed `email_code` where the backend's "You have already responded…"
 * sentence belonged — so a token is treated like an internal message and
 * replaced by the next candidate, then the caller's fallback.
 */
const MACHINE_TOKEN = /^[A-Za-z][A-Za-z0-9]*(?:[_-][A-Za-z0-9]+)+$/;

/** A sentence, as opposed to something only a program can read. */
function isCopy(message: string | undefined): message is string {
  return !!message && !INTERNAL_MESSAGE.test(message) && !MACHINE_TOKEN.test(message);
}

/**
 * Turns anything thrown by the API layer into a sentence a guest or host can
 * act on. Always prefer the backend's own wording, then the browser's, then
 * the caller's fallback — never a bare status code, never a contract error.
 */
export function describeError(
  error: unknown,
  fallback: string = GENERIC_MESSAGE,
): string {
  if (!error) return fallback;
  if (isNetworkFailure(error)) return NETWORK_ERROR_MESSAGE;

  // A wrong body shape is a bug for us to fix, not news for the reader.
  if (error instanceof ContractError) return fallback;

  if (error instanceof ApiError) {
    // A rate limit is about *when*, not *what*: the wait belongs in the sentence.
    if (error.code === "RATE_LIMITED") {
      return rateLimitMessage(error) ?? asText(error.message) ?? fallback;
    }

    // `message` is the API's `detail`; `errors` is the finer-grained part.
    for (const candidate of [fieldMessage(error), asText(error.message)]) {
      if (isCopy(candidate)) return candidate;
    }

    return fallback;
  }

  const message = asText(error instanceof Error ? error.message : error);

  return isCopy(message) ? message : fallback;
}
