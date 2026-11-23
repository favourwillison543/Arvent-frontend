"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useDiscoverEvents } from "@/hooks/useDiscoverEvents";
import { useInView } from "@/hooks/useInView";
import Button from "@/components/ui/Button";
import PageLayout from "@/components/ui/PageLayout";
import { Skeleton } from "@/components/ui/Skeleton";
import { CARD_TITLE, SECTION_TITLE } from "@/components/ui/type";
import { PAGE_TITLE } from "@/components/ui/Container";
import EventPreview from "@/components/create-event/EventPreview";
import { eventToDraft } from "@/components/create-event/eventToDraft";
import { fmtDate, fmtTime } from "@/components/create-event/format";

type PublicEvent = Parameters<typeof eventToDraft>[0] & {
  id: string;
  slug: string;
};


/**
 * The city chips the landing's "Browse events" section draws, ported here so a
 * reader who taps "Browse all events in Lagos" finds the same control on the
 * page it lands on. `All cities` is only here — the landing already knows which
 * city you picked, this page does not, so it needs a way back out of a filter.
 */
const CITIES = ["All cities", "Lagos", "Abuja", "Port Harcourt", "Ibadan"] as const;

const ALL_CITIES = CITIES[0];

/**
 * The API has no `city` column (PRD v2.2: `venueName` plus a free-text
 * `location`), so a chip matches on the address the host typed. A host who
 * writes "12 Admiralty Way, Lekki, Lagos" is found by the Lagos chip; one who
 * writes only "Lekki" is only under `All cities`, which is honest.
 */
function inCity(event: PublicEvent, city: string) {
  if (city === ALL_CITIES) return true;

  const place = `${event.venueName ?? ""} ${event.location ?? ""}`.toLowerCase();

  return place.includes(city.toLowerCase());
}

/**
 * The shape of the feed: a column of rows, two cards to a row.
 *
 * A card is not squeezed into half the screen. It keeps the width that makes it
 * read — 85% of the column on a phone — so the date, the title and the venue
 * have room, and the *second* card of the row is still visible at the edge.
 * That sliver is the point: the row tells you another card is there, and one
 * sideways swipe brings it in. Two cards per row, on every row.
 *
 * The negative margin cancels the page gutter and the padding puts it back, so
 * the first card still lines up with the heading while the row runs to the
 * screen edge — a full-bleed row inside a padded column.
 *
 * From `sm` up there is room for both cards at once, so each row becomes a
 * plain two-column grid with the scrolling switched off. From `lg` — a desktop
 * window, where the sidebar leaves the column wide enough for a third — the
 * rows dissolve (`lg:contents`) and their cards join the feed's own
 * three-column grid, so a desktop shows three across instead of two with a gap
 * of dead space beside it. Written once so the loading placeholders are the
 * same shape as the cards.
 */
const FEED = "flex flex-col gap-3 sm:gap-4 lg:grid lg:grid-cols-3";

const FEED_ROW =
  "-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto overscroll-x-contain px-3 py-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:scroll-px-0 sm:px-0 sm:py-0 lg:contents";

/**
 * One card in a row — 85% of the column on a phone, so the next card of its row
 * peeks in at the edge, and a grid cell from `sm` where both fit. `min-w-0`
 * because a grid track will not shrink a `flex` card below its content, and the
 * title is the thing that must truncate, not the card that must overflow.
 */
const FEED_ITEM = "w-[85%] min-w-0 shrink-0 snap-start sm:w-auto";

/**
 * The feed is chunked in pairs for the phone's sideways rows; the desktop grid
 * takes the cards out of those rows (`xl:contents`), so the chunk size stops
 * mattering at `xl`. Six at a time of two is what the placeholders render too.
 */
function pairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];

  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return rows;
}

function Pin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function Star({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5z" />
    </svg>
  );
}

function EventCard({
  event,
  index,
  seen,
}: {
  event: PublicEvent;
  index: number;
  seen: boolean;
}) {
  const draft = useMemo(() => eventToDraft(event), [event]);
  const [on, setOn] = useState(false);

  const time = draft.startTime ? fmtTime(draft.startTime) : "";
  const when = [fmtDate(draft.date), time].filter(Boolean).join(" at ");

  return (
    <div
      className={`group relative flex min-h-24 overflow-hidden rounded-panel border border-border bg-surface text-foreground transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(24,24,27,0.08)] motion-reduce:transition-none ${FEED_ITEM} ${
        seen
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      }`}
      style={{ transitionDelay: seen ? `${index * 60}ms` : "0ms" }}
    >
      {/* The poster is a thumbnail beside the words, not a cover above them —
          that is the card's layout and it stays. The card is wide enough that
          the date holds one line, the title two and the venue one under it, so
          the poster can be the share it is in the design: a fifth of the width.
          It steps back down at `lg`, where the grid is three across and the
          words need the room more than the thumbnail does. */}
      <div className="relative w-20 shrink-0 self-stretch overflow-hidden bg-muted sm:w-24 lg:w-20">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="w-full scale-[1.15] transition-transform duration-700 group-hover:scale-[1.22]">
              <EventPreview draft={draft} />
            </div>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5 sm:p-3">
        <div className="min-w-0">
          {/* `text-xs` is the app's meta size and fits on one line at the card's
              width; `line-clamp-2` is the safety net for a longer date, so the
              time is never the part that gets dropped. */}
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {when}
          </p>

          <h3 className={`mt-0.5 line-clamp-2 ${CARD_TITLE}`}>
            <Link
              href={`/e/${event.slug}`}
              aria-label={`View ${event.name}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {event.name}
            </Link>
          </h3>

          {draft.venue && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {draft.venue}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            Open to RSVP
          </span>

          <button
            type="button"
            aria-pressed={on}
            aria-label={`${on ? "Remove interest in" : "Mark interested in"} ${event.name}`}
            onClick={() => setOn((v) => !v)}
            className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              on
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 text-foreground hover:bg-muted"
            }`}
          >
            <Star on={on} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const query = useDiscoverEvents();
  const [city, setCity] = useState<string>(ALL_CITIES);

  const shown = useMemo(
    () => (query.data ?? []).filter((event) => inCity(event, city)),
    [query.data, city],
  );

  const feedRows = useMemo(() => pairs(shown), [shown]);

  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.1,
  });

  return (
    <main className="organizer-workspace relative isolate min-h-dvh min-w-0 overflow-hidden bg-background text-foreground pt-9">
      {/* The same opening as the home route: `PageLayout`'s shared `EVENT_TOP`
          (24 / 40 / 56), which is exactly what `PageHeader` gives `/home`.
          This page used to carry its own `pt-24 sm:pt-32` on top of it — 96px
          over the heading on a phone, twice the home screen's — so the first
          card sat two thumb-heights lower than the same card on the dashboard.
          One rhythm for every workspace screen; the header owns it. */}
      {/* `wide`, not `reading`: the organizer home's column. The two screens sit
          in the same frame behind the same sidebar, and a 1024px reading column
          here started the first card 200px right of where `/home` starts it. */}
      <PageLayout width="wide" className="pb-16">
        {/* The home route's header pattern: the screen's own name, left aligned,
            no italic accent, and the supporting line under it. This used to be a
            centred marketing hero — the landing's voice on a workspace screen. */}
        <section className="mb-8 max-w-2xl">
          <h1 className={`font-display font-bold tracking-tight ${PAGE_TITLE}`}>
            Discover events
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            Public events from hosts on Arvent. Tap one you like, and RSVP in
            seconds. No account needed.
          </p>

          <div
            role="group"
            aria-label="Choose a city"
            className="mt-5 flex flex-wrap gap-2"
          >
            {CITIES.map((c) => {
              const active = c === city;

              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCity(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  <Pin />
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {query.isLoading ? (
          <div role="status" aria-busy="true" className={FEED}>
            <span className="sr-only">Loading events</span>
            {[0, 1, 2].map((row) => (
              <div key={row} className={FEED_ROW}>
                {[0, 1].map((cell) => (
                  <div
                    key={cell}
                    className={`flex min-h-24 overflow-hidden rounded-panel border border-border bg-surface ${FEED_ITEM}`}
                  >
                    <Skeleton className="w-20 shrink-0 sm:w-24 lg:w-20" />
                    <div className="w-full space-y-2 p-2.5 sm:p-3">
                      <Skeleton className="h-2.5 w-3/4 rounded-sm" />
                      <Skeleton className="h-3.5 w-full rounded-sm" />
                      <Skeleton className="h-3 w-1/2 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : query.error ? (
          <div role="alert" className="rounded-sheet border border-border bg-surface p-6">
            <h2 className={SECTION_TITLE}>We couldn’t load events right now</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again in a moment.
            </p>
            <Button onClick={() => void query.refetch()} size="sm" className="mt-4">
              Try again
            </Button>
          </div>
        ) : shown.length ? (
          <section ref={section} className={FEED}>
            {feedRows.map((row, rowIndex) => (
              <div key={rowIndex} className={FEED_ROW}>
                {row.map((event, cell) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={rowIndex * 2 + cell}
                    seen={seen}
                  />
                ))}
              </div>
            ))}
          </section>
        ) : (
          <div className="rounded-sheet border border-dashed border-border bg-surface p-10 text-center">
            <h2 className={SECTION_TITLE}>
              {city === ALL_CITIES
                ? "No public events just yet"
                : `No public events in ${city} yet`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon, or start planning a gathering of your own.
            </p>
            <Button href="/create" size="md" className="mt-5">
              Create an event
            </Button>
          </div>
        )}
      </PageLayout>
    </main>
  );
}