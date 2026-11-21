import { SkeletonPage } from "@/components/ui/Skeleton";

/** The organizer home: the welcome block, then the event rows under it. */
export default function Loading() {
  return (
    <main className="organizer-workspace min-h-dvh min-w-0 bg-background text-foreground">
      <SkeletonPage width="page" body="rows" count={4} />
    </main>
  );
}
