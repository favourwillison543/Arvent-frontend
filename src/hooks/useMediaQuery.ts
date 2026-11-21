"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query from JavaScript.
 *
 * Reserved for the few places where "which breakpoint am I on?" has to change
 * the *tree* and not only its classes — mount one variant or the other, not
 * hide both. Layout should stay in CSS: a `lg:` class is resolved by the
 * browser before paint, while this hook resolves one render later.
 *
 * ```tsx
 * const isWide = useMediaQuery("(min-width: 64rem)", true);
 * ```
 *
 * `serverValue` is what the server (and the hydration render) reports. Pass the
 * value the server's HTML already contains, or hydration will mismatch.
 */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);

      list.addEventListener("change", onStoreChange);

      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
