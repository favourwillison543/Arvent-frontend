"use client";

import { Check } from "lucide-react";
import { useId, useState } from "react";
import type { SubmitRsvpInput } from "@/lib/types/guest";
import { optionalEmailSchema } from "@/lib/validation/forms";
import { validateGuestContact } from "@/lib/validation/guest";
import { toRsvpReply } from "@/lib/utils/rsvp";
import FormError from "@/components/ui/FormError";
import Select from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

export function ThemedRsvpForm({
  status,
  initialName = "",
  initialEmail = "",
  initialAdditionalGuests = 0,
  maxAdditionalGuests = 0,
  disabled = false,
  error,
  onSubmit,
}: {
  status: string;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialAdditionalGuests?: number;
  maxAdditionalGuests?: number;
  disabled?: boolean;
  error?: string;
  onSubmit: (data: SubmitRsvpInput) => void | Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [extra, setExtra] = useState(initialAdditionalGuests);
  const [agreed, setAgreed] = useState(true);
  const [localError, setLocalError] = useState("");

  const extraLabelId = useId();
  const nameId = useId();
  const emailId = useId();

  const reply = toRsvpReply(status);
  const going = reply === "going";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setLocalError("Please enter your name.");

    const contact = validateGuestContact({ email, phone: "" });
    if (contact) return setLocalError(contact);

    if (!optionalEmailSchema.safeParse(email.trim()).success) {
      return setLocalError(
        "That email address does not look right. Please check it.",
      );
    }

    if (!agreed) return setLocalError("Please accept to continue.");
    setLocalError("");

    const payload: SubmitRsvpInput = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: undefined,
      rsvpStatus: reply,
      additionalGuestCount: going ? extra : 0,
      consent: agreed,
    };

    void onSubmit(payload);
  };

  const shownError = localError || error;

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex w-full flex-col gap-3.5 text-left sm:gap-5"
    >
      {/* Top padding above `kindly RSVP`, no stray rule beneath subtitle */}
      <header className="pt-2 sm:pt-3">
        <div className="flex items-baseline gap-2">
          <span className="ev-rsvp-script !text-[1.85rem] sm:!text-[2.15rem]">
            kindly
          </span>
          <span className="ev-rsvp-title !text-[1.5rem] sm:!text-[1.75rem]">
            RSVP
          </span>
          <span
            aria-hidden
            className="size-1.5 self-center rounded-full bg-[color:var(--brand)]"
          />
        </div>
        <p className="ev-rsvp-subtitle mt-1 sm:mt-1.5">
          Tell the host who is coming so they can plan your seat.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-0.5">
          <label htmlFor={nameId} className="ev-rsvp-label">
            Your name
          </label>
          <input
            id={nameId}
            className="ev-field !py-1.5 sm:!py-2"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setLocalError("");
            }}
            autoComplete="name"
            placeholder="Ada Obi"
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <label htmlFor={emailId} className="ev-rsvp-label">
            Your email
          </label>
          <input
            id={emailId}
            className="ev-field !py-1.5 sm:!py-2"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError("");
            }}
            autoComplete="email"
            placeholder="you@email.com"
          />
          <p className="ev-rsvp-hint mt-1">
            Only used by the host for this event.
          </p>
        </div>

        {maxAdditionalGuests > 0 && going && (
          <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] py-1.5">
            <span id={extraLabelId} className="ev-rsvp-label m-0">
              Additional guests
            </span>
            <Select
              variant="bare"
              aria-labelledby={extraLabelId}
              wrapperClassName="w-28 shrink-0 text-right"
              value={extra}
              onChange={(e) => setExtra(Number(e.target.value))}
            >
              <option value={0}>Just me</option>
              {Array.from({ length: maxAdditionalGuests }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  +{i + 1} {i === 0 ? "guest" : "guests"}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {shownError && <FormError message={shownError} />}

      <label className="flex cursor-pointer items-start gap-2.5 select-none">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            setLocalError("");
          }}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--ink)]"
          style={
            agreed
              ? {
                  background: "var(--ink)",
                  borderColor: "var(--ink)",
                  color: "var(--inv)",
                }
              : {
                  borderColor: "var(--line)",
                  color: "transparent",
                }
          }
        >
          <Check aria-hidden="true" className="size-3" strokeWidth={3} />
        </span>

        <span className="ev-rsvp-consent">
          The host may use these details to manage this RSVP and contact me
          about this event.
        </span>
      </label>

      <button
        type="submit"
        disabled={disabled}
        aria-busy={disabled}
        className="ev-accent flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-6 text-xs font-semibold uppercase tracking-[0.16em] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? (
          <>
            <Spinner
              label="Sending your RSVP"
              className="[&_svg]:size-4 [&_svg]:text-current"
            />
            <span>Sending…</span>
          </>
        ) : (
          "Send my RSVP"
        )}
      </button>
    </form>
  );
}

export default ThemedRsvpForm;