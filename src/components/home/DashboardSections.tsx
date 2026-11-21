
"use client";

import Link from "next/link";

import type { Event } from "@/lib/types/event";
import type { Moment } from "@/lib/types/moment";

import { fmtDate } from "@/components/create-event/format";
import { posters } from "@/components/create-event/posters";
import { fonts, themeStyle, themes } from "@/components/create-event/themes";

import { Poster } from "@/components/create-event/EventPreview";
import { Icon } from "@/components/ui/Icon";
import { CARD_TITLE, SECTION_TITLE } from "@/components/ui/type";
import { MiniMoment } from "@/components/moments/MomentArt";
import { kinds, longDate } from "@/components/moments/data";


export function EventCard({
  event,
  hostName,
}: {
  event: Event;
  hostName?: string | null;
}) {
  const poster =
    posters.find(
      (item) => String(item.id) === String(event.eventColors?.posterId),
    ) ?? posters[0];

  const font =
    fonts.find(
      (item) => String(item.id) === String(event.eventColors?.fontId),
    ) ?? fonts[0];

  const date = fmtDate(event.date);
  const place = event.venueName || event.location;

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <article className="overflow-hidden rounded-panel border border-border bg-surface shadow-sm transition group-hover:-translate-y-0.5">
        <div className="relative overflow-hidden bg-muted">
          <div className="transition duration-300 group-hover:scale-105">
            <Poster
              poster={poster}
              title=""
              when=""
              where=""
              fontClass={font.className}
              image={event.imageUrl ?? undefined}
              ratio="4 / 5"
            />
          </div>

          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-white">
            Hosting
          </span>

          {(date || place) && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-2.5 pb-2.5 pt-10 text-white">
              {date && (
                <p className="flex min-w-0 items-center gap-1 text-[11px] leading-tight text-white/80">
                  <Icon name="calendar" size={11} />
                  <span className="shrink-0">{date}</span>
                </p>
              )}

              {place && (
                <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] leading-tight text-white/80">
                  <Icon name="pin" size={11} />
                  <span className="truncate">{place}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </article>

      <h2 className={`mt-2.5 truncate ${CARD_TITLE}`}>
        {event.name || "Untitled event"}
      </h2>

      <p className="mt-0.5 truncate text-sm text-muted-foreground">
        Hosted by {hostName || "you"}
      </p>
    </Link>
  );
}

export function MomentCard({ moment }: { moment: Moment }) {
  const theme =
    themes.find((item) => item.id === moment.themeId) ?? themes[0];

  const font =
    fonts.find((item) => item.id === moment.fontId) ?? fonts[0];

  const isDark = theme.mode === "dark";
  const title = moment.title || kinds[moment.kind].titlePlaceholder;

  return (
    <Link href={`/m/${moment.id}`} className="group block">
      <article className="overflow-hidden rounded-panel border border-border bg-surface shadow-sm transition group-hover:-translate-y-0.5">
        <div
          className={`flex aspect-[4/5] flex-col justify-center gap-3 overflow-hidden p-4 text-center sm:p-5 ${
            isDark ? "text-white" : "text-poster-ink"
          }`}
          style={themeStyle(theme)}
        >
          <p className="text-2xs font-semibold uppercase tracking-caps opacity-65">
            {kinds[moment.kind].eyebrow}
          </p>

          <h3
            className={`line-clamp-4 break-words text-2xl font-bold leading-[1] sm:text-3xl ${font.className}`}
          >
            {title}
          </h3>

          {moment.date && (
            <p className="text-sm font-semibold">{longDate(moment.date)}</p>
          )}

          {moment.place && (
            <p className="truncate text-2xs uppercase tracking-[0.18em] opacity-70">
              {moment.place}
            </p>
          )}

          {moment.message && (
            <p className="line-clamp-3 text-xs opacity-75 sm:text-sm">
              {moment.message}
            </p>
          )}
        </div>
      </article>

      <p className={`mt-2.5 truncate ${CARD_TITLE}`}>{title}</p>

      <p className="mt-0.5 truncate text-sm text-muted-foreground">
        {kinds[moment.kind].label}
        {moment.date ? ` · ${longDate(moment.date)}` : ""}
      </p>
    </Link>
  );
}

export function MomentsEmptyState() {
  return (
    <div className="grid items-center gap-6 rounded-sheet border border-border bg-muted/40 p-5 sm:grid-cols-[minmax(0,1fr)_12rem] sm:p-7">
      <div>
        <p className={SECTION_TITLE}>
          A little page for news worth sharing
        </p>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Moments are simple shareable pages for life updates that don&apos;t
          need invitations or RSVPs. Choose a design, add your details, and share
          one link.
        </p>

        <Link
          href="/moments/new"
          className="mt-5 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          Create Moment
        </Link>
      </div>

      {/* The example card. `/m/demo` is rendered from `demoMoment` locally, not
          fetched: there is no public Moments list in the contract, so a visitor
          has to be able to see the shape of one without a real id. */}
      <Link
        href="/m/demo"
        aria-label="View a save the date Moment example"
        className="mx-auto block w-full max-w-40 transition hover:-translate-y-1"
      >
        <MiniMoment kind="save-the-date" />

        <span className="mt-2 block text-center text-xs font-semibold text-muted-foreground">
          View an example
        </span>
      </Link>
    </div>
  );
}
