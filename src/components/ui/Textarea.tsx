"use client";

import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

import {
  FIELD_BARE_AREA,
  FIELD_CONTROL,
  FIELD_RADIUS,
  fieldBorder,
} from "./field";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  /** `bare` for a textarea inside a `FieldRow`, which draws the box. */
  variant?: "default" | "bare";
  /** For inline use — a row or a toolbar — where the control shouldn't stretch. */
  wrapperClassName?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hint,
      error,
      id,
      className = "",
      variant = "default",
      wrapperClassName,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedBy = error
      ? `${textareaId}-error`
      : hint
        ? `${textareaId}-hint`
        : undefined;
    const bare = variant === "bare";
    return (
      <div
        className={[
          bare ? "flex flex-col gap-1.5" : "flex w-full flex-col gap-1.5",
          wrapperClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            bare
              ? [FIELD_BARE_AREA, error && "text-destructive"]
              : [
                  FIELD_CONTROL,
                  FIELD_RADIUS,
                  "min-h-28 resize-y px-4 py-3",
                  fieldBorder(error),
                ],
            className,
          ]
            .flat()
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error ? (
          <p id={`${textareaId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${textareaId}-hint`}
            className="text-sm text-muted-foreground"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

export default Textarea;
