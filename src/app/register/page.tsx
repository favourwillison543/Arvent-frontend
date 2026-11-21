import { Suspense } from "react";

import { AuthRoute } from "@/components/auth/AuthRoute";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/*
 * Same as `/login`: the route stays as an address for `OrganizerGate`, which
 * sends a refused visitor to `/register?returnTo=…`, and it opens the dialog
 * instead of drawing a second sign-up page next to the modal.
 *
 * What used to be here, kept commented out rather than deleted:
 *
 * import AuthForm from "@/components/auth/AuthForm";
 *
 * export default function RegisterPage() {
 *   // Same boundary as /login: the fallback carries the workspace tokens.
 *   return (
 *     <Suspense fallback={<LoadingScreen className="organizer-workspace" />}>
 *       <AuthForm mode="register" />
 *     </Suspense>
 *   );
 * }
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingScreen className="organizer-workspace" />}>
      <AuthRoute mode="register" />
    </Suspense>
  );
}

