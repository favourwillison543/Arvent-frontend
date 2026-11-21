import { SkeletonPage } from "@/components/ui/Skeleton";

/**
 * The route-level placeholder every screen falls back to while its chunk and
 * data stream in. It keeps the page column and the top rhythm of the page it is
 * standing in for, so nothing shifts sideways when the content arrives.
 */
export default function Loading() {
  return (
    <main className="min-h-dvh min-w-0 bg-background text-foreground">
      <SkeletonPage width="page" body="rows" count={4} />
    </main>
  );
}

