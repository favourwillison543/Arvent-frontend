"use client";

import { ArrowRight, RefreshCw } from "lucide-react";

import Link from "next/link";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { themes } from "@/components/create-event/themes";
import { useAuth } from "@/hooks/useAuth";
import { useMoments } from "@/hooks/useMoments";
import { longDate, kinds, type Moment, type MomentKind } from "./data";

/*
 * The Moments you made: `GET /moments` is the signed-in organizer's own list
 * ("Moments I created while signed in", newest first). There is no public wall
 * in the contract, so an anonymous visitor is asked to sign in instead of being
 * shown an error that looks like an empty list.
 */


const FILTERS: { id: MomentKind | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "save-the-date", label: "Save the date" },
  { id: "announcement", label: "Announcements" },
  { id: "milestone", label: "Milestones" },
  { id: "thank-you", label: "Thank yous" },
];

function MomentTile({ moment }: { moment: Moment }) {
  const theme = themes.find((t) => t.id === moment.themeId);
  const ink = theme?.mode === "light" ? "var(--poster-ink)" : "#f5f3ee";
  const meta = kinds[moment.kind];
  const title = moment.title.trim() || meta.titlePlaceholder;
  const when = longDate(moment.date);

  return (
    <Link href={`/m/${moment.id}`} className="group block min-w-0">
      <div className="relative aspect-[3/2] overflow-hidden rounded-panel border border-border bg-muted">
        {moment.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={moment.photo}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex size-full flex-col items-center justify-center gap-1.5 px-3 text-center"
            style={{
              backgroundImage: theme?.image,
              backgroundColor: theme?.color,
              color: ink,
            }}
          >
            <span className="text-2xs font-semibold uppercase tracking-[.24em] opacity-70">
              {meta.eyebrow}
            </span>
            <p className="font-display text-lg font-bold leading-tight">
              {title}
            </p>
            {moment.place && (
              <span className="text-2xs opacity-70">{moment.place}</span>
            )}
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-2xs font-semibold text-white backdrop-blur">
          {meta.label}
        </span>
      </div>

      <p className="mt-2 truncate font-display text-sm font-bold">{title}</p>
      <p className="truncate text-xs text-muted-foreground">
        {[when, moment.from].filter(Boolean).join(" · ") || meta.blurb}
      </p>
    </Link>
  );
}

function Skeletons({ count, columns = 4 }: { count: number; columns?: 3 | 4 }) {
  return (
    <div
      className={gridFor(columns)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading Moments</span>

      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] rounded-panel" />
          <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
          <Skeleton className="mt-1.5 h-2.5 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** One column count for the tiles and their skeletons, so nothing jumps. */
const gridFor = (columns: 3 | 4) =>
  columns === 3
    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
    : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

export default function MomentsWall({
  limit,
  withFilters = false,
  columns = 4,
}: {
  limit?: number;
  withFilters?: boolean;
  columns?: 3 | 4;
}) {
  const [kind, setKind] = useState<MomentKind | "all">("all");
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { moments, loading, error, refetch } = useMoments({
    limit,
    kind: kind === "all" ? undefined : kind,
  });

  const grid = gridFor(columns);
  const waiting = authLoading || loading;

  return (
    <div>
      {withFilters && isAuthenticated && (
        <div
          role="group"
          aria-label="Filter your Moments"
          className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FILTERS.map((f) => {
            const on = kind === f.id;

            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => setKind(f.id)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {waiting ? (
        <Skeletons count={columns} columns={columns} />
      ) : !isAuthenticated ? (
        <div className="rounded-sheet border border-dashed border-border bg-surface p-8 text-center">
          <p className="font-display text-lg font-bold">Your Moments are here</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Sign in to see every Moment you have made. Anyone with a card&apos;s
            link can still open it without an account.
          </p>
          <Button href="/login?returnTo=%2Fmoments" className="mt-4">
            Sign in <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      ) : error ? (
        <div className="rounded-sheet border border-dashed border-border bg-surface p-8 text-center">
          <p className="font-display text-lg font-bold">
            We couldn’t load your Moments
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void refetch()}
          >
            <RefreshCw className="size-4" aria-hidden /> Try again
          </Button>
        </div>
      ) : moments.length === 0 ? (
        limit !== undefined ? (
          <p className="rounded-panel border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No Moments yet - yours could be the first.
          </p>
        ) : (
          <div className="rounded-sheet border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="font-display text-lg font-bold">
              {kind === "all" ? "No Moments yet" : "Nothing here yet"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {kind === "all"
                ? "Every card you make while signed in is listed here, newest first."
                : "You haven’t made this kind of Moment yet. Try another filter, or make the first one."}
            </p>
            <Button href="/moments/new" className="mt-5">
              Create a Moment <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        )
      ) : (
        <div className={grid}>
          {moments.map((moment) => (
            <MomentTile key={moment.id} moment={moment} />
          ))}
        </div>
      )}
    </div>
  );
}
