import { RsvpGlyph, rsvpValues } from "./rsvpSymbols";
import type { EventDraft } from "./draft";

export const RSVP_OPTIONS = [
  { value: "going", label: "Going", key: "rsvpGoing" },
  { value: "maybe", label: "Maybe", key: "rsvpMaybe" },
  { value: "declined", label: "Can’t go", key: "rsvpNo" },
] as const;

/** The options this draft actually offers — hosts can turn "Maybe" off. */
export function rsvpOptions(draft: EventDraft) {
  return draft.allowMaybe
    ? RSVP_OPTIONS
    : RSVP_OPTIONS.filter((option) => option.value !== "maybe");
}

export default function RsvpCircles({
  draft,
  big = false,
  chosen = null,
  onSelect,
}: {
  draft: EventDraft;
  big?: boolean;
  chosen?: string | null;
  onSelect?: (value: string) => void;
}) {
  const interactive = Boolean(onSelect);
  const values = rsvpValues(draft);

  return (
    <div className={`grid gap-2 sm:gap-3 ${draft.allowMaybe ? "grid-cols-3" : "grid-cols-2"}`}>
      {rsvpOptions(draft).map((option) => {
        const on = chosen === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={interactive ? on : undefined}
            tabIndex={interactive ? 0 : -1}
            onClick={() => onSelect?.(option.value)}
            className={`mx-auto flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-full border text-xs font-semibold transition sm:text-sm ${
              big ? "max-w-32" : "max-w-30"
            } ${interactive ? "hover:scale-[1.03]" : "cursor-default"}`}
            style={
              on
                ? {
                    background: "var(--ink)",
                    color: "var(--inv)",
                    borderColor: "var(--ink)",
                  }
                : {
                    background: "var(--ev-surface)",
                    color: "var(--ink)",
                    borderColor: "var(--line)",
                  }
            }
          >
            <RsvpGlyph
              mode={draft.rsvpMode}
              value={values[option.key]}
              size={big ? 30 : 26}
            />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}