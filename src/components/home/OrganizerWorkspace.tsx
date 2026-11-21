
import type { ReactNode } from "react";
import HomeSidebar from "@/components/home/HomeSidebar";
import ThemeHint from "@/components/theme/ThemeHint";

/**
 * Shared application frame for organizer routes.
 *
 * Two things live here and nowhere else: the dvh canvas (`min-h-dvh`, not
 * `min-h-dvh`, so a phone's collapsing URL bar does not jump the page — the
 * brief's "use 100dvh instead of 100vh") and the space the mobile tab bar needs.
 * That space is `pb-float`, read from `--bottom-nav-h`, the same number
 * `HomeSidebar` draws its bar from. Pages inside this frame therefore add no
 * bottom padding of their own; before, `SettingsPage` added `pb-28` and
 * `DiscoverPage` added `pb-32` on top of this frame's `pb-20`, so a phone
 * scrolled through 190-210px of empty space under the last element.
 */
export default function OrganizerWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="organizer-workspace flex min-h-dvh bg-dashboard">
      <HomeSidebar />

      <main className="min-h-dvh min-w-0 flex-1 pb-float lg:pb-12">
        {children}
      </main>

      {/* One nudge per device, two seconds in, that dark mode exists. */}
      <ThemeHint />
    </div>
  );
}
