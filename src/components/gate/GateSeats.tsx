import type { GateGuest } from "@/lib/types/gate";

/**
 * One seat in a party, as a tick.
 *
 * This used to be a 15px chair glyph, one per seat — so a party of four drew a
 * row of tiny furniture that read as decoration rather than a count, and at
 * arm's length on a phone in daylight it disappeared. A seat is a quantity, so
 * it is drawn as one: a short pip that fills as that person comes in, plus the
 * numbers. Shared by the organizer door screen and the public gate link.
 */
export function Seat({ arrived, index }: { arrived: boolean; index: number }) {
  return (
    <span
      aria-hidden="true"
      className={`h-1.5 w-2.5 rounded-full transition-colors duration-300 ${
        arrived ? "bg-status-going" : "bg-muted-foreground/25"
      }`}
      style={{ transitionDelay: arrived ? `${index * 60}ms` : "0ms" }}
    />
  );
}

export function PartySeats({
  guest,
  arrived,
  max = 5,
}: {
  guest: GateGuest;
  arrived: boolean;
  max?: number;
}) {
  const seats = Math.max(1, guest.seats);
  const inside = Math.min(seats, Math.max(0, guest.checkedInCount));
  const visibleSeats = Math.min(seats, max);
  const extraSeats = seats - visibleSeats;

  return (
    <span
      className="flex items-center gap-2"
      aria-label={`${inside} of ${seats} ${seats === 1 ? "seat" : "seats"} inside for ${guest.name}`}
    >
      <span className="flex items-center gap-1">
        {Array.from({ length: visibleSeats }, (_, index) => (
          <Seat key={index} arrived={index < inside} index={index} />
        ))}

        {extraSeats > 0 && (
          <span className="text-2xs font-semibold tabular-nums text-muted-foreground">
            +{extraSeats}
          </span>
        )}
      </span>

      {seats > 1 && (
        <span
          className={`text-2xs font-semibold tabular-nums ${
            arrived ? "text-status-going" : "text-muted-foreground"
          }`}
        >
          {inside}/{seats}
        </span>
      )}
    </span>
  );
}
