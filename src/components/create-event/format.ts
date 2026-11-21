/* Formatting helpers shared by every screen that shows a date or a venue. */

import type { EventDraft } from "./draft";

export function fmtDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00`).toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export const whenOf = (d: EventDraft) =>
  [fmtDate(d.date), fmtTime(d.startTime)].filter(Boolean).join(" · ");

export const whereOf = (d: EventDraft) =>
  [d.venue, d.address].filter(Boolean).join(", ");

/**
 * The zone abbreviation a guest needs beside the times ("7:00 PM – 11:00 PM WAT").
 *
 * The invitation used to print the last segment of the IANA id as a chip — so
 * `Africa/Lagos` became the city name "Lagos", which is a place, not a time
 * zone, and read like a third location. Resolving the name through `Intl` gives
 * the speaker's own abbreviation and, for a zone with none, an honest offset.
 */
export function zoneAbbr(timeZone?: string | null) {
  if (!timeZone) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    // An unrecognised zone must never take the invitation down.
    return "";
  }
}

/** `time` with `zone` appended, or `time` alone when there is no zone. */
export function withZone(time: string, zone: string) {
  return [time, zone].filter(Boolean).join(" ");
}
