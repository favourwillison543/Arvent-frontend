"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import Select from "@/components/ui/Select";
import { Toggle } from "@/components/create-event/controls";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  REMINDER_DAYS,
} from "@/lib/notifications/preferences";

import { useDashboard } from "./ui";

/*
 * What the host is told, and what their guests are told.
 *
 * Three switches, no save button: each one is written the moment it changes, so
 * there is no half-applied state to explain and no "did that stick?" on a phone
 * in a venue. The eye reads top-down as "me, then my guests, then the day".
 */

const ROW = "p-4";

export default function NotificationSettingsPage() {
  const { event } = useDashboard();
  const { preferences, update, reset } = useNotificationPreferences(event.id);

  const isDefault =
    preferences.notifyOnRsvp === DEFAULT_NOTIFICATION_PREFERENCES.notifyOnRsvp &&
    preferences.notifyGuestsOnUpdate ===
      DEFAULT_NOTIFICATION_PREFERENCES.notifyGuestsOnUpdate &&
    preferences.reminderEnabled ===
      DEFAULT_NOTIFICATION_PREFERENCES.reminderEnabled &&
    preferences.reminderDaysBefore ===
      DEFAULT_NOTIFICATION_PREFERENCES.reminderDaysBefore;

  const resetAll = () => {
    reset();
    toast.success("Notification settings are back to the defaults.");
  };

  return (
    <section className="max-w-2xl">
      <SectionHeader
        title="Notifications"
        description="What Arvent emails you, and what it sends the people you invited."
      />

      <div className="mt-4 divide-y divide-border rounded-panel border border-border bg-surface">
        <div className={ROW}>
          <Toggle
            label="Tell me about every RSVP"
            hint="One email each time someone answers, so the guest list never has to be refreshed to be believed."
            checked={preferences.notifyOnRsvp}
            onChange={(notifyOnRsvp) => update({ notifyOnRsvp })}
          />
        </div>

        <div className={ROW}>
          <Toggle
            label="Email guests when I post an update"
            hint="Updates go to everyone still marked as coming, not to the people who declined."
            checked={preferences.notifyGuestsOnUpdate}
            onChange={(notifyGuestsOnUpdate) => update({ notifyGuestsOnUpdate })}
          />
        </div>

        <div className={ROW}>
          <Toggle
            label="Remind guests before the day"
            hint="One reminder, sent to the guests who said they are coming."
            checked={preferences.reminderEnabled}
            onChange={(reminderEnabled) => update({ reminderEnabled })}
          />

          {/* The lead time only exists while the reminder does: a picker that
              changes nothing is a control that lies about what it does. */}
          {preferences.reminderEnabled && (
            <div className="mt-4 flex items-center justify-between gap-4 border-l-2 border-border pl-4">
              <div>
                <p className="text-sm font-medium">Send it</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Counted back from the event&rsquo;s date.
                </p>
              </div>

              <Select
                aria-label="How long before the event the reminder goes out"
                wrapperClassName="w-40 shrink-0"
                value={preferences.reminderDaysBefore}
                onChange={(e) =>
                  update({ reminderDaysBefore: Number(e.target.value) })
                }
              >
                {REMINDER_DAYS.map((days) => (
                  <option key={days} value={days}>
                    {days === 1 ? "1 day before" : `${days} days before`}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-xs leading-snug text-muted-foreground">
          Saved on this device for {event.draft.title}. Email delivery uses the
          address on your account.
        </p>

        {!isDefault && (
          <Button variant="ghost" size="sm" onClick={resetAll}>
            <RotateCcw className="size-4" aria-hidden /> Reset
          </Button>
        )}
      </div>
    </section>
  );
}
