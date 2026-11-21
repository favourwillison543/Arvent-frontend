"use client";

import type { ReactNode } from "react";

/*
 * The one action rail. Every surface that offers a fixed set of tools
 * (event dashboard, event preview, style tools, moment editor) renders
 * this container with <RailButton> children, so the rail is identical
 * everywhere: a floating bar under the content on phones, a vertical
 * rail on the right edge from `lg` up.
 */

export function ActionRail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <nav aria-label={label} className="action-rail">
      {children}
    </nav>
  );
}

export function RailButton({
  label,
  icon,
  on = false,
  onClick,
  disabled = false,
  figure,
}: {
  label: string;
  icon?: ReactNode;
  on?: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** Optional count bubble (e.g. guests going) drawn in place of the icon. */
  figure?: { value: number | string; label: string };
}) {
  return (
    <button
      type="button"
      className="ev-rail"
      data-on={on}
      aria-pressed={on}
      aria-label={figure ? `${figure.value} ${figure.label}` : label || undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {figure ? (
        <span className="action-rail-figure">
          <b>{figure.value}</b>
          <span>{figure.label}</span>
        </span>
      ) : (
        <>
          <span className="action-rail-icon">{icon}</span>
          {label}
        </>
      )}
    </button>
  );
}
