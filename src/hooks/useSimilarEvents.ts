"use client";

import { useMemo } from "react";

import { useDiscoverEvents } from "@/hooks/useDiscoverEvents";

export type SimilarEvent = {
  id: string;
  slug: string;
  name: string;
  type: string;
  date: string;
  imageUrl: string | null;
  eventColors: Record<string, string> | null;
  venueName: string;
  location: string;
};

/**
 * Pick up to `limit` other events, preferring the same event type.
 *
 * Deterministic on purpose: the same pool always yields the same list, which
 * keeps the invitation page stable between renders and makes this testable.
 */
export function pickSimilar(
  pool: SimilarEvent[],
  type: string | undefined,
  excludeId: string | undefined,
  limit = 4,
): SimilarEvent[] {
  const others = pool.filter(
    (item) => item.id !== excludeId && Boolean(item.slug),
  );
  const sameType = others.filter((item) => item.type === type);
  const rest = others.filter((item) => item.type !== type);

  return [...sameType, ...rest].slice(0, limit);
}

/**
 * Public events for the invitation page's "Similar events" strip.
 * Backed by the same query/cache key as the discover page.
 */
export function useSimilarEvents(
  type: string | undefined,
  excludeId: string | undefined,
) {
  const { data, isLoading } = useDiscoverEvents();

  const pool = useMemo<SimilarEvent[]>(
    () =>
      (data ?? []).map((event) => ({
        id: event.id,
        slug: event.slug,
        name: event.name,
        type: event.type,
        date: event.date,
        imageUrl: event.imageUrl,
        eventColors: event.eventColors,
        venueName: event.venueName,
        location: event.location,
      })),
    [data],
  );

  const events = useMemo(
    () => pickSimilar(pool, type, excludeId),
    [pool, type, excludeId],
  );

  return { events, isLoading };
}
