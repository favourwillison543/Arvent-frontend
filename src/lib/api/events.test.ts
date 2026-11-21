import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The id off a write's answer, or nothing.
 *
 * This exists because the create flow once read `.id` from the *publish* answer:
 * a `204` reaches axios as `""` and a `{ message }` has no id. Either one made a
 * created, published event look like a failure — and the only way out of that
 * screen is to create it again.
 */
const { request } = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("axios", () => {
  const axiosMock = Object.assign(request, { isAxiosError: () => false });

  return { default: axiosMock, isAxiosError: axiosMock.isAxiosError };
});

import { cancelEvent, publishEvent, readEventId } from "@/lib/api/events";

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue({ status: 200, data: {} });
});

describe("readEventId", () => {
  it("reads the id off the entity itself", () => {
    expect(readEventId({ id: "evt_1", name: "Ada's 30th" })).toBe("evt_1");
  });

  it("reads the id out of an `{ event }` wrapper", () => {
    expect(readEventId({ event: { id: "evt_2" } })).toBe("evt_2");
  });

  it.each([
    ["an empty 204 body", ""],
    ["no body", undefined],
    ["null", null],
    ["a message-only body", { message: "Event published." }],
    ["an empty object", {}],
    ["an empty id", { id: "" }],
    ["a non-string id", { id: 7 }],
    ["an array", [{ id: "evt_3" }]],
  ])("returns undefined for %s", (_label, body) => {
    expect(readEventId(body)).toBeUndefined();
  });
});

/**
 * Publishing is its own operation in PRD v2.2: `PATCH /events/{id}/publish`,
 * with **no body**. A `status` field on create, or on `PATCH /events/{id}`, is
 * the older contract and is rejected by the DTO whitelist.
 */
describe("publishEvent", () => {
  it("PATCHes the publish route with no body", async () => {
    await publishEvent("evt_1");

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        url: "/events/evt_1/publish",
        data: undefined,
      }),
    );
  });
});

describe("cancelEvent", () => {
  it("PATCHes the cancel route with the reason", async () => {
    await cancelEvent("evt_1", { reason: "Venue fell through" });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        url: "/events/evt_1/cancel",
        data: { reason: "Venue fell through" },
      }),
    );
  });
});
