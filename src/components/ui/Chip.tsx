"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

/**
 * The one pill.
 *
 * Filters, section tabs and option toggles used to be five different pills: the
 * guest filters were `rounded-full border px-3 py-2 text-xs`, the event tabs
 * overrode `ev-chip` with `!px-4 !py-2 !text-sm`, the invitation preview had a
 * 20px-tall chip of its own, and the gate cards a fourth. They are all this.
 *
 * The selected state is a solid ink pill with the page colour showing through,
 * so it reads the same in the workspace, in the dark appearance and on a themed
 * invitation canvas — `theme.css` remaps `--foreground` / `--background` there,
 * so no variant is needed.
 */
const BASE = [
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5",
  "rounded-full border px-4 text-sm font-semibold whitespace-nowrap",
  "transition-colors sm:min-h-9",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:opacity-50",
].join(" ");

const ON = "border-foreground bg-foreground text-background";
const OFF =
  "border-border bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground";

type Common = {
  /** Renders the filled pill. `data-on` is kept for the `.ev` CSS hooks. */
  selected?: boolean;
  /** A count after the label — "Guests 12". Hidden when zero or undefined. */
  count?: number;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

function chipSkin(selected: boolean, className?: string) {
  return [BASE, selected ? ON : OFF, className].filter(Boolean).join(" ");
}

/**
 * The same skin for the one control that can't be a button: the poster picker's
 * upload is a `<label>` wrapping a real file input, and a pill-shaped label has
 * to wear the same clothes as the chips beside it.
 */
export { chipSkin };

function Count({ count }: { count?: number }) {
  if (typeof count !== "number" || count <= 0) return null;
  return <span className="text-2xs font-bold tabular-nums opacity-60">{count}</span>;
}

export type ChipProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/** A pill that toggles or filters — it stays a button, so `aria-pressed` is real. */
export function Chip({
  selected = false,
  count,
  icon,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-on={selected ? "true" : undefined}
      className={chipSkin(selected, className)}
      {...props}
    >
      {icon}
      {children}
      <Count count={count} />
    </button>
  );
}

export type ChipLinkProps = Common &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

/** The navigational twin: same pill, but it is a link and marks `aria-current`. */
export function ChipLink({
  selected = false,
  count,
  icon,
  className,
  children,
  ...props
}: ChipLinkProps) {
  return (
    <Link
      aria-current={selected ? "page" : undefined}
      data-on={selected ? "true" : undefined}
      className={chipSkin(selected, className)}
      {...props}
    >
      {icon}
      {children}
      <Count count={count} />
    </Link>
  );
}
