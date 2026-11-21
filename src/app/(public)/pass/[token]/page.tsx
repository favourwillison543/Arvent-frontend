import { Suspense } from "react";
import type { Metadata } from "next";

import { GuestPassPage } from "@/components/guest-pass/GuestPassPage";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The pass is a document, not a page of the site: it prints, it saves, and it
 * reads on a phone at the door. So it keeps the invitation's theme but not the
 * site frame — no sidebar to print, no navigation to get lost in.
 *
 * The link carries the guest token, so it stays out of search and does not leak
 * the pass's address to wherever it was linked from.
 */
export const metadata: Metadata = {
  title: { absolute: "Your guest pass | Arvent" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  // `useSearchParams` reads `?e=<slug>`; the boundary keeps the route static-safe.
  return (
    <Suspense fallback={<LoadingScreen />}>
      <GuestPassPage />
    </Suspense>
  );
}
