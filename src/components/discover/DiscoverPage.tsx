"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useDiscoverEvents } from "@/hooks/useDiscoverEvents";
import { useInView } from "@/hooks/useInView";
import Button from "@/components/ui/Button";
import PageLayout from "@/components/ui/PageLayout";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { CARD_TITLE, SECTION_TITLE } from "@/components/ui/type";
import EventPreview from "@/components/create-event/EventPreview";
import { eventToDraft } from "@/components/create-event/eventToDraft";
import { fmtDate, fmtTime } from "@/components/create-event/format";

type PublicEvent = Parameters<typeof eventToDraft>[0] & {
  id: string;
  slug: string;
};

function Star({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5z" />
    </svg>
  );
}

function EventCard({
  event,
  index,
  seen,
}: {
  event: PublicEvent;
  index: number;
  seen: boolean;
}) {
  const draft = useMemo(() => eventToDraft(event), [event]);
  const [on, setOn] = useState(false);

  const time = draft.startTime ? fmtTime(draft.startTime) : "";
  const when = [fmtDate(draft.date), time].filter(Boolean).join(" at ");

  return (
    <div
      className={`group relative flex min-h-34 overflow-hidden rounded-panel border border-border bg-surface text-foreground transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(24,24,27,0.08)] motion-reduce:transition-none ${
        seen
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      }`}
      style={{ transitionDelay: seen ? `${index * 60}ms` : "0ms" }}
    >
      <div className="relative min-h-32 w-30 shrink-0 self-stretch overflow-hidden bg-muted sm:w-34">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="w-full scale-[1.15] transition-transform duration-700 group-hover:scale-[1.22]">
              <EventPreview draft={draft} />
            </div>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <h3 className={`line-clamp-2 ${CARD_TITLE}`}>
            <Link
              href={`/e/${event.slug}`}
              aria-label={`View ${event.name}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {event.name}
            </Link>
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            {when}
            {draft.venue ? ` · ${draft.venue}` : ""}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Open to RSVP</span>

          <button
            type="button"
            aria-pressed={on}
            aria-label={`${on ? "Remove interest in" : "Mark interested in"} ${event.name}`}
            onClick={() => setOn((v) => !v)}
            className={`relative z-10 flex size-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              on
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 text-foreground hover:bg-muted"
            }`}
          >
            <Star on={on} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const query = useDiscoverEvents();
  const events = query.data ?? [];

  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.1,
  });

  return (
    <main className="organizer-workspace relative isolate min-h-dvh min-w-0 overflow-hidden bg-background text-foreground">
      <PageLayout width="reading">
        <section className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.05rem)] font-bold leading-[1.02] tracking-[-0.035em]">
            Events worth{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              showing up for.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Public events from hosts on Arvent. Tap one you like, and RSVP
            in seconds. No account needed.
          </p>
        </section>

        {query.isLoading ? (
          <SkeletonCards count={4} className="mx-auto max-w-5xl" />
        ) : query.error ? (
          <div role="alert" className="rounded-sheet border border-border bg-surface p-6">
            <h2 className={SECTION_TITLE}>We couldn’t load events right now</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again in a moment.
            </p>
            <Button onClick={() => void query.refetch()} size="sm" className="mt-4">
              Try again
            </Button>
          </div>
        ) : events.length ? (
          <section
            ref={section}
            className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4"
          >
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} seen={seen} />
            ))}
          </section>
        ) : (
          <div className="rounded-sheet border border-dashed border-border bg-surface p-10 text-center">
            <h2 className="font-display text-2xl font-bold">No public events just yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon, or start planning a gathering of your own.
            </p>
            <Button href="/create" size="md" className="mt-5">
              Create an event
            </Button>
          </div>
        )}
      </PageLayout>
    </main>
  );
}