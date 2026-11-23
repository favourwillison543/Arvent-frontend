"use client";

import { Fragment, type ReactNode } from "react";

import type { EventDraft } from "@/components/create-event/draft";
import { RsvpGlyph, rsvpValues } from "@/components/create-event/rsvpSymbols";
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

/**
 * The row a phone gets, and the only thing in the bar: `RSVP | Interested` in
 * one dark plate, separated by a hairline — the reference's shape. Two plain
 * text actions on a shared surface, not two pills inside a pill: there is no
 * button chrome to compete with the invitation behind it.
 *
 * The glyphs are the host's own (`rsvpValues`), so a Bloom event shows a flower
 * and a bud where a Classic one shows a check and a clock — the bar is the same
 * control, in the event's language. "Interested" is the sheet's `maybe` answer;
 * "Can't go" stays in the sheet, where a decline that needs a name belongs.
 */
export function RsvpActions({
  draft,
  size = "sm",
  chosen = null,
  onSelect,
}: {
  draft: EventDraft;
  /**
   * `sm` is the row inside the phone bar; `lg` is the same control on the
   * desktop card, where it carries its own plate and a bigger tap height.
   */
  size?: "sm" | "lg";
  chosen?: string | null;
  onSelect: (value: string) => void;
}) {
  const values = rsvpValues(draft);
  const big = size === "lg";

  const actions = [
    { value: "going", label: "RSVP", glyph: values.rsvpGoing },
    { value: "maybe", label: "Interested", glyph: values.rsvpMaybe },
  ];

  return (
    <div
      className={`flex w-full items-stretch ${
        big ? "ev-plate mx-auto max-w-sm rounded-full px-2" : ""
      }`}
      /* One fill for both screens: `ev-plate` (theme.css) paints the
         invitation's own ink, a little darker towards the bottom — off-white on
         a dark invitation, near-black on a cream one. The bar on a phone carries
         the same class, so the control cannot come out light on one screen and
         dark on the next. `--inv` is the ink's opposite, i.e. the label colour
         on that plate. */
      style={big ? { color: "var(--inv)" } : undefined}
    >
      {actions.map((action, index) => {
        const on = chosen === action.value;

        return (
          <Fragment key={action.value}>
            {index > 0 && (
              <span
                aria-hidden
                className={`w-px shrink-0 ${big ? "my-3" : "my-2"}`}
                style={{
                  background:
                    "color-mix(in srgb, currentColor 30%, transparent)",
                }}
              />
            )}

            <button
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(action.value)}
              className={`flex min-w-0 flex-1 items-center justify-center font-semibold transition active:opacity-60 ${
                big ? "h-11 gap-2 text-[15px]" : "h-9 gap-1.5 text-[13px]"
              } ${chosen && !on ? "opacity-50" : "opacity-100"}`}
            >
              <RsvpGlyph
                mode={draft.rsvpMode}
                value={action.glyph}
                size={big ? 18 : 15}
              />
              <span className="truncate">{action.label}</span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * The fixed bar under the invitation on phones.
 *
 * It is a `FloatingBar`: the dock (bottom offset, z-ladder, centring) is
 * the shared one, and only the skin and the stack of content are this screen's.
 * Before, it computed the offset itself — `--app-bottom-nav-h` with a hard-coded
 * `4.25rem` fallback and its own `z-30` — which meant it was the one bar in the
 * app that could land under the tab bar if a frame ever stopped declaring the
 * height. `bottom-float` falls back to zero and takes its height from the frames
 * that actually draw the bar (`.invitation-frame`, `.has-bottom-nav`).
 *
 * Its fill is the theme's ink, not the page's glass: near-black on a cream
 * invitation, cream on a dark one, with the labels in the inverse so the answer
 * is legible before it is read. `tone="solid"` is what makes it opaque — the
 * glass `surface` skin would let the poster read straight through the words —
 * and `ev-invert-scope` / `ev-invert` (theme.css) swap the tokens underneath it,
 * so the glyphs, the labels and the hairline between them come out inverted
 * without any of them knowing where they are drawn. A bar that borrowed the
 * page's palette would have been the one control on the invitation that
 * disappeared into the artwork — which is why the invitation's own RSVP card can
 * be translucent and this one cannot.
 *
 * `shape="bar"` because it holds one row — `RSVP | Interested`, the reference's
 * plate — and because that shape is the narrow one: a pill wide enough for a
 * sentence ran from one edge of a phone to the other, so the control was as
 * wide as the screen it was floating on. Stacking a caption over a row (the old
 * `panel`) made the bar a card that happened to float; a bar is a control.
 *
 * `ev-plate` (theme.css) is the fill: the inverse, darkened a little top to
 * bottom, so the plate is a surface in both themes instead of a flat white
 * sticker on a dark invitation and a flat black one on a cream invitation.
 *
 * `lg:hidden` lives on the wrapper, not in the component: above the breakpoint
 * the RSVP card is drawn inline in the page, so there is nothing to float.
 */
export function RsvpBar({ children }: { children: ReactNode }) {
  return (
    <div className="ev-invert-scope lg:hidden">
      <FloatingBar
        shape="bar"
        tone="solid"
        label="Your RSVP"
        className="ev-invert ev-plate"
      >
        {children}
      </FloatingBar>
    </div>
  );
}
