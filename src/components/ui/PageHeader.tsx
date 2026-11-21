import type { ReactNode } from "react";

import { EVENT_TOP, PAGE_BODY, PAGE_TITLE, READING_BODY, WIDE_BODY } from "./Container";
import { EYEBROW } from "./type";

/**
 * A screen's own title: the shared display size, an optional eyebrow and
 * description, and one place for the actions.
 *
 * Event screens draw their title through `EventHeader`; this is for settings,
 * the organizer home and any panel that isn't an event.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  width = "page",
  className,
  sticky = false,
}: {
  /** Small caps above the title — "Event dashboard", "Your account". */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or chips, right of the title on desktop and under it on a phone. */
  actions?: ReactNode;
  /**
   * `page` is the shared column — full width on a phone, 95% from `sm` up;
   * `narrow` caps at 1024px for reading
   * screens; `wide` is the organizer home's — the one the dashboard's card grid
   * uses, so the welcome title starts on the same x as the first card.
   */
  width?: "page" | "narrow" | "wide";
  className?: string;
  /** Sticks to the top of the scroll container (used by the door screen). */
  sticky?: boolean;
}) {
  const columns = { page: PAGE_BODY, narrow: READING_BODY, wide: WIDE_BODY };

  return (
    <header
      className={[
        columns[width],
        EVENT_TOP,
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-6",
        sticky &&
          "sticky top-0 z-sticky border-b border-border bg-background/85 py-4 backdrop-blur-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        {eyebrow && <p className={`mb-1.5 ${EYEBROW}`}>{eyebrow}</p>}
        <h1 className={`font-display font-bold tracking-tight ${PAGE_TITLE}`}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
