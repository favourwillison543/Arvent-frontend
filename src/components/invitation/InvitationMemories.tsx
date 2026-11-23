import { ArrowRight, Clock } from "lucide-react";

import Image from "next/image";
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
  onRsvp?: () => void;
  onRemind?: () => void;
  onSignIn?: () => void;
};

/* Same four sample photos the host preview shows. Never the real album,
   so the locked card leaks nothing. */
const BACKDROP = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg", "/hero4.jpg"];

function BlurredPhotos() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* One row of 4 square tiles, slightly larger than the card so the
          edges bleed off. Light blur: shapes stay readable. */}
      <div className="absolute -inset-2 grid grid-cols-4 content-center gap-2 blur-[4px]">
        {BACKDROP.map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-panel">
            <Image src={src} alt="" fill sizes="160px" unoptimized className="object-cover" />
          </div>
        ))}
      </div>
      {/* gentle dim so the plate text stays readable */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}

/* Shared shell for the loading and locked states: same size, same backdrop,
   so nothing jumps when the server answers. */
function LockedShell({
  children,
  busy = false,
}: {
  children: React.ReactNode;
  busy?: boolean;
}) {
  return (
    <div
      className="relative mt-8 overflow-hidden"
      style={{ borderRadius: "var(--ev-r-md)" }}
      aria-busy={busy || undefined}
    >
      <BlurredPhotos />
      <div className="relative px-3 py-3 sm:px-6">
        <div className="ev-card mx-auto w-full max-w-[16rem] px-3 py-4 text-center backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function InvitationMemories({
  slug,
  title,
  enabled,
  verificationRequired = false,
  photos,
  total = 0,
  loading = false,
  onRsvp,
  onRemind,
  onSignIn,
}: Props) {
  /* The host has not opened the album: nothing a guest can do. */
  if (!enabled) {
    return (
      <div className="ev-card mt-8 flex items-center gap-3 p-5">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full"
          style={{ background: "var(--ev-surface2)" }}
        >
          <LockIcon />
        </span>

        <div>
          <p className="font-display text-lg font-bold">Memories are locked</p>
          <p className="ev-muted text-sm">
            The host hasn’t opened the shared album yet.
          </p>
        </div>
      </div>
    );
  }

  /* Still asking the server: show the protected page first so the open
     gallery never flashes before the lock. */
  if (loading && !photos.length && !verificationRequired) {
    return (
      <LockedShell busy>
        <div className="mx-auto size-7 animate-pulse rounded-full bg-[color:var(--ev-surface2)]" />
        <div className="mx-auto mt-2 h-4 w-28 animate-pulse rounded bg-[color:var(--ev-surface2)]" />
        <div className="mx-auto mt-2 h-3 w-40 animate-pulse rounded bg-[color:var(--ev-surface2)]" />
        <div className="mt-3 h-9 animate-pulse rounded-full bg-[color:var(--ev-surface2)]" />
        <div className="mt-2 h-9 animate-pulse rounded-full bg-[color:var(--ev-surface2)]" />
      </LockedShell>
    );
  }

  /* Verified guests only. */
  if (verificationRequired) {
    return (
      <LockedShell>
        <span className="mx-auto grid size-7 place-items-center">
          <LockIcon size={22} />
        </span>

        <p className="mt-1.5 font-display text-base font-bold">Restricted Access</p>
        <p className="ev-muted mx-auto mt-1 text-xs">
          Only RSVP’d guests can view the album for {title}.
        </p>

        {(onRsvp || onRemind) && (
          <div className="mt-3 grid gap-2">
            {onRsvp && (
              <Button onClick={onRsvp} size="sm" fullWidth>
                RSVP
              </Button>
            )}
            {onRemind && (
              <Button variant="outline" onClick={onRemind} size="sm" fullWidth>
                <Clock className="size-4" aria-hidden />
                Remind me
              </Button>
            )}
          </div>
        )}

        {onSignIn && (
          <p className="ev-faint mt-2 text-xs">
            Already RSVP’d?{" "}
            <button
              type="button"
              onClick={onSignIn}
              className="font-semibold text-[color:var(--ink)] hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
      </LockedShell>
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
        {slots.map((photo, i) =>
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