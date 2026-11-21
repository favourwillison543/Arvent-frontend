"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUpdate, deleteUpdate, getUpdates, updateUpdate } from "@/lib/api/updates";
import type {
  CreateEventUpdateInput,
  UpdateEventUpdateInput,
} from "@/lib/types/update";

export const eventUpdateKeys = {
  forEvent: (eventId: string) => ["event-updates", eventId] as const,
};

export function useEventUpdates(eventId: string) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: eventUpdateKeys.forEvent(eventId),
    queryFn: () => getUpdates(eventId),
  });
  const refresh = () => client.invalidateQueries({ queryKey: eventUpdateKeys.forEvent(eventId) });
  const create = useMutation({
    mutationFn: (data: CreateEventUpdateInput) => createUpdate(eventId, data),
    onSuccess: refresh,
  });
  const edit = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateEventUpdateInput) =>
      updateUpdate(eventId, id, data),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: (id: string) => deleteUpdate(eventId, id), onSuccess: refresh });
  return {
    updates: query.data?.items ?? [], isLoading: query.isLoading, error: query.error,
    refetch: query.refetch,
    createUpdate: create.mutateAsync, updateUpdate: edit.mutateAsync, deleteUpdate: remove.mutate,
    isCreating: create.isPending, isUpdating: edit.isPending, isDeleting: remove.isPending,
  };
}
