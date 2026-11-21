import { endpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/http/client";
import type {
  EventMemoryGallery,
  GetMemoriesParams,
  MemoryAccess,
  MemoryGallery,
  MemoryPhoto,
  MemorySettings,
  PublicMemoryGallery,
  UploadMemoryInput,
} from "@/lib/types/memory";
import { asPage } from "@/lib/utils/list";

function queryString(params?: GetMemoriesParams) {
  const search = new URLSearchParams();
  if (params?.cursor) search.set("cursor", params.cursor);
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : "";
}

/** A number the API may send as a string (Postgres `bigint`). */
function toNumber(value: unknown, fallback = 0) {
  const number = typeof value === "string" ? Number(value) : value;

  return typeof number === "number" && Number.isFinite(number) ? number : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

/** The contributors the page can count without another request. */
function countContributors(photos: MemoryPhoto[]) {
  return new Set(photos.map((photo) => photo.uploadedBy).filter(Boolean)).size;
}

/**
 * The settings half of the answer, translated from the wire names
 * (`memoriesEnabled`, `memoriesAccess`, `memoriesStorageLimitBytes`,
 * `memoriesPhotoLimit`, `memoriesPhotosPerGuest`) into the words the UI uses.
 *
 * This is the only place the prefix lives, so a screen never has to know it.
 */
function toSettings(value: unknown): MemorySettings {
  const settings = record(value);

  return {
    enabled: settings.memoriesEnabled !== false,
    access: settings.memoriesAccess === "public" ? "public" : "invitees",
    storageLimitBytes: toNumber(settings.memoriesStorageLimitBytes),
    photoLimit: toNumber(settings.memoriesPhotoLimit),
    photosPerGuest: settings.memoriesPhotosPerGuest === 1 ? 1 : 2,
    uploadAccess:
      settings.uploadAccess === "checked_in_guests"
        ? "checked_in_guests"
        : "going_guests",
    updatedAt:
      typeof settings.updatedAt === "string" ? settings.updatedAt : "",
  };
}

/**
 * `GET /events/{eventId}/memories` — verified shape:
 *
 *   { settings: { memoriesEnabled, memoriesAccess, memoriesStorageLimitBytes,
 *                 memoriesPhotoLimit, memoriesPhotosPerGuest, uploadAccess,
 *                 updatedAt },
 *     usage: { quotaBytes, usedBytes, reservedBytes, remainingBytes,
 *              photoCount, photoLimit, isFull },
 *     items: [...], nextCursor }
 *
 * The previous version expected `{ photos, total, storageLimitBytes,
 * settings: { enabled } }`, which made `gallery.photos.map` throw and the screen
 * say "Memories could not be loaded".
 */
export async function getMemories(
  eventId: string,
  params?: GetMemoriesParams,
): Promise<MemoryGallery> {
  const path = `${endpoints.events.memories(eventId)}${queryString(params)}`;
  const body = await http.get<unknown>(path);
  const page = asPage<MemoryPhoto>(body, `GET ${path}`);
  const gallery = record(body) as Partial<EventMemoryGallery>;
  const usage = record(gallery.usage);
  const settings = toSettings(gallery.settings);

  return {
    photos: page.items,
    total: toNumber(usage.photoCount, page.items.length),
    contributorCount: countContributors(page.items),
    storageUsedBytes: toNumber(usage.usedBytes),
    storageLimitBytes: settings.storageLimitBytes,
    photoLimit: settings.photoLimit,
    photosPerGuest: settings.photosPerGuest,
    enabled: settings.enabled,
    access: settings.access,
    // The host's own gallery is theirs to contribute to whenever it is open.
    canUpload: settings.enabled,
    storageFull: usage.isFull === true,
    nextCursor: page.nextCursor,
  };
}

/**
 * `GET /public/events/{slug}/memories` — verified shape:
 *
 *   { photoCount, memoriesEnabled, canUpload, storageFull, items, nextCursor }
 *
 * `canUpload` is the API's own verdict for this visitor (it needs a guest
 * session and an RSVP), so the page must not derive it from `memoriesEnabled`.
 */
export async function getPublicMemories(
  slug: string,
  params?: GetMemoriesParams,
): Promise<MemoryGallery> {
  const path = `${endpoints.public.memories(slug)}${queryString(params)}`;
  const body = await http.get<unknown>(path);
  const page = asPage<MemoryPhoto>(body, `GET ${path}`);
  const gallery = record(body) as Partial<PublicMemoryGallery>;
  const used = page.items.reduce((sum, photo) => sum + toNumber(photo.sizeBytes), 0);

  return {
    photos: page.items,
    total: toNumber(gallery.photoCount, page.items.length),
    contributorCount: countContributors(page.items),
    storageUsedBytes: used,
    // The public answer carries no quota or per-guest limits: the page hides the
    // storage bar and lets the API refuse a photo that does not fit.
    storageLimitBytes: 0,
    photoLimit: 0,
    // The public answer carries no per-guest limit; 2 is the event default, and
    // the API is the authority on a third upload either way.
    photosPerGuest: 2,
    enabled: gallery.memoriesEnabled !== false,
    access: "public",
    canUpload: gallery.canUpload === true,
    storageFull: gallery.storageFull === true,
    nextCursor: page.nextCursor,
  };
}

/**
 * `POST /public/events/{slug}/memories` — multipart, so the browser reports the
 * bytes it has actually sent. A 20 MB photo over a phone connection takes long
 * enough that the gallery needs that number instead of a spinner.
 *
 * `event.total` is the browser's own measurement of the multipart body; when it
 * cannot measure (no `Content-Length`), the file's size is the next best answer.
 */
export function uploadPublicMemory(
  slug: string,
  input: UploadMemoryInput,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData();
  body.set("photo", input.file);
  body.set("uploaderName", input.uploaderName);
  return http.post<MemoryPhoto>(endpoints.public.memories(slug), body, {
    onUploadProgress: (event) => {
      if (!onProgress) return;
      const total = event.total || input.file.size;
      if (!total) return;
      onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
    },
  });
}

export function deleteMemory(eventId: string, photoId: string) {
  return http.delete<void>(endpoints.events.memory(eventId, photoId));
}

/**
 * `UpdateMemoriesSettingsDto` — note the `memories` prefix: the API's own names,
 * which the whitelist enforces (a bare `enabled` is a 400, verified live).
 */
export type UpdateMemoriesSettingsInput = {
  memoriesEnabled: boolean;
  memoriesAccess?: MemoryAccess;
  memoriesStorageLimitBytes?: number;
  memoriesPhotoLimit?: number;
  memoriesPhotosPerGuest?: 1 | 2;
  /** Extension: which guests may upload. */
  uploadAccess?: "going_guests" | "checked_in_guests";
};

/** The answer is `{ settings, usage }`; the screen only renders settings. */
export async function updateMemorySettings(
  eventId: string,
  settings: UpdateMemoriesSettingsInput,
) {
  const body = await http.patch<unknown>(endpoints.events.memorySettings(eventId), settings);
  const answer = record(body);

  if (!isRecord(answer.settings)) {
    return null;
  }

  return toSettings(answer.settings);
}

