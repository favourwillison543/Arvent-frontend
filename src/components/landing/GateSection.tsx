import { ArrowRight } from "lucide-react";

import Link from "next/link";

export function GateSection() {
  return (
    <article className="flex min-h-56 flex-col justify-between overflow-hidden rounded-sheet border border-border bg-surface p-6 sm:p-8">
      <div>
        <svg
          aria-hidden="true"
          className="size-8 text-brand-foreground"
          viewBox="0 0 32 32"
          fill="none"
        >
          <circle cx="16" cy="16" r="14" fill="var(--brand)" />
          <path
            d="m9.5 16.5 4.2 4.2 8.8-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="mt-4 font-display text-xl font-bold">
          A calmer check-in
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Give gate staff a private event link. They can find a guest, see their
          seat count and record arrivals without an organizer account.
        </p>
      </div>
      <Link
        href="/create"
        className="mt-6 text-sm font-bold underline underline-offset-4"
      >
        Plan an event <ArrowRight className="inline size-4 align-[-2px]" aria-hidden />
      </Link>
    </article>
  );
}
