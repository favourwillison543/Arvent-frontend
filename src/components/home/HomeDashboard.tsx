
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import Button from "@/components/ui/Button";
import { SkeletonCards, SkeletonRows } from "@/components/ui/Skeleton";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import { HOME_WRAP } from "@/components/event-dashboard/gutters";

import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useMoments } from "@/hooks/useMoments";
import { isPastDate } from "@/lib/utils/dates";
import type { User } from "@/lib/types/auth";

import {
  EventCard,
  MomentCard,
  MomentsEmptyState,
} from "./DashboardSections";
import SignedOutHome from "./SignedOutHome";

type Filter = "upcoming" | "hosting" | "attended";

const filters: { id: Filter; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "hosting", label: "Hosting" },
  { id: "attended", label: "Attended" },
];

/**
 * What the organizer home shows at a glance: eight events and four Moments.
 *
 * A dashboard is a glance, not an archive — eight posters and four Moments are
 * about two screens of cards, so the page ends where the eye expects instead of
 * running on into a wall of them. The cut comes *after* the search box and the
 * filter tabs, which still read every event: the footer admits how many are
 * hidden and offers them in place, and a new filter or a new query starts again
 * at eight so no view stops being a glance. The Moments block lists the same
 * cards in full at `/moments`, so its four are a preview rather than the only
 * way to reach one.
 */
const EVENTS_PER_VIEW = 8;
const MOMENTS_PER_VIEW = 4;

/**
 * The card grid, shared by both blocks.
 *
 * A fifth column from `2xl` is what keeps a card the same size on a big display
 * instead of letting four of them grow into billboards — the cards are a glance,
 * not the page. The grid keeps the header's left gutter, so the title and the
 * first poster still start on the same x.
 */
const CARD_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || "there";
}

export default function HomeDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen className="bg-dashboard" />;
  }

  /*
   * No session: this is an empty state, not a detour. The dashboard explains what
   * lives behind the door and offers both ways in, instead of sending the reader
   * away to a login form that never said what they were logging into.
   */
  if (!isAuthenticated || !user) {
    return <SignedOutHome />;
  }

  return <Dashboard user={user} />;
}

function Dashboard({ user }: { user: User }) {
  const { events, isLoading: eventsLoading } = useEvents();
  const { moments, loading: momentsLoading } = useMoments();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("upcoming");
  /** Whether the reader asked for the events past the first page. */
  const [showAllEvents, setShowAllEvents] = useState(false);

  const counts = useMemo(
    () => ({
      upcoming: events.filter((event) => !isPastDate(event.date)).length,
      hosting: events.length,
      attended: 0,
    }),
    [events],
  );

  const matchingEvents = useMemo(() => {
    const search = query.trim().toLowerCase();

    return events.filter((event) => {
      if (filter === "attended") return false;
      if (filter === "upcoming" && isPastDate(event.date)) return false;
      if (!search) return true;

      return [event.name, event.venueName, event.location]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [events, filter, query]);

  /** The first page of them — the rest are one press away, not one query away. */
  const visibleEvents = showAllEvents
    ? matchingEvents
    : matchingEvents.slice(0, EVENTS_PER_VIEW);
  const remainingEvents = matchingEvents.length - visibleEvents.length;

  /** A preview: `/moments` lists every card. */
  const visibleMoments = moments.slice(0, MOMENTS_PER_VIEW);
  const remainingMoments = moments.length - visibleMoments.length;

  return (
    <div className="workspace-dashboard min-h-dvh overflow-hidden bg-dashboard">
      {/* The header is the first row of the canvas and the card grid is the
          second, on the same wide column — one gutter, one top rhythm. Nesting
          the header inside the grid's column would have paid `px-4` twice and
          started the title 16px right of the first card. */}
      <PageHeader
        width="wide"
        className="relative z-10"
        title={`Welcome to Arvent, ${firstName(user.name)}!`}
        description={
          counts.upcoming === 1
            ? "You have 1 upcoming event."
            : `You have ${counts.upcoming} upcoming events.`
        }
      />

      <div className={`${HOME_WRAP} relative z-10 lg:pb-8`}>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">Search events</span>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowAllEvents(false);
              }}
              placeholder="Search events"
              className="h-10 w-full rounded-full border border-border bg-surface/80 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => {
                  setFilter(id);
                  setShowAllEvents(false);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {label} {counts[id]}
              </button>
            ))}
          </div>
        </div>

        <ul className={`mt-8 ${CARD_GRID}`}>
          {eventsLoading && events.length === 0 ? (
            <li className="col-span-full">
              <SkeletonCards
                count={EVENTS_PER_VIEW}
                className="lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              />
            </li>
          ) : (
            visibleEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} hostName={user.name} />
              </li>
            ))
          )}

          {filter !== "attended" && (
            <li>
              <Link
                href="/create"
                className="flex aspect-[4/5] items-center justify-center rounded-panel border border-dashed border-border bg-muted/40 text-xs font-semibold text-muted-foreground transition hover:border-foreground hover:text-foreground sm:text-sm"
              >
                + New event
              </Link>
            </li>
          )}
        </ul>

        {remainingEvents > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            Showing {visibleEvents.length} of {matchingEvents.length} events.
            <button
              type="button"
              onClick={() => setShowAllEvents(true)}
              className="rounded font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Show all
            </button>
          </p>
        )}

        {showAllEvents && matchingEvents.length > EVENTS_PER_VIEW && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            Showing all {matchingEvents.length} events.
            <button
              type="button"
              onClick={() => setShowAllEvents(false)}
              className="rounded font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Show fewer
            </button>
          </p>
        )}

        {filter === "attended" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Events you RSVP to will show up here.
          </p>
        )}

        {!eventsLoading &&
          filter !== "attended" &&
          visibleEvents.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              {query.trim()
                ? "No events match your search."
                : filter === "upcoming"
                  ? "You have no upcoming events yet."
                  : "You haven't created any events yet."}
            </p>
          )}

        <section
          id="moments"
          className="mt-16 border-t border-border pt-8"
        >
          <SectionHeader
            className="mb-5"
            title="Moments"
            description={
              <span className="block max-w-xl">
                Share a save-the-date, announcement, milestone or thank-you
                without setting up a full event.
              </span>
            }
            actions={
              moments.length > 0 ? (
                <Button href="/moments/new" size="sm">
                  Create Moment
                </Button>
              ) : undefined
            }
          />

          {momentsLoading ? (
            <SkeletonRows
              count={3}
              className="rounded-sheet border border-border bg-surface px-4"
            />

          ) : moments.length === 0 ? (
            <MomentsEmptyState />
          ) : (
            <>
              <ul className={CARD_GRID}>
                {visibleMoments.map((moment) => (
                  <li key={moment.id}>
                    <MomentCard moment={moment} />
                  </li>
                ))}
                <li>
                  <Link
                    href="/moments/new"
                    className="flex aspect-[4/5] items-center justify-center rounded-panel border border-dashed border-border bg-muted/40 text-xs font-semibold text-muted-foreground transition hover:border-brand hover:text-foreground sm:text-sm"
                  >
                    + Create Moment
                  </Link>
                </li>
              </ul>

              {remainingMoments > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Showing {visibleMoments.length} of {moments.length} moments.{" "}
                  <Link
                    href="/moments"
                    className="font-semibold text-foreground underline underline-offset-4"
                  >
                    See all moments
                  </Link>
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
