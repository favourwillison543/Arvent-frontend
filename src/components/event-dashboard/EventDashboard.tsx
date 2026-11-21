"use client";

import { Sparkles } from "lucide-react";

import Link from "next/link";
import { useMemo } from "react";
import Button from "@/components/ui/Button";
import {
  RsvpGlyph,
  rsvpValues,
} from "@/components/create-event/rsvpSymbols";
import { computeStats } from "@/lib/utils/seats";
import { Avatar } from "@/components/ui/Avatar";
import SectionHeader from "@/components/ui/SectionHeader";
import { timeAgo, useDashboard } from "./ui";
import { useActions } from "./EventActions";
import { Glyph } from "./DashboardKit";
import { useEventMemories } from "@/hooks/useMemories";

function MemoriesCard() {
  const { event } = useDashboard();
  const { gallery } = useEventMemories(event.id);
  const count = gallery?.total ?? 0;
  const enabled = event.memoryContributionsEnabled ?? true;
  const recent = (gallery?.photos ?? []).slice(0, 4);

  return (
    <section className="rounded-sheet border border-border bg-surface p-5 sm:p-6">
      <SectionHeader
        align="start"
        eyebrow="Event memories"
        title="Keep the good moments together"
        description={
          <>
            {count} photos ·{" "}
            {enabled ? "Guest contributions on" : "Contributions paused"}
          </>
        }
        icon={
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-xl">
            <Sparkles className="size-5" aria-hidden />
          </span>
        }
      />

      {recent.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {recent.map((photo) => (
            <span
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-panel bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailUrl || photo.url}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/events/${event.id}/memories`}
        className="mt-5 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-85"
      >
        Manage memories
      </Link>
    </section>
  );
}

function EventActivity() {
  const { event } = useDashboard();

  const activity = event.guests
    .flatMap((guest) => {
      const entries: { at: string; text: string }[] = [];

      if (guest.respondedAt) {
        entries.push({
          at: guest.respondedAt,
          text: `${guest.name} RSVP’d ${
            guest.rsvp === "declined" ? "Can’t go" : guest.rsvp
          }`,
        });
      }

      if (guest.checkedInAt) {
        entries.push({
          at: guest.checkedInAt,
          text: `${guest.name} checked in`,
        });
      }

      return entries;
    })
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 8);

  return (
    <section>
      <SectionHeader
        title="Activity"
        description={`${activity.length} recent updates`}
      />
      <ul className="mt-4 space-y-1">
        {activity.length ? (
          activity.map((item, index) => (
            <li
              key={`${item.at}-${index}`}
              className="flex items-center gap-3 rounded-field px-1 py-2.5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                <Glyph name="bell" size={18} />
              </span>
              <span className="min-w-0 flex-1 text-sm">{item.text}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(item.at)}
              </span>
            </li>
          ))
        ) : (
          <li className="py-5 text-sm text-muted-foreground">
            Event activity will show up here as guests respond.
          </li>
        )}
      </ul>
    </section>
  );
}

export default function EventDashboard() {
  const { event } = useDashboard();
  const { open } = useActions();
  const stats = computeStats(event.guests, event.draft.capacity);
  const draft = event.draft;
  const values = rsvpValues(draft);

  const goingGuests = useMemo(
    () => event.guests.filter((guest) => guest.rsvp === "going"),
    [event.guests],
  );

  const statusItems = [
    {
      label: "Going",
      glyph: values.rsvpGoing,
      value: stats.going,
      color: "var(--status-going)",
    },
    {
      label: "Maybe",
      glyph: values.rsvpMaybe,
      value: stats.maybe,
      color: "var(--status-maybe)",
    },
    {
      label: "Can’t go",
      glyph: values.rsvpNo,
      value: stats.declined,
      color: "var(--status-declined)",
    },
  ];

  return (
    <div className="w-full text-foreground">
      {/* 1. The three answers, in one row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {statusItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => open("guests")}
            className="flex flex-col items-center gap-2 rounded-panel border border-border bg-surface px-2.5 py-3.5 text-center transition hover:opacity-90 sm:flex-row sm:gap-3 sm:px-4 sm:text-left"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-surface sm:size-12"
              style={{
                boxShadow: `inset 0 0 22px color-mix(in srgb, ${item.color} 28%, transparent)`,
              }}
            >
              <RsvpGlyph mode={draft.rsvpMode} value={item.glyph} size={24} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl font-bold leading-none">
                {item.value}
              </span>
              <span className="mt-0.5 block text-2xs font-semibold text-muted-foreground">
                {item.label}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* 2. Guests and activity on the left, memories on the right — the hero's
          columns, so the memories card sits under the poster and the activity
          under the title instead of on a grid of its own. */}
      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="min-w-0 space-y-10 lg:col-span-7">
          <section>
            <SectionHeader
              title="Guest list"
              description={`${stats.going} going`}
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="!text-[color:var(--ink)]"
                  onClick={() => open("guests")}
                >
                  View all
                </Button>
              }
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {goingGuests.slice(0, 10).map((guest) => (
                <Avatar key={guest.id} name={guest.name} size={32} />
              ))}

              {goingGuests.length > 10 && (
                <button
                  type="button"
                  onClick={() => open("guests")}
                  className="grid size-8 place-items-center rounded-full bg-muted text-sm font-semibold text-foreground"
                >
                  +{goingGuests.length - 10}
                </button>
              )}

              {!goingGuests.length && (
                <p className="text-sm text-muted-foreground">
                  The guest list will appear here when people RSVP.
                </p>
              )}
            </div>
          </section>

          <EventActivity />
        </div>

        <aside className="min-w-0 lg:col-span-5 lg:col-start-8">
          <MemoriesCard />
        </aside>
      </div>
    </div>
  );
}