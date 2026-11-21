import { ApiError, type ApiProblemField } from "@/lib/http/errors";

/**
 * Axios failure → `ApiError`, in one place.
 *
 * Deliberately a plain function over a structural type rather than a method on
 * the client: this is the code that decides what every screen in the product
 * says when something fails, so it is the code most worth testing against the
 * real documents captured from the API (see `problem.test.ts`).
 */

/** The part of an axios failure this module reads. */
export type FailureLike = {
  message?: string;
  response?: {
    status: number;
    data?: unknown;
    headers?: unknown;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A string, or a list of strings, as one sentence. */
function asSentence(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();

  if (Array.isArray(value)) {
    const parts = value
      .map(asSentence)
      .filter((item): item is string => Boolean(item));

    return parts.length ? parts.join(" ") : undefined;
  }

  return undefined;
}

/** `errors: [{ field, message }]` — also tolerant of a map-shaped `{ field: message }`. */
function problemFields(value: unknown): ApiProblemField[] | undefined {
  const fields = Array.isArray(value)
    ? value.flatMap((entry) => {
        if (!isRecord(entry)) return [];

        const message = asSentence(entry.message);

        return message
          ? [{ field: typeof entry.field === "string" ? entry.field : "", message }]
          : [];
      })
    : isRecord(value)
      ? Object.entries(value).flatMap(([field, raw]) => {
          const message = asSentence(raw);

          return message ? [{ field, message }] : [];
        })
      : [];

  return fields.length ? fields : undefined;
}

/** A header from either an `AxiosHeaders` instance or a plain object. */
function headerValue(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined;

  const get = (headers as { get?: (key: string) => unknown }).get;

  // `AxiosHeaders.get` is the portable read; keep the index access as a fallback
  // for the plain objects the tests (and any hand-made failure) use.
  const fromGet =
    typeof get === "function" ? asSentence(get.call(headers, name)) : undefined;

  if (fromGet) return fromGet;

  return isRecord(headers) ? asSentence(headers[name]) : undefined;
}

/**
 * `429` carries the wait twice: `retryAfterSeconds` in the body (captured:
 * `"retryAfterSeconds": 2596` on `/auth/register`) and a `Retry-After` header.
 * Whichever arrives first is the number the UI counts down from.
 */
function retryAfterSeconds(value: unknown, headers: unknown): number | undefined {
  const fromBody =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody);

  const header = Number(headerValue(headers, "retry-after"));

  return Number.isFinite(header) && header > 0 ? Math.ceil(header) : undefined;
}

/**
 * What to say when the API sent no sentence. Never axios's own wording
 * ("Request failed with status code 502") — that names the transport, not the
 * problem, and it is what used to leak as "Something went wrong".
 */
function statusSentence(status: number, endpoint: string): string {
  if (status === 429) {
    return "That was a lot of requests at once. Wait a moment and try again.";
  }

  if (status === 401) return "Please sign in to continue.";

  if (status === 403) {
    return "That isn't something your account can do. Ask the event host.";
  }

  if (status === 404) return "We couldn't find that.";

  if (status === 409) return "That conflicts with something that already exists.";

  if (status >= 500) {
    return "Arvent couldn't complete that just now. Please try again in a moment.";
  }

  return `The API rejected ${endpoint} (HTTP ${status}).`;
}

export function toApiError(failure: FailureLike, endpoint: string): ApiError {
  const response = failure.response;

  // No response at all: offline, DNS, CORS, aborted, timed out. Status 0 is what
  // `describeError` reads as "the network", so a guest never sees a stack trace.
  if (!response) {
    return new ApiError({
      message: failure.message?.trim() || `The request to ${endpoint} never reached the API.`,
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  const status = response.status;
  const body = response.data;
  const problem: Record<string, unknown> = isRecord(body) ? body : {};

  // An HTML or plain-text body here is not a problem document — a proxy error
  // page, a 502 from the host. The status sentence below is the honest answer.
  const legacyError = isRecord(problem.error) ? problem.error : undefined;

  const detail =
    asSentence(problem.detail) ??
    asSentence(problem.message) ??
    asSentence(legacyError?.message) ??
    (typeof problem.error === "string" ? asSentence(problem.error) : undefined);

  const requestId =
    asSentence(problem.requestId) ??
    headerValue(response.headers, "x-request-id");

  // v2.2 answers `{ message, status, code, details }`; the older problem
  // documents used `errors`. Both are field lists — but `details` is also where
  // a 409 puts *machine* hints (`{ verificationRequired, recovery }`, captured
  // live on `/public/events/{slug}/rsvp`: `recovery: "email_code"`). A bag of
  // flags is not a list of sentences: read as fields, `email_code` became the
  // guest's error message and replaced the API's own "You have already
  // responded…" sentence. Only an array is a field list.
  const details = isRecord(problem.details) ? problem.details : undefined;

  const verificationRequired =
    details?.verificationRequired === true ||
    problem.verificationRequired === true;

  const recovery =
    asSentence(details?.recovery) ?? asSentence(problem.recovery);

  return new ApiError({
    message: detail ?? statusSentence(status, endpoint),
    status,
    code:
      asSentence(problem.code) ??
      asSentence(legacyError?.code) ??
      "API_ERROR",
    type: asSentence(problem.type),
    instance: asSentence(problem.instance),
    requestId,
    errors:
      problemFields(problem.errors) ??
      (Array.isArray(problem.details)
        ? problemFields(problem.details)
        : undefined),
    retryAfterSeconds: retryAfterSeconds(problem.retryAfterSeconds, response.headers),
    // What the guest can *do* about it, kept as data rather than as copy.
    verificationRequired,
    recovery,
  });
}
