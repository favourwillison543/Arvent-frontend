import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseSetCookie, verifySession } from "@/lib/auth/session";

/**
 * The shapes below mirror what the live API actually answered on 17 Nov 2026:
 * `/auth/me` rejects an expired access cookie with a 401 that carries **no**
 * `Set-Cookie`, while `/auth/refresh` rotates the pair in `Set-Cookie` headers.
 * The bug this file guards against is the old session check treating that 401
 * as "signed out" and bouncing a returning organizer to the login form while
 * their refresh token was still perfectly good.
 */

const API = "https://api.test";
const COOKIE = "access_token=old; refresh_token=keep";

function reply(status: number, cookies: string[] = []) {
  return new Response(status === 204 ? null : JSON.stringify({ status }), {
    status,
    headers: cookies.map(
      (cookie) => ["set-cookie", cookie] as [string, string],
    ),
  });
}

function stubFetch(...replies: Response[]) {
  const fetchMock = vi.fn<typeof fetch>();

  for (const response of replies) fetchMock.mockResolvedValueOnce(response);

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv("API_URL", API);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("verifySession", () => {
  it("believes the API, not the presence of a cookie", async () => {
    const fetchMock = stubFetch(reply(200));

    await expect(verifySession(COOKIE)).resolves.toEqual({
      verdict: "authenticated",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API}/auth/me`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ cookie: COOKIE }),
      }),
    );
  });

  it("renews an expired access cookie and hands the new pair back", async () => {
    const fetchMock = stubFetch(
      reply(401),
      reply(200, [
        "access_token=new; Path=/; HttpOnly; SameSite=Lax; Max-Age=2700",
        "refresh_token=rotated; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600",
      ]),
    );

    const check = await verifySession(COOKIE);

    expect(check.verdict).toBe("authenticated");
    expect(check.setCookies).toHaveLength(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${API}/auth/refresh`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("expires both cookies only when the API rejects the pair", async () => {
    stubFetch(reply(401), reply(401));

    await expect(verifySession(COOKIE)).resolves.toEqual({
      verdict: "unauthenticated",
      clearCookies: ["access_token", "refresh_token"],
    });
  });

  it("retries a server fault before giving up", async () => {
    const fetchMock = stubFetch(reply(502), reply(200));

    await expect(verifySession(COOKIE)).resolves.toEqual({
      verdict: "authenticated",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never claims the session ended when the API is down", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(reply(503), reply(503));

    const check = await verifySession(COOKIE);

    expect(check.verdict).toBe("unreachable");
    expect(check.clearCookies).toBeUndefined();
  });

  it("treats an unreachable refresh as a blip, not a sign-out", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(reply(401), reply(503));

    const check = await verifySession(COOKIE);

    expect(check.verdict).toBe("unreachable");
    expect(check.clearCookies).toBeUndefined();
  });

  it("does not call the API without a cookie", async () => {
    const fetchMock = stubFetch();

    await expect(verifySession(null)).resolves.toEqual({
      verdict: "unauthenticated",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("parseSetCookie", () => {
  it("keeps the attributes that make a session cookie a session cookie", () => {
    expect(
      parseSetCookie(
        "access_token=abc.def; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2700",
      ),
    ).toEqual({
      name: "access_token",
      value: "abc.def",
      options: {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 2700,
      },
    });
  });

  it("reads an absolute Expires", () => {
    const cookie = parseSetCookie(
      "refresh_token=x; Expires=Wed, 09 Jun 2027 10:18:14 GMT; Path=/",
    );

    expect(cookie?.options.expires?.toISOString()).toBe("2027-06-09T10:18:14.000Z");
  });

  it("ignores lines that are not cookies", () => {
    expect(parseSetCookie("nope")).toBeNull();
    expect(parseSetCookie("=value; Path=/")).toBeNull();
    expect(parseSetCookie("")).toBeNull();
  });
});
