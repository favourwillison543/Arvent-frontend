"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPublicMoment,
  getMoments,
  getPublicMoment,
  type GetMomentsParams,
} from "@/lib/api/moments";
import { uploadMomentImage } from "@/lib/api/uploads";
import { ApiError } from "@/lib/http/errors";
import type { CreateMomentInput } from "@/lib/types/moment";
import { demoMoment } from "@/components/moments/data";


export const momentKeys = {
  all: ["moments"] as const,
  wall: (params?: GetMomentsParams) => ["moments", "wall", params ?? {}] as const,
  detail: (id: string) => ["moment", id] as const,
};

/** The shared wall: public Moments, optionally narrowed to one kind. */
export function useMoments(params?: GetMomentsParams) {
  const query = useQuery({
    queryKey: momentKeys.wall(params),
    queryFn: () => getMoments(params),
  });

  return {
    // The wall renders the page's items; `getMoments` refused anything that was
    // not an envelope, so a broken body shows its error state instead of a
    // silently empty wall.
    moments: query.data?.items ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMoment(id: string) {
  const query = useQuery({
    queryKey: momentKeys.detail(id),
    queryFn: () => getPublicMoment(id),
    enabled: !!id && id !== "demo",
    retry: false,
  });

  return {
    moment: id === "demo" ? demoMoment : query.data ?? null,
    loading: id !== "demo" && query.isLoading,
    missing: id !== "demo" && query.isError,
  };
}

/**
 * The `photo` the contract accepts, from whatever the editor holds.
 *
 * `CreateMomentDto.photo` is an `http(s)` URL or `""`; a browser `data:` URL is
 * rejected outright (verified: `photo must be an http(s) image URL or ""`). So a
 * picked file is uploaded first - `POST /uploads/moment-image`, which is
 * signed-in only - and the answer's `imageUrl` is what gets stored.
 *
 * An anonymous creator who picked a photo gets a sentence they can act on
 * instead of a 400 in class-validator's voice.
 */
export async function resolveMomentPhoto(photo: string) {
  if (!photo.startsWith("data:")) return photo;

  const blob = await (await fetch(photo)).blob();
  const file = new File([blob], "moment-image", {
    type: blob.type || "image/png",
  });

  try {
    const uploaded = await uploadMomentImage(file);
    return uploaded.imageUrl || "";
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 401) {
      throw new ApiError({
        message:
          "That image needs a signed-in account. Sign in and press Done again, " +
          "or remove the image to post the card without one.",
        status: 401,
        code: "MOMENT_PHOTO_NEEDS_SESSION",
      });
    }

    throw cause;
  }
}

export function useCreateMoment() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (input: CreateMomentInput) =>
      createPublicMoment({
        ...input,
        photo: await resolveMomentPhoto(input.photo),
      }),
    onSuccess: (moment) => {
      queryClient.setQueryData(momentKeys.detail(moment.id), moment);
      void queryClient.invalidateQueries({ queryKey: momentKeys.all });
    },
  });

  return {
    createMoment: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
