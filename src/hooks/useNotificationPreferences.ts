"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  NOTIFICATION_DEFAULTS_SNAPSHOT,
  parseNotificationPreferences,
  readNotificationSnapshot,
  resetNotificationPreferences,
  saveNotificationPreferences,
  subscribeToNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notifications/preferences";

/**
 * The notification choices saved for one event.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: the stored value
 * is already there on the first client render, so the toggles never flash their
 * defaults on a reload, and a second tab on the same event stays in step. The
 * server render sees the defaults, which is what the markup ships with.
 */
export function useNotificationPreferences(eventId: string) {
  const snapshot = useSyncExternalStore(
    subscribeToNotificationPreferences,
    () => readNotificationSnapshot(eventId),
    () => NOTIFICATION_DEFAULTS_SNAPSHOT,
  );

  const preferences = useMemo(
    () => parseNotificationPreferences(snapshot),
    [snapshot],
  );

  /** One toggle at a time: a patch is applied to what is stored right now. */
  const update = useCallback(
    (patch: Partial<NotificationPreferences>) => {
      saveNotificationPreferences(eventId, {
        ...parseNotificationPreferences(readNotificationSnapshot(eventId)),
        ...patch,
      });
    },
    [eventId],
  );

  const reset = useCallback(
    () => resetNotificationPreferences(eventId),
    [eventId],
  );

  return { preferences, update, reset };
}
