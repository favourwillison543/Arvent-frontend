import { SkeletonPage } from "@/components/ui/Skeleton";

/** The discover feed: a heading, then the card grid it is about to show. */
export default function Loading() {
  return (
    <main className="organizer-workspace min-h-dvh min-w-0 bg-background text-foreground">
      <SkeletonPage width="reading" body="cards" count={4} />
    </main>
  );
}
