import type { ReactNode } from "react";

import { cx } from "@/lib/utils/cx";
import { EYEBROW } from "./type";

/**
 * A screen that has nothing to show but a sentence.
 *
 * A missing event, a revoked door link, a 404 and a thrown render all end the
 * same way: one centred column with a title, a reason and a way out. Each screen
 * used to draw its own — three paddings, a `max-w-sm` and a `max-w-md`, titles at
 * 24px and at 30px — so the same failure looked like three different products.
 *
 * `tone="panel"` puts the column on a card instead of the page background, for
 * screens that sit inside a frame that already has one.
 */
export default function NoticeScreen({
  eyebrow,
  title,
  description,
  actions,
  note,
  tone = "plain",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** A footnote — a reference id, a "check back later" line. */
  note?: ReactNode;
  tone?: "plain" | "panel";
  className?: string;
}) {
  return (
    <main
      className={cx(
        "grid min-h-dvh place-items-center bg-background px-6 py-12 text-center text-foreground",
        className,
      )}
    >
      <div
        className={cx(
          "w-full max-w-md",
          tone === "panel" &&
            "rounded-sheet border border-border bg-surface p-8 shadow-sm",
        )}
      >
        {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
        <h1
          className={cx(
            "font-display text-2xl font-bold tracking-tight",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {actions && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        )}
        {note && (
          <p className="mt-5 text-2xs text-muted-foreground">{note}</p>
        )}
      </div>
    </main>
  );
}
