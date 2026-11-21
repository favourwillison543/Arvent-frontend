"use client";

import type { ReactNode } from "react";

import type { EventDraft } from "@/components/create-event/draft";
import { RsvpGlyph, rsvpValues } from "@/components/create-event/rsvpSymbols";
import { rsvpOptions } from "@/components/create-event/RsvpCircles";
import FloatingBar from "@/components/ui/FloatingBar";

/**
 * The pieces of the RSVP block that more than one surface draws: the public
 * invitation (`RsvpPanel`) and the organizer's `/create/preview`.
 *
 * The markup lives here because it used to be written twice, and the preview
 * drifted on every point that is visible:
 *
 * - it said "Will you come?" even when the draft asks guests to request a spot;
 * - its phone bar was a `ev-card` of circles on a gradient, four rem higher
 *   than the invitation's `ev-panel` of pills.
 *
 * One definition, one look. A change here is a change on both surfaces, which
 * is what a preview is for.
 */

/** The words the event's `rsvpAccess` earns, identical on every surface. */
export function rsvpPrompt(rsvpAccess: string): string {
  return rsvpAccess === "request" ? "Request to join" : "Will you come?";
}

/** The line above the choices: the card's headline, or the bar's caption. */
export function RsvpPrompt({
  rsvpAccess,
  compact = false,
}: {
  rsvpAccess: string;
  compact?: boolean;
}) {
  return (
    <p
      className={
        compact
          ? "ev-muted pb-1.5 text-center text-xs font-semibold"
          : "mb-4 text-center font-display text-base font-bold"
      }
    >
      {rsvpPrompt(rsvpAccess)}
    </p>
  );
}

/** The choice row a phone gets — pills, because circles do not fit up there. */
export function RsvpPills({
  draft,
  chosen = null,
  onSelect,
}: {
  draft: EventDraft;
  chosen?: string | null;
  onSelect: (value: string) => void;
}) {
  const values = rsvpValues(draft);

  return (
    <div className="flex gap-2">
      {rsvpOptions(draft).map((option) => {
        const on = chosen === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(option.value)}
            className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border text-sm font-semibold transition active:scale-95"
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
              size={18}
            />
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The fixed bar under the invitation on phones.
 *
 * It is a `FloatingBar` panel: the dock (bottom offset, z-ladder, centring) is
 * the shared one, and only the skin and the stack of content are this screen's.
 * Before, it computed the offset itself — `--app-bottom-nav-h` with a hard-coded
 * `4.25rem` fallback and its own `z-30` — which meant it was the one bar in the
 * app that could land under the tab bar if a frame ever stopped declaring the
 * height. `bottom-float` falls back to zero and takes its height from the frames
 * that actually draw the bar (`.invitation-frame`, `.has-bottom-nav`).
 *
 * `lg:hidden` lives on the wrapper, not in the component: above the breakpoint
 * the RSVP card is drawn inline in the page, so there is nothing to float.
 */
export function RsvpBar({ children }: { children: ReactNode }) {
  return (
    <div className="lg:hidden">
      <FloatingBar shape="panel" label="Your RSVP">
        {children}
      </FloatingBar>
    </div>
  );
}
