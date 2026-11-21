import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import { endpoints } from "@/lib/api/endpoints";
import { refreshSession } from "@/lib/auth/refresh";
import { notifySessionExpired } from "@/lib/auth/sessionEvents";
import { API_PROXY_PATH } from "@/lib/config/api";
import { ApiError, SESSION_ERROR_CODES } from "@/lib/http/errors";
import { toApiError } from "@/lib/http/problem";

/**
 * Same-origin on purpose: `next.config.ts` rewrites `/backend/*` to the API, so
 * the session cookie is first-party and this bundle never learns the API's host.
 * A full URL here is what breaks auth in production, not CORS.
 */
const API_URL = API_PROXY_PATH;

type RequestOptions = AxiosRequestConfig & {
  /** `agp_…` guest pass token. Memory only — never persist it. */
  token?: string;
};

/** A document, not a payload: the first tag of an HTML answer. */
const HTML_START = /^\s*<(!doctype|html|head|body)/i;

/**
 * A 200 that is not JSON did not come from the API: it is a web app listening
 * where the API should be, a proxy's login page, or a CDN error page. Handing
 * that string back as `T` pushed the failure into a component (`items.map is not
 * a function`), so a misconfigured `API_URL` read as a bug in the page. It fails
 * here instead, with a message that names the real problem.
 */
function assertJson<T>(data: T, endpoint: string): T {
  if (typeof data === "string" && HTML_START.test(data)) {
    throw new ApiError({
      message:
        `The API answered ${endpoint} with a web page instead of data. ` +
        "The /backend rewrite is pointing at a web app, not at the API: check " +
        "API_URL in .env.",
      status: 200,
      code: "NOT_A_PAYLOAD",
    });
  }

  return data;
}

/** Endpoints whose 401 *is* the answer: a refresh cannot improve them. */
const SESSION_ENDPOINTS = new Set<string>([
  endpoints.auth.login,
  endpoints.auth.register,
  endpoints.auth.refresh,
]);

function problemCode(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;

  const code = (data as { code?: unknown }).code;

  return typeof code === "string" ? code : undefined;
}

/**
 * Is this the access cookie having expired? The access token lives 45 minutes,
 * so this is the ordinary case, not an exceptional one — the session can be
 * renewed by `refreshSession()` and the request replayed. A 401 against a guest
 * pass has no session behind it, and login/register/refresh are themselves the
 * session, so neither is retried.
 */
function isExpiredSession(
  response: { status: number; data?: unknown } | undefined,
  endpoint: string,
  hasGuestToken: boolean,
) {
  if (!response || response.status !== 401) return false;
  if (hasGuestToken || SESSION_ENDPOINTS.has(endpoint)) return false;

  const code = problemCode(response.data);

  // No problem document (an HTML gateway page, an empty body) is not a verdict
  // on the credential either, so it is worth one refresh attempt too.
  return !code || SESSION_ERROR_CODES.has(code);
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retried = false,
): Promise<T> {
  const { token, headers, ...axiosOptions } = options;

  try {
    const response: AxiosResponse<T> = await axios({
      baseURL: API_URL,
      url: endpoint,
      // Same-origin, so the cookie is sent anyway; explicit so that moving the
      // base path can never silently drop credentials.
      withCredentials: true,
      ...axiosOptions,
      headers: {
        ...headers,
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    return assertJson(response.data, endpoint);
  } catch (error) {
    // Every failure is one RFC 7807 document (or the absence of a response).
    // Mapping happens once, in `problem.ts`, so that a screen which says
    // "describeError(error)" gets the API's own sentence.
    if (axios.isAxiosError(error)) {
      // The API rejected the request before touching any state, so replaying it
      // after a refresh is safe even for a POST — and it is the difference
      // between "session restored" and "signed out mid-edit".
      if (
        !retried &&
        isExpiredSession(error.response, endpoint, Boolean(token))
      ) {
        if (await refreshSession()) return request<T>(endpoint, options, true);

        // Both cookies are gone. The request fails with the API's own words,
        // and the app is told once so it can ask for a log in where the person
        // actually is — mid-form, mid-create — instead of at a page load later.
        notifySessionExpired();
      }

      throw toApiError(error, endpoint);
    }

    throw error;
  }
}

export const http = {
  get<T>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      data: body,
    });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      data: body,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};
