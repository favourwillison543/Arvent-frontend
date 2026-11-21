"use client";

import type { Guest } from "@/lib/types/guest";
import Button from "@/components/ui/Button";

export function RSVPStatus({
  guest,
  onReconfirm,
}: {
  guest: Guest;
  onReconfirm: (response: "confirmed" | "changed") => Promise<unknown>;
}) {
  // `null` = the host added this guest but they have not answered yet.
  const label = guest.rsvpStatus
    ? {
        going: "You’re going",
        maybe: "You’re undecided",
        not_going: "You can’t make it",
        pending_approval: "Your request is waiting for approval",
        waitlisted: "You’re on the waitlist",
      }[guest.rsvpStatus]
    : "The host is expecting you";
  const canReconfirm =
    guest.rsvpStatus === "going" && guest.reconfirmationStatus === "asked";
  return (
    <div className="mt-4 rounded-panel bg-muted p-4">
      <p className="font-semibold">{label}</p>
      {guest.rsvpStatus === "going" && (
        <p className="mt-1 text-sm text-muted-foreground">
          Party of {1 + guest.additionalGuestCount}
        </p>
      )}
      {guest.reconfirmationStatus === "asked" && (
        <div className="mt-3">
          <p className="text-sm">The host asked you to reconfirm.</p>
          {canReconfirm && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void onReconfirm("confirmed")}
                size="sm"
              >
                Still going
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onReconfirm("changed")}
                size="sm"
              >
                Plans changed
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
