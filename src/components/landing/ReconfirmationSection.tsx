import { ArrowRight } from "lucide-react";

import Link from "next/link";

export function ReconfirmationSection() {
  return (
    <article className="flex min-h-56 flex-col justify-between overflow-hidden rounded-sheet border border-border bg-muted p-6 sm:p-8">
      <div>
        <svg
          aria-hidden="true"
          className="size-8 text-foreground"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M25 13A10 10 0 0 0 8 7L5 10m0 0V4m0 6h6M7 19a10 10 0 0 0 17 6l3-3m0 0v6m0-6h-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="mt-4 font-display text-2xl font-bold">
          Know who’s still coming
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Ask guests to reconfirm before the big day. See changes in one place
          and plan with a headcount you can trust.
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
