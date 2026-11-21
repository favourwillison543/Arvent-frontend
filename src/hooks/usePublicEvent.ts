"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPublicEvent,
  getPublicEventUpdates,
} from "@/lib/api/public";

export function usePublicEvent(slug: string) {
  const eventQuery = useQuery({
    queryKey: ["public-event", slug],
    queryFn: () => getPublicEvent(slug),
    enabled: !!slug,
  });

  const updatesQuery = useQuery({
    queryKey: ["public-event-updates", slug],
    queryFn: () => getPublicEventUpdates(slug),
    enabled: !!slug,
  });

  return {
    event: eventQuery.data,
    updates: updatesQuery.data?.items ?? [],
    isLoading: eventQuery.isLoading,
    isLoadingUpdates: updatesQuery.isLoading,
    error: eventQuery.error,
  };
}