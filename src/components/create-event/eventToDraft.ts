
import { defaultDraft, type EventDraft } from "./draft";
import type { Event as ApiEvent } from "@/lib/types/event";

export function eventToDraft(event: ApiEvent): EventDraft {
  const colors = event.eventColors;

  return {
    ...defaultDraft,
    title: event.name ?? "",
    eventType: event.type ?? defaultDraft.eventType,
    description: event.description ?? "",
    image: event.imageUrl ?? "",
    date: event.date ? String(event.date).slice(0, 10) : "",
    startTime: event.programStartTime
      ? String(event.programStartTime).slice(0, 5)
      : defaultDraft.startTime,
    venue: event.venueName ?? "",
    address: event.location ?? "",
    visibility: event.visibility ?? defaultDraft.visibility,
    requireApproval: event.rsvpAccess === "request",
    capacity: event.capacity != null ? String(event.capacity) : "",
    plusOnes: event.maxAdditionalGuests ?? defaultDraft.plusOnes,

    themeId: colors?.themeId ?? defaultDraft.themeId,
    posterId: colors?.posterId ?? defaultDraft.posterId,
    fontId: colors?.fontId ?? defaultDraft.fontId,
    effectId: colors?.effectId ?? defaultDraft.effectId,

    rsvpStyleId: colors?.rsvpStyleId ?? defaultDraft.rsvpStyleId,
    rsvpMode: colors?.rsvpMode === "emojis" ? "emojis" : "icons",
    rsvpGoing: colors?.rsvpGoing ?? defaultDraft.rsvpGoing,
    rsvpMaybe: colors?.rsvpMaybe ?? defaultDraft.rsvpMaybe,
    rsvpNo: colors?.rsvpNo ?? defaultDraft.rsvpNo,

    memoriesEnabled: event.memoriesEnabled ?? undefined,
    memoriesAccess: event.memoriesAccess ?? undefined,
    memoriesStorageLimitBytes:
      event.memoriesStorageLimitBytes != null
        ? Number(event.memoriesStorageLimitBytes)
        : undefined,
    memoriesPhotoLimit: event.memoriesPhotoLimit ?? undefined,
    memoriesPhotosPerGuest: event.memoriesPhotosPerGuest ?? undefined,

    background: colors?.background ?? undefined,
    themeImage: colors?.themeImage ?? undefined,
  };
}

export function draftToEventColors(
  draft: EventDraft,
): Record<string, string> {
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

  if (draft.background) {
    colors.background = draft.background;
  }

  if (draft.themeImage) {
    colors.themeImage = draft.themeImage;
  }

  return colors;
}
