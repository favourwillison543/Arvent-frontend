"use client";

import { ChipLink } from "@/components/ui/Chip";
import { computeStats } from "@/lib/utils/seats";

import { useDashboard } from "./ui";

type Section =
  | "overview"
  | "guests"
  | "reconfirm"
  | "updates"
  | "memories"
  | "notifications";

export default function EventSectionNav({ active }: { active: Section }) {
  const { event, id } = useDashboard();
  const stats = computeStats(event.guests, event.draft.capacity);
  const tabs = [
    { id: "overview", label: "Overview", href: `/events/${id}` },
    { id: "guests", label: "Guests", href: `/events/${id}/guests`, count: stats.invited },
    { id: "reconfirm", label: "Reconfirm", href: `/events/${id}/reconfirm`, count: stats.awaiting },
    { id: "memories", label: "Memories", href: `/events/${id}/memories` },
    { id: "notifications", label: "Notifications", href: `/events/${id}/notifications` },
  ] as const;

  // Every pill here is the shared `Chip` — these used to be `ev-chip` with
  // `!px-4 !py-2 !text-sm` important overrides, which is how the section nav and
  // the guest filters ended up with two different pill heights on one screen.
  return (
    <nav
      aria-label="Event sections"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => (
        <ChipLink
          key={tab.id}
          href={tab.href}
          selected={tab.id === active}
          count={"count" in tab ? tab.count : undefined}
        >
          {tab.label}
        </ChipLink>
      ))}
      <ChipLink href={`/events/${id}/gate`}>Door check-in</ChipLink>
      {/* The organizer's own copy of the preview: the page guests actually
          open, with the theme, so it can be checked without a stranger. */}
      <ChipLink href={`/e/${event.slug}`} target="_blank" rel="noreferrer">
        View invitation
      </ChipLink>
    </nav>
  );
}

