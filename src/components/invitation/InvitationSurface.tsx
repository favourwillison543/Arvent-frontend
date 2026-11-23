"use client";

import type { ReactNode } from "react";

import EventPreview, { POSTER_FRAME } from "@/components/create-event/EventPreview";
import type { EventDraft } from "@/components/create-event/draft";
import { EVENT_BODY } from "@/components/ui/Container";
import { InvitationTitle } from "./InvitationInfo";

/**
 * Phone: poster, title, host, date + venue, then the rest in one column
 * (the fixed bottom bar carries the RSVP).
 * Desktop: title, host, date + venue and About Event on the left; poster with
 * the RSVP card under it on the right.
 */
export default function InvitationSurface({
  draft,
  rsvp,
  intro,
  host,
  meta,
  tiles,
  about,
  extras,
  className = "",
}: {
  draft: EventDraft;
  /** RSVP card, pinned under the poster from `lg` up. */
  rsvp: ReactNode;
  /** The description. */
  intro?: ReactNode;
  /** Who is hosting. */
  host?: ReactNode;
  /** Share actions. */
  meta?: ReactNode;
  /** Date + venue, stacked. */
  tiles?: ReactNode;
  /** Facts about the event. */
  about?: ReactNode;
  /** Memories, similar events: anything below the fold. */
  extras?: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`pb-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+8rem)] lg:pb-16 ${className}`}
    >
      <div className={EVENT_BODY}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-6 lg:pt-4">
          {/* 1. Poster. First on a phone; right column on desktop, with the
              RSVP card under it. The width force below only applies at 400px
              and under, so desktop and larger phones keep POSTER_FRAME. */}
          <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <div
              className={`flex flex-col lg:sticky lg:top-6 ${POSTER_FRAME} max-[400px]:!mx-0 max-[400px]:!w-full max-[400px]:!max-w-none`}
            >
              <div className="max-[400px]:[&>*]:!mx-0 max-[400px]:[&>*]:!w-full max-[400px]:[&>*]:!max-w-none">
                <EventPreview draft={draft} />
              </div>
              <div className="mt-4 hidden lg:block">{rsvp}</div>
            </div>
          </div>

          {/* 2. Title, then the host right under it. */}
          <div className="min-w-0 space-y-2 lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <InvitationTitle draft={draft} />
            {host}
          </div>

          {/* 3. Date + venue first, then everything else, one flow. */}
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7 lg:col-start-1 lg:row-start-2">
            {tiles}
            {meta}

            {(intro || about) && (
              <section className="flex flex-col gap-4">
                <h2 className="ev-muted border-b border-[color:var(--ink)]/10 pb-2 text-sm font-medium">
                  About Event
                </h2>
                {intro}
                {about}
              </section>
            )}

            {extras}
          </div>
        </div>
      </div>
    </main>
  );
}