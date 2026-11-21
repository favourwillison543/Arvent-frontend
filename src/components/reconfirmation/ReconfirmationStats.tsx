import type { Attendance } from "@/lib/types/reconfirmation";

/** "3 guests", "1 guest" — the reader should not have to pluralise. */
function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * The four counts of the current round, then the seats behind them.
 *
 * `not_asked` is the wire's spelling (the API sends snake-case here), and
 * `confirmed` is a tally, not a number — the two details the panel used to get
 * wrong, which left every tile blank.
 */
export function ReconfirmationStats({
  attendance,
}: {
  attendance: Attendance;
}) {
  const { reconfirmation, confirmed, checkedIn } = attendance;

  const values = [
    ["Confirmed", reconfirmation.confirmed],
    ["Waiting", reconfirmation.asked],
    ["Changed plans", reconfirmation.changed],
    ["Not asked", reconfirmation.not_asked],
  ] as const;

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {values.map(([label, value]) => (
          <div
            key={label}
            className="rounded-panel border border-border bg-surface p-4"
          >
            <dt className="text-xs font-semibold text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {plural(confirmed.guests, "guest")} coming ·{" "}
        {plural(confirmed.seats, "seat")} reserved ·{" "}
        {plural(checkedIn.seats, "seat")} checked in
      </p>
    </div>
  );
}
