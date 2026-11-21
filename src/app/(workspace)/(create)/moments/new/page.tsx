import { Suspense } from "react";
import type { Metadata } from "next";

import MomentEditor from "@/components/moments/MomentEditor";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/*
  Composing a Moment is an editor, not a marketing page: it lives in
  `(workspace)` beside `/create` so it gets the same frame (organizer sidebar
  on desktop, app bar + bottom nav on phones) and never the site navbar or
  footer. Its own tools are the shared `ActionRail`.
*/
export const metadata: Metadata = {
  title: { absolute: "Create a Moment | Arvent" },
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MomentEditor />
    </Suspense>
  );
}
