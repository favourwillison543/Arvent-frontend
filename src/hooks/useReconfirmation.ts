"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAttendance, startReconfirmation } from "@/lib/api/reconfirmation";
import { describeError } from "@/lib/http/errorMessage";
import type { StartReconfirmationInput } from "@/lib/types/reconfirmation";

/**
 * The attendance summary and the one write the panel makes.
 *
 * Starting a round touches three reads: the summary itself (`round`,
 * `not_asked`), every guest's `reconfirmationStatus`, and the door list's
 * expected totals. All three are invalidated on success, so the host sees the
 * result of the tap wherever it is shown.
 */
export function useReconfirmation(eventId: string) {
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ["attendance", eventId],
    queryFn: () => getAttendance(eventId),
    enabled: !!eventId,
  });

  const startMutation = useMutation({
    mutationFn: (input?: StartReconfirmationInput) =>
      startReconfirmation(eventId, input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["attendance", eventId],
      });
      void queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
      void queryClient.invalidateQueries({ queryKey: ["gate-list", eventId] });
    },
  });

  return {
    // `getAttendance` guarded the summary itself, so the panel can trust it.
    attendance: attendanceQuery.data,
    isLoading: attendanceQuery.isLoading,
    error: attendanceQuery.error,
    /** Ready-to-show sentence, so the panel never prints a status code. */
    errorMessage: attendanceQuery.error
      ? describeError(
          attendanceQuery.error,
          "We couldn't load reconfirmation. Please try again.",
        )
      : undefined,

    startReconfirmation: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    refetch: attendanceQuery.refetch,
  };
}
