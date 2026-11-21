import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Guest, GuestRsvpStatus } from "@/lib/types/guest";
import { asPage } from "@/lib/utils/list";


export type GetGuestsParams = {
  rsvpStatus?: string;
  reconfirmationStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
};

/**
 * `CreateGuestDto` / `UpdateGuestDto` (v2.2). `name` is the only required field.
 *
 * Seats are granted two ways and the API accepts both: `additionalGuestCount`
 * (how many companions this guest is bringing) and `seatLimit` (the ceiling
 * this person may bring; `null` = the event's `maxAdditionalGuests`).
 */
export type AddGuestInput = {
  /** 1–120 characters. */
  name: string;
  email?: string | null;
  phone?: string | null;
  rsvpStatus?: GuestRsvpStatus | null;
  /** 0–50. */
  additionalGuestCount?: number;
  /** 0–50; `null` = the event's `maxAdditionalGuests`. */
  seatLimit?: number | null;
  /** ≤1000 characters. Private organiser note. */
  note?: string | null;
  /** Admit past `capacity` on purpose. */
  overrideCapacity?: boolean;
};

/** `UpdateGuestDto`: the same keys, all optional. */
export type UpdateOrganizerGuestInput = Partial<AddGuestInput>;

export async function getGuests(
  eventId: string,
  params?: GetGuestsParams,
) {
  const searchParams = new URLSearchParams();

  if (params?.rsvpStatus) {
    searchParams.set("rsvpStatus", params.rsvpStatus);
  }

  if (params?.reconfirmationStatus) {
    searchParams.set(
      "reconfirmationStatus",
      params.reconfirmationStatus,
    );
  }

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();

  const path = `${endpoints.events.guests(eventId)}${query ? `?${query}` : ""}`;

  // Cursor-paginated: `{ items, nextCursor }`. An empty guest list and an
  // unread envelope must not look the same to the organiser.
  return asPage<Guest>(await http.get<unknown>(path), `GET ${path}`);
}

export function addGuest(
  eventId: string,
  data: AddGuestInput,
) {
  return http.post<Guest>(endpoints.events.guests(eventId), data);
}

export function updateGuest(
  eventId: string,
  guestId: string,
  data: UpdateOrganizerGuestInput,
) {
  return http.patch<Guest>(
    endpoints.events.guest(eventId, guestId),
    data,
  );
}

export function deleteGuest(
  eventId: string,
  guestId: string,
) {
  return http.delete<void>(
    endpoints.events.guest(eventId, guestId),
  );
}

export function regenerateGuestToken(
  eventId: string,
  guestId: string,
) {
  return http.post<{ guestToken: string; manageUrl: string }>(
    endpoints.events.regenerateGuestToken(eventId, guestId),
  );
}
