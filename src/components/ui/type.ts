/**
 * The type scale below the page title.
 *
 * `PAGE_TITLE` (in `Container.tsx`) is the display tier and belongs to a screen's
 * own name. Everything under it lives here, so a block heading, a card title and
 * a label are the same size on every screen instead of being re-typed per
 * component.
 */

/** Small caps above a heading: "Event dashboard", "Attendance check". */
export const EYEBROW =
  "text-2xs font-semibold uppercase tracking-label text-muted-foreground";

/** A block heading inside a page — the `SectionHeader` title. */
export const SECTION_TITLE = "font-display text-xl font-bold leading-tight";

/** A card or row title, one step under `SECTION_TITLE`. */
export const CARD_TITLE =
  "font-display text-base font-bold leading-tight tracking-[-0.01em] sm:text-lg";

/** The supporting line under a heading. */
export const BODY_MUTED = "text-sm leading-relaxed text-muted-foreground";
