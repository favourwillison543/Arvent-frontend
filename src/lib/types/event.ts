/**
 * The event, in the vocabulary of **PRD v2.2** — the contract the deployed API
 * serves (`GET /docs-yaml`), and the one this app was built against.
 *
 * This file was temporarily rewritten on 17 Nov to match an older deployment
 * that spoke PRD v1.1 (`title`, `eventType`, `startAt`, `location`). That
 * deployment has been replaced; the API now validates the fields below, field
 * for field, and `PATCH /events/{id}/publish` exists again.
 *
 * The DTO whitelist *rejects* unknown keys instead of ignoring them, so a
 * near-miss is a 400 rather than a silently dropped field: this file is the
 * single place the names are allowed to live.
 */

export type EventStatus = "draft" | "published" | "cancelled";

/** The eight exact values of PRD §3.3. No `owambe`, no `house_party`. */
export type EventType =
  | "birthday"
  | "party"
  | "wedding"
  | "ceremony"
  | "dinner"
  | "conference"
  | "meetup"
  | "other";

export type EventVisibility = "public" | "private";

export type RsvpAccess = "open" | "request" | "managed";

export type MemoriesAccess = "invitees" | "public";

/**
 * `CreateEventInput` (PRD §4.1), which is also the body of `CreateEventDto`.
 *
 * Required: `name`, `type`, `date`, `programStartTime`, `venueName`,
 * `location`, `visibility`, `rsvpAccess`. Everything else is optional and may
 * be omitted — but not sent as `null` unless the contract says nullable.
 */
export type CreateEventInput = {
  /** 1–140 characters. */
  name: string;
  type: EventType;
  /** ≤5000 characters. */
  description?: string;
  /** The `imageUrl` returned by `POST /uploads/event-image`. Never a data URL. */
  imageUrl?: string | null;
  /** `YYYY-MM-DD`, stored exactly as sent. */
  date: string;
  /** `HH:mm`, e.g. `17:30`. */
  doorsOpenTime?: string | null;
  /** `HH:mm`, e.g. `18:00`. */
  programStartTime: string;
  /** IANA name, e.g. `Africa/Lagos`. */
  timezone?: string;
  /** Venue or short place name. 1–200 characters. */
  venueName: string;
  /** Street address / directions. 1–500 characters. */
  location: string;
  landmark?: string | null;
  mapsUrl?: string | null;
  visibility: EventVisibility;
  rsvpAccess: RsvpAccess;
  /** Total seats including additional guests. Omit for unlimited. */
  capacity?: number | null;
  /** How many "plus ones" each guest may bring. 0–20. */
  maxAdditionalGuests?: number;
  waitlistEnabled?: boolean;
  dressCode?: string | null;
  /**
   * Invitation design, stored verbatim (`themeId`, `posterId`, `fontId`,
   * `effectId`, `rsvpStyleId`, `rsvpMode`, `rsvpGoing`, `rsvpMaybe`, `rsvpNo`,
   * `background`, `themeImage`, …). Unknown keys are kept.
   */
  eventColors?: Record<string, string> | null;
  memoriesEnabled?: boolean;
  memoriesAccess?: MemoriesAccess;
  memoriesStorageLimitBytes?: number;
  memoriesPhotoLimit?: number;
  memoriesPhotosPerGuest?: 1 | 2;
  /** Extension: ISO instant at which RSVPs close. */
  rsvpDeadline?: string | null;
  /** Extension: show "N going" on the public page. */
  showGuestCount?: boolean;
};

/**
 * `UpdateEventDto` (PRD §4.2): `Partial<CreateEventInput>`. Omitted fields are
 * left unchanged; `null` is only allowed on the nullable ones.
 */
export type UpdateEventInput = Partial<CreateEventInput> & {
  /** Extension: allow setting `capacity` below the seats already confirmed. */
  confirmOverCapacity?: boolean;
};

/** `PATCH /events/{id}/cancel`, the extension next to `/publish`. */
export type CancelEventInput = {
  /** Shown to visitors. */
  reason?: string | null;
};

/** The `Event` response type, field for field (PRD §3.3). */
export type Event = {
  id: string;
  organizerId: string;
  status: EventStatus;
  name: string;
  type: EventType;
  description: string;
  imageUrl: string | null;
  date: string;
  doorsOpenTime: string | null;
  programStartTime: string;
  timezone: string;
  venueName: string;
  location: string;
  landmark: string | null;
  mapsUrl: string | null;
  visibility: EventVisibility;
  rsvpAccess: RsvpAccess;
  capacity: number | null;
  maxAdditionalGuests: number;
  waitlistEnabled: boolean;
  dressCode: string | null;
  eventColors: Record<string, string> | null;
  memoriesEnabled?: boolean;
  memoriesAccess?: MemoriesAccess;
  memoriesStorageLimitBytes?: number;
  memoriesPhotoLimit?: number;
  memoriesPhotosPerGuest?: 1 | 2;
  /** Extensions documented by the API (present once set). */
  rsvpDeadline?: string | null;
  showGuestCount?: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
};
