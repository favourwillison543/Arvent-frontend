"use client";

import type { CSSProperties, ReactNode } from "react";

/*
 * The Moment editor's building blocks. Buttons and swatches live here so
 * padding, radius, type and the "selected" treatment stay identical.
 * The rail itself is shared: see @/components/ui/ActionRail.
 */

export { ActionRail, RailButton } from "@/components/ui/ActionRail";

/** A small pill used for switching between Moment kinds. */
export function ChipButton({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="ev-chip shrink-0 whitespace-nowrap"
      data-on={on}
      aria-pressed={on}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** A selectable option card in an editor panel. */
export function OptionCard({
  on,
  onClick,
  children,
  className = "",
  label,
  title,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  label?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      data-on={on}
      aria-pressed={on}
      aria-label={label}
      title={title}
      onClick={onClick}
      className={`ev-card px-4 py-3 text-left ${className}`}
    >
      {children}
    </button>
  );
}

/** A round colour / theme swatch. */
export function SwatchButton({
  on,
  label,
  onClick,
  style,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  style: CSSProperties;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      data-on={on}
      onClick={onClick}
      className="ev-sel aspect-square rounded-full border"
      style={style}
    />
  );
}
