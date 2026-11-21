/**
 * The one control skin.
 *
 * `Input`, `Textarea` and `Select` all start from these strings. Before, each
 * carried its own copy — the input was `h-11 rounded-xl bg-muted`, the textarea
 * matched, and the select was `rounded-lg bg-background px-2 py-2 text-xs` — so
 * two fields side by side were never quite the same height, radius or text size.
 *
 * Two of those differences were bugs, not taste: anything under 16px text makes
 * iOS Safari zoom the whole page when the field takes focus, and anything under
 * 44px is under the touch target floor.
 */
export const FIELD_CONTROL =
  "w-full border bg-muted text-base text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

/** 44px. The touch target floor. */
export const FIELD_HEIGHT = "h-11";

/** 12px — `radius-field` in the shared scale. */
export const FIELD_RADIUS = "rounded-field";

export function fieldBorder(error?: string) {
  return error ? "border-destructive" : "border-border";
}

/**
 * The row that owns the border.
 *
 * The create page is a stack of these — "When", "Where", "Hosted by", "Spots" —
 * and so is every themed settings pane. Rather than each field carrying its own
 * box, the row draws the surface and the control goes bare inside it. That way
 * one row can hold three controls (date, start, end) and still read as one field,
 * which is the shape Partiful's create form uses.
 *
 * The blur matches `.ev-card`'s 10px so a row on a themed canvas is pixel-equal
 * to the card it replaced, and on the workspace surface the blur is a no-op.
 *
 * The height is the brief's row: **52px on a phone, 60px from `sm` up** — a 44px
 * control plus the padding, stated once here so every form row in the app is the
 * same height as every other form row (and as a guest list row, which is a 44px
 * picker in 8px of padding). It is `min-h`, so a textarea row grows.
 */
export const FIELD_ROW =
  "flex min-h-13 gap-3 rounded-panel border bg-surface px-4 py-1 backdrop-blur-sticky transition-colors focus-within:border-foreground sm:min-h-15";

/**
 * Borderless, transparent, 16px — for a control inside `FIELD_ROW`.
 * Height and padding belong to the variant below, never to the caller, so two
 * bare fields can't drift apart.
 */
const FIELD_BARE =
  "w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const FIELD_BARE_INPUT = `${FIELD_BARE} min-h-11`;

export const FIELD_BARE_AREA = `${FIELD_BARE} min-h-20 resize-none`;

/** The chevron sits at the row's trailing edge, so the padding is the gutter. */
export const FIELD_BARE_SELECT = `${FIELD_BARE} min-h-11 appearance-none pr-7`;
