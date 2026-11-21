"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGateAccess, deleteGateAccess, getGateAccess } from "@/lib/api/gate";

export const gateAccessKeys = { forEvent: (eventId: string) => ["gate-access", eventId] as const };

export function useGateAccess(eventId: string) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: gateAccessKeys.forEvent(eventId), queryFn: () => getGateAccess(eventId) });
  const refresh = () => client.invalidateQueries({ queryKey: gateAccessKeys.forEvent(eventId) });
  const create = useMutation({
    // A door link may check people in and register walk-ins. Overriding
    // capacity is the organiser's call, so it is not granted by default.
    //
    // `expiresAt` is sent explicitly: the API caps any expiry at 30 days from
    // now, so its "one day after the event" default **fails with a 400** for an
    // event further out than that. A link minted now is valid for 29 days; for
    // an event beyond that, mint a fresh one nearer the date.
    mutationFn: (label: string) =>
      createGateAccess(eventId, {
        label: label.trim() || "Gate",
        permissions: ["check_in", "walk_in"],
        expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    onSuccess: refresh,
  });
  const revoke = useMutation({ mutationFn: (id: string) => deleteGateAccess(eventId, id), onSuccess: refresh });
  return {
    accesses: query.data?.items ?? [], isLoading: query.isLoading, error: query.error,
    // `mutateAsync` on both writes: the caller waits for the answer, so a
    // confirmation dialog can stay open on a failure instead of guessing.
    createAccess: create.mutateAsync, revokeAccess: revoke.mutateAsync,
    isCreating: create.isPending, createError: create.error,
    isRevoking: revoke.isPending, revokeError: revoke.error,
  };
}
