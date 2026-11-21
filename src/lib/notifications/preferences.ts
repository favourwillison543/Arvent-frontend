/*
 * The organizer's notification choices for one event.
 *
 * The event payload has no fields for these yet, so the choice is kept on the
 * device that made it: `localStorage`, keyed by event id. Every screen reads and
 * writes through this module, so when the fields do land on the event only the
 * four functions below change - the settings screen and its toggles do not.
 *
 * Nothing here throws: a browser with storage disabled, a key a person edited
 * by hand, or a value from an older shape all fall back to the defaults.
 */

export type NotificationPreferences = {
  /** Email the organizer as each RSVP arrives. */
  notifyOnRsvp: boolean;
  /** Email the guests whenever the organizer posts an update. */
  notifyGuestsOnUpdate: boolean;
  /** Send guests one reminder before the day. */
  reminderEnabled: boolean;
  /** How many days ahead that reminder goes out. */
  reminderDaysBefore: number;
};

/** The lead times the settings screen offers. */
export const REMINDER_DAYS = [1, 2, 3, 7] as const;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  notifyOnRsvp: true,
  notifyGuestsOnUpdate: true,
  reminderEnabled: true,
  reminderDaysBefore: 2,
};

/** The snapshot the server render and a first visit both see. */
export const NOTIFICATION_DEFAULTS_SNAPSHOT = JSON.stringify(
  DEFAULT_NOTIFICATION_PREFERENCES,
);

const STORAGE_PREFIX = "arvent:notifications:v1:";

const keyFor = (eventId: string) => `${STORAGE_PREFIX}${eventId}`;

const listeners = new Set<() => void>();

/**
 * What this tab just saved.
 *
 * Storage can refuse a write (private mode, a full quota, a locked-down
 * browser). The value still applies for the life of the tab, so the switch the
 * host just moved never springs back while they are looking at it.
 */
const inMemory = new Map<string, string>();

function emit(): void {
  for (const listener of listeners) listener();
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** A stored value, read defensively: anything unusable becomes the default. */
export function parseNotificationPreferences(
  raw: string | null,
): NotificationPreferences {
  if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;

  try {
    const value = JSON.parse(raw) as Record<string, unknown> | null;
    const days = Number(value?.reminderDaysBefore);

    return {
      notifyOnRsvp: asBoolean(
        value?.notifyOnRsvp,
        DEFAULT_NOTIFICATION_PREFERENCES.notifyOnRsvp,
      ),
      notifyGuestsOnUpdate: asBoolean(
        value?.notifyGuestsOnUpdate,
        DEFAULT_NOTIFICATION_PREFERENCES.notifyGuestsOnUpdate,
      ),
      reminderEnabled: asBoolean(
        value?.reminderEnabled,
        DEFAULT_NOTIFICATION_PREFERENCES.reminderEnabled,
      ),
      reminderDaysBefore: REMINDER_DAYS.some((option) => option === days)
        ? days
        : DEFAULT_NOTIFICATION_PREFERENCES.reminderDaysBefore,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * The raw stored string, for `useSyncExternalStore`.
 *
 * A string compares by value, so the snapshot is stable between reads and React
 * does not re-render in a loop: callers parse it once per change.
 */
export function readNotificationSnapshot(eventId: string): string {
  const inThisTab = inMemory.get(eventId);

  if (inThisTab) return inThisTab;
  if (typeof window === "undefined") return NOTIFICATION_DEFAULTS_SNAPSHOT;

  try {
    return (
      window.localStorage.getItem(keyFor(eventId)) ??
      NOTIFICATION_DEFAULTS_SNAPSHOT
    );
  } catch {
    return NOTIFICATION_DEFAULTS_SNAPSHOT;
  }
}

export function saveNotificationPreferences(
  eventId: string,
  preferences: NotificationPreferences,
): void {
  const raw = JSON.stringify(preferences);

  inMemory.set(eventId, raw);

  try {
    window.localStorage.setItem(keyFor(eventId), raw);
  } catch {
    // Private mode or a full quota: the tab keeps the choice it just made.
  }

  emit();
}

export function resetNotificationPreferences(eventId: string): void {
  inMemory.delete(eventId);

  try {
    window.localStorage.removeItem(keyFor(eventId));
  } catch {
    // Nothing stored, nothing to remove.
  }

  emit();
}

/**
 * Subscribes to changes from this tab and from any other.
 *
 * `storage` never fires in the tab that wrote the value, so a save announces
 * itself directly; `storage` covers a second tab on the same event.
 */
export function subscribeToNotificationPreferences(
  listener: () => void,
): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    // `key` is null when another tab cleared storage outright.
    if (event.key === null) {
      inMemory.clear();
      listener();
      return;
    }

    if (!event.key.startsWith(STORAGE_PREFIX)) return;

    // Another tab wrote (or reset) this event: that value is the truth now, so
    // the copy this tab kept for a failed write must not shadow it.
    inMemory.delete(event.key.slice(STORAGE_PREFIX.length));
    listener();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
