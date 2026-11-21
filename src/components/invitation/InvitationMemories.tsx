import { ArrowRight } from "lucide-react";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { RsvpIcon } from "@/components/create-event/rsvpSymbols";
import { LockIcon } from "./InvitationIcons";

export type MemoryPhoto = {
  id: string;
  url: string;
};

type Props = {
  slug: string;
  title: string;
  enabled: boolean;
  /** The gallery answered 403: the visitor has not been verified as a guest. */
  verificationRequired?: boolean;
  photos: MemoryPhoto[];
  /** Every photo in the album, not just the four on this card. */
  total?: number;
  loading?: boolean;
};

export default function InvitationMemories({
  slug,
  title,
  enabled,
  verificationRequired = false,
  photos,
  total = 0,
  loading = false,
}: Props) {
  if (!enabled || verificationRequired) {
    return (
      <div className="ev-card mt-8 flex items-center gap-3 p-5">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full"
          style={{ background: "var(--ev-surface2)" }}
        >
          <LockIcon />
        </span>

        <div>
          <p className="font-display text-lg font-bold">
            {verificationRequired ? "Memories are for guests" : "Memories are locked"}
          </p>
          <p className="ev-muted text-sm">
            {verificationRequired
              ? "Open your invitation and RSVP so the host knows you - then the album opens."
              : "The host hasn’t opened the shared album yet."}
          </p>
        </div>
      </div>
    );
  }

  const shown = photos.slice(0, 4);
  const slots = Array.from({ length: 4 }, (_, i) => shown[i] ?? null);
  const all = Math.max(total, photos.length);

  return (
    <div className="ev-card mt-8 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">Memories</p>
          <p className="ev-muted mt-1 text-sm">
            One shared album for {title}.
            {all > 0 && (
              <span>
                {" "}
                {all} {all === 1 ? "photo" : "photos"} so far.
              </span>
            )}
          </p>
        </div>

        <Button href={`/e/${slug}/memories`} variant="outline" size="sm">
          {all > 4 ? `View all ${all}` : "Open memories"}{" "}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {loading && !shown.length
          ? slots.map((_, i) => (
              <div
                key={`loading-${i}`}
                aria-hidden
                className="aspect-square animate-pulse rounded-panel bg-[color:var(--ev-surface2)]"
              />
            ))
          : slots.map((photo, i) =>
              photo ? (
                <Link
                  key={photo.id}
                  href={`/e/${slug}/memories`}
                  aria-label={`Open the album - photo ${i + 1}`}
                  className="relative aspect-square overflow-hidden rounded-panel"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>
              ) : (
                <Link
                  key={`empty-${i}`}
                  href={`/e/${slug}/memories`}
                  aria-label="Add a photo to the album"
                  className="ev-sq grid aspect-square place-items-center rounded-panel transition hover:scale-[1.03]"
                  style={{ borderStyle: "dashed" }}
                >
                  <RsvpIcon name="plus" size={22} />
                </Link>
              ),
            )}
      </div>
    </div>
  );
}
