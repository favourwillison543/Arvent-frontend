"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useAppearance } from "@/components/theme/AppearanceProvider";
import { useAuth } from "@/hooks/useAuth";

const SEEN_KEY = "arvent:theme-hint-seen";

/** Wait long enough for the page to settle, short enough to still be noticed. */
const DELAY = 2000;

/**
 * The one-time nudge that the workspace has a dark theme.
 *
 * It waits two seconds so it never competes with the screen the organizer is
 * opening, it only speaks to organizers who are signed in and still on the light
 * theme — the place it points at, Settings, is behind a session — and the flag in
 * `localStorage` means it is said once per device and never again.
 */
export default function ThemeHint() {
  const { resolved, setAppearance } = useAppearance();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated || resolved === "dark") return;

    try {
      if (window.localStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Storage can be blocked; staying quiet beats nagging on every visit.
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Same as above: the hint is a nicety, not a requirement.
      }

      toast("There's a dark theme", {
        description: "Switch whenever you like in Settings → Appearance.",
        action: {
          label: "Try it",
          onClick: () => setAppearance("dark"),
        },
        duration: 9000,
      });
    }, DELAY);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, resolved, setAppearance]);

  return null;
}
