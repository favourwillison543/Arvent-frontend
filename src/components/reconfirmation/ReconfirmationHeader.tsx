import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/dates";

/**
 * The panel's headline and its one action.
 *
 * `going` is `confirmed.guests` — the people the API actually asks. It used to
 * be `reconfirmation.notAsked`, read under the wrong name and therefore
 * `undefined`; and even under the right name it is the wrong number to gate the
 * button on, because a new round asks everyone again rather than the leftovers
 * (verified live: a second call answers `round: 2, askedCount: 1` with
 * `not_asked: 0`).
 */
export function ReconfirmationHeader({
  eventName,
  going,
  round,
  startedAt,
  onStart,
  busy,
}: {
  eventName: string;
  going: number;
  round: number;
  startedAt: string | null;
  onStart: () => void;
  busy?: boolean;
}) {
  return (
    <header className="rounded-sheet border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">
        Attendance check
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold">
        Reconfirm {eventName} guests
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {going === 0
          ? "Nobody has said they’re coming yet, so there is no one to ask. Once RSVPs come in, start a round here."
          : `Ask the ${going === 1 ? "guest who is" : `${going} guests who are`} coming to confirm their plans, so your final headcount is reliable.`}
      </p>
      {round > 0 && startedAt && (
        <p className="mt-2 text-xs text-muted-foreground">
          Round {round} started {formatDateTime(startedAt)}. Starting another
          round asks everyone again.
        </p>
      )}
      <Button
        type="button"
        disabled={busy || going === 0}
        onClick={onStart}
        size="md"
        className="mt-4"
      >
        {busy
          ? "Starting…"
          : going === 0
            ? "No one to ask yet"
            : `Request confirmation from ${going}`}
      </Button>
    </header>
  );
}
