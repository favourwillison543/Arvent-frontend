import { describe, expect, it } from "vitest";

import { describeError, NETWORK_ERROR_MESSAGE } from "@/lib/http/errorMessage";
import { toApiError } from "@/lib/http/problem";

/**
 * These are not invented shapes. Each document below was copied from a live
 * request to the deployed API on 17 Nov 2026 — it answers
 * every failure as RFC 7807 `application/problem+json`. The bug this file
 * guards against is that the client used to look for `message`, find nothing,
 * and replace every one of these sentences with "Something went wrong."
 */

/** `GET /events` with no cookie. */
const UNAUTHENTICATED = {
  type: "https://docs.arvent.app/errors/unauthenticated",
  title: "UNAUTHORIZED",
  status: 401,
  code: "UNAUTHENTICATED",
  detail: "Please sign in to continue.",
  instance: "/events",
  requestId: "4e424ba9-5259-4aef-a3d5-21b738abf70e",
};

/** `GET /public/events/nope-nope`. */
const EVENT_NOT_FOUND = {
  type: "https://docs.arvent.app/errors/event_not_found",
  title: "NOT FOUND",
  status: 404,
  code: "EVENT_NOT_FOUND",
  detail: "Event not found.",
  instance: "/public/events/nope-nope",
  requestId: "7fe3e9b1-7bf2-47d9-84dd-8e72a413567a",
};

/** `POST /auth/login` with `{}` — note: `errors` is an array, not a map. */
const VALIDATION_FAILED = {
  type: "https://docs.arvent.app/errors/validation_failed",
  title: "BAD REQUEST",
  status: 400,
  code: "VALIDATION_FAILED",
  detail: "Some fields are invalid.",
  errors: [
    { field: "email", message: "email must be an email" },
    { field: "password", message: "password must be a string" },
  ],
  instance: "/auth/login",
  requestId: "3b8f54b2-d182-4c54-8966-73c3ec644862",
};

/** `POST /auth/register` after a few attempts — captured live, 429. */
const RATE_LIMITED = {
  type: "https://docs.arvent.app/errors/rate_limited",
  title: "TOO MANY REQUESTS",
  status: 429,
  code: "RATE_LIMITED",
  detail: "Too many requests. Please slow down.",
  retryAfterSeconds: 2596,
  instance: "/auth/register",
  requestId: "a8d2bcf2-7b2f-4336-a362-ac530cef4300",
};

/**
 * `POST /public/events/to-my-listening-party-r5pwji3xcj/rsvp` with an email that
 * already answered — captured from the live API, 409. The sentence is in
 * `detail`; `details` is a *machine* bag (`verificationRequired`, `recovery`),
 * and reading it as field errors is what put `email_code` on the screen instead
 * of "You have already responded…".
 */
const GUEST_ALREADY_RESPONDED = {
  type: "https://docs.arvent.app/errors/guest_already_responded",
  title: "CONFLICT",
  status: 409,
  code: "GUEST_ALREADY_RESPONDED",
  detail:
    "You have already responded to this event. Verify your email to view or change your response.",
  message:
    "You have already responded to this event. Verify your email to view or change your response.",
  details: { verificationRequired: true, recovery: "email_code" },
  verificationRequired: true,
  recovery: "email_code",
  instance: "/public/events/to-my-listening-party-r5pwji3xcj/rsvp",
  requestId: "699acee4-820c-45d5-99a9-39774be29318",
};

function failure(status: number, data: unknown, headers: unknown = {}) {
  return {
    message: `Request failed with status code ${status}`,
    response: { status, data, headers },
  };
}


describe("toApiError — RFC 7807", () => {
  it("shows the API's own sentence from `detail`, not axios wording", () => {
    const error = toApiError(failure(401, UNAUTHENTICATED), "/events");

    expect(error.message).toBe("Please sign in to continue.");
    expect(error.status).toBe(401);
    expect(error.code).toBe("UNAUTHENTICATED");
    expect(error.type).toBe("https://docs.arvent.app/errors/unauthenticated");
    expect(error.instance).toBe("/events");
    expect(error.requestId).toBe("4e424ba9-5259-4aef-a3d5-21b738abf70e");
  });

  it("does not use `title` as copy — it is the HTTP status in capitals", () => {
    const error = toApiError(failure(404, EVENT_NOT_FOUND), "/public/events/x");

    expect(error.message).toBe("Event not found.");
    expect(error.message).not.toBe("NOT FOUND");
    expect(error.code).toBe("EVENT_NOT_FOUND");
  });

  it("reads field errors as an array of { field, message }", () => {
    const error = toApiError(failure(400, VALIDATION_FAILED), "/auth/login");

    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.errors).toEqual([
      { field: "email", message: "email must be an email" },
      { field: "password", message: "password must be a string" },
    ]);
  });

  it("reads a 409 `details` bag as metadata, never as field errors", () => {
    const error = toApiError(
      failure(409, GUEST_ALREADY_RESPONDED),
      "/public/events/x/rsvp",
    );

    expect(error.code).toBe("GUEST_ALREADY_RESPONDED");
    expect(error.message).toBe(GUEST_ALREADY_RESPONDED.detail);
    // `details.recovery` is a code for the UI, not a sentence for the guest.
    expect(error.errors).toBeUndefined();
    expect(error.verificationRequired).toBe(true);
    expect(error.recovery).toBe("email_code");
  });

  it("still reads `details` when it is an array of field errors", () => {
    const error = toApiError(
      failure(400, {
        status: 400,
        code: "VALIDATION_FAILED",
        detail: "Some fields are invalid.",
        details: [{ field: "email", message: "email must be an email" }],
      }),
      "/auth/login",
    );

    expect(error.errors).toEqual([
      { field: "email", message: "email must be an email" },
    ]);
  });

  it("never leaves a bare status code as the message", () => {
    const bodies = [UNAUTHENTICATED, EVENT_NOT_FOUND, VALIDATION_FAILED, null, ""];

    for (const body of bodies) {
      const error = toApiError(failure(500, body), "/events");

      expect(error.message.length).toBeGreaterThan(0);
      expect(error.message).not.toMatch(/request failed with status code/i);
    }
  });

  it("keeps the wait from a 429 so the screen can name it", () => {
    const error = toApiError(failure(429, RATE_LIMITED), "/auth/register");

    expect(error.retryAfterSeconds).toBe(2596);
  });

  it("reads Retry-After when the body has no retryAfterSeconds", () => {
    const error = toApiError(
      failure(429, { ...RATE_LIMITED, retryAfterSeconds: undefined }, { "retry-after": "30" }),
      "/auth/register",
    );

    expect(error.retryAfterSeconds).toBe(30);
  });
});


describe("toApiError — bodies that are not problem documents", () => {
  it("describes a 502 HTML page as a server problem, not a page problem", () => {
    const error = toApiError(
      failure(502, "<!doctype html><html><body>Bad gateway</body></html>"),
      "/events",
    );

    expect(error.status).toBe(502);
    expect(error.code).toBe("API_ERROR");
    expect(error.message).toBe(
      "Arvent couldn't complete that just now. Please try again in a moment.",
    );
  });

  it("asks the user to wait on 429 rather than blaming them", () => {
    const error = toApiError(failure(429, undefined), "/public/events/x/rsvp");

    expect(error.status).toBe(429);
    expect(error.message).toMatch(/wait a moment/i);
  });

  it("falls back to the x-request-id header when the body has none", () => {
    const error = toApiError(
      failure(500, { detail: "Internal error." }, { "x-request-id": "abc-123" }),
      "/events",
    );

    expect(error.requestId).toBe("abc-123");
  });

  it("still reads a `{ message }` body, for anything in front of the API", () => {
    const error = toApiError(failure(400, { message: "Body is too large." }), "/moments");

    expect(error.message).toBe("Body is too large.");
    expect(error.code).toBe("API_ERROR");
  });
});

describe("toApiError — no response", () => {
  it("marks a request that never arrived as status 0 / NETWORK_ERROR", () => {
    const error = toApiError({ message: "Network Error" }, "/events");

    expect(error.status).toBe(0);
    expect(error.code).toBe("NETWORK_ERROR");
    expect(error.message).toBe("Network Error");
  });
});

describe("describeError", () => {
  it("prefers the field messages over the generic validation summary", () => {
    const error = toApiError(failure(400, VALIDATION_FAILED), "/auth/login");

    expect(describeError(error)).toBe(
      "email must be an email password must be a string",
    );
    expect(describeError(error)).not.toBe("Some fields are invalid.");
  });

  it("shows the backend sentence for a real failure", () => {
    const error = toApiError(failure(404, EVENT_NOT_FOUND), "/public/events/x");

    expect(describeError(error)).toBe("Event not found.");
  });

  it("tells an already-answered guest to verify — never `email_code`", () => {
    const error = toApiError(
      failure(409, GUEST_ALREADY_RESPONDED),
      "/public/events/x/rsvp",
    );

    expect(describeError(error)).toBe(GUEST_ALREADY_RESPONDED.detail);
    expect(describeError(error)).not.toBe("email_code");
  });

  it("replaces a machine token that arrives as the only message", () => {
    const error = toApiError(
      failure(409, { status: 409, code: "CONFLICT", detail: "email_code" }),
      "/public/events/x/rsvp",
    );

    expect(describeError(error, "We couldn’t save your RSVP.")).toBe(
      "We couldn’t save your RSVP.",
    );
  });

  it("turns an unreachable API into connection advice", () => {
    const error = toApiError({ message: "Network Error" }, "/events");

    expect(describeError(error)).toBe(NETWORK_ERROR_MESSAGE);
  });

  it("turns a rate limit into a wait the visitor can plan around", () => {
    const error = toApiError(failure(429, RATE_LIMITED), "/auth/register");

    // 2596 seconds is 43.27 minutes: round up, so the countdown never promises
    // a retry that the window is still refusing.
    expect(describeError(error)).toBe("Too many requests. Try again in 44 minutes.");
  });

  it("keeps the caller's fallback for something that is not an error at all", () => {
    expect(describeError(undefined, "We couldn't load this event.")).toBe(
      "We couldn't load this event.",
    );
  });
});
