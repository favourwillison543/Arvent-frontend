"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  appearanceCookie,
  appearanceFromCookie,
  DEFAULT_APPEARANCE,
  isAppearance,
  resolveAppearance,
  type Appearance,
  type ResolvedAppearance,
} from "@/lib/theme/appearance";

/**
 * One store for the organizer appearance, shared by every consumer.
 *
 * The source of truth on first render is `<html data-appearance-preference>`,
 * which `appearanceInitScript` writes before the first paint. Changes are
 * mirrored to a cookie so the next full page load starts in the right theme.
 */

type AppearanceValue = {
  /** What the organizer picked: light, dark or system. */
  appearance: Appearance;
  /** What that resolves to right now (system can flip to dark). */
  resolved: ResolvedAppearance;
  setAppearance: (next: Appearance) => void;
};

const listeners = new Set<() => void>();
let preference: Appearance | null = null;
let resolved: ResolvedAppearance | null = null;

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DARK_QUERY).matches
  );
}

function storedPreference(): Appearance {
  if (typeof document === "undefined") return DEFAULT_APPEARANCE;

  const fromMarkup = document.documentElement.dataset.appearancePreference;
  if (isAppearance(fromMarkup)) return fromMarkup;

  // The bootstrap script was blocked or the markup was rendered without it.
  return appearanceFromCookie(document.cookie);
}

function notify() {
  for (const listener of listeners) listener();
}

function apply(next: Appearance) {
  const nextResolved = resolveAppearance(next, systemPrefersDark());
  const changed = preference !== next || resolved !== nextResolved;

  preference = next;
  resolved = nextResolved;

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.dataset.appearance = nextResolved;
    root.dataset.appearancePreference = next;
  }

  if (changed) notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getPreference(): Appearance {
  if (preference === null) preference = storedPreference();
  return preference;
}

function getResolved(): ResolvedAppearance {
  if (resolved === null) {
    resolved = resolveAppearance(getPreference(), systemPrefersDark());
  }
  return resolved;
}

function getServerPreference(): Appearance {
  return DEFAULT_APPEARANCE;
}

function getServerResolved(): ResolvedAppearance {
  return DEFAULT_APPEARANCE;
}

const AppearanceContext = createContext<AppearanceValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const appearance = useSyncExternalStore(
    subscribe,
    getPreference,
    getServerPreference,
  );
  const resolvedAppearance = useSyncExternalStore(
    subscribe,
    getResolved,
    getServerResolved,
  );

  const setAppearance = useCallback((next: Appearance) => {
    if (typeof document !== "undefined") {
      document.cookie = appearanceCookie(next);
    }
    apply(next);
  }, []);

  useEffect(() => {
    // Reconcile the DOM with storage (covers a disabled bootstrap script).
    apply(getPreference());

    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      if (getPreference() === "system") apply("system");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo<AppearanceValue>(
    () => ({
      appearance,
      resolved: resolvedAppearance,
      setAppearance,
    }),
    [appearance, resolvedAppearance, setAppearance],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used inside <AppearanceProvider>");
  return ctx;
}
