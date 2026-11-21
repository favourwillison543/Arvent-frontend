/* The guest pass: the words, the reference and the file name, in one place so
   the pass screen and its printed sheet cannot drift apart. */

import type { GuestRsvpStatus } from "@/lib/types/guest";

/** The guest's answer in the pass's words — never the API's snake case. */
export const PASS_STATUS_LABEL: Record<GuestRsvpStatus, string> = {
  going: "Confirmed",
  maybe: "Maybe",
  not_going: "Can’t make it",
  pending_approval: "Awaiting approval",
  waitlisted: "On the waitlist",
};

/** What that answer means at the door, in one line. */
export const PASS_STATUS_NOTE: Record<GuestRsvpStatus, string> = {
  going: "Show this pass at the door.",
  maybe: "Your seat isn’t held yet — update your RSVP when you know.",
  not_going: "You told the host you can’t make it. Changed your mind? Update your RSVP.",
  pending_approval: "The host hasn’t approved this guest yet.",
  waitlisted: "The host will be in touch if a seat opens up.",
};

/**
 * A guest's reference: the first eight characters of their id in two groups.
 *
 * Short enough to read down a phone line at the door, stable for the life of
 * the guest record, and derived — so it needs no extra column and no extra
 * request. The full id stays the real identifier; this is its label.
 */
export function guestReference(guestId: string): string {
  const hex = guestId.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const head = (hex.slice(0, 4) || "0000").padEnd(4, "0");
  const tail = (hex.slice(4, 8) || "0000").padEnd(4, "0");

  return `ARV-${head}-${tail}`;
}

const fileSafe = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

/** The name a saved or printed pass lands under. */
export function passFileName(eventName: string, guestName: string): string {
  return ["arvent-pass", fileSafe(eventName), fileSafe(guestName)]
    .filter(Boolean)
    .join("-");
}

/**
 * The event's calendar date, spelled out.
 *
 * Built from `YYYY-MM-DD` at midnight local time: the date is a calendar day
 * the host chose, not an instant, so it must not shift with a timezone.
 */
export function passDate(date: string): string {
  if (!date) return "";

  return new Date(`${date}T00:00`).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
