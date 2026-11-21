"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicEvents } from "@/lib/api/public";
import { eventKeys } from "@/hooks/useEvents";
import { isBrowsable } from "@/lib/utils/visibility";

// Kept so any existing imports of publicEventKeys still work.
// It now points at the shared key, which starts with "events".
export const publicEventKeys = { all: eventKeys.discover };

export function useDiscoverEvents() {
  return useQuery({
    queryKey: eventKeys.discover,
    queryFn: getPublicEvents,
    // The public list is not trusted to have filtered anything: this one answer
    // feeds Discover *and* the invitation's "Similar events" strip, so the browse
    // rule is applied here once instead of being re-implemented per screen.
    // `getPublicEvents` has already unwrapped `{ items, nextCursor }`; this only
    // decides what is browsable.
    select: (page) => page.items.filter(isBrowsable),
  });
}