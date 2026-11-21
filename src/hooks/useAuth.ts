"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/http/errors";
import { setSessionPresent } from "@/lib/auth/sessionEvents";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "@/lib/types/auth";

/** One key for the session: the query, the seed and the wipe all use it. */
const AUTH_KEY = ["auth", "me"] as const;

/**
 * The body of `/auth/login` is `{ user }` and the body of `/auth/register` is
 * `{ user, message }`; neither is the session. The session is the httpOnly cookie
 * pair set alongside them, which this bundle never sees — so the login body can
 * only predict it. `GET /auth/me` states it, and a browser that kept no cookie
 * fails it.
 *
 * Only a 401 is a verdict on the session. An unreachable API must not turn a
 * successful sign-in into an error message.
 *
 * A 200 with no cookie behind it is the third case, and deserves its own
 * sentence: the password was right, an account exists, and the browser stored
 * nothing.
 */
async function assertSessionSurvived() {
  try {
    await getCurrentUser();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) return;

    throw new ApiError({
      // Worth the words: this failure looks exactly like a wrong password to
      // the person typing it, and nothing is wrong with their password.
      message:
        "Your details were accepted, but the session cookie didn't stick. " +
        "Allow cookies for this site and try again. If this is Safari on an " +
        "iPhone, cross-site cookies are blocked there until the app and the " +
        "API share one domain.",
      status: 401,
      code: "SESSION_NOT_STORED",
    });
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  // `/auth/me` is the session: the http client has already tried a refresh
  // before this 401 reaches here, so a second attempt would only repeat it.
  const currentUser = useQuery({
    queryKey: AUTH_KEY,
    queryFn: getCurrentUser,
    retry: false,
  });

  /*
   * Tell the http client whether there is a session to lose. A 401 from a visitor
   * who was never signed in is the probe answering "no", not an expiry, and must
   * not raise the log-in dialog; a 401 from someone who was signed in is exactly
   * the case that should. Module state, because the client is not a component.
   */
  useEffect(() => {
    if (currentUser.isLoading) return;

    setSessionPresent(!!currentUser.data?.user);
  }, [currentUser.isLoading, currentUser.data]);

  /**
   * A new session replaces the old one entirely. Everything cached under a
   * non-auth key was fetched as the previous visitor — an organizer who just
   * signed in would otherwise keep the anonymous copies of every public page
   * they browsed, and a second account would see the first one's events.
   */
  const adoptSession = (session: AuthResponse) => {
    setSessionPresent(true);
    queryClient.setQueryData<AuthResponse>(AUTH_KEY, session);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "auth",
    });
  };

  /**
   * The cookie is the session, so it is confirmed before the form navigates: a
   * login the browser did not keep would otherwise land on the dashboard and
   * fail every call behind it, which looks exactly like a button that does
   * nothing. Registration deliberately skips this — it is followed by a log in,
   * not by a session (see `AuthForm`).
   */
  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const session = await login(data);
      await assertSessionSurvived();
      return session;
    },
    onSuccess: adoptSession,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onSuccess: adoptSession,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } catch (error) {
        // The client already refreshed and retried once, so a 401 here means
        // the session really was gone. There is nothing left to revoke, and
        // the httpOnly cookies are not JavaScript's to clear — the proxy
        // expires the rejected pair on the next protected navigation.
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
      queryClient.setQueryData<AuthResponse | null>(AUTH_KEY, null);
      setSessionPresent(false);
    },
  });

  return {
    user: currentUser.data?.user ?? null,
    isLoading: currentUser.isLoading,
    isAuthenticated: !!currentUser.data?.user,
    error: currentUser.error,

    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
