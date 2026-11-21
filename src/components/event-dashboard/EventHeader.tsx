"use client";

import { useState, type ReactNode } from "react";

import EventPreview, { POSTER_FRAME } from "@/components/create-event/EventPreview";
import { Icon } from "@/components/ui/Icon";
import { fmtDate, fmtTime } from "@/components/create-event/format";
import { Avatar } from "@/components/ui/Avatar";
import InvitationTiles from "@/components/invitation/InvitationTiles";
import { EVENT_TITLE, EVENT_TOP } from "@/components/ui/Container";
import { DASH_WRAP } from "./gutters";
import { useDashboard } from "./ui";

/**
 * The host's own hero. It is the invitation's hero: title, description, the
 * same date and venue cards guests get, the host, and the poster. The section
 * tabs are passed in as `nav` so they sit right under the host.
 */
export default function EventHeader({ nav }: { nav?: ReactNode }) {
  const { event } = useDashboard();
  const [expanded, setExpanded] = useState(false);
  const draft = event.draft;
  const time = [fmtTime(draft.startTime), fmtTime(draft.endTime)].filter(Boolean).join(" – ");
  const where = [draft.venue, draft.address].filter(Boolean).join(", ");
  const mapsHref = where
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`
    : "";
  const description = draft.description?.trim();
  const isLong = !!description && description.length > 160;

  return (
    <section className={`${DASH_WRAP} ${EVENT_TOP} pb-8 text-left text-foreground`}>
      {/* Phones read one column, in the invitation's order: title, who is
          hosting (close under it), the poster, the description, then the date
          and venue cards. Nothing is centred — the invitation is left-aligned,
          so the dashboard matches it.

          From `lg` up this is the invitation's own grid — seven columns of
          words, five of poster, the same gap — so the host and the guest see
          the same hero, and the poster is the same size on both because it is
          measured by its frame, not by the column it sits in. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-5">
        <div className="order-1 min-w-0 space-y-1 lg:col-span-7 lg:row-start-1">
          <h1
            className={`break-words font-display font-bold tracking-tight ${EVENT_TITLE}`}
          >
            {draft.title || "Untitled event"}
          </h1>

          <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon name="crown" size={20} /> Hosted by
            </p>
            <div className="flex items-center gap-2.5">
              <Avatar name={draft.host || "You"} size={22} />
              <span className="font-semibold">{draft.host || "You"}</span>
            </div>
          </div>
        </div>

        <div className={`order-2 lg:col-span-5 lg:col-start-8 lg:row-span-4 lg:row-start-1 lg:self-start ${POSTER_FRAME}`}>
          <EventPreview draft={draft} />
        </div>

        {description && (
          <div className="order-3 min-w-0 lg:col-span-7 lg:row-start-2">
            <p
              className={`text-sm leading-relaxed text-muted-foreground sm:text-base ${
                expanded ? "" : "line-clamp-3"
              }`}
            >
              {description}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-1 text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        <div className="order-4 text-left lg:col-span-7 lg:row-start-3">
          <InvitationTiles
            isoDate={draft.date}
            date={fmtDate(draft.date) || "Date TBD"}
            times={time}
            venue={draft.venue}
            address={draft.address}
            mapsHref={mapsHref}
          />
        </div>

        {nav && (
          <div className="order-5 -mx-4 mt-1 overflow-x-auto px-4 text-left [scrollbar-width:none] sm:mx-0 sm:px-0 lg:col-span-7 lg:row-start-4 [&::-webkit-scrollbar]:hidden">
            {nav}
          </div>
        )}
      </div>
    </section>
  );
}