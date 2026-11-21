export type MemoryAccess = "invitees" | "public";

/** A photo, exactly as the API answers it (`MemoryPhotoResponse`). */
export type MemoryPhoto = {
  id: string;
  eventId: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: string;
};

/**
 * The gallery's settings, as the API names them.
 *
 * The deployed DTO prefixes every field (`memoriesEnabled`, `memoriesAccess` …);
 * a bare `enabled` is a 400 `property enabled should not exist`. Verified
 * against the live service on 19 Nov.
 */
export type MemorySettings = {
  enabled: boolean;
  access: MemoryAccess;
  storageLimitBytes: number;
  photoLimit: number;
  photosPerGuest: 1 | 2;
  /** Who may upload: every guest going, or only those already checked in. */
  uploadAccess: "going_guests" | "checked_in_guests";
  updatedAt: string;
};

/** Storage accounting, read from the event on every request. */
export type MemoryUsage = {
  quotaBytes: number;
  usedBytes: number;
  reservedBytes: number;
  remainingBytes: number;
  photoCount: number;
  photoLimit: number;
  isFull: boolean;
};

/** `GET /events/{eventId}/memories` — the host's view. */
export type EventMemoryGallery = {
  settings: MemorySettings;
  usage: MemoryUsage;
  items: MemoryPhoto[];
  nextCursor: string | null;
};

/**
 * `GET /public/events/{slug}/memories` — the guest's view. It deliberately
 * reveals less: a count, whether the gallery is open, and whether *this*
 * visitor may add to it.
 */
export type PublicMemoryGallery = {
  photoCount: number;
  memoriesEnabled: boolean;
  canUpload: boolean;
  storageFull: boolean;
  items: MemoryPhoto[];
  nextCursor: string | null;
};

/**
 * The one shape the two gallery screens read.
 *
 * The API's two answers carry different fields; `lib/api/memories.ts` maps both
 * onto this view so a page never has to know which endpoint fed it.
 */
export type MemoryGallery = {
  photos: MemoryPhoto[];
  total: number;
  contributorCount: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  photoLimit: number;
  photosPerGuest: 1 | 2;
  enabled: boolean;
  access: MemoryAccess;
  /** The API's own answer to "may this visitor add a photo?". */
  canUpload: boolean;
  storageFull: boolean;
  nextCursor: string | null;
};

export type UploadMemoryInput = {
  file: File;
  uploaderName: string;
};

export type GetMemoriesParams = { cursor?: string; limit?: number };

