"use client";

import { useCallback, useMemo } from "react";

import { useEvent as useApiEvent } from "@/hooks/useEvent";
import { useGateList } from "@/hooks/useGateList";
import { useGuests } from "@/hooks/useGuests";
import { defaultDraft, type EventDraft } from "@/components/create-event/draft";
import { eventToDraft } from "@/components/create-event/eventToDraft";
import type { Event } from "@/lib/types/event";
import type { Guest as ApiGuest } from "@/lib/types/guest";
import { describeError } from "@/lib/http/errorMessage";

/**
 * The dashboard renders a *display projection* of the API models: RSVPs read as
 * `declined` / `pending` instead of `not_going` / `pending_approval`, and the
 * event carries the `EventDraft` that drives the theme shell.
 *
 * Reads come from the projection; every write goes through the mutators
 * returned by `useEventDashboard` (one API call per user intent). There is no
 * whole-object patch any more, so changing one guest can never rewrite the
 * event or replay unrelated mutations.
 */
export type DashboardRsvp = "going" | "maybe" | "declined" | "pending";
export type DashboardReconfirm = "none" | "asked" | "confirmed" | "cannot";

export type DashboardGuest = {
  id: string;
  name: string;
  phone: string;
  rsvp: DashboardRsvp;
  plusOnes: number;
  checkedIn: number;
  checkedInAt?: string;
  reconfirm: DashboardReconfirm;
  respondedAt?: string;
};

export type DashboardEvent = {
  id: string;
  slug: string;
  createdAt: string;
  draft: EventDraft;
  guests: DashboardGuest[];
  memoryContributionsEnabled?: boolean;
};

function toRsvp(status: ApiGuest["rsvpStatus"]): DashboardRsvp {
  if (status === "going") return "going";
  if (status === "maybe") return "maybe";
  if (status === "not_going") return "declined";
  return "pending";
}

function toApiRsvp(status: DashboardRsvp): ApiGuest["rsvpStatus"] {
  if (status === "going") return "going";
  if (status === "maybe") return "maybe";
  if (status === "declined") return "not_going";
  return "pending_approval";
}

function toReconfirm(
  status: ApiGuest["reconfirmationStatus"],
): DashboardReconfirm {
  if (status === "asked") return "asked";
  if (status === "confirmed") return "confirmed";
  if (status === "changed") return "cannot";
  return "none";
}

function toDashboardGuest(guest: ApiGuest): DashboardGuest {
  return {
    id: guest.id,
    name: guest.name,
    phone: guest.phone ?? "",
    rsvp: toRsvp(guest.rsvpStatus),
    plusOnes: guest.additionalGuestCount,
    checkedIn: guest.checkedInSeats ?? guest.checkedInCount ?? 0,
    checkedInAt: guest.checkedInAt ?? undefined,
    reconfirm: toReconfirm(guest.reconfirmationStatus),
    respondedAt: guest.updatedAt,
  };
}

function toDashboardEvent(
  event: Event,
  guests: ApiGuest[],
): DashboardEvent {
  const draft: EventDraft = {
    ...eventToDraft(event),
    host: "You",
    memoriesEnabled: event.memoriesEnabled ?? true,
    memoriesAccess: event.memoriesAccess ?? "invitees",
    memoriesStorageLimitBytes:
      event.memoriesStorageLimitBytes ?? defaultDraft.memoriesStorageLimitBytes,
    memoriesPhotoLimit:
      event.memoriesPhotoLimit ?? defaultDraft.memoriesPhotoLimit,
    memoriesPhotosPerGuest:
      event.memoriesPhotosPerGuest ?? defaultDraft.memoriesPhotosPerGuest,
  };

  return {
    id: event.id,
    slug: event.slug,
    createdAt: event.createdAt,
    draft,
    guests: guests.map(toDashboardGuest),
    memoryContributionsEnabled: event.memoriesEnabled ?? true,
  };
}


/** Fields the dashboard may change on an existing guest. */
export type GuestPatch = {
  name?: string;
  phone?: string;
  rsvp?: DashboardRsvp;
  plusOnes?: number;
};

export type NewGuest = {
  name: string;
  phone?: string;
  plusOnes?: number;
};

/**
 * One event, its guests and the door list, with a mutator per user intent.
 *
 * Reads are derived from the API queries, so every screen re-renders from a
 * single source of truth once a mutation invalidates its cache.
 */
export function useEventDashboard(id: string) {
  const eventQuery = useApiEvent(id);
  const guestQuery = useGuests(id);
  const gate = useGateList(id);

  const event = useMemo(
    () =>
      eventQuery.event
        ? toDashboardEvent(eventQuery.event, guestQuery.guests)
        : null,
    [eventQuery.event, guestQuery.guests],
  );

  const { updateGuest: updateGuestCall, addGuest: addGuestCall } = guestQuery;
  const { deleteGuest: deleteGuestCall } = guestQuery;
  const { checkIn: checkInCall, addWalkIn: addWalkInCall } = gate;

  // Only the event itself is fatal: a guest read that fails must never hide an
  // event the host can otherwise open. The panels render with what they have
  // and the failure is reported inline instead. The door list read is not
  // needed on these screens, so it is retried here but never reported.
  const eventError = eventQuery.error;

  const notes = useMemo(() => {
    if (!guestQuery.error) return [];

    return [
      describeError(guestQuery.error, "We couldn't load the guest list."),
    ];
  }, [guestQuery.error]);

  /** Re-runs every read; used by the error screens and the inline notices. */
  const retry = useCallback(() => {
    void eventQuery.refetch();
    void guestQuery.refetch();
    void gate.refetch();
  }, [eventQuery, guestQuery, gate]);

  const updateGuest = useCallback(
    (guestId: string, patch: GuestPatch) => {
      const data: Parameters<typeof updateGuestCall>[0]["data"] = {};

      if (patch.name !== undefined) data.name = patch.name;
      if (patch.phone !== undefined) data.phone = patch.phone;
      if (patch.rsvp !== undefined) data.rsvpStatus = toApiRsvp(patch.rsvp);
      if (patch.plusOnes !== undefined) {
        data.additionalGuestCount = patch.plusOnes;
      }

      if (Object.keys(data).length === 0) return;

      void updateGuestCall({ guestId, data });
    },
    [updateGuestCall],
  );

  const addGuest = useCallback(
    ({ name, phone, plusOnes = 0 }: NewGuest) => {
      void addGuestCall({
        name,
        phone: phone || undefined,
        additionalGuestCount: plusOnes,
      });
    },
    [addGuestCall],
  );

  const deleteGuest = useCallback(
    (guestId: string) => {
      void deleteGuestCall(guestId);
    },
    [deleteGuestCall],
  );

  /** Checks a guest's whole party in (never less than one seat). */
  const checkIn = useCallback(
    (guestId: string, seats = 1) => {
      void checkInCall({
        guestId,
        data: { seats: Math.max(1, seats) },
      });
    },
    [checkInCall],
  );

  const addWalkIn = useCallback(
    ({ name, phone, seats = 1 }: NewGuest & { seats?: number }) => {
      void addWalkInCall({
        name,
        phone: phone || undefined,
        seats: Math.max(1, seats),
      });
    },
    [addWalkInCall],
  );

  return {
    event,
    loading: eventQuery.isLoading,
    missing: !eventQuery.isLoading && !eventQuery.event && !eventQuery.error,
    error: eventError,
    /** A sentence the host can act on, instead of a status code. */
    errorMessage: eventError
      ? describeError(
          eventError,
          "We couldn't load this event. Check your connection and try again.",
        )
      : undefined,
    /** Non-fatal read failures (guests, door list) for the inline notice bar. */
    notes,
    retry,
    updateGuest,
    addGuest,
    deleteGuest,
    checkIn,
    addWalkIn,
  };
}
