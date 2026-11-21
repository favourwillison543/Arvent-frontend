import { SkeletonPage } from "@/components/ui/Skeleton";

/**
 * The event dashboard. The shell draws the event's own hero, so this only fills
 * the panel area below it with rows.
 */
export default function Loading() {
  return (
    <div className="ev-dash min-h-dvh">
      <SkeletonPage width="event" heading={false} body="rows" count={4} />
    </div>
  );
}
