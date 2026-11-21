import type { SubmitRsvpInput } from "@/lib/types/guest";

/**
 * The invitation says "Can't go"; the API says `not_going`. The creator's
 * symbols (`RsvpCircles`) speak the invitation's vocabulary, so every write
 * passes through here instead of trusting the string it was handed.
 *
 * This is the only place the two vocabularies meet: `ThemedRsvpForm` used to
 * forward the raw value and the API rejected it as an unknown `rsvpStatus`.
 */
export type RsvpChoice = "going" | "maybe" | "declined";

export function toRsvpReply(choice: string): SubmitRsvpInput["rsvpStatus"] {
  if (choice === "declined" || choice === "not_going") return "not_going";
  if (choice === "maybe") return "maybe";

  return "going";
}

/** The inverse, for drawing the chosen circle from a stored status. */
export function toRsvpChoice(status: string | null | undefined): RsvpChoice | null {
  if (!status) return null;
  if (status === "not_going" || status === "declined") return "declined";
  if (status === "maybe") return "maybe";
  if (status === "going") return "going";

  // `pending_approval` / `waitlisted`: the guest has not answered yet, and
  // guessing an answer for them would draw the wrong circle as chosen.
  return null;
}
