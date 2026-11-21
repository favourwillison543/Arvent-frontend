/* The event draft: the single shape every create, preview and edit screen mutates. */

import type { EventType } from "@/lib/types/event";
export type EventDraft = {
  memoriesEnabled: boolean | undefined;
  memoriesAccess: "public" | "invitees" | undefined;
  memoriesStorageLimitBytes: number | undefined;
  memoriesPhotoLimit: number | undefined;
  memoriesPhotosPerGuest: 1 | 2 | undefined;
  title: string;
  eventType: EventType;
  fontId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  host: string;
  venue: string;
  address: string;
  description: string;
  posterId: string;
  image: string; // uploaded poster (data URL), "" to use a template
  themeId: string;
  effectId: string;
  visibility: "public" | "private";
  capacity: string; // "" = unlimited
  showGuestList: boolean;
  plusOnes: number;
  requireApproval: boolean;
  askWhatsapp: boolean;
  allowMaybe: boolean;
  rsvpStyleId: string; // preset id, or "custom"
  rsvpMode: "icons" | "emojis";
  rsvpGoing: string;
  rsvpMaybe: string;
  rsvpNo: string;
  background?: string;
themeImage?: string;
};

export type Update = <K extends keyof EventDraft>(
  key: K,
  value: EventDraft[K],
) => void;

export type Errors = Partial<
  Record<"title" | "date" | "venue" | "description" | "capacity", string>
>;

export const defaultDraft: EventDraft = {
  title: "",
  eventType: "party",
  fontId: "classic",
  date: "",
  startTime: "18:00",
  endTime: "",
  host: "",
  venue: "",
  address: "",
  description: "",
  // A new event starts light. The dark themes are a choice the host makes once
  // they have seen their own title on the page — not the default they land on.
  posterId: "minimal-ink",
  image: "",
  themeId: "paper",
  effectId: "glow",
  visibility: "public",
  capacity: "",
  showGuestList: true,
  plusOnes: 1,
  requireApproval: false,
  askWhatsapp: false,
  allowMaybe: true,
  rsvpStyleId: "classic",
  rsvpMode: "icons",
  rsvpGoing: "check",
  rsvpMaybe: "clock",
  rsvpNo: "x",
  memoriesEnabled: undefined,
  memoriesAccess: undefined,
  memoriesStorageLimitBytes: undefined,
  memoriesPhotoLimit: undefined,
  memoriesPhotosPerGuest: undefined
};
