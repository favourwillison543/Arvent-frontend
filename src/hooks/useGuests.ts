"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addGuest,
  deleteGuest,
  getGuests,
  regenerateGuestToken,
  updateGuest,
} from "@/lib/api/guests";
import type { AddGuestInput, GetGuestsParams } from "@/lib/api/guests";
import { describeError } from "@/lib/http/errorMessage";

export function useGuests(
  eventId: string,
  params?: GetGuestsParams,
) {
  const queryClient = useQueryClient();

  const guestsQuery = useQuery({
    queryKey: ["guests", eventId, params],
    queryFn: () => getGuests(eventId, params),
    enabled: !!eventId,
  });

  const addMutation = useMutation({
    mutationFn: (data: AddGuestInput) =>
      addGuest(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["guests", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance", eventId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      guestId,
      data,
    }: {
      guestId: string;
      data: Parameters<typeof updateGuest>[2];
    }) => updateGuest(eventId, guestId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["guests", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance", eventId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (guestId: string) =>
      deleteGuest(eventId, guestId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["guests", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance", eventId],
      });
    },
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: (guestId: string) =>
      regenerateGuestToken(eventId, guestId),
  });

  return {
    guests: guestsQuery.data?.items ?? [],
    isLoading: guestsQuery.isLoading,
    error: guestsQuery.error,
    /** Ready-to-show sentence for the guest tables. */
    errorMessage: guestsQuery.error
      ? describeError(guestsQuery.error, "We couldn't load the guest list.")
      : undefined,

    addGuest: addMutation.mutateAsync,
    updateGuest: updateMutation.mutateAsync,
    deleteGuest: deleteMutation.mutateAsync,
    regenerateGuestToken: regenerateTokenMutation.mutateAsync,
    refetch: guestsQuery.refetch,

    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRegeneratingToken: regenerateTokenMutation.isPending,
  };
}