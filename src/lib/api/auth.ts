import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";
import { API_SAME_ORIGIN } from "@/lib/config/api";
import { COOKIE_TRANSPORT } from "@/lib/http/transport";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "@/lib/types/auth";

/*
 * Both of these *start* a session, so both must ask for the cookie transport.
 * Without the header the API answers in its default mode — a token in the body,
 * no `Set-Cookie` — and the login looks successful while the next `/auth/me`
 * arrives with no session at all.
 */

export function register(data: RegisterInput) {
  return http.post<AuthResponse>(endpoints.auth.register, data, {
    headers: COOKIE_TRANSPORT,
  });
}

export function login(data: LoginInput) {
  return http.post<AuthResponse>(endpoints.auth.login, data, {
    headers: COOKIE_TRANSPORT,
  });
}

export function logout() {
  // Addressed as `/auth/logout`: the session the logout has to revoke is named
  // by the refresh cookie, and that cookie is `Path=/auth` — under `/backend` it
  // is not sent, so the server would have nothing to revoke.
  return http.post<void>(endpoints.auth.logout, undefined, {
    baseURL: API_SAME_ORIGIN,
  });
}

export function getCurrentUser() {
  return http.get<AuthResponse>(endpoints.auth.currentUser);
}
