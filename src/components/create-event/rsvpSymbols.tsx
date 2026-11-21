/* Visual RSVP sets: the icon families and emoji set a host can pick from. */

import { iconPaths } from "@/components/ui/Icon";
import type { GuestRsvpStatus } from "@/lib/types/guest";
import type { EventDraft } from "./draft";

export const rsvpStyles = [
  {
    id: "classic",
    name: "Classic",
    going: "check",
    maybe: "clock",
    no: "x",
    emojis: ["✅", "🤔", "❌"],
  },
  {
    id: "bloom",
    name: "Bloom",
    going: "flower",
    maybe: "bud",
    no: "leaf",
    emojis: ["🌷", "🌸", "🌿"],
  },
  {
    id: "flirty",
    name: "Flirty",
    going: "lips",
    maybe: "sparkle",
    no: "heart-break",
    emojis: ["💋", "✨", "💔"],
  },
  {
    id: "hearts",
    name: "Hearts",
    going: "heart",
    maybe: "heart-pulse",
    no: "heart-break",
    emojis: ["💗", "💓", "💔"],
  },
  {
    id: "celebrate",
    name: "Celebrate",
    going: "confetti",
    maybe: "star",
    no: "x",
    emojis: ["🎉", "⭐", "🙅"],
  },
  {
    id: "night-out",
    name: "Night out",
    going: "moon",
    maybe: "sparkle",
    no: "x",
    emojis: ["🌙", "✨", "🚫"],
  },
];

export const rsvpIcons = [
  "check",
  "clock",
  "x",
  "star",
  "sparkle",
  "heart",
  "heart-pulse",
  "heart-break",
  "flower",
  "bud",
  "lips",
  "leaf",
  "music",
  "balloon",
  "clover",
  "sun",
  "moon",
  "crown",
  "flame",
  "confetti",
];

const rsvpPaths: Record<string, string> = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5z",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  "heart-break":
    "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10zM12 7.4l-1.5 3 3 2-1.5 3",
  "heart-pulse":
    "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10zM7 12h3l1.5-2.5 2 4L15 12h2",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  leaf: "M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7",
  flower: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 9V3M12 15v6M9 12H3M15 12h6",
  bud: "M12 21v-8M12 13c-3 0-5-2.5-5-6 3 0 5 2 5 6zM12 13c3 0 5-2.5 5-6-3 0-5 2-5 6z",
  lips: "M3 12c3-4 6-5 9-3 3-2 6-1 9 3-3 5-6 7-9 7s-6-2-9-7zM3 12h18",
  music:
    "M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  balloon:
    "M12 3a6 6 0 0 1 6 6c0 4-3.5 7-6 8-2.5-1-6-4-6-8a6 6 0 0 1 6-6zM12 17l-1 2h2l-1-2zM12 19c0 1.5 1 2 1 2",
  clover:
    "M12 8.5a3 3 0 1 0-3 3M12 8.5a3 3 0 1 1 3 3M12 15.5a3 3 0 1 1-3-3M12 15.5a3 3 0 1 0 3-3M12 12l4 8",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  crown: "M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 1-9z",
  confetti: "M4 20l4-12 8 8-12 4zM14 4v2M19 9h2M17 5l1.5-1.5M20 14v.01M10 3v.01",
  // Waiting on the host to approve the request.
  hourglass:
    "M8 3h8M8 21h8M9 3c0 3.5 3 4.5 3 7s-3 3.5-3 7M15 3c0 3.5-3 4.5-3 7s3 3.5 3 7",
  // Approved, but the room is full: holding a place in the queue.
  queue:
    "M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5.5 20v-1.2A3.8 3.8 0 0 1 9.3 15h5.4a3.8 3.8 0 0 1 3.8 3.8V20M3 9h2.5M18.5 9H21",
};

export function RsvpIcon({
  name,
  size = 26,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const d = rsvpPaths[name] ?? iconPaths[name] ?? rsvpPaths.check;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/** The three symbols a draft should draw, resolving presets and emoji mode. */
export function rsvpValues(draft: EventDraft) {
  const preset = rsvpStyles.find((style) => style.id === draft.rsvpStyleId);

  if (draft.rsvpStyleId === "custom" || !preset) {
    return {
      rsvpGoing: draft.rsvpGoing,
      rsvpMaybe: draft.rsvpMaybe,
      rsvpNo: draft.rsvpNo,
    };
  }

  if (draft.rsvpMode === "emojis") {
    return {
      rsvpGoing: preset.emojis[0],
      rsvpMaybe: preset.emojis[1],
      rsvpNo: preset.emojis[2],
    };
  }

  return {
    rsvpGoing: preset.going,
    rsvpMaybe: preset.maybe,
    rsvpNo: preset.no,
  };
}

/**
 * Guest RSVP status → the canonical icon for it (used outside a themed draft).
 *
 * Typed as a total record on purpose: the five statuses in `lib/types/guest.ts`
 * are the vocabulary, so adding one there breaks the build here until a glyph
 * exists. A missing glyph used to fall back to a check mark, which quietly told
 * a waitlisted guest they were confirmed.
 */
export const rsvpStatusIcons: Record<GuestRsvpStatus, string> = {
  going: "check",
  maybe: "clock",
  not_going: "x",
  pending_approval: "hourglass",
  waitlisted: "queue",
};

export function RsvpGlyph({
  mode,
  value,
  size = 26,
}: {
  mode: EventDraft["rsvpMode"];
  value: string;
  size?: number;
}) {
  if (mode === "emojis") {
    return <span style={{ fontSize: size, lineHeight: 1 }}>{value}</span>;
  }

  return <RsvpIcon name={value} size={size} />;
}
export const rsvpEmojis = [
  "✅",
  "🎉",
  "🥳",
  "💃🏾",
  "🕺🏾",
  "😍",
  "🙌🏾",
  "👏🏾",
  "🍾",
  "🥂",
  "🍗",
  "🍢",
  "🍕",
  "🎈",
  "💖",
  "😎",
  "🤔",
  "🤷🏾",
  "🙈",
  "👀",
  "😢",
  "😭",
  "💀",
  "🙅🏾",
  "🚫",
  "😴",
  "✈️",
  "🏠",
  "🌸",
  "✨",
];
