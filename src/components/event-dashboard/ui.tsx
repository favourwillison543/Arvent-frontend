"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type {
  DashboardEvent,
  GuestPatch,
  NewGuest,
} from "./hooks/useEventDashboard";

/* ---------- Shared context (set by EventDashboardShell) ---------- */

export type DashboardCtx = {
  id: string;
  event: DashboardEvent;
  updateGuest: (guestId: string, patch: GuestPatch) => void;
  addGuest: (guest: NewGuest) => void;
  deleteGuest: (guestId: string) => void;
};

export const DashboardContext = createContext<DashboardCtx | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);

  if (!ctx)
    throw new Error("useDashboard must be used inside EventDashboardShell");
  return ctx;
}

/* ---------- Small helpers ---------- */

export function useCopy() {
  const [done, setDone] = useState("");

  const copy = useCallback(async (text: string, key = "x") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    setDone(key);
    setTimeout(() => setDone(""), 1800);
  }, []);

  return { done, copy };
}

/** 0803 123 4567 or +234 803... -> 2348031234567 */
export function normalizePhone(raw: string) {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  return digits;
}

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export const firstName = (name: string) => name.split(" ")[0];

export const originUrl = () =>
  typeof window === "undefined" ? "" : window.location.origin;

export function timeAgo(iso?: string) {
  if (!iso) return "";

  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
}

