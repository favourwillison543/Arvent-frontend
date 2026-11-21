"use client";

import { useState, type FormEvent } from "react";

import { SUPPORT_EMAIL } from "@/components/landing/socialLinks";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { joinWaitlist } from "@/lib/api/waitlist";
import { describeError } from "@/lib/http/errorMessage";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The waitlist form: an email, an optional city, and one request to the public
 * waitlist route. It says nothing it can't back — the confirmation is the API's
 * answer, and a failure keeps the address in the field so it can be retried.
 */
export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  // If the request can't go through, the same details can still reach us as mail.
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Waitlist request",
  )}&body=${encodeURIComponent(
    [`Email: ${email.trim() || "(add yours)"}`, city.trim() && `City: ${city.trim()}`]
      .filter(Boolean)
      .join("\n"),
  )}`;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL.test(email.trim())) {
      setError("Enter an email address we can reach you on.");
      return;
    }

    setError("");
    setSending(true);

    try {
      const entry = await joinWaitlist({
        email: email.trim(),
        city: city.trim() || undefined,
      });

      setConfirmation(
        entry?.alreadyOnList
          ? "You're already on the list — we'll be in touch."
          : "You're on the list. We'll email you the moment your batch opens.",
      );
    } catch (cause) {
      setError(
        describeError(cause, "We couldn't save that just now. Please try again."),
      );
    } finally {
      setSending(false);
    }
  };

  if (confirmation) {
    return (
      <div
        role="status"
        className="rounded-sheet border border-border bg-muted p-6 text-center sm:p-8"
      >
        <p className="font-display text-xl font-bold">You&apos;re in the queue.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {confirmation}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-sheet border border-border bg-muted p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={sending}
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="City (optional)"
            type="text"
            autoComplete="address-level2"
            placeholder="Lagos"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={sending}
            hint="Helps us decide where to open next."
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-3 text-sm text-destructive">
          <p>{error}</p>
          <a
            href={mailto}
            className="mt-1 inline-block font-semibold text-foreground underline underline-offset-4"
          >
            Join by email instead
          </a>
        </div>
      )}

      <Button type="submit" size="lg" fullWidth className="mt-5" disabled={sending}>
        {sending ? "Joining…" : "Join the waitlist"}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        One email when your batch opens. No newsletter.
      </p>
    </form>
  );
}
