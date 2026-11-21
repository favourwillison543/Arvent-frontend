/* Themed form controls used by the create-event settings panes. */

import { Minus, Plus } from "lucide-react";

import type { ReactNode } from "react";

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}): ReactNode {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>

      {/* The button is the 44px target; the track inside it is the visual. It
          used to *be* the track — a 20px-tall hit area. */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="flex h-11 w-12 shrink-0 items-center justify-center"
      >
        <span
          aria-hidden
          data-checked={checked ? "true" : undefined}
          className="ev-switch relative h-6 w-11 rounded-full transition-colors"
        >
          <span
            className={`ev-knob absolute left-0.5 top-0.5 size-5 rounded-full transition-transform ${
              checked ? "translate-x-5" : ""
            }`}
          />
        </span>
      </button>
    </div>
  );
}

export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const btn =
    "flex size-11 items-center justify-center rounded-field border border-border bg-surface transition-colors disabled:opacity-30 enabled:hover:border-foreground/30";

  return (
    <div className="flex items-center gap-2.5" role="group" aria-label={label}>
      <button
        type="button"
        className={btn}
        aria-label="Fewer"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="min-w-6 text-center text-base font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        aria-label="More"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
