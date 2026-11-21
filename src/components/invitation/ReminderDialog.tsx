"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import { createWhatsAppUrl } from "@/lib/utils/phone";

import {
  downloadReminder,
  googleCalendarUrl,
  reminderMessage,
  type ReminderInput,
} from "./calendar";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * "Remind me" asks for one thing — where the reminder should land — and then
 * hands off: an email goes straight into Google Calendar as the attendee, a
 * phone number becomes a WhatsApp message to themselves. Nothing is stored and
 * no account is needed.
 *
 * It wears the invitation's own card, not the app's dialog chrome: the RSVP and
 * the reminder are the two questions a guest answers while looking at somebody's
 * artwork, and one of them arriving as a generic modal made the other look like
 * the odd one out. The field is a writing line, the button is the theme's ink,
 * and the calendar fallbacks are quiet text under the rule.
 */
export default function ReminderDialog({
  open,
  onClose,
  event,
  when,
}: {
  open: boolean;
  onClose: () => void;
  event: ReminderInput;
  /** Human readable date and time, e.g. "Sat, 12 Apr · 7:00 PM". */
  when: string;
}) {
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<"calendar" | "whatsapp" | "">("");
  const contactId = useId();
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Esc closes and the page behind stops scrolling while the card is up.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    setContact("");
    setError("");
    setSentTo("");
    onClose();
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = contact.trim();
    const digits = value.replace(/\D/g, "");

    if (EMAIL.test(value)) {
      const href = googleCalendarUrl(event, value);

      if (href) window.open(href, "_blank", "noopener,noreferrer");
      setError("");
      setSentTo("calendar");
      return;
    }

    if (digits.length >= 7) {
      window.open(
        createWhatsAppUrl(value, reminderMessage(event, when)),
        "_blank",
        "noopener,noreferrer",
      );
      setError("");
      setSentTo("whatsapp");
      return;
    }

    setError("Enter an email address or a WhatsApp number with at least 7 digits.");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Remind me"
        className="ev-panel relative max-h-[88svh] w-full max-w-md overflow-y-auto p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="ev-muted absolute right-3 top-3 grid size-9 place-items-center rounded-full transition hover:bg-[color:var(--ev-surface)] hover:text-[color:var(--ink)]"
        >
          <X aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>

        <p className="ev-faint text-center text-2xs font-semibold uppercase tracking-[0.22em]">
          Remind me
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold leading-tight">
          Don’t let it slip.
        </h2>
        <p className="ev-muted mt-2 text-center text-sm leading-relaxed">
          Where should the reminder for{" "}
          <span className="font-semibold">{event.title || "this event"}</span> go?
        </p>
        {when && <p className="ev-faint mt-1 text-center text-xs">{when}</p>}

        <div className="ev-ornament my-5">
          <span className="ev-ornament-glyph">✦</span>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor={contactId} className="ev-field-label">
              Email or WhatsApp
            </label>
            <input
              id={contactId}
              className="ev-field"
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com or 0801 234 5678"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setError("");
                setSentTo("");
              }}
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg">
            {sentTo ? "Send again" : "Get my reminder"}
          </Button>
        </form>

        {sentTo === "calendar" && (
          <p role="status" className="ev-muted mt-3 text-center text-xs leading-relaxed">
            Google Calendar is open in a new tab — accept the event and the
            reminder is set.
          </p>
        )}

        {sentTo === "whatsapp" && (
          <p role="status" className="ev-muted mt-3 text-center text-xs leading-relaxed">
            WhatsApp is open in a new tab with your reminder. Send it to keep it
            in the chat.
          </p>
        )}

        <div className="ev-ornament my-4">
          <span className="ev-ornament-glyph">or</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="ev-faint text-center text-xs leading-relaxed">
            No email or number to give? Add it to a calendar app instead.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadReminder(event);
                close();
              }}
            >
              Add to calendar app
            </Button>
            <Button
              variant="ghost"
              size="sm"
              href={googleCalendarUrl(event) || "#"}
              target="_blank"
              rel="noreferrer"
            >
              Open Google Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
