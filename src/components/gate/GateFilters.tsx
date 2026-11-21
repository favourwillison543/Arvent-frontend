"use client";

export type GateFilter = "waiting" | "inside" | "all";

const TABS: { id: GateFilter; label: string }[] = [
  { id: "waiting", label: "Waiting" },
  { id: "inside", label: "Inside" },
  { id: "all", label: "All" },
];

/**
 * Waiting / Inside / All, as one segmented track.
 *
 * The list is the screen, so the filter cannot be three pill buttons that push
 * it down and wrap on a 375px phone. One 44px track holds all three with their
 * counts, and the selected segment is the only raised surface in it.
 *
 * The counts are computed from the current search results, not the whole guest
 * list: type a name and each segment says how many of the matches are waiting
 * or already inside, which is how staff answer "has she come in yet?".
 */
export function GateFilters({
  value,
  onChange,
  counts,
}: {
  value: GateFilter;
  onChange: (value: GateFilter) => void;
  counts: Record<GateFilter, number>;
}) {
  return (
    <div
      role="group"
      aria-label="Filter the door list"
      className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1"
    >
      {TABS.map((tab) => {
        const active = tab.id === value;

        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.id)}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors ${
              active
                ? "bg-surface text-foreground shadow-raise"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`tabular-nums ${
                active ? "text-muted-foreground" : "opacity-60"
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}