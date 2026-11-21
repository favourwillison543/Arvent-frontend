"use client";

import { Search, X } from "lucide-react";

/**
 * The one field on the screen.
 *
 * It sits inside the guest list's own plate, so it is an inset well rather than
 * a second bordered box: `bg-muted` at rest, a border only when focused. The
 * previous field was a 44px white slab with a 12px radius, which read as heavy
 * as the panel it was sitting in.
 */
export function GateSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search a name or phone"
        aria-label="Search guests"
        autoComplete="off"
        className="h-11 w-full rounded-field border border-transparent bg-muted pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-border focus:bg-surface [&::-webkit-search-cancel-button]:hidden"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}
