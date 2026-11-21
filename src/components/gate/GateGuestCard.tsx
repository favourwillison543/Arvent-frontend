"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { GateGuest } from "@/lib/types/gate";
import { CheckInButton } from "./CheckInButton";
import { PartySeats } from "./GateSeats";

/**
 * The categories the API marks a row with when the guest is not plain "going".
 * A check-in for one of them is a deliberate admission, so the request has to
 * carry `admit: true` or the door is refused.
 */
const ADMITTED = new Set(["waitlisted", "pending", "not_eligible"]);

const CATEGORY_LABEL: Record<string, string> = {
  waitlisted: "Waitlisted",
  pending: "Reply pending",
  not_eligible: "Not going",
};

export function isAdmission(guest: GateGuest) {
  return ADMITTED.has(guest.category ?? "");
}

/**
 * One name on the door list.
 *
 * A row, not a card: hairline separators and one status line. Five nested
 * rounded plates per guest (card, avatar, chip, seat glyphs, button) made a
 * hundred-guest list look like a wall of boxes, and the eye could not run down
 * the names. The only thing that changes shape is the action on the right.
 */
export function GateGuestCard({
  guest,
  busy,
  onCheckIn,
  onCheckInAll,
}: {
  guest: GateGuest;
  busy: boolean;
  onCheckIn: () => void;
  onCheckInAll: () => void;
}) {
  const remaining = Math.max(0, guest.seats - guest.checkedInCount);
  const arrived = remaining === 0;
  const admit = isAdmission(guest);

  const caption = arrived
    ? `All ${guest.seats > 1 ? `${guest.seats} seats ` : ""}inside`
    : admit
      ? (CATEGORY_LABEL[guest.category ?? ""] ?? "Not going")
      : guest.checkedInCount
        ? `${guest.checkedInCount} of ${guest.seats} inside`
        : "Expected";

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Avatar name={guest.name} size={36} />

      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2">
          <span className="truncate text-sm font-semibold">{guest.name}</span>

          {guest.phoneLast4 && (
            <span className="shrink-0 text-2xs font-semibold tabular-nums text-muted-foreground">
              •••• {guest.phoneLast4}
            </span>
          )}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <PartySeats guest={guest} arrived={arrived} />

          <span
            className={`text-2xs ${
              arrived ? "font-semibold text-status-going" : "text-muted-foreground"
            }`}
          >
            {caption}
          </span>
        </div>
      </div>

      <CheckInButton
        remaining={remaining}
        busy={busy}
        admit={admit}
        onCheckIn={onCheckIn}
        onCheckInAll={onCheckInAll}
      />
    </li>
  );
}
