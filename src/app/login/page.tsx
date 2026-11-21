import { Suspense } from "react";

import { AuthRoute } from "@/components/auth/AuthRoute";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/*
 * There is no sign-in page any more: signing in is the dialog that every "Log
 * in" button opens (`components/auth/AuthDialog`), so this address only opens
 * that same card. It still has to answer, because `proxy.ts` redirects a refused
 * visitor to `/login?returnTo=…`.
 *
 * The page that used to be here is kept, commented out, rather than deleted:
 *
 * import AuthForm from "@/components/auth/AuthForm";
 *
 * export default function LoginPage() {
 *   // `useSearchParams` inside AuthForm needs a boundary; the fallback carries the
 *   // workspace tokens so the card never flashes the wrong appearance first.
 *   return (
 *     <Suspense fallback={<LoadingScreen className="organizer-workspace" />}>
 *       <AuthForm mode="login" />
 *     </Suspense>
 *   );
 * }
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen className="organizer-workspace" />}>
      <AuthRoute mode="login" />
    </Suspense>
  );
}

