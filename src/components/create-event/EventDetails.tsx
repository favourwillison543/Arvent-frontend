import type { ReactNode } from "react";

import DateField from "@/components/ui/DateField";
import FieldRow from "@/components/ui/FieldRow";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { EVENT_TITLE } from "@/components/ui/Container";
import { fonts } from "./themes";
import type { Errors, EventDraft, Update } from "./draft";

const eventTypes: [EventDraft["eventType"], string][] = [
  ["party", "Party"],
  ["birthday", "Birthday"],
  ["wedding", "Wedding"],
  ["ceremony", "Ceremony"],
  ["dinner", "Dinner"],
  ["conference", "Conference"],
  ["meetup", "Meetup"],
  ["other", "Other"],
];

/** Half-hour steps, 24h — the same strings the API stores (`18:00`). */
const times = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  return `${hour}:${index % 2 === 0 ? "00" : "30"}`;
});


export default function EventDetails({
  draft,
  update,
  errors,
  afterTitle,
}: {
  draft: EventDraft;
  update: Update;
  errors: Errors;
  afterTitle?: ReactNode;
}) {
  const font = fonts.find((f) => f.id === draft.fontId) ?? fonts[0];

  return (
    <div className="space-y-6">
      {/* Title + style. The title is the page, so it gets the display size and
          the font chips sit under it — pick the type, see it applied. The card
          is the one place in the form with air in it: everything under it is a
          tight stack of answers, so the two beats read as two beats. */}
      <div>
        <div className="rounded-panel border border-border bg-surface px-4 pb-2.5 pt-4 backdrop-blur-sticky transition-colors focus-within:border-foreground">
          <Input
            variant="bare"
            aria-label="Event name"
            value={draft.title}
            maxLength={60}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Untitled event"
            className={`${EVENT_TITLE} placeholder:text-foreground/60! ${font.className}`}
          />

          {/* The chip previews the font, so the four you did not pick are set in
              their own face with no pill around them: only the choice in play is
              filled. Six boxes at once would out-shout the title. */}
          <div
            className="mt-1.5 flex items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Title style"
          >
            {fonts.map((f) => {
              const on = f.id === draft.fontId;

              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update("fontId", f.id)}
                  className={[
                    "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-base font-semibold whitespace-nowrap transition-colors sm:min-h-9",
                    f.className,
                    on
                      ? "bg-foreground text-background"
                      : "text-foreground/75 hover:text-foreground",
                  ].join(" ")}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>
        {errors.title && (
          <p className="mt-1 px-1 text-2xs text-destructive-ink">
            {errors.title}
          </p>
        )}
      </div>

      {afterTitle}

      {/* The answers themselves, on Partiful's 6px rhythm: one stack, so the
          rows read as a single card of answers rather than eight loose fields.
          The title and this stack are the two beats of the form. */}
      <div className="space-y-1.5">
        <FieldRow icon="sparkle">
          <Select
            variant="bare"
            aria-label="Event type"
            value={draft.eventType}
            onChange={(e) =>
              update("eventType", e.target.value as EventDraft["eventType"])
            }
          >
            {eventTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldRow>

        {/* One row, three answers to "when": our own date grid and two half-hour
            pickers. The border belongs to the row, so it reads as one field.
            The widths are measured to fit one phone line at 375 — 104 + 76 + 76
            plus the dash and the gaps is 292 of the 311 inside the row — so
            neither `18:30` nor the date has to truncate. Under 350 it wraps. */}
        <FieldRow icon="calendar" error={errors.date}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <DateField
              value={draft.date}
              ariaLabel="Date"
              wrapperClassName="min-w-26 flex-1"
              onChange={(next) => update("date", next)}
            />

            <Select
              variant="bare"
              align="end"
              wrapperClassName="w-19 shrink-0"
              aria-label="Start time"
              value={draft.startTime}
              onChange={(event) => update("startTime", event.target.value)}
            >
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>

            <span aria-hidden="true" className="text-muted-foreground/60">
              –
            </span>

            <Select
              variant="bare"
              align="end"
              wrapperClassName="w-19 shrink-0"
              aria-label="End time"
              value={draft.endTime}
              onChange={(event) => update("endTime", event.target.value)}
            >
              <option value="">– –</option>
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
          </div>
        </FieldRow>

        <FieldRow icon="crown">
          <Input
            variant="bare"
            aria-label="Hosted by"
            value={draft.host}
            onChange={(e) => update("host", e.target.value)}
            placeholder="Hosted by (optional)"
          />
        </FieldRow>

        <FieldRow icon="pin" error={errors.venue}>
          <Input
            variant="bare"
            aria-label="Location"
            value={draft.venue}
            maxLength={200}
            onChange={(e) => update("venue", e.target.value)}
            placeholder="Location or venue"
          />
        </FieldRow>

        <FieldRow icon="pin">
          <Input
            variant="bare"
            aria-label="Address or area"
            value={draft.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Address or area (optional)"
          />
        </FieldRow>

        <FieldRow icon="people" error={errors.capacity}>
          <Input
            variant="bare"
            aria-label="Spots"
            type="number"
            min={1}
            max={100000}
            inputMode="numeric"
            value={draft.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            placeholder="Unlimited spots"
          />
        </FieldRow>

        <FieldRow icon="text" top error={errors.description}>
          <Textarea
            variant="bare"
            aria-label="Description"
            rows={3}
            maxLength={5000}
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe your event: dress code, parking, anything guests should know."
          />
        </FieldRow>
      </div>
    </div>
  );
}

