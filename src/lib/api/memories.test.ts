import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The two gallery shapes, read from the deployed API on 19 Nov.
 *
 * The previous client expected `{ photos, total, storageLimitBytes, settings:
 * { enabled, access } }` from both endpoints. The host's gallery actually
 * answers `{ settings, usage, items, nextCursor }` and the guest's answers
 * `{ photoCount, memoriesEnabled, canUpload, storageFull, items, nextCursor }`,
 * so `gallery.photos.map` threw and the screen said "Memories could not be
 * loaded". These tests pin the mapping that replaced it.
 */
const { get, patch, post } = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/http/client", () => ({
  http: { get, patch, post, delete: vi.fn() },
}));

import {
  getMemories,
  getPublicMemories,
  updateMemorySettings,
  uploadPublicMemory,
} from "@/lib/api/memories";

beforeEach(() => {
  get.mockReset();
  patch.mockReset();
  post.mockReset();
});

const photo = {
  id: "photo-1",
  eventId: "event-1",
  url: "https://cdn.example/photo-1.jpg",
  thumbnailUrl: "https://cdn.example/photo-1-thumb.jpg",
  fileName: "photo-1.jpg",
  sizeBytes: 2_048,
  uploadedBy: "Ada",
  createdAt: "2026-11-19T08:32:14.855Z",
};

describe("getMemories", () => {
  it("reads the host's { settings, usage, items } answer", async () => {
    get.mockResolvedValue({
      settings: {
        memoriesEnabled: true,
        memoriesAccess: "public",
        memoriesStorageLimitBytes: 524_288_000,
        memoriesPhotoLimit: 500,
        memoriesPhotosPerGuest: 2,
        uploadAccess: "going_guests",
        updatedAt: "2026-11-19T08:32:14.855Z",
      },
      usage: {
        quotaBytes: 524_288_000,
        usedBytes: 2_048,
        reservedBytes: 0,
        remainingBytes: 524_285_952,
        photoCount: 1,
        photoLimit: 500,
        isFull: false,
      },
      items: [photo],
      nextCursor: null,
    });

    const gallery = await getMemories("event-1");

    expect(gallery.photos).toHaveLength(1);
    expect(gallery.total).toBe(1);
    expect(gallery.contributorCount).toBe(1);
    expect(gallery.enabled).toBe(true);
    expect(gallery.access).toBe("public");
    expect(gallery.storageLimitBytes).toBe(524_288_000);
    expect(gallery.storageUsedBytes).toBe(2_048);
    expect(gallery.photoLimit).toBe(500);
    expect(gallery.photosPerGuest).toBe(2);
    expect(gallery.canUpload).toBe(true);
  });

  it("reads a bigint that arrived as a string", async () => {
    get.mockResolvedValue({
      settings: {
        memoriesEnabled: false,
        memoriesAccess: "invitees",
        memoriesStorageLimitBytes: "524288000",
        memoriesPhotoLimit: 20,
        memoriesPhotosPerGuest: 1,
      },
      usage: { usedBytes: "4096", photoCount: 2, isFull: true },
      items: [photo, { ...photo, id: "photo-2", uploadedBy: "Bola" }],
      nextCursor: "next",
    });

    const gallery = await getMemories("event-1");

    expect(gallery.storageLimitBytes).toBe(524_288_000);
    expect(gallery.storageUsedBytes).toBe(4_096);
    expect(gallery.photosPerGuest).toBe(1);
    expect(gallery.canUpload).toBe(false);
    expect(gallery.storageFull).toBe(true);
    expect(gallery.contributorCount).toBe(2);
    expect(gallery.nextCursor).toBe("next");
  });

  it("refuses a body without an items array instead of showing an empty gallery", async () => {
    get.mockResolvedValue({ photos: [] });

    await expect(getMemories("event-1")).rejects.toThrow(/GET \/events\/event-1\/memories/);
  });
});

describe("getPublicMemories", () => {
  it("trusts the API's canUpload for this visitor", async () => {
    get.mockResolvedValue({
      photoCount: 0,
      memoriesEnabled: true,
      canUpload: false,
      storageFull: false,
      items: [],
      nextCursor: null,
    });

    const gallery = await getPublicMemories("ada-30th");

    expect(gallery.enabled).toBe(true);
    expect(gallery.canUpload).toBe(false);
    expect(gallery.photos).toEqual([]);
    expect(gallery.storageLimitBytes).toBe(0);
  });

  it("reports canUpload once the gallery answers true", async () => {
    get.mockResolvedValue({
      photoCount: 3,
      memoriesEnabled: true,
      canUpload: true,
      storageFull: false,
      items: [photo],
      nextCursor: null,
    });

    const gallery = await getPublicMemories("ada-30th");

    expect(gallery.canUpload).toBe(true);
    expect(gallery.total).toBe(3);
  });
});

describe("uploadPublicMemory", () => {
  it("sends the multipart body and turns bytes sent into a percentage", async () => {
    post.mockResolvedValue(photo);
    const file = new File([new Uint8Array(1_024)], "photo-1.jpg", {
      type: "image/jpeg",
    });
    const percents: number[] = [];

    await uploadPublicMemory("ada-30th", { file, uploaderName: "Ada" }, (percent) =>
      percents.push(percent),
    );

    const [endpoint, body, options] = post.mock.calls[0];

    expect(endpoint).toBe("/public/events/ada-30th/memories");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("photo")).toBe(file);
    expect((body as FormData).get("uploaderName")).toBe("Ada");

    // The gallery's bar is driven by these numbers, not by a timer.
    options.onUploadProgress({ loaded: 256, total: 1_024 });
    options.onUploadProgress({ loaded: 1_024, total: 1_024 });
    options.onUploadProgress({ loaded: 2_048, total: 1_024 });
    expect(percents).toEqual([25, 100, 100]);
  });

  it("falls back to the file's size when the browser cannot measure the body", async () => {
    post.mockResolvedValue(photo);
    const file = new File([new Uint8Array(1_000)], "photo-1.jpg", {
      type: "image/jpeg",
    });
    const percents: number[] = [];

    await uploadPublicMemory("ada-30th", { file, uploaderName: "Ada" }, (percent) =>
      percents.push(percent),
    );

    post.mock.calls[0][2].onUploadProgress({ loaded: 500 });
    expect(percents).toEqual([50]);
  });
});

describe("updateMemorySettings", () => {
  it("sends the DTO's own names - a bare `enabled` is a 400", async () => {
    patch.mockResolvedValue({
      settings: { memoriesEnabled: true, memoriesAccess: "public" },
      usage: {},
    });

    await updateMemorySettings("event-1", {
      memoriesEnabled: true,
      memoriesAccess: "public",
    });

    expect(patch).toHaveBeenCalledWith("/events/event-1/memories/settings", {
      memoriesEnabled: true,
      memoriesAccess: "public",
    });
  });
});
