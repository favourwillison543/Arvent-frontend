"use client";

import { ImagePlus, Plus, X } from "lucide-react";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Image from "next/image";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import FloatingBar from "@/components/ui/FloatingBar";
import Input from "@/components/ui/Input";

const MAX_PHOTO_SIZE = 20 * 1024 * 1024;

export type MemoryPhoto = {
  id: string;
  src: string;
  name: string;
  size: number;
  uploadedBy: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

function formatStorageLimit(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${bytes / (1024 * 1024 * 1024)} GB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/**
 * The gallery's own words for a photo. The public answer does not always carry
 * `fileName`, and `next/image` refuses an empty `alt` ("Image is missing
 * required alt property"), so a nameless photo gets a sentence that still
 * describes it instead of nothing.
 */
function photoLabel(photo: MemoryPhoto, eventName: string) {
  return photo.name?.trim() || `Photo shared in ${eventName}`;
}

/**
 * The shared album for one event. It is used twice: on the organizer's
 * dashboard (with the contribution settings) and on the public memories page
 * inside the event theme. Everything here reads the app tokens - `border`,
 * `surface`, `foreground`, `muted-foreground` - so the same markup paints with
 * the workspace palette on the dashboard and with the event palette on the
 * invitation.
 */
export function MemoryGallery({
  eventName,
  photos = [],
  mode,
  canContribute,
  contributionsEnabled = true,
  access = "invitees",
  storageLimitBytes = 0,
  storageUsedBytes,
  photoLimit = 0,
  photosPerGuest = 1,
  toolbar,
  onSettingsChange,
  onDelete,
  onUpload,
}: {
  eventName: string;
  photos?: MemoryPhoto[];
  mode: "organizer" | "guest";
  canContribute: boolean;
  contributionsEnabled?: boolean;
  access?: "invitees" | "public";
  storageLimitBytes?: number;
  /** The API's `usage.usedBytes`; falls back to summing the page. */
  storageUsedBytes?: number;
  photoLimit?: number;
  photosPerGuest?: 1 | 2;
  /** Extra controls (preview link, copy link) that belong in the header row. */
  toolbar?: ReactNode;
  onSettingsChange?: (settings: { enabled: boolean; access: "invitees" | "public" }) => void;
  onDelete?: (photoId: string) => void;
  /**
   * Send the selected photos. The callback reports progress across the whole
   * batch (0-100), so the tray's bar keeps moving whether this is one photo or
   * two.
   */
  onUpload?: (
    files: File[],
    uploaderName: string,
    onProgress?: (percent: number) => void,
  ) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ file: File; src: string }[]>([]);
  const [contributor, setContributor] = useState("");
  const [selected, setSelected] = useState<MemoryPhoto | null>(null);
  /** `0`-`100` while the selected photos are being sent; `null` otherwise. */
  const [progress, setProgress] = useState<number | null>(null);
  const uploading = progress !== null;
  /* The batch is sent one photo at a time, so the percentage also says how many
     thumbnails have already left - those stop spinning. */
  const sent = uploading
    ? Math.floor(((progress ?? 0) / 100) * pending.length)
    : 0;

  // The organizer's gallery reports storage for the whole album, which the
  // current page does not hold; the guest's gallery does not report it at all.
  const usedBytes =
    storageUsedBytes ?? photos.reduce((sum, photo) => sum + photo.size, 0);
  const pendingBytes = pending.reduce((sum, photo) => sum + photo.file.size, 0);
  const remainingBytes = Math.max(0, storageLimitBytes - usedBytes);
  const contributors = new Set(photos.map((photo) => photo.uploadedBy)).size;
  const full = photoLimit > 0 && photos.length >= photoLimit;
  const usedPercent = storageLimitBytes
    ? Math.min(100, Math.round((usedBytes / storageLimitBytes) * 100))
    : 0;

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const valid: { file: File; src: string }[] = [];
    let rejected = "";

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        rejected ||= "Choose image files to add to the gallery.";
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        rejected ||= `${file.name} is larger than the 20 MB per-photo limit.`;
        continue;
      }
      valid.push({ file, src: URL.createObjectURL(file) });
    }

    /* One message per selection, through the app's single toast stack: three
       oversized files are one problem, not three. */
    if (rejected) toast.error(rejected);

    setPending(valid);
    event.target.value = "";
  }

  async function addPhotos() {
    if (!canContribute) {
      toast.error("Open the event invitation to contribute photos.");
      return;
    }
    if (!pending.length || uploading) return;
    const name = contributor.trim();
    if (!name) {
      toast.error("Add your name so the host can see who shared each photo.");
      return;
    }
    if (pending.length > photosPerGuest) {
      toast.error(
        `Each guest can add up to ${photosPerGuest} ${photosPerGuest === 1 ? "photo" : "photos"}.`,
      );
      return;
    }
    if (photoLimit > 0 && photos.length + pending.length > photoLimit) {
      toast.error(
        `This event has ${photoLimit} shared photo slots, and they are full.`,
      );
      return;
    }
    if (storageLimitBytes > 0 && pendingBytes > remainingBytes) {
      toast.error(
        "This gallery has reached its shared storage limit. Try fewer or smaller photos.",
      );
      return;
    }
    try {
      setProgress(0);
      await onUpload?.(pending.map((item) => item.file), name, (percent) =>
        // A `100` from axios means "bytes sent" - the API is still processing,
        // so the bar holds at 99 until the answer lands.
        setProgress(Math.min(99, Math.max(0, Math.round(percent)))),
      );
      pending.forEach((item) => URL.revokeObjectURL(item.src));
      setPending([]);
      setContributor("");
      toast.success("Photos added to the event memories.");
    } catch {
      toast.error("We couldn’t upload those photos. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  function removePhoto(photo: MemoryPhoto) {
    onDelete?.(photo.id);
    setSelected(null);
  }

  return (
    <div className="w-full pb-16 text-foreground">
      {/* A compact header, the same shape as every other tab: a small eyebrow
          and the line that matters. The display-size headline that used to open
          this page repeated the tab's own name and pushed the album itself
          below the fold on a phone. */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Memories
          </p>
          <h1 className="mt-1 truncate font-display text-lg font-bold tracking-tight">
            {eventName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">
              {photos.length}
              {photoLimit > 0 ? ` of ${photoLimit}` : ""}{" "}
              {photos.length === 1 ? "photo" : "photos"}
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              {contributors} {contributors === 1 ? "contributor" : "contributors"}
            </span>
            {storageLimitBytes > 0 && (
              <span className="rounded-full border border-border px-3 py-1">
                {formatBytes(remainingBytes)} left
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {toolbar}
          {/* Guests get the upload button; the organizer's job on this tab is
              sharing the album, so the big button is not theirs. */}
          {mode !== "organizer" && canContribute && contributionsEnabled && (
            <Button
              onClick={() => input.current?.click()}
              disabled={full || uploading}
              size="lg"
              className="shrink-0"
            >
              <Plus className="size-4" aria-hidden />{" "}
              {full ? "Gallery full" : uploading ? "Uploading…" : "Add photos"}
            </Button>
          )}
        </div>
      </header>

      {mode === "organizer" && (
        <section className="mt-7 grid gap-5 rounded-sheet border border-border bg-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold">Guest contributions</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Let guests add photos to this shared album.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={contributionsEnabled}
                aria-label="Guest contributions"
                onClick={() =>
                  onSettingsChange?.({ enabled: !contributionsEnabled, access })
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  contributionsEnabled ? "bg-foreground" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 size-5 rounded-full bg-white transition ${
                    contributionsEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <label className="block max-w-sm text-sm font-semibold">
              Who can open the album?
              <select
                value={access}
                onChange={(event) =>
                  onSettingsChange?.({
                    enabled: contributionsEnabled,
                    access: event.target.value as "invitees" | "public",
                  })
                }
                className="mt-2 h-11 w-full appearance-none rounded-field border border-border bg-background px-3.5 text-sm font-medium text-foreground"
              >
                <option value="invitees">Guests with the event link</option>
                <option value="public">Anyone with the link</option>
              </select>
              <span className="mt-1.5 block text-xs font-normal text-muted-foreground">
                {access === "public"
                  ? "Linked from the public event page, so anyone who finds it can open the album."
                  : "Reachable only from the shared event link you send."}
              </span>
            </label>
          </div>

          <div className="rounded-panel border border-border bg-background p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold">Shared storage</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {formatBytes(usedBytes)} / {formatStorageLimit(storageLimitBytes)}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-baseline justify-between gap-3">
                <dt>Space left</dt>
                <dd className="tabular-nums">{formatBytes(remainingBytes)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt>Photo slots</dt>
                <dd className="tabular-nums">
                  {photos.length}
                  {photoLimit > 0 ? ` of ${photoLimit}` : ""}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt>Per guest</dt>
                <dd className="tabular-nums">
                  {photosPerGuest} {photosPerGuest === 1 ? "photo" : "photos"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt>Per photo</dt>
                <dd className="tabular-nums">20 MB max</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      {mode === "guest" && !contributionsEnabled && (
        <div className="mt-6 rounded-panel border border-border bg-surface p-4 text-sm text-muted-foreground">
          Photo contributions are turned off by the host. You can still browse the
          memories.
        </div>
      )}

      {!photos.length ? (
        <section className="mt-7 rounded-sheet border border-dashed border-border bg-surface px-6 py-16 text-center sm:py-20">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted">
            <ImagePlus className="size-5" aria-hidden />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold">
            Your shared album starts here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Photos from everyone will live together here. Add the first one and keep
            the best moments in one place.
          </p>
          {canContribute && contributionsEnabled && (
            <Button
              onClick={() => input.current?.click()}
              disabled={full || uploading}
              className="mt-5"
            >
              <Plus className="size-4" aria-hidden />{" "}
              {full ? "Gallery full" : uploading ? "Uploading…" : "Add the first photos"}
            </Button>
          )}
        </section>
      ) : (
        <div className="mt-7 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
          {photos.map((photo) => {
            const label = photoLabel(photo, eventName);

            return (
              <article
                key={photo.id}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-panel border border-border bg-muted sm:mb-4"
              >
                <button
                  type="button"
                  onClick={() => setSelected(photo)}
                  aria-label={`View ${label}`}
                  className="block w-full text-left"
                >
                  <Image
                    src={photo.src}
                    alt={label}
                    width={900}
                    height={1100}
                    unoptimized
                    className="h-auto max-h-[30rem] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white opacity-0 transition group-hover:opacity-100">
                    <span className="block truncate text-sm font-semibold">
                      {label}
                    </span>
                    <span className="mt-1 block text-xs text-white/75">
                      Added by {photo.uploadedBy}
                    </span>
                  </span>
                </button>
                {mode === "organizer" && (
                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    aria-label={`Remove ${label}`}
                    className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/60 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {pending.length > 0 && (
        <FloatingBar shape="panel" label="Selected photos">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold">
                {uploading ? "Sending your photos" : "Preview your photos"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {pending.length} selected · {formatBytes(pendingBytes)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPending([])}
              disabled={uploading}
              className="min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {pending.map((photo, index) => (
              <div key={`${photo.file.name}-${photo.file.lastModified}`} className="relative">
                <Image
                  src={photo.src}
                  alt={photo.file.name}
                  width={76}
                  height={76}
                  unoptimized
                  className={`size-16 shrink-0 rounded-field object-cover transition ${
                    uploading && index >= sent ? "opacity-50" : ""
                  }`}
                />
                {/* A spinner on each thumbnail says the photo is still in
                    flight, even while the bar sits on one number. */}
                {uploading && index >= sent && (
                  <span className="absolute inset-0 grid place-items-center rounded-field bg-black/35">
                    <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  </span>
                )}
              </div>
            ))}
          </div>
          {uploading ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
                <span>Uploading {pending.length} {pending.length === 1 ? "photo" : "photos"}…</span>
                <span className="tabular-nums text-muted-foreground">{progress}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress ?? 0}
              >
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-300"
                  style={{ width: `${Math.max(2, progress ?? 0)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this page open until the photos finish - a large photo can take a
                while on a phone connection.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={contributor}
                onChange={(event) => setContributor(event.target.value)}
                aria-label="Your name"
                placeholder="Your name"
                wrapperClassName="flex-1"
              />
              <Button onClick={addPhotos}>
                Add to memories ({pending.length})
              </Button>
            </div>
          )}
        </FloatingBar>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={selectPhotos}
      />

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close photo"
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/15 text-white"
          >
            <X className="size-5" aria-hidden />
          </button>
          <Image
            src={selected.src}
            alt={photoLabel(selected, eventName)}
            width={1600}
            height={1200}
            unoptimized
            className="max-h-[85vh] max-w-full rounded-panel object-contain"
          />
          <p className="absolute bottom-5 left-4 right-4 text-center text-sm text-white">
            {photoLabel(selected, eventName)} · Added by {selected.uploadedBy}
          </p>
        </div>
      )}
    </div>
  );
}
