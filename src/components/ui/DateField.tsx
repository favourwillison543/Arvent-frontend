"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import Popover from "./Popover";

const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const monthLabel = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});
const fullDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** `YYYY-MM-DD` in local time — `toISOString` would shift the day west of UTC. */
function toIso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/**
 * The date field.
 *
 * The form used to open the browser's own `<input type="date">`. On a themed
 * canvas that control is a light-mode widget — a calendar glyph and a
 * `dd/mm/yyyy` placeholder — sitting inside our dark glass row: two designs on
 * one line, and the month grid belongs to the OS, so nothing about it could be
 * matched to the rest of the app. This is ours: the row shows the date the way
 * the invitation prints it ("Sat 24 May") and the grid underneath is drawn with
 * the same radius, border and glass as every other panel.
 *
 * The value is still `YYYY-MM-DD`, so the draft, the API and the poster did not
 * change.
 */
export default function DateField({
  value,
  onChange,
  ariaLabel = "Date",
  placeholder = "Set a date…",
  wrapperClassName,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  wrapperClassName?: string;
  className?: string;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const selected = parseIso(value);
  const [view, setView] = useState(() => selected ?? new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toIso(today);

  // Monday-first, like every calendar in the product.
  const cells = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const lead = (new Date(year, month, 1).getDay() + 6) % 7;
    const length = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = Array.from({ length: lead }, () => null);

    for (let day = 1; day <= length; day += 1)
      out.push(new Date(year, month, day));
    while (out.length % 7 !== 0) out.push(null);

    return out;
  }, [view]);

  const step = (months: number) =>
    setView(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + months, 1),
    );

  const choose = (date: Date) => {
    onChange(toIso(date));
    setOpen(false);
  };

  return (
    <div className={["min-w-0", wrapperClassName].filter(Boolean).join(" ")}>
      <button
        ref={trigger}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setView(selected ?? new Date());
          setOpen((was) => !was);
        }}
        className={[
          "flex min-h-11 w-full items-center text-left text-base",
          selected ? "" : "text-muted-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="truncate">
          {selected ? shortDay.format(selected) : placeholder}
        </span>
      </button>

      <Popover
        anchor={trigger}
        open={open}
        onClose={() => setOpen(false)}
        minWidth={288}
        label="Choose a date"
      >
        <div className="p-1">
          <div className="mb-1 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => step(-1)}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
            >
              <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.8} />
            </button>

            <p className="text-sm font-semibold">{monthLabel.format(view)}</p>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => step(1)}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
            >
              <ChevronRight aria-hidden="true" size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5" role="presentation">
            {WEEK.map((day) => (
              <span
                key={day}
                className="flex h-7 items-center justify-center text-2xs font-medium text-muted-foreground"
              >
                {day}
              </span>
            ))}

            {cells.map((date, index) => {
              if (!date) return <span key={`pad-${index}`} />;

              const iso = toIso(date);
              const on = iso === value;
              const isToday = iso === todayIso;

              return (
                <button
                  key={iso}
                  type="button"
                  aria-label={fullDay.format(date)}
                  aria-pressed={on}
                  onClick={() => choose(date)}
                  className={[
                    "flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                    on
                      ? "bg-foreground font-semibold text-background"
                      : isToday
                        ? "ring-1 ring-inset ring-foreground/40 hover:bg-foreground/10"
                        : "hover:bg-foreground/10",
                  ].join(" ")}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-border pt-1">
            <button
              type="button"
              onClick={() => choose(today)}
              className="flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <CalendarDays aria-hidden="true" size={14} strokeWidth={1.8} />
              Today
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="flex min-h-9 items-center rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Popover>
    </div>
  );
}
