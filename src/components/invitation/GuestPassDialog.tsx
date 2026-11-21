"use client";

import { ArrowLeft, CircleCheck, Ticket } from "lucide-react";

import type { GuestRsvpStatus } from "@/lib/types/guest";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import GuestPassSheet from "@/components/guest-pass/GuestPassSheet";

import { passHeadline, passHref } from "./GuestPass";

/** The facts the pass card prints, gathered by the invitation. */
export type PassFacts = {
  eventName: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  guestName: string;
  guestId: string;
  /** The API's pass reference, when the answer carried one. */
  reference?: string;
  partyOf: number;
};

/**
 * The pass, over the invitation.
 *
 * A guest who has just replied was being sent to a second page to find out
 * whether it worked — and, when the token arrived in a fragment, to a page that
 * could not read it at all. The confirmation and the pass are the same answer,
 * so they are the same surface: it opens over the invitation they are already
 * reading, says what was saved, shows the card the door will look at, and comes
 * with a way back. The full page still exists for a link opened from an email.
 */
export function GuestPassDialog({
  open,
  link,
  status,
  pass,
  onClose,
}: {
  open: boolean;
  /** The guest's manage link — the invitation address with the token in `g`. */
  link: string;
  status?: GuestRsvpStatus | null;
  /** `null` until the API has answered with the guest's own record. */
  pass: PassFacts | null;
  onClose: () => void;
}) {
  if (!open) return null;

  const href = passHref(link);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your guest pass"
        className="ev-panel max-h-[90svh] w-full max-w-md overflow-y-auto overscroll-contain rounded-panel p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="ev-muted -ml-1 inline-flex h-9 items-center gap-1.5 rounded-full pl-1 pr-2 text-sm font-semibold transition hover:text-[color:var(--ink)]"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back
          </button>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ev-muted -mr-1 grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-[color:var(--ev-surface)] hover:text-[color:var(--ink)]"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* The answer first: this is what the guest came back to read. */}
        <p
          role="status"
          className="mt-2 flex items-center gap-2 font-display text-xl font-bold"
        >
          <CircleCheck aria-hidden className="size-5" />
          {passHeadline(status)}
        </p>

        <p className="ev-muted mt-1 text-sm leading-relaxed">
          {status === "not_going"
            ? "The host has your reply, and you can change it any time from this invitation."
            : "Your pass is below. Keep this link — it is also how you change your answer later."}
        </p>

        {pass && (
          <div className="mt-4">
            <GuestPassSheet
              eventName={pass.eventName}
              guestName={pass.guestName}
              date={pass.date}
              time={pass.time}
              venue={pass.venue}
              address={pass.address}
              status={status ?? "maybe"}
              guestId={pass.guestId}
              reference={pass.reference}
              partyOf={pass.partyOf}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {href && (
            <Button href={href}>
              <Ticket aria-hidden className="size-4" />
              Open full pass
            </Button>
          )}

          <Button variant="outline" onClick={onClose}>
            Back to invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
