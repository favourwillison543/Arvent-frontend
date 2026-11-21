
import { Spinner } from "@/components/ui/Spinner";

/**
 * Full-page loading state. Colours come from whatever token set is in scope, so
 * it follows the organizer appearance on workspace routes and the invitation
 * theme on guest routes.
 */
export function LoadingScreen({ className = "" }: { className?: string }) {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className={`grid min-h-dvh w-full place-items-center bg-background text-foreground ${className}`}
    >
      <Spinner label="Loading" />
    </main>
  );
}
