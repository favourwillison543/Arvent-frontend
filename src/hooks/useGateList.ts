"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addWalkIn,
  checkInGuest,
  getGateList,
} from "@/lib/api/gate";
import type {
  CheckInInput,
  WalkInInput,
} from "@/lib/types/gate";
import { describeError } from "@/lib/http/errorMessage";

/**
 * The door list and the two things a door person does to it.
 *
 * Identity is the httpOnly gate cookie set by `POST /gate/session`; the
 * organiser's own session works on the same calls. Nothing here sends a token
 * header — the contract has none.
 *
 * Check-ins and walk-ins carry an `Idempotency-Key`, generated per intent, so a
 * retried tap on a bad mobile connection never counts anybody twice.
 */
export function useGateList(
  eventId: string,
  search?: string,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const enabled = !!eventId && (options?.enabled ?? true);

  const gateListQuery = useQuery({
    queryKey: ["gate-list", eventId, search],
    // One page, as big as the endpoint allows: the door has to see the whole
    // list, and the API's default page is 20 — a 150-guest event would have
    // shown a seventh of its guests with no hint that there were more.
    queryFn: () => getGateList(eventId, { search, limit: 100 }),
    enabled,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["gate-list", eventId] });
    void queryClient.invalidateQueries({ queryKey: ["attendance", eventId] });
    void queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
  };

  const checkInMutation = useMutation({
    mutationFn: ({
      guestId,
      data,
    }: {
      guestId: string;
      data: CheckInInput;
    }) => checkInGuest(eventId, guestId, data, crypto.randomUUID()),

    onSuccess: refresh,
  });

  const walkInMutation = useMutation({
    mutationFn: (data: WalkInInput) =>
      addWalkIn(eventId, data, crypto.randomUUID()),

    onSuccess: refresh,
  });

  return {
    // `getGateList` guarded the `guests` array itself, so the door screen can
    // trust this one.
    guests: gateListQuery.data?.guests ?? [],
    event: gateListQuery.data?.event,
    attendance: gateListQuery.data?.attendance,
    isLoading: gateListQuery.isLoading,
    error: gateListQuery.error,
    /** Ready-to-show sentence for the door screen. */
    errorMessage: gateListQuery.error
      ? describeError(
          gateListQuery.error,
          "We couldn't load the door list. Pull to refresh.",
        )
      : undefined,

    checkIn: checkInMutation.mutateAsync,
    addWalkIn: walkInMutation.mutateAsync,
    refetch: gateListQuery.refetch,

    isCheckingIn: checkInMutation.isPending,
    isAddingWalkIn: walkInMutation.isPending,
  };
}
