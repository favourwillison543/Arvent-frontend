"use client";

import type { useGuest } from "@/hooks/useGuest";
import type { SubmitRsvpInput } from "@/lib/types/guest";
import { toRsvpChoice } from "@/lib/utils/rsvp";
import { Icon } from "@/components/ui/Icon";
import type { EventDraft } from "@/components/create-event/draft";
import RsvpCircles from "@/components/create-event/RsvpCircles";
import { RSVPStatus } from "./RSVPStatus";
import { GuestPass, passHref } from "./GuestPass";
import { ThemedRsvpForm } from "./ThemedRsvpForm";
import { RsvpBar, RsvpPills, RsvpPrompt, rsvpPrompt } from "./RsvpBlock";

type PanelProps = {
  draft: EventDraft;
  rsvpAccess: string;
  guestToken?: string;
  guestQuery: ReturnType<typeof useGuest>;
  newPass: string;
  canRsvp: boolean;
  chosen: string | null;
  onSelect: (value: string) => void;
};

function Notices({
  guestQuery,
  guestToken,
}: Pick<PanelProps, "guestQuery" | "guestToken">) {
  const guest = guestQuery.guest;

  return (
    <>
      {guestQuery.isLoading && guestToken && (
        <p role="status" className="ev-muted mb-2 text-center text-sm">
          Loading your personal invitation…
        </p>
      )}

      {guestQuery.error && guestToken && (
        <p role="alert" className="mb-2 text-center text-sm text-destructive">
          This personal RSVP link is invalid or expired.
        </p>
      )}

      {guest && (
        <div className="mb-2">
          <RSVPStatus
            guest={guest}
            onReconfirm={(response) => guestQuery.reconfirm(response)}
          />
        </div>
      )}
    </>
  );
}

const LOCKED =
  "This event uses a personal guest list. Open the invitation link sent to you to RSVP.";

export function RsvpPanel(props: PanelProps) {
  const { draft, rsvpAccess, newPass, canRsvp, chosen, onSelect, guestQuery } = props;

  return (
    <div>
      <Notices {...props} />

      {canRsvp ? (
        <>
          <RsvpPrompt rsvpAccess={rsvpAccess} />

          <RsvpCircles
            draft={draft}
            big
            chosen={chosen}
            onSelect={onSelect}
          />
        </>
      ) : (
        <p className="ev-muted text-center text-sm">{LOCKED}</p>
      )}

      {/* The pass sits under the answers rather than replacing them: a guest who
          has just replied still has to be able to change their mind, and a guest
          who arrived on their own link can reach the pass without re-RSVPing. */}
      {newPass && (
        <GuestPass
          link={newPass}
          status={guestQuery.guest?.rsvpStatus ?? undefined}
        />
      )}
    </div>
  );
}

export function RsvpMobileBar(props: PanelProps) {
  const { draft, rsvpAccess, newPass, canRsvp, chosen, onSelect, guestQuery } = props;
  const pass = newPass ? passHref(newPass) : "";

  return (
    <RsvpBar>
      <Notices {...props} />

      {canRsvp ? (
        <>
          <RsvpPrompt rsvpAccess={rsvpAccess} compact />

          <RsvpPills draft={draft} chosen={chosen} onSelect={onSelect} />
        </>
      ) : (
        <p className="ev-muted py-1 text-center text-xs">{LOCKED}</p>
      )}

      {pass && (
        <p className="pt-1.5 text-center">
          <a
            href={pass}
            className="ev-muted text-xs font-semibold underline underline-offset-4"
          >
            View my pass
            {guestQuery.guest ? ` · ${guestQuery.guest.name}` : ""}
          </a>
        </p>
      )}
    </RsvpBar>
  );
}

type SheetProps = {
  open: boolean;
  /** The answer in the invitation's words (`going` | `maybe` | `declined`). */
  status: string | null;
  rsvpAccess: string;
  draft: EventDraft;
  name: string;
  email: string;
  phone: string;
  additionalGuests: number;
  maxAdditionalGuests: number;
  disabled: boolean;
  error: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  onSubmit: (data: SubmitRsvpInput) => Promise<void>;
};

export function RsvpSheet({
  open,
  status,
  rsvpAccess,
  draft,
  name,
  email,
  phone,
  additionalGuests,
  maxAdditionalGuests,
  disabled,
  error,
  onSelect,
  onClose,
  onSubmit,
}: SheetProps) {
  if (!open) return null;

  const choice = toRsvpChoice(status) ?? "going";

  /*
   * One card, not a form: the answer first (drawn with the icons the host chose
   * for this event), then the least a host needs to reach the guest. No brand
   * colour anywhere — the chosen answer is the theme's own ink, and the submit
   * is the app's solid button, so the sheet feels like the rest of Arvent even
   * though it sits on somebody's decorated canvas.
   *
   * The phone layout is a sheet, not a page: it sits above the tab bar (the
   * overlay is `z-50` and the themed page no longer caps its dialogs), the body
   * is the one scroller, and the last button keeps clear of the home indicator
   * so "Send my RSVP" is never half under the dock.
   */
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your RSVP"
        className="ev-panel flex max-h-[88svh] w-full max-w-md flex-col overflow-hidden rounded-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="ev-faint text-2xs font-semibold uppercase tracking-[0.16em]">
                {rsvpPrompt(rsvpAccess)}
              </p>
              <h2 className="mt-1 truncate font-display text-xl font-bold">
                {draft.title || "Your RSVP"}
              </h2>
            </div>

            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="ev-muted -mr-1 grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-[color:var(--ev-surface)] hover:text-[color:var(--ink)]"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* The same three answers as the invitation, in the host's icon set.
              Tight on a phone so the reply card below it starts above the fold. */}
          <div
            className="mt-3 rounded-field border p-2.5 sm:mt-4 sm:p-3"
            style={{
              borderColor: "var(--line)",
              background: "var(--ev-surface)",
            }}
          >
            <RsvpCircles draft={draft} chosen={choice} onSelect={onSelect} />
          </div>

          <ThemedRsvpForm
            status={choice}
            initialName={name}
            initialEmail={email}
            initialPhone={phone}
            initialAdditionalGuests={additionalGuests}
            maxAdditionalGuests={maxAdditionalGuests}
            disabled={disabled}
            error={error}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
