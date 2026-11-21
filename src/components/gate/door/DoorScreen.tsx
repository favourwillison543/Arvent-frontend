"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  KeyRound,
  Search,
  UserPlus,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import ThemeShell from "@/components/create-event/ThemeShell";
import { fmtDate, fmtTime } from "@/components/create-event/format";
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import FloatingBar from "@/components/ui/FloatingBar";
import Input from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DASH_WRAP } from "@/components/event-dashboard/gutters";
import NoticeScreen from "@/components/ui/NoticeScreen";
import { CARD_TITLE } from "@/components/ui/type";
import { useEventDashboard } from "@/components/event-dashboard/hooks/useEventDashboard";
import { GateAccessManager } from "@/components/gate/GateAccessManager";
import { useGateList } from "@/hooks/useGateList";
import type { GateGuest } from "@/lib/types/gate";

type View = "waiting" | "in" | "all";

type DoorGuestItem = GateGuest & {
  passReference?: string | null;
  checkedInSeats?: number;
  remainingSeats?: number;
  walkIn?: boolean;
};

type DoorSummary = {
  expected?: number;
  checkedIn?: number;
  checkedInSeats?: number;
  confirmedSeats?: number;
  capacity?: number;
  spotsLeft?: number;
};

const PAGE = 20;

const initial = (g: DoorGuestItem) => (g.name.trim()[0] ?? "#").toUpperCase();

const checkedSeatsOf = (g: DoorGuestItem) =>
  g.checkedInSeats ?? g.checkedInCount ?? 0;

const remainingSeatsOf = (g: DoorGuestItem) =>
  typeof g.remainingSeats === "number"
    ? Math.max(0, g.remainingSeats)
    : Math.max(0, g.seats - checkedSeatsOf(g));

export default function DoorScreen() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);

  const {
    event,
    checkIn: checkInGuest,
    addWalkIn: addWalkInGuest,
    loading: eventLoading,
    missing,
    errorMessage: eventError,
  } = useEventDashboard(id);
  const door = useGateList(id);
  const loading = eventLoading || door.isLoading;

  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("all");
  const [letter, setLetter] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [showAccess, setShowAccess] = useState(false);
  const [walkIn, setWalkIn] = useState("");
  const [sheet, setSheet] = useState<"walkin" | null>(null);
  const [lastIn, setLastIn] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!lastIn) return;

    const timer = window.setTimeout(() => setLastIn(null), 6000);
    return () => window.clearTimeout(timer);
  }, [lastIn]);

  const closeWalkIn = () => {
    setWalkIn("");
    setSheet(null);
  };

  if (loading) {
    return <LoadingScreen className="workspace-theme" />;
  }

  const failure = eventError ?? door.errorMessage;

  if (failure) {
    return (
      <NoticeScreen
        eyebrow="Door list"
        title="We couldn’t open the door list"
        description={failure}
        actions={
          <>
            <Button onClick={() => window.location.reload()}>Try again</Button>
            <Button href={`/events/${id}`} variant="ghost">
              Back to event
            </Button>
          </>
        }
      />
    );
  }

  if (missing || !event) {
    return (
      <NoticeScreen
        eyebrow="Event"
        title="Event not found"
        description="Ask the host for a fresh door link."
      />
    );
  }

  const draft = event.draft;
  const rows = door.guests as DoorGuestItem[];
  const summary = (door as typeof door & { summary?: DoorSummary }).summary;

  const arrived =
    summary?.checkedInSeats ??
    summary?.checkedIn ??
    door.attendance?.checkedIn ??
    0;
  const expected =
    summary?.expected ??
    summary?.confirmedSeats ??
    door.attendance?.expected ??
    0;
  const remainingExpected = Math.max(0, expected - arrived);
  const when = [fmtDate(draft.date), fmtTime(draft.startTime)]
    .filter(Boolean)
    .join(" · ");
  const query = q.trim().toLowerCase();

  const checkIn = (guest: DoorGuestItem) => {
    checkInGuest(guest.id, remainingSeatsOf(guest) || guest.seats);
    setLastIn({ id: guest.id, name: guest.name });
  };

  const addWalkIn = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return;

    addWalkInGuest({ name, seats: 1 });

    setLastIn({ id: name, name });
    setWalkIn("");
    setSheet(null);
  };

  const base = rows
    .filter((guest) => {
      if (query && !guest.name.toLowerCase().includes(query)) {
        return false;
      }

      if (view === "waiting") return remainingSeatsOf(guest) > 0;
      if (view === "in") return remainingSeatsOf(guest) === 0;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const letters = Array.from(new Set(base.map(initial))).sort();
  const activeLetter = letter && letters.includes(letter) ? letter : null;

  const filtered = activeLetter
    ? base.filter((guest) => initial(guest) === activeLetter)
    : base;

  const shown = filtered.slice(0, limit);
  const remaining = filtered.length - shown.length;

  const countFor = (selectedView: View) =>
    rows.filter((guest) => {
      if (selectedView === "waiting") return remainingSeatsOf(guest) > 0;
      if (selectedView === "in") return remainingSeatsOf(guest) === 0;
      return true;
    }).length;

  const views: { id: View; label: string }[] = [
    { id: "all", label: "Everyone" },
    { id: "waiting", label: "Expected" },
    { id: "in", label: "Arrived" },
  ];

  const resetFilters = () => {
    setQ("");
    setLetter(null);
    setLimit(PAGE);
  };

  const nobody = rows.length === 0;

  const emptyTitle =
    query || activeLetter
      ? "No one matches that"
      : nobody
        ? "No guests yet"
        : view === "in"
          ? "Nobody has arrived yet"
          : "Everyone is in";

  const emptyBody =
    query || activeLetter
      ? "Check the spelling, or search another name."
      : nobody
        ? "The guest list fills up as people RSVP. Anyone who turns up tonight can be added below."
        : view === "in"
          ? "Check guests in and they will show up here."
          : "Every expected guest is already inside. Add a walk-in if someone arrives without an RSVP.";

  return (
    <ThemeShell draft={{ ...draft, effectId: "none" }}>
      <main className="ev-dash min-h-dvh pb-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+3rem)] text-foreground">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
          <div
            className={`${DASH_WRAP} flex h-14 items-center justify-between gap-4`}
          >
            <Link
              href={`/events/${id}`}
              className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              <span className="truncate">Back to event</span>
            </Link>

            <Button size="sm" variant="outline" onClick={() => setSheet("walkin")}>
              <UserPlus className="size-4" aria-hidden />
              Add walk-in
            </Button>
          </div>
        </header>

        {/* Header & tally */}
        <section className={`${DASH_WRAP} pt-7 pb-6`}>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Door list{when ? ` · ${when}` : ""}
              </p>
              <h1 className="mt-1 break-words font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {draft.title || "Untitled event"}
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

        {/* Gate access */}
        <section className={DASH_WRAP}>
          <button
            type="button"
            aria-expanded={showAccess}
            onClick={() => setShowAccess((open) => !open)}
            className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm transition hover:opacity-80"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <KeyRound
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="font-medium text-foreground">Gate access</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Usher links
              </span>
            </span>

            <ChevronDown
              aria-hidden
              className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                showAccess ? "rotate-180" : ""
              }`}
            />
          </button>

          {showAccess && (
            <div className="pb-5 pt-2">
              <GateAccessManager eventId={id} compact />
            </div>
          )}
        </section>

        {/* Guest list */}
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
                      setLetter(null);
                      setLimit(PAGE);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="tabular-nums opacity-75">
                      {countFor(item.id)}
                    </span>
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
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setLetter(null);
                  setLimit(PAGE);
                }}
                placeholder="Search guest"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {q && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={resetFilters}
                  className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
          </div>

          {letters.length > 1 && (
            <div className="mt-3 flex flex-wrap items-center gap-1">
              {letters.map((item) => {
                const active = activeLetter === item;

                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setLetter(active ? null : item);
                      setLimit(PAGE);
                    }}
                    className={`size-7 rounded-full text-xs font-medium transition ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}

          {shown.length > 0 ? (
            <ul className="mt-3 divide-y divide-border/60">
              {shown.map((guest) => {
                const checked = checkedSeatsOf(guest);
                const remSeats = remainingSeatsOf(guest);
                const inHouse = remSeats === 0;

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

                    {inHouse ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-status-going">
                        <Check
                          className="size-3.5"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        In
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => checkIn(guest)}
                      >
                        Check in
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-14 text-center">
              <p className={CARD_TITLE}>{emptyTitle}</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                {emptyBody}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSheet("walkin")}
              >
                <UserPlus className="size-4" aria-hidden /> Add walk-in
              </Button>
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

              {remaining > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLimit((current) => current + PAGE)}
                >
                  Show {Math.min(PAGE, remaining)} more
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSheet("walkin")}
                  className="inline-flex items-center gap-1.5 font-medium text-foreground underline underline-offset-4 transition hover:opacity-75"
                >
                  <UserPlus className="size-3.5" aria-hidden /> Add walk-in
                </button>
              )}
            </div>
          )}
        </section>

        {/* Check-in confirmation */}
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

        {/* Walk-in modal */}
        {sheet === "walkin" && (
          <Modal title="Add a walk-in" onClose={closeWalkIn}>
            <div className="space-y-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Add their name to the list. They will be registered and checked
                in immediately.
              </p>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  addWalkIn(walkIn);
                }}
              >
                <div className="space-y-2">
                  <Input
                    id="walkin-name"
                    label="Guest name"
                    autoFocus
                    autoComplete="name"
                    required
                    value={walkIn}
                    onChange={(e) => setWalkIn(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={closeWalkIn}>
                    Cancel
                  </Button>

                  <Button type="submit" disabled={!walkIn.trim()}>
                    Add & check in
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </main>
    </ThemeShell>
  );
}