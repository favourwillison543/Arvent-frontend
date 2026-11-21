import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The guest pass as the API actually answers it.
 *
 * Two live defects are pinned here.
 *
 * **The envelope.** `GET /public/guest/pass` and `POST /public/guest/pass/session`
 * answer `{ pass: { guest, event, reference }, passUrl }` — not `{ guest, event }`.
 * Typed as the latter, a perfectly good 200 left `data.guest` undefined, so the
 * pass page said *"This pass isn't available"* about a pass the API had just
 * confirmed. `passSession` is the one place that shape is translated.
 *
 * **The address.** The cookie these routes work with is `Path=/public/guest`, and
 * a browser only sends a cookie on a path that starts with the cookie's own
 * `Path`. Under the `/backend` prefix the claim's cookie was never sent back, so
 * the read after it was a 401. They are called as themselves now (`baseURL: "/"`),
 * which `next.config.ts` rewrites to the API.
 */
const { get, post, patch } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("@/lib/http/client", () => ({
  http: { get, post, patch, delete: vi.fn() },
}));

import {
  claimGuestPass,
  getGuestPass,
  passSession,
  updateGuestRsvp,
} from "@/lib/api/public";
import type { GuestPassAnswer, PublicEvent } from "@/lib/api/public";

const event = {
  id: "event-1",
  slug: "qa-party-3b3ui55enp",
  name: "QA Party",
  date: "2026-12-24",
  programStartTime: "18:00",
  venueName: "Eko Hotel",
  location: "Victoria Island, Lagos",
} as unknown as PublicEvent;

/** A verbatim 200 from the deployed API, trimmed to the fields the app reads. */
const answer: GuestPassAnswer = {
  pass: {
    reference: "MHAM-NX81",
    state: "active",
    valid: true,
    guest: {
      name: "Ada Guest",
      rsvpStatus: "going",
      additionalGuestCount: 0,
      seats: 1,
      checkedInAt: null,
    },
    event,
  },
  passUrl:
    "http://localhost:3000/pass#token=agp_01a1f8f46b487c62a84f09ef52da7b2aU_iauPRfD1bPXTycR8-4sSpzhluJpoH2",
};

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  patch.mockReset();
});

describe("getGuestPass", () => {
  it("reads /public/guest/pass as itself, so the pass cookie is sent", async () => {
    get.mockResolvedValue(answer);

    await getGuestPass("qa-party-3b3ui55enp");

    expect(get).toHaveBeenCalledWith("/public/guest/pass", {
      baseURL: "/",
      headers: { "X-Event-Slug": "qa-party-3b3ui55enp" },
    });
  });

  it("still asks when the address does not name the event", async () => {
    get.mockResolvedValue(answer);

    await getGuestPass();

    expect(get).toHaveBeenCalledWith("/public/guest/pass", { baseURL: "/" });
  });
});

describe("claimGuestPass", () => {
  it("trades the `agp_` token at the same-origin pass session", async () => {
    post.mockResolvedValue(answer);

    await claimGuestPass("agp_01a1");

    expect(post).toHaveBeenCalledWith(
      "/public/guest/pass/session",
      { token: "agp_01a1" },
      { baseURL: "/" },
    );
  });
});

describe("passSession", () => {
  it("unwraps `{ pass }` into the guest and event the pass page renders", () => {
    const session = passSession(answer);

    expect(session.guest.name).toBe("Ada Guest");
    expect(session.guest.rsvpStatus).toBe("going");
    expect(session.event.slug).toBe("qa-party-3b3ui55enp");
    expect(session.reference).toBe("MHAM-NX81");
  });

  it("prints the API's reference instead of one derived from a placeholder id", () => {
    const session = passSession(answer);

    // The pass carries no guest id: the reference *is* the identifier here, and
    // it is what the door types in.
    expect(session.guest.id).toBe("MHAM-NX81");
    expect(session.guest.passReference).toBe("MHAM-NX81");
  });

  it("counts the seats the pass covers, never fewer than the guest", () => {
    const session = passSession({
      ...answer,
      pass: {
        ...answer.pass,
        guest: { ...answer.pass.guest, seats: 0, additionalGuestCount: 3 },
      },
    });

    expect(session.guest.seats).toBe(4);
    expect(session.guest.seatLimit).toBe(4);
  });

  it("does not invent a consent the pass never asked about", () => {
    expect(passSession(answer).guest.consent).toBe(false);
  });
});

describe("updateGuestRsvp", () => {
  it("unwraps `{ guest }` so callers keep one shape", async () => {
    const guest = { id: "guest-1", name: "Ada Guest" };
    patch.mockResolvedValue({ guest });

    await expect(
      updateGuestRsvp({ rsvpStatus: "maybe" }, "qa-party-3b3ui55enp"),
    ).resolves.toBe(guest);
  });

  it("accepts a bare guest from a deployment that answers that way", async () => {
    const guest = { id: "guest-1", name: "Ada Guest" };
    patch.mockResolvedValue(guest);

    await expect(updateGuestRsvp({ rsvpStatus: "maybe" })).resolves.toBe(guest);
  });
});
