"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Button from "@/components/ui/Button";
import { ActionRail, RailButton } from "@/components/ui/ActionRail";
import { Chip } from "@/components/ui/Chip";
import Select from "@/components/ui/Select";
import { computeStats } from "@/lib/utils/seats";
import type {
  DashboardGuest,
  DashboardRsvp,
} from "./hooks/useEventDashboard";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo, useCopy, useDashboard } from "./ui";
import { Glyph, Pager } from "./DashboardKit";
import { EdgeSheet } from "@/components/ui/Modal";
import UpdatesPage from "./UpdatesPage";
import { useDeleteEvent, useDuplicateEvent } from "@/hooks/useEvents";


type Panel = "guests" | "invite" | "more" | "updates" | null;
type GuestFilter = "all" | "going" | "maybe" | "declined";

const GUEST_PAGE = 8;

const guestFilters: { id: GuestFilter; label: string; status?: DashboardRsvp }[] = [
  { id: "going", label: "Going", status: "going" },
  { id: "maybe", label: "Maybe", status: "maybe" },
  { id: "declined", label: "Can’t go", status: "declined" },
  { id: "all", label: "Everyone" },
];

/* ------------------------------------------------------------------ */
/* Context: lets any tab open the guest panel (e.g. "View all")        */
/* ------------------------------------------------------------------ */

const ActionsContext = createContext<{ open: (panel: Panel) => void } | null>(null);

export function useActions() {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error("useActions must be used inside <ActionsProvider>");
  return ctx;
}

/**
 * Wrap every dashboard tab in this. It renders the action rail and the
 * panels once, so they show up on Overview, Guests, Reconfirm and Updates.
 */
export function ActionsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { event } = useDashboard();
  const [panel, setPanel] = useState<Panel>(null);
  const going = computeStats(event.guests, event.draft.capacity).going;
  const value = useMemo(() => ({ open: setPanel }), []);
const editEvent = () => {
  router.push(`/create?editId=${encodeURIComponent(event.id)}`);
};


  return (
    <ActionsContext.Provider value={value}>
      {children}
      <ActionRail label="Event actions">
        <RailButton
          label="Edit"
          onClick={editEvent}
          icon={<Glyph name="edit" size={24} />}
        />
        <RailButton
          label="Blast"
          onClick={() => setPanel("updates")}
          icon={<Glyph name="blast" size={24} />}
        />
        <RailButton
          label=""
          figure={{ value: going, label: "Going" }}
          onClick={() => setPanel("guests")}
        />
        <RailButton
          label="Invite"
          onClick={() => setPanel("invite")}
          icon={<Glyph name="invite" size={24} />}
        />
        <RailButton
          label="More"
          onClick={() => setPanel("more")}
          icon={<Glyph name="more" size={24} />}
        />
      </ActionRail>
      {panel === "guests" && <GuestPanel onClose={() => setPanel(null)} />}
      {panel === "invite" && <InviteDialog onClose={() => setPanel(null)} />}
      {panel === "more" && <MoreMenu onClose={() => setPanel(null)} onEdit={editEvent} />}
      {panel === "updates" && <UpdatesPage onClose={() => setPanel(null)} />}
    </ActionsContext.Provider>
  );
}

/* ------------------------------------------------------------------ */

function GuestPanel({ onClose }: { onClose: () => void }) {
  const { event, updateGuest } = useDashboard();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GuestFilter>("going");
  const [page, setPage] = useState(0);
  const counts = computeStats(event.guests, event.draft.capacity);

  const all = event.guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(query.toLowerCase().trim());
    return matchesSearch && (filter === "all" || guest.rsvp === filter);
  });
  const pages = Math.max(1, Math.ceil(all.length / GUEST_PAGE));
  const safePage = Math.min(page, pages - 1);
  const guests = all.slice(safePage * GUEST_PAGE, safePage * GUEST_PAGE + GUEST_PAGE);

  const updateRsvp = (guest: DashboardGuest, rsvp: DashboardRsvp) => {
    updateGuest(guest.id, { rsvp });
  };

  return (
    <EdgeSheet title="Manage guests" onClose={onClose}>
        <label className="flex h-12 items-center gap-3 rounded-full bg-muted px-5">
          <Glyph name="search" size={20} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            aria-label="Find a guest"
            placeholder="Find a guest…"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {guestFilters.map((item) => {
            const count = item.id === "all" ? counts.invited : item.status === "going" ? counts.going : item.status === "maybe" ? counts.maybe : counts.declined;
            return (
              <Chip
                key={item.id}
                selected={filter === item.id}
                count={count}
                onClick={() => { setFilter(item.id); setPage(0); }}
              >
                {item.label}
              </Chip>
            );
          })}
        </div>

        <ul className="mt-5 divide-y divide-border">
          {guests.map((guest) => (
            <li key={guest.id} className="flex flex-wrap items-center gap-3 py-3.5">
              <Avatar name={guest.name} size={48} />
              <span className="min-w-0 flex-1 truncate font-semibold">{guest.name}</span>
              <Select
                aria-label={`RSVP status for ${guest.name}`}
                wrapperClassName="w-auto shrink-0"
                value={guest.rsvp}
                onChange={(e) => updateRsvp(guest, e.target.value as DashboardRsvp)}
              >
                <option value="going">Going</option>
                <option value="maybe">Maybe</option>
                <option value="declined">Can’t go</option>
                <option value="pending">Invited</option>
              </Select>
              <span className="w-20 text-right text-xs text-muted-foreground">{guest.respondedAt ? timeAgo(guest.respondedAt) : "Invited"}</span>
            </li>
          ))}
          {!guests.length && <li className="py-14 text-center text-sm text-muted-foreground">No guests in this view.</li>}
        </ul>

        <Pager page={safePage} size={GUEST_PAGE} total={all.length} onPage={setPage} />
    </EdgeSheet>
  );
}

function InviteDialog({ onClose }: { onClose: () => void }) {
  const { event } = useDashboard();
  const { done, copy } = useCopy();
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/e/${event.slug}`;
  const inviteText = encodeURIComponent(`You're invited to ${event.draft.title}. Join here: ${url}`);
  return (
    <EdgeSheet title="Invite your guests" onClose={onClose}>
      <div className="grid size-16 place-items-center rounded-panel bg-foreground text-background">
        <Glyph name="invite" size={32} />
      </div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        Share one event link with everyone. Anyone with the link can view the invitation.
      </p>
      <div className="mt-7 flex flex-col gap-3">
        <Button onClick={() => void copy(url, "invite")}>
          <Glyph name="link" size={18} />
          {done === "invite" ? "Copied" : "Copy link"}
        </Button>
        <Button
          variant="outline"
          href={`https://wa.me/?text=${inviteText}`}
          target="_blank"
          rel="noreferrer"
        >
          Share on WhatsApp
        </Button>
      </div>
    </EdgeSheet>
  );
}


function MoreMenu({ onClose, onEdit }: { onClose: () => void; onEdit: () => void }) {
  const router = useRouter();
  const { id } = useDashboard();
  const { duplicateEvent, isDuplicating } = useDuplicateEvent();
  const { deleteEvent, isDeleting } = useDeleteEvent();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const duplicate = async () => {
    try {
      const copy = await duplicateEvent(id);
      router.push(`/events/${copy.id}`);
    } catch {
      window.alert("We couldn’t duplicate this event. Please try again.");
    }
  };
  const remove = async () => {
    setDeleteError("");
    try {
      await deleteEvent(id);
      router.replace("/home");
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "We couldn’t delete this event.");
      setConfirmDelete(false);
    }
  };
  /* The delete confirmation takes over the same drawer instead of stacking a
     second dialog over it — two washes read as a broken dismissal. */
  if (confirmDelete) {
    return (
      <EdgeSheet title="Delete this event?" onClose={() => setConfirmDelete(false)}>
        <p className="text-sm leading-6 text-muted-foreground">
          This permanently deletes the event and its guest list. This action can’t be undone.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void remove()}
            className="rounded-full bg-destructive px-4 py-3 text-sm font-bold text-brand-foreground disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete event"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-full border border-border px-4 py-3 text-sm font-semibold"
          >
            Keep event
          </button>
        </div>
      </EdgeSheet>
    );
  }

  return (
    <EdgeSheet title="Event options" onClose={onClose}>
      <div className="flex flex-col gap-1">
        <button type="button" onClick={onEdit} className="flex w-full items-center gap-3 rounded-field p-3 text-left hover:bg-muted"><Glyph name="edit" size={20} />Edit event details</button>
        <Link href={`/events/${id}/gate`} onClick={onClose} className="flex items-center gap-3 rounded-field p-3 hover:bg-muted"><Glyph name="invite" size={20} />Door check-in settings</Link>
        <Link href={`/events/${id}/reconfirm`} onClick={onClose} className="flex items-center gap-3 rounded-field p-3 hover:bg-muted"><Glyph name="bell" size={20} />Guest reminders</Link>
        <Link href={`/events/${id}/notifications`} onClick={onClose} className="flex items-center gap-3 rounded-field p-3 hover:bg-muted"><Glyph name="bell" size={20} />Notification settings</Link>
        <button type="button" disabled={isDuplicating} onClick={() => void duplicate()} className="flex w-full items-center gap-3 rounded-field p-3 text-left hover:bg-muted disabled:opacity-50"><Glyph name="plus" size={20} />{isDuplicating ? "Duplicating…" : "Duplicate event"}</button>
        <button type="button" onClick={() => setConfirmDelete(true)} className="flex w-full items-center gap-3 rounded-field p-3 text-left text-destructive-ink hover:bg-muted">Delete event</button>
        {deleteError && <p role="alert" className="mt-3 px-3 text-sm text-destructive-ink">{deleteError}</p>}
      </div>
    </EdgeSheet>
  );
}
