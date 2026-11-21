"use client";

import { ArrowLeft } from "lucide-react";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { usePublicEvent } from "@/hooks/usePublicEvent";
import { usePublicMemories } from "@/hooks/useMemories";
import { ApiError } from "@/lib/http/errors";
import ThemeShell from "@/components/create-event/ThemeShell";
import { eventToDraft } from "@/components/create-event/eventToDraft";
import { DASH_WRAP } from "@/components/event-dashboard/gutters";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import NoticeScreen from "@/components/ui/NoticeScreen";
import { MemoryGallery } from "./MemoryGallery";

/**
 * The guest view of the shared album. It renders inside `ThemeShell` so the page
 * keeps the event's own palette and art - the same canvas as the invitation -
 * instead of the app's light tokens.
 */
export default function PublicMemoriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { event, isLoading, error } = usePublicEvent(slug);
  const { gallery, isLoading: memoriesLoading, error: memoriesError, uploadMemory } =
    usePublicMemories(slug);

  const draft = useMemo(() => (event ? eventToDraft(event) : null), [event]);

  if (isLoading || memoriesLoading) {
    return <LoadingScreen />;
  }

  if (!event || !draft || error || memoriesError || !gallery) {
    // `invitees` galleries answer 403 MEMORIES_ACCESS_DENIED until this device is
    // verified as a guest - say that, instead of "not available", which reads
    // like the album is gone.
    const needsVerification =
      memoriesError instanceof ApiError &&
      memoriesError.code === "MEMORIES_ACCESS_DENIED";

    return (
      <NoticeScreen
        eyebrow="Memories"
        title={needsVerification ? "Memories are for guests" : "Memories aren’t available"}
        description={
          needsVerification
            ? "Open your invitation and RSVP so the host knows you - then this album opens."
            : "This event gallery could not be loaded."
        }
        actions={
          <Link
            href={`/e/${slug}`}
            className="font-semibold underline underline-offset-4"
          >
            Back to invitation
          </Link>
        }
      />
    );
  }

  // The shared event URL is the guest entry point; memory access does not
  // depend on the separate RSVP management token.
  const inviteUrl = `/e/${slug}`;

  return (
    <ThemeShell draft={draft}>
      <div className={`${DASH_WRAP} pt-4 sm:pt-6`}>
        <Link
          href={inviteUrl}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted mb-6"
        >
          <ArrowLeft className="size-4" aria-hidden /> Event invitation
        </Link>
      </div>

      <div className={DASH_WRAP}>
        <MemoryGallery
          eventName={event.name}
          mode="guest"
          // `canUpload` is the API's verdict for this visitor; `memoriesEnabled`
          // only says the host opened the album.
          canContribute={gallery.canUpload}
          contributionsEnabled={gallery.enabled}
          access={gallery.access}
          storageLimitBytes={gallery.storageLimitBytes}
          storageUsedBytes={gallery.storageUsedBytes}
          photoLimit={gallery.photoLimit}
          photosPerGuest={gallery.photosPerGuest}
          photos={gallery.photos.map((photo) => ({
            id: photo.id,
            src: photo.url,
            name: photo.fileName,
            size: photo.sizeBytes,
            uploadedBy: photo.uploadedBy,
          }))}
          onUpload={async (files, uploaderName, onProgress) => {
            // The API takes one photo per request, so the batch is sent in
            // order and each file's own percentage is folded into the whole.
            for (const [index, file] of files.entries()) {
              await uploadMemory({ file, uploaderName }, (percent) =>
                onProgress?.(((index + percent / 100) / files.length) * 100),
              );
            }
          }}
        />
      </div>
    </ThemeShell>
  );
}
