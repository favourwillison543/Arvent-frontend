/**
 * The type scale below the page title.
 *
 * `PAGE_TITLE` (in `Container.tsx`) is the display tier and belongs to a screen's
 * own name. Everything under it lives here, so a block heading, a card title and
 * a label are the same size on every screen instead of being re-typed per
 * component.
 *
 * Every tier moved one step down with `PAGE_TITLE` (24/28/32): a section is
 * 18/20 and a card title 14/16, which is the size every list and list-like card
 * in the app was already hand-writing. A page title that shrinks while its
 * sections stay at 20px would have read as two titles, one of them shouting.
 */

/** Small caps above a heading: "Event dashboard", "Attendance check". */
export const EYEBROW =
  "text-2xs font-semibold uppercase tracking-label text-muted-foreground";

/** A block heading inside a page — the `SectionHeader` title. */
export const SECTION_TITLE =
  "font-display text-lg font-bold leading-tight sm:text-xl";

/** A card or row title, one step under `SECTION_TITLE`. */
export const CARD_TITLE =
  "font-display text-sm font-bold leading-tight tracking-[-0.01em] sm:text-base";

/** The supporting line under a heading. */
export const BODY_MUTED = "text-sm leading-relaxed text-muted-foreground";
