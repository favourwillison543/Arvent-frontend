import { SkeletonPage } from "@/components/ui/Skeleton";

/** The Moments page: its own title, then the wall of cards. */
export default function Loading() {
  return (
    <main className="min-h-dvh min-w-0 bg-background text-foreground">
      <SkeletonPage width="page" body="cards" count={6} />
    </main>
  );
}
