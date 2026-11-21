import { afterEach, describe, expect, it, vi } from "vitest";

import { asArray, asPage, pageItems } from "./list";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("asPage", () => {
  it("reads an empty page", () => {
    expect(asPage({ items: [], nextCursor: null }, "GET /events")).toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("reads the items and the cursor of a populated page", () => {
    const page = asPage<{ id: string }>(
      { items: [{ id: "a" }, { id: "b" }], nextCursor: "cursor-2" },
      "GET /events",
    );

    expect(page.items).toHaveLength(2);
    expect(page.items[1].id).toBe("b");
    expect(page.nextCursor).toBe("cursor-2");
  });

  it("treats a missing cursor as the last page", () => {
    expect(asPage({ items: [1] }, "GET /events").nextCursor).toBeNull();
  });

  it("treats a non-string cursor as the last page instead of failing the list", () => {
    expect(asPage({ items: [1], nextCursor: 0 }, "GET /events").nextCursor).toBeNull();
  });

  it("takes extra envelope keys in its stride", () => {
    // A page may grow (`total`, `hasMore`) without breaking the reader.
    const page = asPage({ items: [1], nextCursor: null, total: 1 }, "GET /events");

    expect(page.items).toEqual([1]);
  });

  it("throws on a bare array instead of reporting an empty list", () => {
    // The exact bug this replaced: `Array.isArray(value) ? value : []` made an
    // unwrapped envelope look like "no events".
    expect(() => asPage([{ id: "a" }], "GET /public/events")).toThrow(
      /GET \/public\/events returned a bare array of 1 item\(s\)/,
    );
  });

  it("names the endpoint and the keys it actually received", () => {
    expect(() => asPage({ photos: [] }, "GET /events/evt_1/memories")).toThrow(
      /an object with keys \[photos\]/,
    );
  });

  it("rejects an envelope whose items are not an array", () => {
    expect(() => asPage({ items: "nope" }, "GET /events")).toThrow(
      /an object with keys \[items\]/,
    );
  });

  it("rejects a string body, which is what a wrong base URL returns", () => {
    expect(() => asPage("<!doctype html><html></html>", "GET /events")).toThrow(
      /returned a string where an \{ items: \[\], nextCursor \} envelope/,
    );
  });

  it("rejects null and undefined", () => {
    expect(() => asPage(null, "GET /events")).toThrow(/returned null/);
    expect(() => asPage(undefined, "GET /events")).toThrow(/returned undefined/);
  });

  it("logs and returns an empty page in production, so a guest keeps the screen", () => {
    vi.stubEnv("NODE_ENV", "production");
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(asPage([{ id: "a" }], "GET /public/events")).toEqual({
      items: [],
      nextCursor: null,
    });
    expect(logged).toHaveBeenCalledTimes(1);
    expect(String(logged.mock.calls[0][0])).toMatch(/GET \/public\/events/);
  });
});

describe("pageItems", () => {
  it("returns the items of a page", () => {
    expect(pageItems({ items: [1, 2], nextCursor: null }, "GET /moments")).toEqual([1, 2]);
  });

  it("still refuses to invent an empty list in development", () => {
    expect(() => pageItems([], "GET /moments")).toThrow(Error);
  });
});

describe("asArray", () => {
  it("passes a bare array through", () => {
    expect(asArray([1, 2], "GET /events/evt_1/gate-list")).toEqual([1, 2]);
  });

  it("rejects an envelope where an array was expected", () => {
    expect(() => asArray({ items: [] }, "GET /events/evt_1/gate-list")).toThrow(
      /an object with keys \[items\] where an array was expected/,
    );
  });
});
