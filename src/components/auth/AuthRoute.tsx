"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { safeReturnTo } from "@/lib/utils/returnTo";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

import { useAuthDialog } from "./AuthDialog";

/**
 * `/login` and `/register` are addresses, not pages.
 *
 * Signing in is the dialog every "Log in" button opens, so these routes carry no
 * form of their own — they open that same card and nothing else. They stay
 * because they are still linked to: `proxy.ts` sends a refused visitor to
 * `/login?returnTo=…` and `OrganizerGate` sends them to `/register?returnTo=…`.
 *
 * Closing the card means "not now": the page behind it has nothing on it but a
 * spinner, so it goes home rather than leaving a dead address. Signing in is not
 * a close — `AuthForm` sends the visitor to `returnTo`, which is the workspace
 * when the address was opened cold.
 */
export function AuthRoute({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { openAuth, isOpen } = useAuthDialog();
  const { isAuthenticated } = useAuth();
  const params = useSearchParams();
  const returnTo = params.get("returnTo");

  const opened = useRef(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (opened.current) return;

    opened.current = true;
    // Always a destination: a cold `/login` has no `returnTo`, and refreshing an
    // address whose only content is a spinner would look like a failed log-in.
    openAuth({ mode, returnTo: safeReturnTo(returnTo) });
  }, [mode, openAuth, returnTo]);

  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      return;
    }

    if (wasOpen.current && !isAuthenticated) router.replace("/");
  }, [isOpen, isAuthenticated, router]);

  return <LoadingScreen className="organizer-workspace" />;
}
