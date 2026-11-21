import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/landing/PageShell";
import { SUPPORT_EMAIL, SocialGlyph, socials } from "@/components/landing/socialLinks";

export const metadata: Metadata = {
  title: "Contact | Arvent",
  description:
    "Questions about an event, a guest list or your account? Here's how to reach the people behind Arvent.",
};

const help = [
  {
    title: "Guests can't RSVP",
    body: "Send us the event link and the name the guest used. We can find the RSVP and tell you exactly what happened.",
  },
  {
    title: "A guest needs a change",
    body: "Guests can update their own answer from the link in their invitation — they don't need to write to us.",
  },
  {
    title: "Door list or check-in",
    body: "Tell us the event and what the door team is seeing. Screenshots help more than descriptions.",
  },
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Talk to"
      accent="a person."
      intro="Arvent is built by a small team, and the same people read this inbox. Tell us what's happening and we'll reply within one working day."
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="group rounded-sheet border border-border bg-muted p-6 transition hover:-translate-y-0.5 hover:border-foreground"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Email
          </p>
          <p className="mt-2 break-all font-display text-xl font-bold text-foreground">
            {SUPPORT_EMAIL}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Best for anything with details attached: an event, a guest, a
            payment question.
          </p>
        </a>

        <div className="rounded-sheet border border-border bg-muted p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Elsewhere
          </p>
          <p className="mt-2 font-display text-xl font-bold text-foreground">
            We&apos;re on social
          </p>

          <ul className="mt-3 flex items-center gap-2">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Arvent on ${social.label}`}
                  className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground"
                >
                  <SocialGlyph>{social.glyph}</SocialGlyph>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            DMs are open, but email is the only place we promise a reply.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Before you write
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {help.map((item) => (
            <div
              key={item.title}
              className="rounded-panel border border-border p-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Not open yet?{" "}
        <Link
          href="/waitlist"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Join the waitlist
        </Link>{" "}
        and we&apos;ll email you when your batch starts.
      </p>
    </PageShell>
  );
}
