"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  publishEvent,
  readEventId,
} from "@/lib/api/events";
import { uploadEventImage } from "@/lib/api/uploads";
import { ApiError } from "@/lib/http/errors";
import type { EventDraft } from "@/components/create-event/draft";
import type { CreateEventInput, Event } from "@/lib/types/event";
import { eventKeys, usePublishEvent } from "@/hooks/useEvents";

/**
 * The wizard's draft → `CreateEventInput` (PRD §4.1).
 *
 * The draft speaks the UI's words (`title`, `eventType`, `venue`, `address`);
 * the API speaks the contract's (`name`, `type`, `venueName`, `location`). This
 * function is the only translation, and it sends **nothing the DTO does not
 * have** — the whitelist rejects unknown keys with a 400.
 *
 * `startTime` becomes `programStartTime` as typed (`HH:mm`); the date stays a
 * calendar string, exactly as the contract wants it. `endTime` is draft-only
 * (PRD §16) and is not sent.
 */
export function toCreateEventInput(
  draft: EventDraft,
  imageUrl?: string,
): CreateEventInput {
  const venueName = draft.venue.trim();
  const address = draft.address.trim();

  return {
    name: draft.title.trim(),
    type: draft.eventType,
    ...(draft.description.trim() ? { description: draft.description.trim() } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    date: draft.date,
    programStartTime: draft.startTime || "18:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    venueName,
    // `location` is required and is the street address; when the host only gave
    // a venue name, that name is the location rather than an empty string.
    location: address || venueName,
    visibility: draft.visibility,
    rsvpAccess: draft.requireApproval ? "request" : "open",
    ...(draft.capacity ? { capacity: Number(draft.capacity) } : {}),
    maxAdditionalGuests: draft.plusOnes,
    showGuestCount: draft.showGuestList,
    eventColors: eventColors(draft),
    ...memorySettings(draft),
  };
}

/**
 * The invitation's visual configuration, stored verbatim in `eventColors`
 * (PRD §5). Keys the contract names are always sent; `background` and
 * `themeImage` only when the draft actually has them.
 */
function eventColors(draft: EventDraft): Record<string, string> {
  const colors: Record<string, string> = {
    themeId: draft.themeId,
    posterId: draft.posterId,
    fontId: draft.fontId,
    effectId: draft.effectId,
    rsvpStyleId: draft.rsvpStyleId,
    rsvpMode: draft.rsvpMode,
    rsvpGoing: draft.rsvpGoing,
    rsvpMaybe: draft.rsvpMaybe,
    rsvpNo: draft.rsvpNo,
  };

  if (draft.background) colors.background = draft.background;
  if (draft.themeImage) colors.themeImage = draft.themeImage;

  return colors;
}

/** Only the memory settings the host actually chose — omitted means "API default". */
function memorySettings(draft: EventDraft): Partial<CreateEventInput> {
  return {
    ...(draft.memoriesEnabled === undefined
      ? {}
      : { memoriesEnabled: draft.memoriesEnabled }),
    ...(draft.memoriesAccess === undefined
      ? {}
      : { memoriesAccess: draft.memoriesAccess }),
    ...(draft.memoriesStorageLimitBytes === undefined
      ? {}
      : { memoriesStorageLimitBytes: draft.memoriesStorageLimitBytes }),
    ...(draft.memoriesPhotoLimit === undefined
      ? {}
      : { memoriesPhotoLimit: draft.memoriesPhotoLimit }),
    ...(draft.memoriesPhotosPerGuest === undefined
      ? {}
      : { memoriesPhotosPerGuest: draft.memoriesPhotosPerGuest }),
  };
}

/**
 * The `imageUrl` the event takes, from whatever the draft holds.
 *
 * - An existing **http(s) URL** (editing an event) is already the right value.
 * - A browser **`data:` URL** is uploaded first and replaced by the returned URL.
 * - Anything else (no image) sends nothing at all.
 *
 * A missing poster is decoration; a data URL the API rejects is a 400.
 */
export async function resolveImageUrl(image: string) {
  if (/^https?:\/\//i.test(image)) return image;
  if (!image.startsWith("data:")) return undefined;

  const blob = await (await fetch(image)).blob();
  const file = new File([blob], "event-poster", {
    type: blob.type || "image/png",
  });
  const uploaded = await uploadEventImage(file);

  return uploaded.imageUrl || undefined;
}

/**
 * The published event, without trusting the publish body.
 *
 * `PATCH /events/{id}/publish` documents no response body, so it may answer the
 * updated event, a `{ message }`, or `204` (which axios hands back as `""`).
 * Only an object can be merged, an `{ event }` wrapper is unwrapped, and the id
 * from the create call always wins — it is the id the organiser is about to be
 * routed to.
 */
function withPublished(base: Event, body: unknown): Event {
  const record =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;

  if (!record) return base;

  const wrapped = record.event;
  const patch =
    wrapped && typeof wrapped === "object"
      ? (wrapped as Partial<Event>)
      : (record as Partial<Event>);

  return { ...base, ...patch, id: base.id };
}

export function useCreateDraftEvent() {
  const queryClient = useQueryClient();
  const { publishEvent: publish, isPublishing } = usePublishEvent();

  const createMutation = useMutation({
    mutationFn: async (draft: EventDraft) => {
      const imageUrl = await resolveImageUrl(draft.image);
      const created = await createEvent(toCreateEventInput(draft, imageUrl));
      const id = readEventId(created);

      if (!id) {
        throw new ApiError({
          message:
            "The API accepted the event but its answer carried no id, so there " +
            "is nothing to open. Check your events before trying again: if the " +
            "event is listed, it was created and only this answer was " +
            "unreadable.",
          status: 502,
          code: "NO_EVENT_ID",
        });
      }

      let published: unknown;

      try {
        // Created as a draft, published as a second call (PRD §4.3).
        published = await publishEvent(id);
      } catch (cause) {
        console.error("[createAndPublish] Publish failed after create", cause);
      }

      const event = withPublished({ ...created, id }, published);
      queryClient.setQueryData(eventKeys.detail(id), event);
      return event;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });

  return {
    createAndPublish: createMutation.mutateAsync,
    publish,
    isCreating: createMutation.isPending,
    isPublishing,
  };
}

