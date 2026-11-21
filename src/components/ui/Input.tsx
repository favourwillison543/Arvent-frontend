"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

import {
  FIELD_BARE_INPUT,
  FIELD_CONTROL,
  FIELD_HEIGHT,
  FIELD_RADIUS,
  fieldBorder,
} from "./field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /**
   * `bare` drops the box: transparent, borderless, 16px — for a control that sits
   * inside a `FieldRow`, which draws the surface and the focus ring instead.
   */
  variant?: "default" | "bare";
  /** For inline use — a row or a toolbar — where the control shouldn't stretch. */
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    className,
    id,
    variant = "default",
    wrapperClassName,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  const bare = variant === "bare";

  return (
    // A block-level flex container already fills the form column, so `w-full` is
    // only needed on the boxed variant; leaving it off lets a bare control sit
    // inline in a row without `w-full` and `w-auto` fighting.
    <div
      className={[bare ? "flex flex-col gap-1.5" : "flex w-full flex-col gap-1.5", wrapperClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          bare
            ? [FIELD_BARE_INPUT, error && "text-destructive"]
            : [FIELD_CONTROL, FIELD_HEIGHT, FIELD_RADIUS, "px-4", fieldBorder(error)],
          className,
        ]
          .flat()
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
