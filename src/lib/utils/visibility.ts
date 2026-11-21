import type { Event } from "@/lib/types/event";

/**
 * Whether an event may appear in a browse surface (Discover, "Similar events").
 *
 * A private event is not hidden from people holding its link - that is the whole
 * point of private - it is only kept out of lists somebody else is scrolling.
 * Drafts and cancelled events are never browsable.
 */
export function isBrowsable(
  event: Pick<Event, "visibility" | "status">,
): boolean {
  return event.visibility !== "private" && event.status === "published";
}
