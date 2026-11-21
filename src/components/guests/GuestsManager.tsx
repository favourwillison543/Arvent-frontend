"use client";

import { Ellipsis } from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

import { fmtDate } from "@/components/create-event/format";
import Button from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import SectionHeader from "@/components/ui/SectionHeader";
import Select from "@/components/ui/Select";
import { useGuests } from "@/hooks/useGuests";
import { describeError } from "@/lib/http/errorMessage";

import type {
  DashboardGuest,
  DashboardRsvp,
} from "../event-dashboard/hooks/useEventDashboard";

import {
  firstName,
  normalizePhone,
  originUrl,
  timeAgo,
  useCopy,
  useDashboard,
  waLink,
} from "../event-dashboard/ui";
import { Pager } from "../event-dashboard/DashboardKit";

type Filter = "all" | DashboardRsvp;

const PAGE = 10;

const statuses: { id: DashboardRsvp; label: string; emoji: string }[] = [
  { id: "going", label: "Going", emoji: "👍" },
  { id: "maybe", label: "Maybe", emoji: "🤔" },
  { id: "pending", label: "Invited", emoji: "💌" },
  { id: "declined", label: "Can’t go", emoji: "😔" },
];

const rank: Record<DashboardRsvp, number> = { going: 0, maybe: 1, pending: 2, declined: 3 };

const menuItem =
  "flex w-full items-center rounded-field px-3 py-2.5 text-left text-sm font-medium hover:bg-muted";

export default function GuestManager() {
  const { event, updateGuest, addGuest, deleteGuest } = useDashboard();
  const { regenerateGuestToken, isRegeneratingToken } = useGuests(event.id);
  const { done, copy } = useCopy();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", plusOnes: 0 });
  const [managementLink, setManagementLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const d = event.draft;

  const linkFor = () => `${originUrl()}/e/${event.slug}`;
  const inviteText = (g: DashboardGuest) =>
    `Hi ${firstName(g.name)}, you're invited to ${d.title}${d.date ? ` on ${fmtDate(d.date)}` : ""}${d.venue ? ` at ${d.venue}` : ""}. RSVP here: ${linkFor()}`;

  const setRsvp = (g: DashboardGuest, rsvp: DashboardRsvp) =>
    updateGuest(g.id, { rsvp });

  const regenerateLink = async (guest: DashboardGuest) => {
    setMenu(null);
    if (!window.confirm(`Regenerate ${guest.name}’s RSVP management link? The previous management link will stop working.`)) return;
    try {
      const response = await regenerateGuestToken(guest.id);
      setManagementLink(new URL(response.manageUrl, window.location.origin).toString());
    } catch (cause) {
      // The workspace already mounts one toast stack (`AppToaster`); this screen
      // used to pin a second, hand-rolled one to the bottom of the viewport.
      toast.error(
        describeError(cause, "We couldn’t regenerate the RSVP management link."),
      );
    }
  };

  const add = () => {
    const name = form.name.trim();
    if (!name) return;
    addGuest({
      name,
      phone: normalizePhone(form.phone),
      plusOnes: form.plusOnes,
    });
    setForm({ name: "", phone: "", plusOnes: 0 });
    setPage(0);
  };

  const counts = (id: Filter) =>
    id === "all"
      ? event.guests.length
      : event.guests.filter((g) => g.rsvp === id).length;

  const all = event.guests
    .filter(
      (g) =>
        (filter === "all" || g.rsvp === filter) &&
        g.name.toLowerCase().includes(q.trim().toLowerCase()),
    )
    .sort((a, b) => rank[a.rsvp] - rank[b.rsvp] || a.name.localeCompare(b.name));

  const pages = Math.max(1, Math.ceil(all.length / PAGE));
  const safePage = Math.min(page, pages - 1);
  const list = all.slice(safePage * PAGE, safePage * PAGE + PAGE);

  return (
    <>
    <section>
      <SectionHeader
        title="Guest list"
        description={`${event.guests.length} invited · ${counts("going")} going`}
        actions={
          <Button size="sm" onClick={() => setAdding((a) => !a)}>
            {adding ? "Close" : "Add guest"}
          </Button>
        }
      />

      {adding && (
        <div className="mt-4 grid gap-3 rounded-panel bg-muted p-4 sm:grid-cols-2">
          <Input
            aria-label="Guest name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
          <Input
            aria-label="WhatsApp number"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="WhatsApp number"
          />
          <Select
            aria-label="Plus-ones"
            value={form.plusOnes}
            onChange={(e) =>
              setForm({ ...form, plusOnes: Number(e.target.value) })
            }
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "No plus-one" : `+${n} guest${n > 1 ? "s" : ""}`}
              </option>
            ))}
          </Select>
          <Button onClick={add}>Add to list</Button>
        </div>
      )}

      <label className="mt-5 flex h-12 items-center gap-3 rounded-full bg-muted px-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
        <input
          aria-label="Search guests"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Find a guest…"
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[{ id: "all" as Filter, label: "Everyone", emoji: "" }, ...statuses].map(
          (f) => (
            <Chip
              key={f.id}
              selected={filter === f.id}
              count={counts(f.id)}
              icon={f.emoji ? <span aria-hidden="true">{f.emoji}</span> : undefined}
              onClick={() => {
                setFilter(f.id);
                setPage(0);
              }}
            >
              {f.label}
            </Chip>
          ),
        )}
      </div>

      {all.length === 0 ? (
        <div className="mt-6 rounded-panel bg-muted px-6 py-14 text-center">
          <p className="text-4xl" aria-hidden="true">
            {event.guests.length === 0 ? "💌" : "🔍"}
          </p>
          <p className="mt-3 font-display text-base font-bold">
            {event.guests.length === 0 ? "No guests yet" : "No one matches"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.guests.length === 0
              ? "Add guests here, or share your invite link and let them RSVP."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-border rounded-panel bg-muted">
            {list.map((g) => (
              <li key={g.id} className="relative flex items-center gap-3 px-4 py-3">
                <Avatar name={g.name} size={44} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{g.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {g.plusOnes > 0 ? `+${g.plusOnes} guest · ` : ""}
                    {g.respondedAt ? timeAgo(g.respondedAt) : g.phone ? `+${g.phone}` : "No number"}
                  </p>
                </div>

                <Select
                  aria-label={`RSVP for ${g.name}`}
                  wrapperClassName="w-auto shrink-0"
                  value={g.rsvp}
                  onChange={(e) => setRsvp(g, e.target.value as DashboardRsvp)}
                >
                  {statuses.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.emoji} {r.label}
                    </option>
                  ))}
                </Select>

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`More options for ${g.name}`}
                  aria-expanded={menu === g.id}
                  onClick={() => setMenu(menu === g.id ? null : g.id)}
                  className="shrink-0 text-muted-foreground"
                >
                  <Ellipsis className="size-5" aria-hidden />
                </Button>

                {menu === g.id && (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setMenu(null)}
                      className="fixed inset-0 z-10 cursor-default"
                    />
                    <div className="absolute right-3 top-full z-20 mt-1 w-56 rounded-panel border border-border bg-surface p-1.5 shadow-2xl">
                      {g.phone && (
                        <a
                          href={waLink(g.phone, inviteText(g))}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setMenu(null)}
                          className={menuItem}
                        >
                          Message on WhatsApp
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={isRegeneratingToken}
                        onClick={() => void regenerateLink(g)}
                        className={menuItem}
                      >
                        {isRegeneratingToken ? "Generating link…" : "Regenerate RSVP management link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => copy(linkFor(), g.id)}
                        className={menuItem}
                      >
                        {done === g.id ? "Copied" : "Copy invite link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenu(null);
                          if (window.confirm(`Remove ${g.name}?`)) {
                            deleteGuest(g.id);
                          }
                        }}
                        className={`${menuItem} text-destructive-ink`}
                      >
                        Remove from list
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          <Pager
            page={safePage}
            size={PAGE}
            total={all.length}
            onPage={(p) => {
              setPage(p);
              setMenu(null);
            }}
          />
        </>
      )}
    </section>
    {managementLink && <Modal title="RSVP management link" onClose={() => { setManagementLink(""); setLinkCopied(false); }}>
      <p className="text-sm leading-6 text-muted-foreground">This link lets this guest manage their RSVP. The event invitation link remains the shared link for everyone.</p>
      <p className="mt-4 break-all rounded-field bg-muted p-3 text-sm">{managementLink}</p>
      <Button className="mt-4" onClick={() => { void navigator.clipboard.writeText(managementLink).then(() => setLinkCopied(true)); }}>{linkCopied ? "Copied" : "Copy management link"}</Button>
    </Modal>}
    </>
  );
}
