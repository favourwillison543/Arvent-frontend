"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Container from "@/components/ui/Container";
import { fmtDate, fmtTime } from "@/components/create-event/format";
import { useDiscoverEvents } from "@/hooks/useDiscoverEvents";
import { useInView } from "@/hooks/useInView";
import type { PublicEvent } from "@/lib/api/public";
import Button from "../ui/Button";

import { SECTION_HEADING } from "./type";

/**
 * One card, whichever feed it came from.
 *
 * `interested` is `null` when nobody told us: the public list carries no
 * attendance count, and a number invented for the marketing page is exactly the
 * fake data this section used to be made of. Only the two placeholders below
 * print a figure.
 */
type Card = {
  /** The React key: the event's own id, or the placeholder's own name. */
  id: string;
  title: string;
  date: string;
  area: string;
  interested: number | null;
  poster: string;
  /** A real invitation, or `/discover` for a placeholder that has no event. */
  href: string;
};

/**
 * The chips — the same five the Discover page offers, `All cities` first. The
 * landing used to hide that option and force a city, so a reader with no event
 * near them never saw the rest of the feed.
 */
const CITIES = [
  "All cities",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
] as const;

type City = (typeof CITIES)[number];

const ALL_CITIES: City = CITIES[0];

/**
 * Local poster art. The card images used to point at an external placeholder
 * service, which left the strip blank on slow/blocked connections; these ship
 * with the app so the section always renders.
 */
const POSTERS = [
  "/events/owambe.jpg",
  "/events/wedding.jpg",
  "/events/birthday.jpg",
  "/events/dinner.jpg",
  "/events/house-party.jpg",
  "/events/graduation.jpg",
  "/events/naming.jpg",
  "/events/baby-shower.jpg",
  "/events/anniversary.jpg",
  "/events/school-reunion.jpg",
] as const;

const POSTER_KEYWORDS: [RegExp, (typeof POSTERS)[number]][] = [
  [/owambe/, "/events/owambe.jpg"],
  [/wedding|bridal|engagement/, "/events/wedding.jpg"],
  [/birthday/, "/events/birthday.jpg"],
  [/brunch|dinner|seafood/, "/events/dinner.jpg"],
  [/party|housewarming|rooftop|beach/, "/events/house-party.jpg"],
  [/graduation/, "/events/graduation.jpg"],
  [/naming/, "/events/naming.jpg"],
  [/baby/, "/events/baby-shower.jpg"],
  [/anniversary|sundown/, "/events/anniversary.jpg"],
  [/reunion/, "/events/school-reunion.jpg"],
];

/** Stable poster for a slug: keyword match first, then a deterministic pick. */
export function posterFor(slug: string) {
  const match = POSTER_KEYWORDS.find(([pattern]) => pattern.test(slug));

  if (match) return match[1];

  let hash = 0;

  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) % POSTERS.length;
  }

  return POSTERS[hash];
}

/**
 * Two cards for a cold start — the only invented events left on this page.
 *
 * This section used to be twenty-four made-up events across four cities, with
 * made-up attendance numbers, every one of them linking to an invitation that
 * never existed. It now reads the same public feed Discover does. These two stay
 * so the strip is not an empty hole on a day nobody has published anything —
 * and because there is no event behind them, they point at `/discover` instead
 * of a dead `/e/` link.
 */
const PLACEHOLDERS: Card[] = [
  {
    id: "placeholder-owambe",
    title: "Owambe Nights",
    date: "Sat, Oct 17 at 7pm",
    area: "Lekki, Lagos",
    interested: 1248,
    poster: posterFor("owambe-nights"),
    href: "/discover",
  },
  {
    id: "placeholder-brunch",
    title: "Sunday Brunch",
    date: "Sun, Oct 11 at 12pm",
    area: "Victoria Island, Lagos",
    interested: 640,
    poster: posterFor("sunday-brunch"),
    href: "/discover",
  },
];

/** A published invitation, said in the card's vocabulary. */
function toCard(event: PublicEvent): Card {
  const time = event.programStartTime ? fmtTime(event.programStartTime) : "";

  return {
    id: event.id,
    title: event.name,
    date: [fmtDate(event.date), time].filter(Boolean).join(" at "),
    area: event.venueName || event.location,
    // The public list carries no attendance count, so the card says what it
    // knows instead of printing a number nobody can back up.
    interested: null,
    poster: event.imageUrl || posterFor(event.slug),
    href: `/e/${event.slug}`,
  };
}

/**
 * The city match Discover uses. There is no `city` column (PRD v2.2 is
 * `venueName` plus a free-text `location`), so a chip matches what the host
 * typed: a host who writes "12 Admiralty Way, Lekki, Lagos" is found by the
 * Lagos chip, one who writes only "Lekki" is not. Duplicated on purpose — the
 * marketing page should not reach into the workspace screen for a filter.
 */
function inCity(event: PublicEvent, city: string) {
  if (city === ALL_CITIES) return true;

  const place = `${event.venueName ?? ""} ${event.location ?? ""}`.toLowerCase();

  return place.includes(city.toLowerCase());
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

export default function BrowseEvents() {
  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.1,
  });

  const [city, setCity] = useState<City>(ALL_CITIES);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const feed = useDiscoverEvents();
  const events = feed.data;

  /**
   * Real invitations first. The two placeholders only fill a feed that answered
   * and had nothing at all in it — a city that is merely quiet gets the honest
   * line under the grid instead, because a Lagos invitation shown under the
   * Abuja chip would be the same lie this section used to tell.
   */
  const rows = useMemo(() => {
    const all = events ?? [];
    const inTown = all.filter((event) => inCity(event, city)).map(toCard);

    if (inTown.length) return inTown;

    return feed.isSuccess && all.length === 0 ? PLACEHOLDERS : [];
  }, [events, city, feed.isSuccess]);

  const quiet = feed.isSuccess && (events?.length ?? 0) > 0 && rows.length === 0;

  /**
   * "All cities" is not a place, so the copy that names one only fires for the
   * other chips. It is also the default: a reader who lands here has not told us
   * where they are, and hiding the whole feed behind a guess is worse than
   * showing it.
   */
  const showCity = city !== ALL_CITIES;
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");

  return (
    <section id="browse-events" ref={section} className="w-full py-16 sm:py-24">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className={SECTION_HEADING}>
            Find events to attend{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              {showCity ? `in ${city}.` : "anywhere."}
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Public events from hosts on Arvent — every city, or the one you
            pick. Tap one you like, and RSVP.
          </p>

          <div
            role="group"
            aria-label="Choose a city"
            className="mt-7 flex flex-wrap justify-center gap-2"
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
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
          {rows.map((card, index) => {
            const on = !!saved[card.id];

            return (
              <div
                key={card.id}
                className={`group relative flex min-h-34 overflow-hidden rounded-panel border border-border bg-surface text-foreground transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(24,24,27,0.08)] motion-reduce:transition-none ${
                  seen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                }`}
                style={{
                  transitionDelay: seen ? `${index * 60}ms` : "0ms",
                }}
              >
                <div className="relative min-h-32 w-30 shrink-0 self-stretch overflow-hidden bg-muted sm:w-34">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.poster}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="line-clamp-2 font-display text-base font-bold leading-tight tracking-[-0.01em] sm:text-lg">
                      <Link
                        href={card.href}
                        aria-label={`View ${card.title}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {card.title}
                      </Link>
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {[card.date, card.area].filter(Boolean).join(" · ")}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {card.interested === null
                        ? "Open to RSVP"
                        : `${(card.interested + (on ? 1 : 0)).toLocaleString()} Interested`}
                    </span>

                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${
                        on ? "Remove interest in" : "Mark interested in"
                      } ${card.title}`}
                      onClick={() =>
                        setSaved((current) => ({
                          ...current,
                          [card.id]: !current[card.id],
                        }))
                      }
                      className={`relative z-10 flex size-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
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
          })}
        </div>

        {quiet && (
          <p className="mx-auto mt-6 max-w-md text-center text-sm text-muted-foreground">
            No public events in {city} yet. Every city is on the{" "}
            <Link
              href="/discover"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Discover page
            </Link>
            .
          </p>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            href={showCity ? `/discover?city=${citySlug}` : "/discover"}
            variant="secondary"
            size="lg"
          >
            {showCity ? `Browse all events in ${city}` : "Browse all events"}
          </Button>
        </div>
      </Container>
    </section>
  );
}
