import type { Metadata } from "next";

import PageShell, { LegalSection } from "@/components/landing/PageShell";
import { SUPPORT_EMAIL } from "@/components/landing/socialLinks";

export const metadata: Metadata = {
  title: "Privacy | Arvent",
  description:
    "What Arvent collects, why it collects it, who can see it, and how to get it deleted.",
};

const updated = "1 November 2026";

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="What we know,"
      accent="and why."
      intro="An invitation carries people's names, phone numbers and plans. Here's exactly what we hold and who can see it."
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Last updated {updated}
      </p>

      <div className="mt-6 space-y-8">
        <LegalSection title="What we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-semibold text-foreground">Account details</span>{" "}
              — your name, email, phone number and password (stored hashed).
            </li>
            <li>
              <span className="font-semibold text-foreground">Event details</span> —
              the name, date, venue, capacity, poster and description you publish.
            </li>
            <li>
              <span className="font-semibold text-foreground">Responses</span> — a
              guest&apos;s name, contact, answer, number of plus-ones and any note
              they leave.
            </li>
            <li>
              <span className="font-semibold text-foreground">Photos</span> — images
              uploaded to an event&apos;s moments.
            </li>
            <li>
              <span className="font-semibold text-foreground">Technical</span> —
              basic request logs (time, route, errors) so we can keep the site up.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="Why we use it">
          <p>
            To run your event: publish the invitation, take RSVPs, keep the guest
            list accurate and let the door team check people in. To send the
            messages the product promises — a reminder you asked for, a
            confirmation, an invitation link.
          </p>
          <p>
            We don&apos;t sell your data, and we don&apos;t put guest contacts on a
            mailing list of our own.
          </p>
        </LegalSection>

        <LegalSection title="Who can see what">
          <p>
            An organizer sees the responses to their own event, including guest
            names and the contacts those guests used to reply, because the guest
            list is the point of the product.
          </p>
          <p>
            A guest sees only their own response, and can change or withdraw it from
            their invitation link. A public event and its details can be seen by
            anyone holding the link; a private one can&apos;t be found by browsing.
          </p>
          <p>
            Our service providers — hosting, database, email delivery — process data
            on our behalf and under contract. We don&apos;t hand it to anyone else
            unless the law requires it.
          </p>
        </LegalSection>

        <LegalSection title="Cookies and local storage">
          <p>
            We use the minimum needed to keep you signed in and to remember a
            preference like light or dark appearance. No advertising cookies, no
            third-party trackers following you around the web.
          </p>
        </LegalSection>

        <LegalSection title="How long we keep it">
          <p>
            Event data stays while your account is open so you can reuse and review
            past events. Ask us to delete an event or your account and we remove the
            associated guest responses and photos with it.
          </p>
          <p>
            Some records — such as a guest list for an event that hasn&apos;t
            happened yet, or a log we need for security — may be kept a little
            longer, and then deleted.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <p>
            You can ask to see, correct, export or delete the data we hold about
            you. Organizers can edit or delete their events from the dashboard;
            guests can change their response from their invitation.
          </p>
          <p>
            For anything else, email us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-foreground underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            from the address on your account and we&apos;ll sort it out.
          </p>
        </LegalSection>

        <LegalSection title="Younger guests">
          <p>
            Arvent isn&apos;t for children. Accounts are for people old enough to
            enter a contract where they live, and we don&apos;t knowingly collect
            data from anyone younger.
          </p>
        </LegalSection>

        <LegalSection title="Changes and contact">
          <p>
            If this policy changes in a way that affects you, we&apos;ll tell you
            before the change takes effect. Questions or requests:{" "}
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
