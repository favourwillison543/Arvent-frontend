import type { ReactNode } from "react";

import HomeSidebar from "@/components/home/HomeSidebar";

/**
 * The invitation is public, and it wears the same frame as every other page on
 * the site: the sidebar on a desktop, the tab bar on a phone.
 *
 * The rail is not organizer-only. A guest gets the public version of it — Home,
 * Explore, Create event, and Log in instead of the profile — and a signed-in
 * organizer gets their own account block. `HomeSidebar` reads the session
 * itself and already draws both states, so nothing here has to decide.
 */
export default function InvitationFrame({ children }: { children: ReactNode }) {
  return (
    <div className="invitation-frame organizer-workspace flex min-h-dvh bg-dashboard">
      <HomeSidebar />

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
