"use client";

import { ArrowUpRight, Check, Link2 } from "lucide-react";

import { useState } from "react";
import { useParams } from "next/navigation";

import Button from "@/components/ui/Button";
import { DASH_WRAP } from "@/components/event-dashboard/gutters";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { useEvent } from "@/hooks/useEvent";
import { useEventMemories } from "@/hooks/useMemories";
import { MemoryGallery } from "./MemoryGallery";

/**
 * Copy that still works when the async clipboard is unavailable - plain http on
 * a phone, a sandboxed webview, an older browser. The legacy selection copy runs
 * second, and the caller offers the URL itself when both are refused.
 */
async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to the selection copy */
  }

  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  } catch {
    return false;
  }
}

export default function OrganizerMemoriesPage() {
  const { id } = useParams<{ id: string }>();
  const { event, isLoading: eventLoading } = useEvent(String(id));
  const { gallery, isLoading, updateSettings, deleteMemory } = useEventMemories(String(id));
  const [share, setShare] = useState<{ state: "idle" | "copied" | "manual"; url: string }>({
    state: "idle",
    url: "",
  });

  if (eventLoading || isLoading)
    return (
      <div className="py-6">
        <SkeletonRows count={3} />
      </div>
    );
  if (!event || !gallery)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Memories could not be loaded.
      </p>
    );

  const enabled = gallery.enabled;
  const access = gallery.access;
  const sharePath = `/e/${event.slug}/memories`;

  const copyLink = async () => {
    const url = `${window.location.origin}${sharePath}`;
    const copied = await copyText(url);

    if (!copied) {
      setShare({ state: "manual", url });
      return;
    }

    setShare({ state: "copied", url });
    window.setTimeout(() => setShare({ state: "idle", url: "" }), 2500);
  };

  return (
    <>
      <MemoryGallery
        eventName={event.name}
        photos={gallery.photos.map((photo) => ({
          id: photo.id,
          src: photo.url,
          name: photo.fileName,
          size: photo.sizeBytes,
          uploadedBy: photo.uploadedBy,
        }))}
        mode="organizer"
        canContribute={enabled}
        contributionsEnabled={enabled}
        access={access}
        storageLimitBytes={gallery.storageLimitBytes}
        storageUsedBytes={gallery.storageUsedBytes}
        photoLimit={gallery.photoLimit}
        photosPerGuest={gallery.photosPerGuest}
        toolbar={
          <>
            <Button
              href={sharePath}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              className="shrink-0"
            >
              Preview gallery <ArrowUpRight className="size-4" aria-hidden />
            </Button>
            <Button
              onClick={() => void copyLink()}
              variant="outline"
              className="shrink-0"
            >
              {share.state === "copied" ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Link2 className="size-4" aria-hidden />
              )}
              {share.state === "copied" ? "Link copied" : "Copy memories link"}
            </Button>
          </>
        }
        onDelete={(photoId) => {
          void deleteMemory(photoId);
        }}
        onSettingsChange={(settings) => {
          void updateSettings(settings);
        }}
      />

      {share.state === "manual" && (
        <div className={`${DASH_WRAP} pb-16`}>
          <label className="block text-sm font-semibold">
            Your browser blocked the copy button - select the link below
            <input
              readOnly
              value={share.url}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-2 h-11 w-full rounded-field border border-border bg-surface px-3.5 text-sm font-normal"
            />
          </label>
        </div>
      )}
    </>
  );
}
