"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMemory, getMemories, getPublicMemories, updateMemorySettings, uploadPublicMemory } from "@/lib/api/memories";
import { ApiError } from "@/lib/http/errors";
import type { GetMemoriesParams, MemorySettings, UploadMemoryInput } from "@/lib/types/memory";

export const memoryKeys = {
  public: (slug: string) => ["public-memories", slug] as const,
  event: (eventId: string) => ["memories", eventId] as const,
};

export function usePublicMemories(slug: string, params?: GetMemoriesParams) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [...memoryKeys.public(slug), params] as const,
    queryFn: () => getPublicMemories(slug, params),
    enabled: Boolean(slug),
    // A 403 means "verify as a guest first" (`MEMORIES_ACCESS_DENIED`): the
    // answer will not change by asking again.
    retry: (attempt, error) =>
      !(error instanceof ApiError && error.status === 403) && attempt < 2,
  });
  const uploadMutation = useMutation({
    mutationFn: ({
      input,
      onProgress,
    }: {
      input: UploadMemoryInput;
      onProgress?: (percent: number) => void;
    }) => uploadPublicMemory(slug, input, onProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memoryKeys.public(slug) }),
  });
  return {
    gallery: query.data,
    isLoading: query.isLoading,
    error: query.error,
    /** `onProgress` receives the percentage of this one file already sent. */
    uploadMemory: (input: UploadMemoryInput, onProgress?: (percent: number) => void) =>
      uploadMutation.mutateAsync({ input, onProgress }),
    isUploading: uploadMutation.isPending,
  };
}

export function useEventMemories(eventId: string, params?: GetMemoriesParams) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [...memoryKeys.event(eventId), params] as const,
    queryFn: () => getMemories(eventId, params),
    enabled: Boolean(eventId),
  });
  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => deleteMemory(eventId, photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memoryKeys.event(eventId) }),
  });
  const settingsMutation = useMutation({
    mutationFn: (settings: Pick<MemorySettings, "enabled" | "access">) =>
      // The API's names carry the `memories` prefix.
      updateMemorySettings(eventId, {
        memoriesEnabled: settings.enabled,
        memoriesAccess: settings.access,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.event(eventId) });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
  return {
    gallery: query.data,
    isLoading: query.isLoading,
    error: query.error,
    deleteMemory: deleteMutation.mutateAsync,
    updateSettings: settingsMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdatingSettings: settingsMutation.isPending,
  };
}
