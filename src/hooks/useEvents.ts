"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  createEvent,
  deleteEvent,
  duplicateEvent,
  getEvents,
  publishEvent,
  readEventId,
} from "@/lib/api/events";
import type { CreateEventInput, Event } from "@/lib/types/event";

export const eventKeys = {
  all: ["events"] as const,
  detail: (id: string) => ["event", id] as const,
  // Starts with "events", so invalidating `all` also refreshes discover
  discover: ["events", "discover"] as const,
};

/**
 * Cache a write's event *only* when the body really is one.
 *
 * None of the write paths document a response, and publishing is a status
 * change: a `204` reaches here as `""` and a `{ message }` has no `id`. Both
 * used to be filed under the key `["event", undefined]`, and the hook's caller
 * then read `.id` off them and reported "no id" for an event that existed.
 */
function cacheEvent(queryClient: QueryClient, body: unknown) {
  const id = readEventId(body);

  if (id) queryClient.setQueryData<Event>(eventKeys.detail(id), body as Event);
}

/* ---------- Single-purpose hooks: each mutation is written once ---------- */

export function useCreateEvent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: (event) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
      cacheEvent(queryClient, event);
    },
  });

  return { createEvent: mutation.mutateAsync, isCreating: mutation.isPending };
}

export function usePublishEvent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => publishEvent(id),
    onSuccess: (event) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
      cacheEvent(queryClient, event);
    },
  });

  return {
    publishEvent: mutation.mutateAsync,
    isPublishing: mutation.isPending,
  };
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => duplicateEvent(id),
    onSuccess: (event) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
      cacheEvent(queryClient, event);
    },
  });

  return {
    duplicateEvent: mutation.mutateAsync,
    isDuplicating: mutation.isPending,
  };
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });

  return {
    deleteEvent: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}

/* ---------- List hook: the query, plus the hooks above re-exposed ---------- */

export function useEvents() {
  const eventsQuery = useQuery({
    queryKey: eventKeys.all,
    queryFn: getEvents,
  });

  const { createEvent, isCreating } = useCreateEvent();
  const { publishEvent, isPublishing } = usePublishEvent();
  const { duplicateEvent, isDuplicating } = useDuplicateEvent();
  const { deleteEvent, isDeleting } = useDeleteEvent();

  return {
    // `getEvents` already unwrapped the envelope and rejected anything else, so
    // the cache holds a real page here.
    events: eventsQuery.data?.items ?? [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,

    createEvent,
    deleteEvent,
    publishEvent,
    duplicateEvent,

    isCreating,
    isDeleting,
    isPublishing,
    isDuplicating,
  };
}