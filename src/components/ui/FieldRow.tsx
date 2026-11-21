import type { ReactNode } from "react";

import { Icon } from "./Icon";
import { FIELD_ROW } from "./field";

/**
 * The one form row.
 *
 * The create form is a column of these: a glyph, then the control, inside a box
 * that owns the border. It replaced `ev-card` + `ev-input` — where the card drew
 * the box and the input sat inside it with its own 14px text — so now the row and
 * the control are one thing at one size, on the workspace and on a themed canvas
 * alike (`bg-surface` / `border-border` / `text-foreground` are remapped by
 * `.ev`, so no variant is needed here either).
 *
 * A row can hold more than one control — date, start and end share one — because
 * the border belongs to the row, not to each field.
 */
export default function FieldRow({
  icon,
  error,
  top = false,
  children,
}: {
  /** Glyph name from the shared icon set. Decorative: never the only label. */
  icon?: string;
  /** Draws the row in the error colour and prints the message underneath. */
  error?: string;
  /** Align the glyph and the controls to the top — for multi-line rows. */
  top?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        className={[
          FIELD_ROW,
          top ? "items-start" : "items-center",
          error ? "border-destructive" : "border-border",
        ].join(" ")}
      >
        {icon && (
          <span
            className={[
              "shrink-0 text-muted-foreground",
              top ? "mt-0.5" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon name={icon} />
          </span>
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {error && (
        <p className="mt-1 px-1 text-2xs text-destructive-ink">{error}</p>
      )}
    </div>
  );
}
