import type { Metadata } from "next";

import PageShell from "@/components/landing/PageShell";
import WaitlistForm from "@/components/landing/WaitlistForm";
import { SUPPORT_EMAIL } from "@/components/landing/socialLinks";

export const metadata: Metadata = {
  title: "Join the waitlist | Arvent",
  description:
    "Arvent opens in batches. Leave your email and we'll tell you the moment your batch opens.",
};

const steps = [
  {
    title: "Leave your email",
    body: "One field, no account. Add your city so we know where to open next.",
  },
  {
    title: "We open a batch",
    body: "When your batch opens you get one email with your invite link. No newsletter, no drip.",
  },
  {
    title: "Create your first event",
    body: "Pick a poster, set the date and capacity, and share one link with everyone.",
  },
];

export default function WaitlistPage() {
  return (
    <PageShell
      eyebrow="Early access"
      title="Get in before"
      accent="the room fills."
      intro="We open Arvent in batches so every new organizer gets a hand. Leave your email and we'll tell you when your batch is up."
    >
      <WaitlistForm />

      <ol className="mt-10 space-y-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-sm font-bold text-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Can&apos;t wait, or running an event this month?{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Tell us about it
        </a>{" "}
        and we&apos;ll move you up.
      </p>
    </PageShell>
  );
}
