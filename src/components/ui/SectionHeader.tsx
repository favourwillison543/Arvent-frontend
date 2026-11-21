import type { ReactNode } from "react";

import { EYEBROW, SECTION_TITLE } from "./type";

/**
 * The one section heading: a block title, one supporting line, and that block's
 * actions on the same baseline. For the screen's own title use `PageHeader`.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
  align = "center",
  className,
}: {
  /** Small caps above the title — "Event memories", "Attendance check". */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or chips, right of the title on desktop and under it on a phone. */
  actions?: ReactNode;
  /** A trailing mark of the section's own — a disc, an avatar, a count. */
  icon?: ReactNode;
  /** `start` keeps a tall `icon` at the top of the block instead of its middle. */
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={[
        "flex flex-wrap justify-between gap-x-4 gap-y-2",
        align === "start" ? "items-start" : "items-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
        <h2
          className={[SECTION_TITLE, eyebrow && "mt-1"]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {(actions || icon) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {icon}
        </div>
      )}
    </div>
  );
}
