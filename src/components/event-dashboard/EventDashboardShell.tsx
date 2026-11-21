"use client";

import type { ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";

import { useEventDashboard } from "./hooks/useEventDashboard";
import EventHeader from "./EventHeader";
import { DashboardContext } from "./ui";
import ThemeShell from "../create-event/ThemeShell";
import Button from "@/components/ui/Button";
import NoticeScreen from "@/components/ui/NoticeScreen";
import EventSectionNav from "./EventSectionNav";
import EventDashboard from "./EventDashboard";
import { DASH_WRAP } from "./gutters";
import { ActionsProvider } from "./EventActions";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ApiError } from "@/lib/http/errors";

type Tab =
  | "overview"
  | "guests"
  | "reconfirm"
  | "updates"
  | "memories"
  | "notifications";

const TABS: Tab[] = [
  "guests",
  "reconfirm",
  "updates",
  "memories",
  "notifications",
];

// Tabs whose page is a modal. The overview is drawn behind them.
const MODAL_TABS: Tab[] = ["reconfirm", "updates"];

const WRAP = DASH_WRAP;

/** The tab a path belongs to, e.g. `/events/abc/guests` → `guests`. */
export function tabFromPath(pathname: string): Tab {
  return TABS.find((tab) => pathname.endsWith(`/${tab}`)) ?? "overview";
}

/**
 * The mounted shell for one event. It lives in the `(dashboard)` layout so the
 * hero, the tab bar and the action rail stay on screen while the tabs change.
 */
export default function EventDashboardShell({ children }: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const id = String(params.id);
  const active = tabFromPath(pathname);
  const {
    event,
    updateGuest,
    addGuest,
    deleteGuest,
    loading,
    missing,
    error,
    errorMessage,
    notes,
    retry,
  } = useEventDashboard(id);

  if (loading) {
    return <LoadingScreen className="workspace-theme" />;
  }

  /*
   * A status, not "not found". The same rejection used to read "We couldn't find
   * this event" — 404, 403 and an expired session all sounded like the event had
   * been deleted, so an organizer whose session had simply ended went looking for
   * a mistake that wasn't there.
   */
  if (errorMessage) {
    const status = error instanceof ApiError ? error.status : 0;
    const signedOut = status === 401;
    const forbidden = status === 403;

    return (
      <NoticeScreen
        eyebrow={signedOut ? "Session ended" : forbidden ? "No access" : "Something went wrong"}
        title={
          signedOut
            ? "Sign in to open this event"
            : forbidden
              ? "You don’t have access to this event"
              : "We couldn’t open this event"
        }
        description={errorMessage}
        actions={
          signedOut ? (
            <Button href={`/login?returnTo=${encodeURIComponent(pathname)}`}>
              Log in
            </Button>
          ) : (
            <>
              <Button onClick={retry}>Try again</Button>
              <Button href="/events" variant="ghost">
                All events
              </Button>
            </>
          )
        }
      />
    );
  }

  if (missing || !event) {
    return (
      <NoticeScreen
        eyebrow="Event"
        title="Event not found"
        description="We couldn’t find this event on this device."
        actions={
          <Button href="/create">Create an event</Button>
        }
      />
    );
  }

  const modal = MODAL_TABS.includes(active);

  /*
   * The host's screen for the event is the event itself, so it keeps the theme
   * the host designed: same palette, art, scene and effect as the invitation.
   * `ev-dash` only swaps the card wash for the invitation's panel plate,
   * because guest rows and menus have to stay readable over the artwork. The
   * organizer's own chrome (sidebar, tab bar) sits outside this shell and keeps
   * the workspace appearance.
   */
  return (
    <ThemeShell draft={event.draft}>
      <DashboardContext.Provider
        value={{ id, event, updateGuest, addGuest, deleteGuest }}
      >
        {/* The rail lives here so it shows on every tab and never remounts. */}
        <ActionsProvider>
          {/* `pr-[148px]` is the fixed action rail's footprint at `lg`: it keeps
              the page's text from running under the rail. It measures the rail,
              so it is not a step on the 4px layout grid below. */}
          <main className="ev-dash min-h-dvh pb-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+7rem)] lg:pb-24 lg:pr-[148px]">
          <EventHeader nav={<EventSectionNav active={active} />} />
          <div className="mb-6" />

            {/* Guests and the door list load next to the event. When one of
                them fails the event still opens, so the failure is reported
                here instead of replacing the whole dashboard. */}
            {notes.length > 0 && (
              <div className={`${WRAP} mb-6`}>
                <div className="flex flex-wrap items-center gap-3 rounded-panel border border-border bg-surface/80 px-4 py-3 text-sm">
                  <p className="min-w-0 flex-1 text-muted-foreground">
                    {notes.join(" ")}
                  </p>
                  <Button variant="outline" size="sm" onClick={retry}>
                    Try again
                  </Button>
                </div>
              </div>
            )}
            <div className={`${WRAP} text-foreground`}>
              {modal && <EventDashboard />}
              {children}
            </div>
          </main>
        </ActionsProvider>
      </DashboardContext.Provider>
    </ThemeShell>
  );
}

