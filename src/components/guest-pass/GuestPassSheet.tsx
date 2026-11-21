import { Check, Clock, HelpCircle, X } from "lucide-react";

import type { GuestRsvpStatus } from "@/lib/types/guest";
import {
  PASS_STATUS_LABEL,
  PASS_STATUS_NOTE,
  guestReference,
} from "@/lib/utils/pass";

function StatusMark({ status }: { status: GuestRsvpStatus }) {
  const label = PASS_STATUS_LABEL[status];

  if (status === "going") {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className="mt-2.5 inline-flex size-6 items-center justify-center rounded-full border border-status-going/35 bg-status-going/12 text-status-going"
      >
        <Check aria-hidden className="size-3.5" strokeWidth={2.75} />
      </span>
    );
  }

  if (status === "not_going") {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className="mt-2.5 inline-flex size-6 items-center justify-center rounded-full border border-status-declined/35 bg-status-declined/12 text-status-declined"
      >
        <X aria-hidden className="size-3.5" strokeWidth={2.75} />
      </span>
    );
  }

  const PendingGlyph = status === "maybe" ? HelpCircle : Clock;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="mt-2.5 inline-flex size-6 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--ev-surface)] text-[color:var(--soft)]"
    >
      <PendingGlyph aria-hidden className="size-3.5" strokeWidth={2.25} />
    </span>
  );
}

/**
 * The pass itself: styled like a printed invitation sheet rather than a
 * dashboard card — script flourish + spaced display heading, a clean check/X
 * status mark, an ornament rule separating the event from the guest's admission
 * block, and a soft wash of `--brand` behind the guest name & door reference.
 */
export default function GuestPassSheet({
  eventName,
  guestName,
  date,
  time,
  venue,
  address,
  status,
  guestId,
  reference,
  partyOf,
}: {
  eventName: string;
  guestName: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  status: GuestRsvpStatus;
  /** The guest's id, used for the printed reference when the API sent none. */
  guestId: string;
  /** The API's own pass reference (`MHAM-NX81`) — what the door will look for. */
  reference?: string;
  /** Seats this pass covers, including the guest. */
  partyOf: number;
}) {
  const printed = reference || guestReference(guestId);
  const showParty = status === "going" && partyOf > 1;

  return (
    <section
      data-pass-sheet
      aria-label={`Guest pass for ${guestName}`}
      className="print-sheet ev-panel overflow-hidden rounded-[var(--ev-r-md)]"
    >
      {/* Inset stationery hairline border */}
      <div
        className="m-2.5 rounded-[calc(var(--ev-r-md)-6px)] border px-6 py-7 sm:m-3 sm:px-9 sm:py-9"
        style={{ borderColor: "var(--line)" }}
      >
        {/* Top flourish + icon status mark */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="ev-rsvp-script !text-[1.85rem]">guest</span>
            <span className="ev-rsvp-title !text-[1.45rem]">PASS</span>
          </div>

          <StatusMark status={status} />

          {/* Event Title */}
          <h1 className="mt-4 font-display text-2xl font-medium leading-[1.15] tracking-[0.03em] sm:text-3xl">
            {eventName}
          </h1>

          {/* Date, Time & Venue stacked like a printed invite */}
          <div className="mt-4 space-y-1 text-sm">
            <p className="font-medium">
              {date || "Date to be announced"}
              {time ? ` · ${time}` : ""}
            </p>
            <p className="ev-muted text-xs leading-relaxed">
              {venue || "Venue to be announced"}
              {address ? ` — ${address}` : ""}
            </p>
          </div>
        </div>

        {/* Diamond ornament divider from theme.css */}
        <div className="ev-ornament my-6" aria-hidden="true">
          <span className="ev-ornament-glyph">✦</span>
        </div>

        {/* Guest & Door Reference block with the existing brand wash */}
        <div
          data-pass-tint
          className="grid gap-4 rounded-[var(--ev-r-sm)] border px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
          style={{
            borderColor: "var(--line)",
            background: "color-mix(in srgb, var(--brand) 12%, transparent)",
          }}
        >
          <div className="min-w-0">
            <p className="ev-rsvp-label">Prepared for</p>
            <p className="mt-1 break-words font-display text-xl font-medium leading-snug">
              {guestName}
            </p>
            <p className="ev-muted mt-0.5 text-xs">
              {showParty
                ? `Admit party of ${partyOf}`
                : PASS_STATUS_NOTE[status]}
            </p>
          </div>

          <div
            className="border-t pt-3 sm:border-t-0 sm:pt-0 sm:text-right"
            style={{ borderColor: "var(--line)" }}
          >
            <p className="ev-rsvp-label">Reference</p>
            <p className="mt-1 font-mono text-base font-semibold tracking-[0.14em] tabular-nums">
              {printed}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}