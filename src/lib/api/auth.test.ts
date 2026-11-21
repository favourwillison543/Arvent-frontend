import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The API serves a session two ways and takes the *default* unless a request
 * asks otherwise — and the default is "token in the JSON body, no
 * `Set-Cookie`". That default is indistinguishable from a successful login
 * until the next `/auth/me` arrives with no session, and it is invisible to the
 * route proxy that guards `/settings` and `/events`. It cost an afternoon once:
 * the login answered 200, the body carried an `accessToken`, and nothing was
 * ever stored, because the request never said which transport it wanted.
 *
 * So the header is pinned here. It is one string, in one module, and these two
 * calls are the only place it can go missing without a type error.
 */
const { request } = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("axios", () => {
  const axiosMock = Object.assign(request, { isAxiosError: () => false });

  return { default: axiosMock, isAxiosError: axiosMock.isAxiosError };
});

import { login, register } from "@/lib/api/auth";

const COOKIE_TRANSPORT_HEADERS = expect.objectContaining({
  "X-Auth-Transport": "cookie",
});

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue({ status: 200, data: { user: { id: "u1" } } });
});

describe("session-starting calls", () => {
  it("asks for a cookie when logging in", async () => {
    await login({ email: "organiser@example.com", password: "a-long-password" });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/auth/login",
        headers: COOKIE_TRANSPORT_HEADERS,
      }),
    );
  });

  it("asks for a cookie when registering", async () => {
    await register({
      name: "Ada Obi",
      email: "ada@example.com",
      phoneNumber: "+2348031234567",
      password: "a-long-password",
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/auth/register",
        headers: COOKIE_TRANSPORT_HEADERS,
      }),
    );
  });

  it("hands the body back unchanged — no token is read or kept here", async () => {
    // A token may still arrive (the API serves bearer clients too), and it is
    // the session only for callers without a cookie jar. Nothing in this app
    // may start depending on it.
    await expect(
      login({ email: "organiser@example.com", password: "a-long-password" }),
    ).resolves.toEqual({ user: { id: "u1" } });
  });
});
