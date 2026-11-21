import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The attendance summary is the whole screen: every tile, the button's label
 * and whether the button may be pressed at all. It was read under the PRD's
 * older names (`guests.going`, `reconfirmedHeadcount`, `notAsked`), none of
 * which the API sends, so the panel rendered "Request confirmation from
 * undefined" over four blank tiles. These tests pin the live body and refuse
 * the old one, so that failure cannot come back quietly.
 */
const { request } = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("axios", () => {
  const axiosMock = Object.assign(request, { isAxiosError: () => false });

  return { default: axiosMock, isAxiosError: axiosMock.isAxiosError };
});

import {
  asAttendance,
  getAttendance,
  startReconfirmation,
} from "@/lib/api/reconfirmation";
import { ContractError } from "@/lib/utils/list";

/** `GET /events/{id}/attendance`, captured from the live API on 20 Nov 2026. */
const LIVE_ATTENDANCE = {
  eventId: "01a1f9c6-5ff6-7eb2-aa93-e0d4f3c412ef",
  capacity: 20,
  totalGuestRecords: 1,
  confirmed: { guests: 1, seats: 2 },
  remainingCapacity: 18,
  overCapacityBy: 0,
  byStatus: {
    going: { guests: 1, seats: 2 },
    maybe: { guests: 0, seats: 0 },
    notGoing: { guests: 0, seats: 0 },
    pendingApproval: { guests: 0, seats: 0 },
    waitlisted: { guests: 0, seats: 0 },
    noResponse: { guests: 0, seats: 0 },
  },
  reconfirmation: {
    round: 1,
    startedAt: "2026-11-20T16:24:51.384Z",
    not_asked: 0,
    asked: 1,
    confirmed: 0,
    changed: 0,
  },
  checkedIn: { guests: 0, seats: 0, pendingSeats: 0 },
  walkIns: { guests: 0, seats: 0 },
  generatedAt: "2026-11-20T16:24:51.687Z",
};

/** `POST /events/{id}/reconfirmation/start`, captured live. */
const LIVE_START = {
  askedCount: 1,
  round: 1,
  startedAt: "2026-11-20T16:24:51.384Z",
  emailsQueued: 0,
};

describe("asAttendance", () => {
  it("reads the live summary, snake_case and all", () => {
    const attendance = asAttendance(LIVE_ATTENDANCE, "GET /events/evt_1/attendance");

    expect(attendance.confirmed).toEqual({ guests: 1, seats: 2 });
    expect(attendance.reconfirmation.not_asked).toBe(0);
    expect(attendance.reconfirmation.asked).toBe(1);
    expect(attendance.reconfirmation.round).toBe(1);
    expect(attendance.reconfirmation.startedAt).toBe(
      "2026-11-20T16:24:51.384Z",
    );
    expect(attendance.byStatus.going.seats).toBe(2);
    expect(attendance.remainingCapacity).toBe(18);
  });

  it("fills the blocks it does not read with zeroes, but never the summary", () => {
    const attendance = asAttendance(
      {
        confirmed: { guests: 0, seats: 0 },
        reconfirmation: {
          round: 0,
          startedAt: null,
          not_asked: 2,
          asked: 0,
          confirmed: 0,
          changed: 0,
        },
      },
      "GET /events/evt_1/attendance",
    );

    expect(attendance.byStatus.maybe).toEqual({ guests: 0, seats: 0 });
    expect(attendance.walkIns).toEqual({ guests: 0, seats: 0 });
    expect(attendance.checkedIn).toEqual({
      guests: 0,
      seats: 0,
      pendingSeats: 0,
    });
    expect(attendance.capacity).toBeNull();
    expect(attendance.reconfirmation.not_asked).toBe(2);
  });

  it("rejects a summary whose counts are not numbers", () => {
    expect(() =>
      asAttendance(
        {
          confirmed: { guests: 1, seats: 2 },
          reconfirmation: { not_asked: "0", asked: 1, confirmed: 0, changed: 0 },
        },
        "GET /events/evt_1/attendance",
      ),
    ).toThrow(ContractError);
  });

  it("rejects the PRD's older body instead of rendering blanks", () => {
    const prdBody = {
      capacity: 20,
      guests: { going: 1, maybe: 0, not_going: 0, pending_approval: 0, waitlisted: 0 },
      seats: { given: 2, confirmed: 2, remaining: 18 },
      reconfirmation: { confirmed: 0, changed: 0, asked: 1, notAsked: 2 },
      reconfirmedHeadcount: 0,
      checkedInSeats: 0,
      notArrivedSeats: 2,
    };

    expect(() =>
      asAttendance(prdBody, "GET /events/evt_1/attendance"),
    ).toThrow(ContractError);
  });

  it.each([
    ["null", null],
    ["no body", undefined],
    ["a bare string", "ok"],
    ["an array", [LIVE_ATTENDANCE]],
    ["an empty object", {}],
  ])("rejects %s, naming the endpoint", (_label, body) => {
    expect(() => asAttendance(body, "GET /events/evt_1/attendance")).toThrow(
      /GET \/events\/evt_1\/attendance returned .* where an attendance summary/,
    );
  });
});

describe("getAttendance", () => {
  it("reads the summary and names the endpoint when the body is wrong", async () => {
    request.mockResolvedValue({ status: 200, data: { guests: {} } });

    await expect(getAttendance("evt_1")).rejects.toThrow(
      /GET \/events\/evt_1\/attendance/,
    );
  });
});

describe("startReconfirmation", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockResolvedValue({ status: 200, data: LIVE_START });
  });

  it("POSTs the DTO with the app's own defaults", async () => {
    const result = await startReconfirmation("evt_1");

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/events/evt_1/reconfirmation/start",
        data: { includeMaybe: false, notifyByEmail: false },
      }),
    );
    expect(result).toEqual(LIVE_START);
  });

  it("passes includeMaybe and notifyByEmail through", async () => {
    await startReconfirmation("evt_1", {
      includeMaybe: true,
      notifyByEmail: true,
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { includeMaybe: true, notifyByEmail: true },
      }),
    );
  });
});
