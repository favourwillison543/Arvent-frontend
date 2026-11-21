import type { ReactNode } from "react";

/**
 * Guest-facing surface: invitations (`/e/[slug]`), event memories and the gate
 * check-in screen (`/g/[gateToken]`).
 *
 * These routes are public and carry their own full-screen theme (see
 * `ThemeShell`), so they sit outside `(workspace)` and guests never inherit the
 * organizer sidebar or bottom nav. A signed-in organizer is the exception: the
 * invitation wraps itself in `InvitationFrame`, which puts the workspace rail
 * back so the host can walk out of their own invitation.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
