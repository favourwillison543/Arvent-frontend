import type { CreateMomentInput, Moment, MomentKind } from "@/lib/types/moment";
export type { CreateMomentInput, Moment, MomentKind, MomentStyle } from "@/lib/types/moment";

export const kinds: Record<
  MomentKind,
  {
    label: string;
    eyebrow: string;
    blurb: string;
    titleLabel: string;
    titlePlaceholder: string;
    messagePlaceholder: string;
    showFrom: boolean;
    link: "invitation" | "stat" | null;
  }
> = {
  "save-the-date": {
    label: "Save the date",
    eyebrow: "Save the date",
    blurb: "Tell everyone to hold the day.",
    titleLabel: "Your names",
    titlePlaceholder: "Chika & Emeka",
    messagePlaceholder: "We're getting married. Formal invitation to follow.",
    showFrom: false,
    link: "invitation",
  },
  announcement: {
    label: "Announcement",
    eyebrow: "We have news",
    blurb: "A baby, a move, a new chapter.",
    titleLabel: "Headline",
    titlePlaceholder: "It's a girl",
    messagePlaceholder: "Ada arrives this December.",
    showFrom: true,
    link: null,
  },
  milestone: {
    label: "Milestone",
    eyebrow: "A milestone",
    blurb: "Graduated, promoted, turning 70.",
    titleLabel: "What happened",
    titlePlaceholder: "I did it.",
    messagePlaceholder: "Four years, one very proud mum.",
    showFrom: true,
    link: null,
  },
  "thank-you": {
    label: "Thank you",
    eyebrow: "Thank you",
    blurb: "After the party, say it properly.",
    titleLabel: "Headline",
    titlePlaceholder: "Thank you for being there",
    messagePlaceholder: "Thank you for celebrating with us and making it special.",
    showFrom: true,
    link: "stat",
  },
};

const looks: Record<MomentKind, Pick<Moment, "themeId" | "fontId" | "effectId" | "style">> = {
  "save-the-date": { themeId: "moment-save-date", fontId: "editorial", effectId: "glow", style: "editorial" },
  announcement: { themeId: "moment-announcement", fontId: "classic", effectId: "hearts", style: "editorial" },
  milestone: { themeId: "moment-milestone", fontId: "classic", effectId: "confetti", style: "editorial" },
  "thank-you": { themeId: "moment-thank-you", fontId: "elegant", effectId: "none", style: "editorial" },
};

export function blankMoment(kind: MomentKind): CreateMomentInput {
  return {
    kind,
    ...looks[kind],
    title: "",
    date: "",
    place: "",
    message: "",
    from: "",
    photo: "",
    eventId: "",
  };
}

/* ---------- Dates ---------- */

export const dotDate = (date: string) => {
  if (!date) return "";
  const [y, m, d] = date.split("-");

  return `${d} · ${m} · ${y}`;
};

export const longDate = (date: string) =>
  date
    ? new Date(`${date}T00:00`).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

/** Downloadable .ics so people can add the date to their calendar. */
export function calendarHref(m: Moment) {
  if (!m.date) return "";

  const compact = (s: string) => s.replace(/-/g, "");
  const next = new Date(`${m.date}T00:00:00Z`);

  next.setUTCDate(next.getUTCDate() + 1);

  const esc = (s: string) => s.replace(/[,;\\]/g, "\\$&");
  const stamp = `${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Arvent//Moments//EN",
    "BEGIN:VEVENT",
    `UID:${m.id}@arvent`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(m.date)}`,
    `DTEND;VALUE=DATE:${compact(next.toISOString().slice(0, 10))}`,
    `SUMMARY:${esc(m.title || kinds[m.kind].titlePlaceholder)}`,
    m.place ? `LOCATION:${esc(m.place)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
}

export const demoMoment: Moment = {
  ...blankMoment("save-the-date"),
  id: "demo",
  createdAt: new Date().toISOString(),
  title: "Chika & Emeka",
  date: "2027-10-18",
  place: "Lagos",
  message: "We're getting married. Formal invitation to follow.",
};
