import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `refreshSession` is the client's half of session restore. The access cookie
 * lives 45 minutes, so a tab left open produces a burst of 401s at once; the
 * whole point of this module is that the burst costs **one** rotation. Two
 * concurrent rotations would spend the same refresh token twice, and the loser
 * would rotate the winner's token out from under it.
 */
const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("axios", () => ({ default: { post } }));

import { refreshSession } from "@/lib/auth/refresh";

beforeEach(() => {
  post.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("refreshSession", () => {
  it("shares one rotation between simultaneous callers", async () => {
    let settle: ((response: { status: number }) => void) | undefined;

    post.mockReturnValue(
      new Promise<{ status: number }>((resolve) => {
        settle = resolve;
      }),
    );
    vi.stubGlobal("window", {});

    const first = refreshSession();
    const second = refreshSession();

    expect(post).toHaveBeenCalledTimes(1);

    settle?.({ status: 200 });

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
  });

  it("posts to /auth/refresh — the path the refresh cookie is scoped to", async () => {
    post.mockResolvedValue({ status: 200 });
    vi.stubGlobal("window", {});

    await expect(refreshSession()).resolves.toBe(true);

    /*
     * Not `/backend/auth/refresh`. The API scopes the refresh cookie to
     * `Path=/auth`, and a browser only sends a cookie on a path that starts with
     * its own `Path` — so under the `/backend` prefix the cookie never left the
     * browser and every renewal was a 401 (reproduced: same cookie jar,
     * `/backend/auth/refresh` → 401 INVALID_REFRESH_TOKEN, `/auth/refresh` → 200).
     */
    expect(post).toHaveBeenCalledWith(
      "/auth/refresh",
      undefined,
      expect.objectContaining({
        baseURL: "/",
        withCredentials: true,
        headers: expect.objectContaining({ "X-Auth-Transport": "cookie" }),
      }),
    );
  });

  it("reports a dead refresh token as `false` instead of throwing", async () => {
    post.mockRejectedValue(new Error("401"));
    vi.stubGlobal("window", {});

    await expect(refreshSession()).resolves.toBe(false);
  });

  it("tries again after a failed attempt", async () => {
    post.mockRejectedValueOnce(new Error("503"));
    post.mockResolvedValueOnce({ status: 200 });
    vi.stubGlobal("window", {});

    await expect(refreshSession()).resolves.toBe(false);
    await expect(refreshSession()).resolves.toBe(true);

    expect(post).toHaveBeenCalledTimes(2);
  });

  it("does nothing on the server, where the cookies are not", async () => {
    await expect(refreshSession()).resolves.toBe(false);

    expect(post).not.toHaveBeenCalled();
  });
});
