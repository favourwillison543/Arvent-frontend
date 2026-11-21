"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

/**
 * The landing page is for visitors, not for people who already have an account.
 *
 * A signed-in host who opens the marketing page (a bookmark from before they
 * joined, the back button, a typo) is sent to `/home` where their events are.
 * It renders nothing: the landing page is server-rendered marketing copy and
 * keeps its markup, so search engines still read it and a signed-out visitor
 * still gets the page from the first byte.
 */
export function SignedInRedirect({ to = "/home" }: { to?: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(to);
  }, [isAuthenticated, isLoading, router, to]);

  return null;
}
