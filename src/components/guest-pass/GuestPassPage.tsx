"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Check, Copy, Printer, Ticket } from "lucide-react";

import { useGuest } from "@/hooks/useGuest";
import Button from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import ThemeShell from "@/components/create-event/ThemeShell";
import { eventToDraft } from "@/components/create-event/eventToDraft";
import { fmtTime } from "@/components/create-event/format";
import { passDate } from "@/lib/utils/pass";

import GuestPassSheet from "./GuestPassSheet";

export function GuestPassPage() {
  const { token } = useParams<{ token: string }>();
  const search = useSearchParams();
  const guestToken = String(token);
  const eventSlug = search.get("e") || undefined;

  const { guest, event, reference, isLoading, error } = useGuest(
    guestToken,
    eventSlug,
    { pass: true },
  );
  const [copied, setCopied] = useState(false);
  const [printError, setPrintError] = useState("");

  const draft = useMemo(
    () => (event ? eventToDraft(event) : null),
    [event],
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !guest || !event || !draft) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl font-bold">
            This pass isn’t available
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The link may have expired, or the host may have replaced this
            guest’s personal link. Ask them for a new one.
          </p>
          <Button href="/" variant="outline" className="mt-5">
            Back to Arvent
          </Button>
        </div>
      </main>
    );
  }

  const slug = event.slug;
  const invitationHref = `/e/${slug}?g=${encodeURIComponent(guestToken)}`;

  const doors = event.doorsOpenTime ? fmtTime(event.doorsOpenTime) : "";
  const time = [fmtTime(event.programStartTime), doors && `Doors ${doors}`]
    .filter(Boolean)
    .join(" · ");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const save = () => {
    setPrintError("");
    try {
      window.print();
    } catch {
      setPrintError(
        "This browser blocked the print sheet. Use your browser’s Share → Print to save the pass.",
      );
    }
  };

  return (
    <ThemeShell draft={draft}>
      <main
        data-pass-page
        className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-between gap-8 bg-transparent px-5 pb-12 pt-8 sm:px-8 sm:pt-12 print:max-w-none print:justify-start print:gap-0 print:p-0"
      >
        {/* <header
          data-pass-chrome
          className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4"
        >
          <Link
            href="/"
            aria-label="Arvent home"
            className="flex items-center text-[color:var(--ink)]"
          >
            <span
              aria-hidden="true"
              className="inline-block h-5 w-28 bg-current"
              style={{
                WebkitMask:
                  "url(/brand/arvent-wordmark.svg) no-repeat left center / contain",
                mask: "url(/brand/arvent-wordmark.svg) no-repeat left center / contain",
              }}
            />
          </Link>

          <Link
            href={invitationHref}
            className="text-sm font-medium underline decoration-[color:var(--line)] underline-offset-4 transition hover:decoration-[color:var(--ink)] ev-muted"
          >
            View invitation
          </Link>
        </header> */}

        <section className="my-auto flex flex-col gap-6 print:my-0">
          <GuestPassSheet
            eventName={event.name}
            guestName={guest.name}
            date={passDate(event.date)}
            time={time}
            venue={event.venueName ?? undefined}
            address={event.location ?? undefined}
            status={guest.rsvpStatus ?? "maybe"}
            guestId={guest.id}
            reference={reference}
            partyOf={1 + (guest.additionalGuestCount ?? 0)}
          />

          <div
            data-pass-chrome
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[color:var(--line)] pt-4"
          >
            <button
              type="button"
              onClick={save}
              className="ev-accent inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition hover:opacity-90"
            >
              <Printer aria-hidden className="size-4" />
              Save pass
            </button>

            <div className="flex items-center gap-5 text-sm">
              <button
                type="button"
                onClick={() => void copy()}
                className="inline-flex items-center gap-1.5 underline decoration-[color:var(--line)] underline-offset-4 transition hover:decoration-[color:var(--ink)] ev-muted"
              >
                {copied ? (
                  <>
                    <Check
                      aria-hidden
                      className="size-3.5 text-[color:var(--ink)]"
                    />
                    <span className="text-[color:var(--ink)]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy aria-hidden className="size-3.5" />
                    <span>Copy link</span>
                  </>
                )}
              </button>

              <Link
                href={invitationHref}
                className="inline-flex items-center gap-1.5 underline decoration-[color:var(--line)] underline-offset-4 transition hover:decoration-[color:var(--ink)] ev-muted"
              >
                <Ticket aria-hidden className="size-3.5" />
                <span>Invitation</span>
              </Link>
            </div>
          </div>

          {printError && (
            <p
              data-pass-chrome
              role="alert"
              className="text-xs text-[color:var(--destructive-ink)]"
            >
              {printError}
            </p>
          )}
        </section>

        <footer data-pass-chrome className="pt-2">
          <p className="max-w-md text-xs leading-relaxed ev-faint">
            Save pass opens your print sheet so you can save as PDF. Keep this
            personal link private, as anyone with it can view your RSVP.
          </p>
        </footer>
      </main>
    </ThemeShell>
  );
}

export default GuestPassPage;