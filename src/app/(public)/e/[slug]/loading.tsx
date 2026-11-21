import { SkeletonPage } from "@/components/ui/Skeleton";


export default function Loading() {
  return (
    <main className="min-h-dvh min-w-0 bg-background text-foreground">
      <SkeletonPage width="event" body="text" count={4} />
    </main>
  );
}
