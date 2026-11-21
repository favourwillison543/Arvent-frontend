import { cx } from "@/lib/utils/cx";
import PageLayout, { type PageWidth } from "./PageLayout";

/**
 * The loading state, as a shape rather than a spinner.
 *
 * A centred spinner tells the reader nothing about what is coming, and it makes
 * every screen's first paint look like the same screen. These placeholders take
 * the shape of the content that is already on its way — a card grid, a list of
 * rows, a page opening — so the layout does not jump when the data lands.
 *
 * They are decorative: the container carries `aria-busy` and one `sr-only`
 * "Loading" sentence, so a screen reader hears the state once.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("animate-pulse bg-muted motion-reduce:animate-none", className)}
    />
  );
}

/** Lines of text. The last one is short, the way a paragraph ends. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cx("space-y-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cx(
            "h-3 rounded-sm",
            index === lines - 1 ? "w-2/3" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

/** One card: `rounded-sheet` like the panels around it, a media band, two lines. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-sheet border border-border bg-surface",
        className,
      )}
    >
      <Skeleton className="h-32" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4 rounded-sm" />
        <Skeleton className="h-3 w-1/2 rounded-sm" />
      </div>
    </div>
  );
}

/** The shape of the discover feed and any other card grid. */
export function SkeletonCards({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cx("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** The shape of a guest list, a door list, a set of settings rows. */
export function SkeletonRows({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cx("divide-y divide-border", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5 rounded-sm" />
            <Skeleton className="h-3 w-1/4 rounded-sm" />
          </div>
          <Skeleton className="h-8 w-16 shrink-0 rounded-panel" />
        </div>
      ))}
    </div>
  );
}

/**
 * A whole page opening: an eyebrow, a title, one supporting line and a body.
 *
 * Used by `loading.tsx`, which replaces a route's content while it streams — so
 * it renders a `div`, not a `main`, and takes the route's own column.
 */
export function SkeletonPage({
  width = "event",
  heading = true,
  body = "rows",
  count = 5,
  className,
}: {
  /** The column the real page uses, so the shapes land in the same place. */
  width?: PageWidth;
  /** `false` for a route whose own chrome already draws the title. */
  heading?: boolean;
  body?: "rows" | "cards" | "text";
  count?: number;
  className?: string;
}) {
  return (
    <PageLayout width={width} className={cx("pb-16", className)}>
      <div role="status" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading</span>

        {heading && (
          <div>
            <Skeleton className="h-2.5 w-24 rounded-sm" />
            <Skeleton className="mt-4 h-9 w-2/3 max-w-md rounded-panel" />
            <Skeleton className="mt-4 h-3 w-full max-w-lg rounded-sm" />
            <Skeleton className="mt-2 h-3 w-1/2 max-w-sm rounded-sm" />
          </div>
        )}

        <div className={heading ? "mt-10" : ""}>
          {body === "cards" ? (
            <SkeletonCards count={count} />
          ) : body === "text" ? (
            <SkeletonText lines={count} />
          ) : (
            <SkeletonRows count={count} />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
