"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { defaultDraft, type EventDraft } from "./draft";

const DRAFT_STORAGE_KEY = "arvent-create-event-draft";

type StoredDraft = {
  draft?: EventDraft;
  hasDraft?: boolean;
  editingId?: string | null;
};

/** Read the saved draft once, outside of React's render path. */
function readStoredDraft(): StoredDraft | null {
  try {
    const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);

    return saved ? (JSON.parse(saved) as StoredDraft) : null;
  } catch {
    return null;
  }
}

type DraftState = {
  draft: EventDraft;
  setDraft: Dispatch<SetStateAction<EventDraft>>;
  hasDraft: boolean;
  setHasDraft: (value: boolean) => void;
  /** Id of the event this draft was loaded from (null = brand new event) */
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  isDraftHydrated: boolean;
  clearDraft: () => void;
};

const DraftContext = createContext<DraftState | null>(null);

export function CreateDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<EventDraft>(defaultDraft);
  const [hasDraft, setHasDraft] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  // Restore the draft once when the provider mounts. The update is wrapped in
  // a transition: it is a restore, not a render-time derivation, and must not
  // block the first paint of the builder.
  useEffect(() => {
    const stored = readStoredDraft();

    startTransition(() => {
      if (stored?.draft) {
        setDraft({ ...defaultDraft, ...stored.draft });
        setHasDraft(stored.hasDraft ?? true);
        setEditingId(stored.editingId ?? null);
      }

      setIsDraftHydrated(true);
    });
  }, []);

  // Save changes only after the initial restoration finishes.
  useEffect(() => {
    if (!isDraftHydrated) return;

    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ draft, hasDraft, editingId }),
      );
    } catch {
      // Storage may be unavailable or full.
    }
  }, [draft, hasDraft, editingId, isDraftHydrated]);

  const clearDraft = useCallback(() => {
    setDraft(defaultDraft);
    setHasDraft(false);
    setEditingId(null);

    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore unavailable storage.
    }
  }, []);

  const value = useMemo<DraftState>(
    () => ({
      draft,
      setDraft,
      hasDraft,
      setHasDraft,
      editingId,
      setEditingId,
      isDraftHydrated,
      clearDraft,
    }),
    [draft, hasDraft, editingId, isDraftHydrated, clearDraft],
  );

  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
}

export function useCreateDraft() {
  const context = useContext(DraftContext);

  if (!context) {
    throw new Error("useCreateDraft must be used inside CreateDraftProvider");
  }

  return context;
}