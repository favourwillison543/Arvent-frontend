
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getEvent, updateEvent } from "@/lib/api/events";

import type { UpdateEventInput } from "@/lib/types/event";
import { describeError } from "@/lib/http/errorMessage";

import { eventKeys } from "@/hooks/useEvents";

export function useEvent(id: string) {
  const queryClient = useQueryClient();

  const eventQuery = useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEvent(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEventInput) =>
      updateEvent(id, data),

    onSuccess: (event) => {
      queryClient.setQueryData(
        eventKeys.detail(id),
        event
      );

      void queryClient.invalidateQueries({
        queryKey: eventKeys.all,
      });
    },
  });

  return {
    event: eventQuery.data,
    isLoading: eventQuery.isLoading,
    error: eventQuery.error,
    /** Ready-to-show sentence instead of a bare status code. */
    errorMessage: eventQuery.error
      ? describeError(eventQuery.error, "We couldn't load this event.")
      : undefined,
    refetch: eventQuery.refetch,
    updateEvent: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}