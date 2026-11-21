export function GateHeader({
  title,
  expected,
  checkedIn,
}: {
  title: string;
  expected: number;
  checkedIn: number;
}) {
  const percent = expected
    ? Math.min(100, Math.round((checkedIn / expected) * 100))
    : 0;
  const remaining = Math.max(0, expected - checkedIn);

  return (
    /*
     * The header is type, not another card. A door screen used to open with a
     * bordered plate holding a number, a bar, a percentage and a sentence — four
     * ways to say the same thing, all above the list. One number, one thin bar
     * in the brand colour, one caption: the arithmetic is the only accent the
     * screen gets.
     */
    <header className="px-1">
      <p className="text-2xs font-semibold uppercase tracking-label text-muted-foreground">
        Door list
      </p>

      <h1 className="mt-1.5 break-words font-display text-2xl font-bold leading-tight">
        {title}
      </h1>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold leading-none tabular-nums">
            {checkedIn}
          </span>
          <span className="text-sm text-muted-foreground">
            of {expected} inside
          </span>
        </p>

        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {percent}%
        </span>
      </div>

      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Guests inside"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2.5 text-xs text-muted-foreground">
        {remaining === 0
          ? "Everyone expected is inside."
          : `${remaining} ${remaining === 1 ? "seat" : "seats"} still expected`}
      </p>
    </header>
  );
}
