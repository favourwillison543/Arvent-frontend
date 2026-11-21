"use client";

import type { ReactNode } from "react";

import EventPreview, { POSTER_FRAME } from "@/components/create-event/EventPreview";
import type { EventDraft } from "@/components/create-event/draft";
import { EVENT_BODY } from "@/components/ui/Container";
import { InvitationTitle } from "./InvitationInfo";

/**
 * The invitation body. Every surface that shows an event the way a guest sees
 * it — the public `/e/[slug]` invitation, the organizer's `/create/preview`
 * and the dashboard preview — renders this exact grid, so the poster, the
 * RSVP column and the order of the detail blocks can't drift between them.
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
  /** The description, under the poster. */
  intro?: ReactNode;
  /** Who is hosting — above the poster, like the dashboard hero. */
  host?: ReactNode;
  /** Date, event type, RSVP rule and the share actions. */
  meta: ReactNode;
  /**
   * Date + venue tiles. Shown at every width — the phone used to repeat the same
   * date as two lines of text in `meta`, which is why the column read as a stack
   * of loose details instead of one block.
   */
  tiles?: ReactNode;
  /** Facts about the event. */
  about?: ReactNode;
  /** Memories, similar events — anything below the fold. */
  extras?: ReactNode;
  /** Extra top spacing, e.g. when a floating bar sits above the surface. */
  className?: string;
}) {
  return (
    <main
      className={`pb-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+8rem)] lg:pb-16 ${className}`}
    >
      <div className={EVENT_BODY}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-5 lg:pt-4">
          {/* 1. Title, then whose event it is — close together, one block. */}
          <div className="min-w-0 space-y-1 lg:col-span-7 lg:row-start-1">
            <InvitationTitle draft={draft} />
            {host}
          </div>

          {/* 2. The poster. */}
          <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1">
            {/* Poster and RSVP share one width, so the choices sit exactly under
                the poster on every screen instead of drifting apart. */}
            <div className={`flex flex-col lg:sticky lg:top-6 ${POSTER_FRAME}`}>
              <EventPreview draft={draft} />

              <div className="ev-card mt-4 hidden p-5 lg:block">{rsvp}</div>
            </div>
          </div>

          {/* 3. The story, under the poster. */}
          {intro && (
            <div className="min-w-0 lg:col-span-7 lg:row-start-2">{intro}</div>
          )}

          {/* 4. When and where as one block, then the house rules, then
              anything below the fold. The chips, the shares and the two tiles
              are three parts of the same answer ("when, where, what do I need
              to know"), so they sit 12px apart while the blocks after them keep
              the page rhythm. */}
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-7 lg:row-start-3">
            <div className="flex flex-col gap-3">
              {meta}
              {tiles}
            </div>
            {about}
            {extras}
          </div>
        </div>
      </div>
    </main>
  );
}
