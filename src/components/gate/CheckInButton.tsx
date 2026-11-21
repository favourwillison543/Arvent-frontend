"use client";

import { Check } from "lucide-react";

import Button from "@/components/ui/Button";

/**
 * The one action a door person takes.
 *
 * A party may arrive in pieces, so the primary button admits one seat and the
 * quiet "all N" under it admits the rest in one call — before this there was no
 * way to say "the four of them are here" without four taps. `admit` is the
 * second half of the same story: a waitlisted or pending guest is not "going",
 * and the API refuses a check-in for them unless the request says so.
 */
export function CheckInButton({
  remaining,
  busy,
  admit = false,
  onCheckIn,
  onCheckInAll,
}: {
  remaining: number;
  busy: boolean;
  /** One tap admits a guest the list is not expecting (waitlist / pending). */
  admit?: boolean;
  onCheckIn: () => void;
  onCheckInAll?: () => void;
}) {
  if (remaining < 1) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-2xs font-semibold text-status-going">
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
        Inside
      </span>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        type="button"
        disabled={busy}
        onClick={onCheckIn}
        size="sm"
        className="min-w-[5.5rem]"
      >
        {busy ? "Saving…" : admit ? "Admit" : "Check in"}
      </Button>

      {remaining > 1 && onCheckInAll && (
        <button
          type="button"
          disabled={busy}
          onClick={onCheckInAll}
          className="rounded px-1 text-2xs font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
        >
          all {remaining}
        </button>
      )}
    </div>
  );
}
