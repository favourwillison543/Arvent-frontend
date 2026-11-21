"use client";

import { useEffect } from "react";

import Button from "@/components/ui/Button";
import NoticeScreen from "@/components/ui/NoticeScreen";

/**
 * Last line of defence for anything that throws below the root layout: a failed
 * navigation (the API answered 503 while the session was being verified, a chunk
 * never arrived) lands here instead of Next's bare error screen. Must be a
 * client component, so it cannot import server-only helpers.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <NoticeScreen
      className="organizer-workspace"
      eyebrow="Something broke"
      title="This screen didn’t load."
      description="Nothing was lost — your drafts and RSVPs are safe. Try again, or head back to your events."
      tone="panel"
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <Button href="/home" variant="secondary">
            Go to home
          </Button>
        </>
      }
      note={error.digest ? `Reference: ${error.digest}` : undefined}
    />
  );
}

