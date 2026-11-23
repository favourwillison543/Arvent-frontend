"use client";

import { Check, Search, X } from "lucide-react";
import { toast } from "sonner";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { useGateList } from "@/hooks/useGateList";
import { openGateSession } from "@/lib/api/gate";
import { describeError } from "@/lib/http/errorMessage";
import type { GateGuest, GateSession } from "@/lib/types/gate";
import { isAdmission } from "./GateGuestCard";
import { DASH_WRAP } from "@/components/event-dashboard/gutters";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import NoticeScreen from "@/components/ui/NoticeScreen";
import FloatingBar from "@/components/ui/FloatingBar";

type GateView = "waiting" | "inside" | "all";

type GateItemRow = GateGuest & {
  passReference?: string | null;
  checkedInSeats?: number;
  remainingSeats?: number;
  walkIn?: boolean;
};

type GateSummary = {
  expected?: number;
  checkedIn?: number;
  checkedInSeats?: number;
  confirmedSeats?: number;
  capacity?: number;
  spotsLeft?: number;
};

const PAGE = 20;

const checkedSeatsOf = (guest: GateItemRow) =>
  guest.checkedInSeats ?? guest.checkedInCount ?? 0;

const remainingSeatsOf = (guest: GateItemRow) =>
  typeof guest.remainingSeats === "number"
    ? Math.max(0, guest.remainingSeats)
    : Math.max(0, guest.seats - checkedSeatsOf(guest));

export function GatePage() {
  const { gateToken: gateCode } = useParams<{ gateToken: string }>();
  const searchParams = useSearchParams();
  const linkedEventId = searchParams.get("eventId") || "";

  const [search, setSearch] = useState("");
  const [view, setView] = useState<GateView>("all");
  const [limit, setLimit] = useState(PAGE);
  const [lastIn, setLastIn] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [sessionError, setSessionError] = useState("");
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const [session, setSession] = useState<GateSession | null>(null);
  const [sessionReady, setSessionReady] = useState(!gateCode);
  const sessionRun = useRef(0);

  const startSession = useCallback(async () => {
    if (!gateCode) {
      setSessionReady(true);
      return;
    }

    const run = ++sessionRun.current;

    setSessionReady(false);
    setSessionError("");

    try {
      const answer = await openGateSession(decodeURIComponent(gateCode));
      if (run === sessionRun.current) setSession(answer ?? null);
    } catch (cause) {
      if (run !== sessionRun.current) return;
      setSessionError(
        describeError(cause, "That gate code was not accepted."),
      );
    } finally {
      if (run === sessionRun.current) setSessionReady(true);
    }
  }, [gateCode]);

  useEffect(() => {
    queueMicrotask(() => void startSession());

    return () => {
      sessionRun.current += 1;
    };
  }, [startSession]);

  useEffect(() => {
    if (!lastIn) return;
    const timer = window.setTimeout(() => setLastIn(null), 6000);
    return () => window.clearTimeout(timer);
  }, [lastIn]);

  const eventId = session?.event?.id || linkedEventId;
  const gateState = useGateList(eventId, search, {
    enabled: sessionReady && Boolean(eventId),
  });

  const {
    event,
    attendance,
    guests,
    isLoading,
    error,
    refetch,
    checkIn,
    isCheckingIn,
  } = gateState;

  const summary = (gateState as typeof gateState & { summary?: GateSummary })
    .summary;

  const retry = () => {
    void (async () => {
      await startSession();
      await refetch();
    })();
  };

  const handleConfirmRevoke = () => {
    setIsRevoking(true);
    try {
      setSession(null);
      setRevokeModalOpen(false);
      toast("Gate session closed for this device.");
    } finally {
      setIsRevoking(false);
    }
  };

  const eventName = event?.name || session?.event?.name || "Untitled event";

  const rows = guests as GateItemRow[];

  const totals = useMemo(
    () => ({
      expected: rows.reduce((sum, guest) => sum + guest.seats, 0),
      checkedIn: rows.reduce((sum, guest) => sum + checkedSeatsOf(guest), 0),
    }),
    [rows],
  );

  const counts = useMemo(() => {
    const inside = rows.filter((guest) => remainingSeatsOf(guest) === 0).length;

    return {
      all: rows.length,
      inside,
      waiting: rows.length - inside,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    if (view === "all") return rows;

    return rows.filter((guest) =>
      view === "inside"
        ? remainingSeatsOf(guest) === 0
        : remainingSeatsOf(guest) > 0,
    );
  }, [view, rows]);

  if (!gateCode && !eventId) {
    return (
      <NoticeScreen
        eyebrow="Gate link"
        title="This gate link is incomplete"
        description="Ask the organizer for a fresh gate link. The link needs its event reference to open the right guest list."
      />
    );
  }

  if (!sessionReady || isLoading) return <LoadingScreen />;

  if (!eventId) {
    return (
      <NoticeScreen
        eyebrow="Gate link"
        title="This gate link is missing its event"
        description={
          sessionError ||
          "Ask the organizer for a fresh gate link — it has to carry the event it opens."
        }
      />
    );
  }

  if (error) {
    return (
      <NoticeScreen
        eyebrow="Gate list"
        title="Can’t open this gate list"
        description={
          sessionError ||
          "This link may have been revoked or expired. Ask the organizer for a new one."
        }
        actions={
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
        }
      />
    );
  }

  const arrived =
    summary?.checkedInSeats ??
    summary?.checkedIn ??
    attendance?.checkedIn ??
    totals.checkedIn;
  const expected =
    summary?.expected ??
    summary?.confirmedSeats ??
    attendance?.expected ??
    totals.expected;
  const remainingExpected = Math.max(0, expected - arrived);

  const shown = filtered.slice(0, limit);
  const remainingRows = filtered.length - shown.length;

  const views: { id: GateView; label: string; count: number }[] = [
    { id: "all", label: "Everyone", count: counts.all },
    { id: "waiting", label: "Expected", count: counts.waiting },
    { id: "inside", label: "Arrived", count: counts.inside },
  ];

  const emptyMessage = search
    ? "No guests match that search."
    : view === "waiting"
      ? "Everyone expected is already inside."
      : view === "inside"
        ? "Nobody has come in yet."
        : "There are no confirmed guests yet.";

  const handleCheckIn = (guest: GateItemRow, seats: number) => {
    void checkIn({
      guestId: guest.id,
      data: { seats, ...(isAdmission(guest) ? { admit: true } : {}) },
    }).then(
      () => setLastIn({ id: guest.id, name: guest.name }),
      (cause: unknown) =>
        toast.error(
          describeError(cause, "That check-in didn’t go through. Try again."),
        ),
    );
  };

  return (
    <main className="min-h-dvh pb-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+3rem)] text-foreground">
      <section className={`${DASH_WRAP} pt-7 pb-6`}>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Door list
            </p>
            <h1 className="mt-1 break-words font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {eventName}
            </h1>
          </div>

          <div className="flex shrink-0 items-baseline gap-6">
            <div>
              <span className="block text-xs text-muted-foreground">
                Checked in
              </span>
              <span className="mt-0.5 block font-display text-2xl font-bold leading-none tabular-nums">
                {arrived}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {expected}
                </span>
              </span>
            </div>

            <div>
              <span className="block text-xs text-muted-foreground">
                Remaining
              </span>
              <span className="mt-0.5 block font-display text-2xl font-bold leading-none tabular-nums">
                {remainingExpected}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={`${DASH_WRAP} mt-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Filter the guest list"
            className="flex items-center gap-1.5"
          >
            {views.map((item) => {
              const active = view === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setView(item.id);
                    setLimit(PAGE);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="tabular-nums opacity-75">{item.count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex h-10 w-full items-center gap-2 rounded-full border border-border/80 px-3.5 focus-within:border-foreground/50 sm:w-64">
            <Search
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              aria-label="Search guests by name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Search guest"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setLimit(PAGE);
                }}
                className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {shown.length > 0 ? (
          <ul className="mt-3 divide-y divide-border/60">
            {shown.map((guest) => {
              const checked = checkedSeatsOf(guest);
              const remainingSeats = remainingSeatsOf(guest);
              const fullyIn = remainingSeats === 0;
              const partialIn = checked > 0 && !fullyIn;

              return (
                <li
                  key={guest.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={guest.name} size={38} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium sm:text-[15px]">
                        {guest.name}
                      </p>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span className="tabular-nums">
                          {checked}/{guest.seats}
                        </span>

                        {guest.passReference && (
                          <span className="tabular-nums">
                            · {guest.passReference}
                          </span>
                        )}

                        {guest.walkIn && <span>· Walk-in</span>}
                      </div>
                    </div>
                  </div>

                  {fullyIn ? (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-status-going">
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                      In
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isCheckingIn}
                        onClick={() => handleCheckIn(guest, 1)}
                      >
                        {partialIn ? "+1 in" : "Check in"}
                      </Button>

                      {remainingSeats > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isCheckingIn}
                          onClick={() => handleCheckIn(guest, remainingSeats)}
                        >
                          All ({remainingSeats})
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-14 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-2 flex items-center justify-between gap-4 pt-4 text-xs text-muted-foreground">
            <p>
              Showing{" "}
              <span className="font-medium tabular-nums text-foreground">
                {shown.length}
              </span>{" "}
              of{" "}
              <span className="font-medium tabular-nums text-foreground">
                {filtered.length}
              </span>
            </p>

            {remainingRows > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLimit((current) => current + PAGE)}
              >
                Show {Math.min(PAGE, remainingRows)} more
              </Button>
            )}
          </div>
        )}
      </section>

      {revokeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-gate-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onClick={() => !isRevoking && setRevokeModalOpen(false)}
        >
          <div
            className="w-full max-w-sm border border-border bg-background p-5 text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Door list</p>
                <h2
                  id="revoke-gate-title"
                  className="mt-0.5 font-display text-lg font-bold tracking-tight"
                >
                  End gate session?
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                disabled={isRevoking}
                onClick={() => setRevokeModalOpen(false)}
                className="text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              This closes the active gate session on this device. You can reopen
              the door list again using a valid gate link.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isRevoking}
                onClick={() => setRevokeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isRevoking}
                onClick={handleConfirmRevoke}
              >
                {isRevoking ? "Closing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {lastIn && (
        <FloatingBar announce>
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </span>

          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {lastIn.name} checked in
          </span>

          <button
            type="button"
            className="shrink-0 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            onClick={() => setLastIn(null)}
          >
            Dismiss
          </button>
        </FloatingBar>
      )}
    </main>
  );
}