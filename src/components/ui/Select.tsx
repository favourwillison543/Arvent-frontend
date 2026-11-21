"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from "react";

import Popover from "./Popover";
import {
  FIELD_BARE_SELECT,
  FIELD_CONTROL,
  FIELD_HEIGHT,
  FIELD_RADIUS,
  fieldBorder,
} from "./field";

type OptionElement = ReactElement<{
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
}>;

/**
 * The one picker.
 *
 * It used to be a native `<select>`, and the control itself was fine — the
 * *list* was not. The OS paints `<option>` in its own palette, so on a themed
 * canvas (dark glass over a gradient) the open menu came up unreadable, and no
 * CSS inside `.ev` could reach into it. The list is ours now: the same glass
 * panel as the rails, portalled above everything, with the chevron and the row
 * from `field.ts` — one control on the workspace and on every theme.
 *
 * Call sites still write `onChange((e) => e.target.value)`: the handler receives
 * a stand-in event carrying the chosen value, so no screen had to relearn its
 * own logic.
 */
export interface SelectProps {
  label?: string;
  hint?: string;
  error?: string;
  /** `bare` for a picker inside a `FieldRow`, which draws the box. */
  variant?: "default" | "bare";
  /** For inline use — a row or a toolbar — where the control shouldn't stretch. */
  wrapperClassName?: string;
  className?: string;
  id?: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  /** Line the menu up with the control's trailing edge. */
  align?: "start" | "end";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
}

export default function Select({
  label,
  hint,
  error,
  variant = "default",
  wrapperClassName,
  className,
  id,
  value,
  onChange,
  disabled = false,
  align = "start",
  children,
  ...aria
}: SelectProps) {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listId = `${buttonId}-list`;

  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const items = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((child) => {
          const option = child as OptionElement;
          return {
            value: String(option.props.value ?? ""),
            label: option.props.children,
            disabled: Boolean(option.props.disabled),
          };
        }),
    [children],
  );

  const selectedIndex = items.findIndex(
    (item) => item.value === String(value ?? ""),
  );
  const current = items[selectedIndex] ?? items[0];

  const openList = useCallback(() => {
    setActive(selectedIndex < 0 ? 0 : selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  const pick = useCallback(
    (next: string) => {
      setOpen(false);
      trigger.current?.focus();
      if (next === String(value ?? "")) return;
      onChange?.({
        target: { value: next },
      } as unknown as ChangeEvent<HTMLSelectElement>);
    },
    [onChange, value],
  );

  const move = (step: number) => {
    if (!items.length) return;
    let next = active;
    for (let i = 0; i < items.length; i += 1) {
      next = (next + step + items.length) % items.length;
      if (!items[next].disabled) break;
    }
    setActive(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(items.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[active];
      if (item && !item.disabled) pick(item.value);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const bare = variant === "bare";
  const describedBy = error
    ? `${buttonId}-error`
    : hint
      ? `${buttonId}-hint`
      : undefined;

  return (
    // No `w-full` on the wrapper: a block-level flex container already fills the
    // form column, and leaving the width off lets the same control sit inline in
    // a row (the guest list) without `w-full` and `w-auto` fighting.
    <div
      className={["flex flex-col gap-1.5", wrapperClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label
          htmlFor={buttonId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={trigger}
          id={buttonId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={
            open && items[active] ? `${listId}-${active}` : undefined
          }
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
          className={[
            bare
              ? [FIELD_BARE_SELECT, "flex items-center text-left"]
              : [
                  FIELD_CONTROL,
                  FIELD_HEIGHT,
                  FIELD_RADIUS,
                  "flex items-center pl-4 pr-10 text-left",
                  fieldBorder(error),
                ],
            className,
          ]
            .flat()
            .filter(Boolean)
            .join(" ")}
          {...aria}
        >
          <span className="truncate">{current?.label}</span>
        </button>

        <ChevronDown
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className={[
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-transform",
            open ? "rotate-180" : "",
            bare ? "right-0" : "right-3",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      <Popover
        anchor={trigger}
        open={open}
        onClose={() => setOpen(false)}
        align={align}
        minWidth={176}
        label={typeof label === "string" ? label : aria["aria-label"]}
      >
        <ul role="listbox" id={listId} aria-labelledby={buttonId}>
          {items.map((item, index) => {
            const on = index === selectedIndex;

            return (
              <li key={`${item.value}-${index}`}>
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={on}
                  disabled={item.disabled}
                  onPointerEnter={() => setActive(index)}
                  onClick={() => pick(item.value)}
                  className={[
                    "flex min-h-11 w-full items-center gap-2 rounded-field px-3 text-left text-base whitespace-nowrap transition-colors",
                    on ? "bg-foreground/10 font-semibold" : "",
                    !on && index === active ? "bg-foreground/[.07]" : "",
                    item.disabled ? "opacity-40" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {on && (
                    <Check
                      aria-hidden="true"
                      size={16}
                      strokeWidth={2}
                      className="shrink-0"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>

      {error ? (
        <p id={`${buttonId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${buttonId}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
