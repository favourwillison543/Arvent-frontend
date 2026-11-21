/**
 * Failures: one problem document, read once.
 *
 * The API answers every failure as RFC 7807 `application/problem+json`. Verified
 * against the live API on 17 Nov 2026:
 *
 *   401 { type, title: "UNAUTHORIZED", status: 401, code: "UNAUTHENTICATED",
 *         detail: "Please sign in to continue.", instance: "/events",
 *         requestId: "4e424ba9-…" }
 *   404 { …, code: "EVENT_NOT_FOUND", detail: "Event not found.", … }
 *   400 { …, code: "VALIDATION_FAILED", detail: "Some fields are invalid.",
 *         errors: [{ field: "email", message: "email must be an email" }, …] }
 *
 * Three things follow, and all three were previously wrong:
 *
 *  - The sentence lives in `detail`. Nothing sends `message`, so the old
 *    `data.message ?? data.error.message` lookup never found anything and every
 *    backend sentence became "Something went wrong. Please try again." — a
 *    wrong password and a dead server read the same.
 *  - `title` is the HTTP status text in capitals ("BAD REQUEST"). It is kept for
 *    logs, never shown: "BAD REQUEST" is not a sentence to put in front of a
 *    guest.
 *  - Field errors are an **array** of `{ field, message }`, not a map.
 */

/** One field-level message from `errors`. */
export type ApiProblemField = {
  field: string;
  message: string;
};

/** An RFC 7807 problem document, plus this API's `code` and `requestId`. */
export type ApiProblem = {
  type?: string;
  title?: string;
  status?: number;
  code?: string;
  detail?: string;
  instance?: string;
  requestId?: string;
  errors?: ApiProblemField[];
  /** `RATE_LIMITED` only: seconds until the window reopens. */
  retryAfterSeconds?: number;
  /**
   * The refusal asks the visitor to prove who they are before it will answer.
   * `POST /public/events/{slug}/rsvp` sends this on a 409
   * (`GUEST_ALREADY_RESPONDED`): the email already replied on another device.
   */
  verificationRequired?: boolean;
  /** How to prove it — `email_code` today. A code for the UI, never for the screen. */
  recovery?: string;
};

type ApiErrorInit = {
  /** The sentence to show. Never a status code on its own. */
  message: string;
  /** HTTP status; 0 when the request never reached the API. */
  status: number;
  /** `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NETWORK_ERROR`, … */
  code: string;
  /** `https://docs.arvent.app/errors/…` — for a log line, not for the screen. */
  type?: string;
  /** The API's path for this failure, e.g. `/events`. */
  instance?: string;
  /** Echoes the API's request id: the string to quote in a support message. */
  requestId?: string;
  /** Field-level messages, in the order the API sent them. */
  errors?: ApiProblemField[];
  /** `RATE_LIMITED` only: how long the UI should ask the visitor to wait. */
  retryAfterSeconds?: number;
  /** The refusal wants the visitor verified first (see `ApiProblem`). */
  verificationRequired?: boolean;
  /** How to verify — `email_code` today. */
  recovery?: string;
};

/**
 * The 401 codes that mean "your session expired", as opposed to "this particular
 * credential is wrong": a guest pass (`INVALID_GUEST_TOKEN`) or a gate key
 * (`INVALID_GATE_TOKEN`) must never trigger an organizer refresh.
 */
export const SESSION_ERROR_CODES = new Set([
  "UNAUTHENTICATED",
  "SESSION_EXPIRED",
  "TOKEN_EXPIRED",
]);

/** The HTTP status of a failure, or 0 when it never reached the API. */
export function statusOf(error: unknown): number {
  return error instanceof ApiError ? error.status : 0;
}

/**
 * An expired session, wherever it surfaces.
 *
 * `http` turns a 401 into one of these after trying a refresh; a *replayed*
 * request that still fails lands here too, which is why the query cache watches
 * for it — otherwise that case sat on a page that looked signed in.
 */
export function isSessionExpiredError(error: unknown): boolean {
  if (statusOf(error) !== 401) return false;

  const code = (error as ApiError).code;

  return !code || SESSION_ERROR_CODES.has(code);
}

/** A refusal a retry cannot improve: the answer is the answer. */
export function isFinalError(error: unknown): boolean {
  const status = statusOf(error);

  return status === 401 || status === 403 || status === 404;
}

export class ApiError extends Error {
  status: number;
  code: string;
  type?: string;
  instance?: string;
  requestId?: string;
  errors?: ApiProblemField[];
  retryAfterSeconds?: number;
  /** Set when the API answered "verify first" rather than "no". */
  verificationRequired?: boolean;
  /** `email_code`: the verification path the API offers. */
  recovery?: string;

  constructor({
    message,
    status,
    code,
    type,
    instance,
    requestId,
    errors,
    retryAfterSeconds,
    verificationRequired,
    recovery,
  }: ApiErrorInit) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.type = type;
    this.instance = instance;
    this.requestId = requestId;
    this.errors = errors;
    this.retryAfterSeconds = retryAfterSeconds;
    this.verificationRequired = verificationRequired;
    this.recovery = recovery;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
