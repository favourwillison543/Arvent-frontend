/* The four emails Arvent sends a guest, and the plain-text twin of each.
 *
 * A template takes data and returns `{ subject, html, text }` — nothing here
 * talks to a mail provider, so the same functions work behind Resend, SES or a
 * smoke test that prints to the console. Links point at the guest's own pages,
 * the invitation (`/e/<slug>?g=<token>`) and the pass (`/pass/<token>`).
 */

import { fmtTime } from "@/components/create-event/format";
import { passDate } from "@/lib/utils/pass";

import {
  APP_URL,
  detailCard,
  emailShell,
  paragraphs,
  primaryButton,
  smallNote,
  textLink,
} from "./layout";

export type EmailEvent = {
  name: string;
  slug: string;
  /** `YYYY-MM-DD` — a calendar day, not an instant. */
  date: string;
  /** `HH:MM`, 24-hour. */
  programStartTime: string;
  doorsOpenTime?: string | null;
  venueName: string;
  location: string;
};

export type EmailMessage = {
  subject: string;
  html: string;
  text: string;
};

export type GuestReply = "going" | "maybe" | "not_going";

export const REPLY_WORDS: Record<GuestReply, string> = {
  going: "You’re going",
  maybe: "Maybe",
  not_going: "Can’t make it",
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

const eventWhen = (event: EmailEvent) => {
  const doors = event.doorsOpenTime ? fmtTime(event.doorsOpenTime) : "";
  const start = event.programStartTime ? fmtTime(event.programStartTime) : "";
  return [start, doors && `Doors ${doors}`].filter(Boolean).join(" · ");
};

const eventWhere = (event: EmailEvent) =>
  [event.venueName, event.location].filter(Boolean).join(", ");

const invitationUrl = (event: EmailEvent, guestToken?: string) =>
  `${APP_URL}/e/${event.slug}${guestToken ? `?g=${encodeURIComponent(guestToken)}` : ""}`;

const passUrl = (guestToken: string, event?: EmailEvent) =>
  `${APP_URL}/pass/${encodeURIComponent(guestToken)}${
    event ? `?e=${encodeURIComponent(event.slug)}` : ""
  }`;

const details = (event: EmailEvent, extra: { label: string; value: string }[] = []) =>
  detailCard([
    { label: "When", value: [passDate(event.date), eventWhen(event)].filter(Boolean).join(", ") },
    { label: "Where", value: eventWhere(event) },
    ...extra,
  ]);

/** What the guest gets the moment their RSVP is saved. */
export function rsvpConfirmationEmail({
  guestName,
  event,
  reply,
  partyOf,
  guestToken,
}: {
  guestName: string;
  event: EmailEvent;
  reply: GuestReply;
  partyOf: number;
  guestToken: string;
}): EmailMessage {
  const name = firstName(guestName);
  const going = reply === "going";
  const maybe = reply === "maybe";

  const title = going
    ? `You’re on the list, ${name}.`
    : maybe
      ? `RSVP saved, ${name}.`
      : `We’ll miss you, ${name}.`;

  const intro = going
    ? `Your RSVP for ${event.name} is confirmed${partyOf > 1 ? `, for a party of ${partyOf}` : ""}. Bring this pass to the door — it carries your name and a reference the host can check.`
    : maybe
      ? `Your “maybe” for ${event.name} is saved. The host can see it, and you can change it any time from your pass — no need to ask anyone.`
      : `We’ve told the host you can’t make ${event.name}. If your plans change, your pass is still yours to reopen and update.`;

  const invite = invitationUrl(event, guestToken);
  const pass = passUrl(guestToken, event);

  const primary =
    reply === "not_going"
      ? primaryButton({ href: invite, label: "Change my RSVP" })
      : primaryButton({ href: pass, label: "Open my guest pass" });

  const content = `
    ${paragraphs(intro)}
    ${details(event, [
      {
        label: "RSVP",
        value:
          partyOf > 1 && going ? `${REPLY_WORDS[reply]} · party of ${partyOf}` : REPLY_WORDS[reply],
      },
    ])}
    ${primary}
    ${reply === "not_going" ? "" : textLink({ href: invite, label: "Change my RSVP" })}
    ${smallNote(
      "Your pass link is personal. Anyone holding it can see and change this RSVP, so keep it to yourself.",
    )}`;


  return {
    subject: going
      ? `You’re on the list — ${event.name}`
      : maybe
        ? `RSVP saved — ${event.name}`
        : `RSVP received — ${event.name}`,
    html: emailShell({
      subject: `RSVP for ${event.name}`,
      preheader: `${REPLY_WORDS[reply]} · ${passDate(event.date)} · ${event.venueName}`,
      status: REPLY_WORDS[reply],
      tone: going ? "going" : maybe ? "maybe" : "no",
      title,
      content,
      footerNote: `You’re getting this because you RSVP’d to ${event.name} on Arvent.`,
    }),
    text: [
      title,
      "",
      intro,
      "",
      `When: ${passDate(event.date)}${eventWhen(event) ? `, ${eventWhen(event)}` : ""}`,
      `Where: ${eventWhere(event)}`,
      `RSVP: ${REPLY_WORDS[reply]}`,
      "",
      going ? `Your guest pass: ${pass}` : "",
      `Invitation: ${invite}`,
      "",
      "Your pass link is personal. Anyone holding it can see and change this RSVP.",
      "",
      "— Arvent",
    ]
      .filter((line) => line !== "")
      .join("\n"),
  };
}

/** A note the host posts on the event, sent to the guests who opted in. */
export function eventUpdateEmail({
  guestName,
  event,
  update,
  guestToken,
}: {
  guestName: string;
  event: EmailEvent;
  update: { title: string; body: string };
  guestToken: string;
}): EmailMessage {
  const invite = invitationUrl(event, guestToken);

  const content = `
    ${paragraphs(`${firstName(guestName)}, the host of ${event.name} posted an update:`)}
    ${paragraphs(update.body)}
    ${primaryButton({ href: invite, label: "Open the invitation" })}
    ${smallNote(`Sent to guests of ${event.name} who asked for updates.`)}`;

  return {
    subject: `${event.name}: ${update.title}`,
    html: emailShell({
      subject: update.title,
      preheader: update.title,
      status: "New update",
      title: update.title,
      content,
      footerNote: `You asked ${event.name} for updates on Arvent.`,
    }),
    text: [
      `${firstName(guestName)}, the host of ${event.name} posted an update:`,
      "",
      update.title,
      "",
      update.body,
      "",
      `Read it on the invitation: ${invite}`,
      "",
      "— Arvent",
    ].join("\n"),
  };
}

/** The one email a guest never opts out of: the event they planned around is off. */
export function eventCancelledEmail({
  guestName,
  event,
}: {
  guestName: string;
  event: EmailEvent;
}): EmailMessage {
  const invite = invitationUrl(event);

  const content = `
    ${paragraphs(`${firstName(guestName)}, the host has cancelled ${event.name}.`)}
    ${details(event)}
    ${paragraphs(
      "Your RSVP for this event no longer stands. Nothing else changes — your Arvent account and other events are untouched.",
    )}
    ${textLink({ href: invite, label: "See the event page" })}`;

  return {
    subject: `Cancelled — ${event.name}`,
    html: emailShell({
      subject: `${event.name} has been cancelled`,
      preheader: `${event.name}, set for ${passDate(event.date)}, has been cancelled.`,
      status: "Cancelled",
      tone: "no",
      title: `${event.name} has been cancelled`,
      content,
      footerNote: `You’re getting this because you RSVP’d to ${event.name} on Arvent.`,
    }),
    text: [
      `${firstName(guestName)}, the host has cancelled ${event.name}.`,
      "",
      `When: ${passDate(event.date)}${eventWhen(event) ? `, ${eventWhen(event)}` : ""}`,
      `Where: ${eventWhere(event)}`,
      "",
      "Your RSVP for this event no longer stands.",
      "",
      `Event page: ${invite}`,
      "",
      "— Arvent",
    ].join("\n"),
  };
}

/** The nudge before the day: only for guests who are going and asked for email. */
export function eventReminderEmail({
  guestName,
  event,
  guestToken,
  when = "tomorrow",
}: {
  guestName: string;
  event: EmailEvent;
  guestToken: string;
  when?: string;
}): EmailMessage {
  const name = firstName(guestName);
  const pass = passUrl(guestToken, event);
  const invite = invitationUrl(event, guestToken);

  const content = `
    ${paragraphs(`${event.name} is ${when}, ${name}. Here is everything you need.`)}
    ${details(event)}
    ${primaryButton({ href: pass, label: "Open my guest pass" })}
    ${textLink({ href: invite, label: "Can’t make it? Change my RSVP" })}
    ${smallNote(
      "“Save pass” on the pass page keeps a copy on your phone in case the network at the door is slow.",
    )}`;

  return {
    subject: `Reminder: ${event.name} is ${when}`,
    html: emailShell({
      subject: `${event.name} is ${when}`,
      preheader: `${passDate(event.date)} · ${event.venueName}`,
      status: "Reminder",
      title: `See you ${when}, ${name}.`,
      content,
      footerNote: `You asked ${event.name} to remind you on Arvent.`,
    }),
    text: [
      `${event.name} is ${when}, ${name}.`,
      "",
      `When: ${passDate(event.date)}${eventWhen(event) ? `, ${eventWhen(event)}` : ""}`,
      `Where: ${eventWhere(event)}`,
      "",
      `Your guest pass: ${pass}`,
      `Change your RSVP: ${invite}`,
      "",
      "— Arvent",
    ].join("\n"),
  };
}

/* ---------------------------------------------------------------------------
   Preview data.

   The preview screen renders these through the same functions the app uses, so
   what is reviewed is the email — not a mock-up of it.
--------------------------------------------------------------------------- */

export const SAMPLE_EVENT: EmailEvent = {
  name: "Chika’s 30th",
  slug: "chikas-30th",
  date: "2026-11-21",
  programStartTime: "18:00",
  doorsOpenTime: "17:30",
  venueName: "The Roof, Victoria Island",
  location: "12 Marina Road, Lagos",
};

const SAMPLE_GUEST = "Ada Obi";
const SAMPLE_TOKEN = "b0f3c1d2-7d4e-4f8a-9a11-33e0c8b2f4d7";

export type EmailPreview = EmailMessage & { id: string; label: string };

export function emailPreviews(): EmailPreview[] {
  return [
    {
      id: "confirmation",
      label: "RSVP confirmed",
      ...rsvpConfirmationEmail({
        guestName: SAMPLE_GUEST,
        event: SAMPLE_EVENT,
        reply: "going",
        partyOf: 2,
        guestToken: SAMPLE_TOKEN,
      }),
    },
    {
      id: "update",
      label: "New update",
      ...eventUpdateEmail({
        guestName: SAMPLE_GUEST,
        event: SAMPLE_EVENT,
        guestToken: SAMPLE_TOKEN,
        update: {
          title: "Doors open at 5:30",
          body: "We’ve moved the start half an hour earlier so the rooftop photos land at golden hour.\n\nParking is on Marina Road — tell the attendant you’re with Chika’s 30th.",
        },
      }),
    },
    {
      id: "reminder",
      label: "Reminder",
      ...eventReminderEmail({
        guestName: SAMPLE_GUEST,
        event: SAMPLE_EVENT,
        guestToken: SAMPLE_TOKEN,
      }),
    },
    {
      id: "cancelled",
      label: "Cancelled",
      ...eventCancelledEmail({
        guestName: SAMPLE_GUEST,
        event: SAMPLE_EVENT,
      }),
    },
  ];
}

