import type { Metadata } from "next";

import PageShell, { LegalSection } from "@/components/landing/PageShell";
import { SUPPORT_EMAIL } from "@/components/landing/socialLinks";

export const metadata: Metadata = {
  title: "Terms of use | Arvent",
  description:
    "The plain-language terms for using Arvent to create events, invite guests and check people in.",
};

const updated = "1 November 2026";

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms of use"
      title="The deal, in"
      accent="plain language."
      intro="These are the rules for using Arvent. They're short on purpose — if something here surprises you, write to us and we'll explain it."
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Last updated {updated}
      </p>

      <div className="mt-6 space-y-8">
        <LegalSection title="Using Arvent">
          <p>
            You can use Arvent to create events, invite guests, collect RSVPs and
            check people in at the door. You don&apos;t need an account to open an
            invitation or RSVP — only to create and manage an event.
          </p>
          <p>
            You must be old enough to enter a contract where you live. If
            you&apos;re using Arvent for a business or a team, you&apos;re agreeing
            to these terms on its behalf.
          </p>
        </LegalSection>

        <LegalSection title="Your account">
          <p>
            Keep your sign-in details to yourself — anything done from your account
            is treated as done by you. Tell us straight away if you think someone
            else has access.
          </p>
          <p>
            Use a real name for a real event. We may suspend accounts that
            impersonate other people or organizations.
          </p>
        </LegalSection>

        <LegalSection title="Events you create">
          <p>
            Your event is yours. You decide what goes on the invitation, whether
            it&apos;s public or private, how many guests can come and who joins the
            door team.
          </p>
          <p>
            You&apos;re responsible for the event itself — for what happens at the
            venue, for the accuracy of the details you publish, and for any permits
            or permissions it needs.
          </p>
          <p>
            A public event can be found and shared by anyone with the link. If you
            don&apos;t want that, create it as private.
          </p>
        </LegalSection>

        <LegalSection title="Guests and their data">
          <p>
            When you invite guests, you&apos;re the one deciding what their
            responses are used for. Use them to run your event — not to message
            people who never asked to hear from you.
          </p>
          <p>
            Guests can update or withdraw their own response from their invitation
            link at any time.
          </p>
        </LegalSection>

        <LegalSection title="Photos and moments">
          <p>
            Photos you upload to an event&apos;s moments stay yours. By uploading
            them you give us permission to store them and show them to the people
            with access to that event.
          </p>
          <p>
            Only upload photos you have the right to share. If someone asks you to
            take their photo down, take it down.
          </p>
        </LegalSection>

        <LegalSection title="What we don't allow">
          <p>Don&apos;t use Arvent to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>create events that are illegal, fraudulent or a scam;</li>
            <li>harass, threaten or impersonate anyone;</li>
            <li>upload malware or try to break, overload or reverse-engineer us;</li>
            <li>scrape guest lists or resell access to other people&apos;s events.</li>
          </ul>
          <p>
            We can remove content or close an account that breaks these rules, and
            we&apos;ll tell you why unless the law says we can&apos;t.
          </p>
        </LegalSection>

        <LegalSection title="Ending your use">
          <p>
            You can stop using Arvent at any time and ask us to close your account.
            We may suspend or close an account that breaks these terms.
          </p>
          <p>
            Closing an account removes your access. Some records — such as a guest
            list an organizer still needs for an upcoming event — may be kept until
            that event passes.
          </p>
        </LegalSection>

        <LegalSection title="Changes, and the boring bits">
          <p>
            We may update these terms as the product changes. If a change matters,
            we&apos;ll tell you before it takes effect.
          </p>
          <p>
            Arvent is provided as it is. We work hard to keep it available and
            correct, but we can&apos;t promise it will never be interrupted or
            wrong, and we&apos;re not liable for losses that flow from that beyond
            what the law requires.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Questions about these terms:{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-foreground underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </LegalSection>
      </div>
    </PageShell>
  );
}
