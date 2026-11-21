"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { usePublicEvent } from "@/hooks/usePublicEvent";
import { useGuest } from "@/hooks/useGuest";
import { useAuth } from "@/hooks/useAuth";
import { useSimilarEvents } from "@/hooks/useSimilarEvents";
import { usePublicMemories } from "@/hooks/useMemories";

import type { GuestRsvpStatus, SubmitRsvpInput } from "@/lib/types/guest";
import { getGuestPass } from "@/lib/api/public";
import { ApiError } from "@/lib/http/errors";
import { describeError } from "@/lib/http/errorMessage";
import { rememberGuestSlug } from "@/lib/utils/guestSlug";
import { toRsvpChoice, toRsvpReply } from "@/lib/utils/rsvp";

import {
  fmtDate,
  fmtTime,
  withZone,
  zoneAbbr,
} from "@/components/create-event/format";
import ThemeShell from "@/components/create-event/ThemeShell";
import { eventToDraft } from "@/components/create-event/eventToDraft";

import {
  InvitationHeader,
  InvitationMeta,
  InvitationAbout,
  InvitationDescription,
  InvitationHost,
} from "./InvitationInfo";
import InvitationSurface from "./InvitationSurface";
import InvitationTiles from "./InvitationTiles";
import InvitationMemories, { type MemoryPhoto } from "./InvitationMemories";
import InvitationSimilar from "./InvitationSimilar";
import { RsvpPanel, RsvpMobileBar, RsvpSheet } from "./RsvpPanel";
import ReminderDialog from "./ReminderDialog";
import { guestTokenFrom } from "./GuestPass";
import { GuestPassDialog, type PassFacts } from "./GuestPassDialog";
import { SkeletonPage } from "@/components/ui/Skeleton";

type PublicMeta = {
  id?: string;
  type?: string;
  timezone?: string;
  organizerId?: string;
  mapsUrl?: string | null;
  hostName?: string;
  organizer?: { name?: string };
} | null;

export function InvitationPage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const guestToken = search.get("g") || undefined;

  const { event, isLoading, error } = usePublicEvent(slug);
  const guestQuery = useGuest(guestToken, slug);
  const { user, isAuthenticated } = useAuth();

  // The album card shows the first four photos, so ask for four. `total` in the
  // same response drives the "View all" label - never count on the client.
  const memoriesQuery = usePublicMemories(slug, { limit: 4 });

  const [status, setStatus] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [passOpen, setPassOpen] = useState(false);
  const [passFacts, setPassFacts] = useState<PassFacts | null>(null);
  const [passStatus, setPassStatus] = useState<GuestRsvpStatus | null>(null);
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);

  const photos: MemoryPhoto[] = (memoriesQuery.gallery?.photos ?? []).map(
    (photo) => ({
      id: photo.id,
      url: photo.thumbnailUrl || photo.url,
    }),
  );
  const photoTotal = memoriesQuery.gallery?.total ?? 0;
  // `invitees` galleries answer 403 MEMORIES_ACCESS_DENIED until this device is
  // verified as a guest; the card says so instead of showing four empty slots.
  const memoriesNeedVerification =
    memoriesQuery.error instanceof ApiError &&
    memoriesQuery.error.code === "MEMORIES_ACCESS_DENIED";
  const meta = (event ?? null) as PublicMeta;

  const draft = useMemo(
    () =>
      event
        ? eventToDraft(event as Parameters<typeof eventToDraft>[0])
        : null,
    [event],
  );

  const { events: similar } = useSimilarEvents(meta?.type, meta?.id);

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <SkeletonPage width="event" body="text" count={4} />
      </main>
    );
  }

  if (error || !event || !draft) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="font-display text-3xl font-bold">
            This invitation isn’t available
          </h1>
          <p className="mt-3 text-muted-foreground">
            The event may be private, cancelled, or the link may have expired.
          </p>
        </div>
      </main>
    );
  }

  const guest = guestQuery.guest;
  const canJoin = event.rsvpAccess !== "managed" || !!guestToken;
  const canRsvp = canJoin && (!guestToken || !!guest);
  const chosen = status ?? toRsvpChoice(guest?.rsvpStatus);

  const account = user as {
    id?: string;
    name?: string;
    firstName?: string;
  } | null;
  const displayName = account?.name ?? account?.firstName ?? "";
  const isOwner = !!account?.id && account.id === meta?.organizerId;

  const hostName =
    draft.host ||
    meta?.hostName ||
    meta?.organizer?.name ||
    (isOwner ? displayName : "") ||
    "The host";

  const where = [draft.venue, draft.address].filter(Boolean).join(", ");
  const mapsHref =
    meta?.mapsUrl ||
    (where
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`
      : "");

  const typeLabel =
    draft.eventType.charAt(0).toUpperCase() + draft.eventType.slice(1);

  /* The rule the guest has to know before answering. `managed` means the host
     sends the invitations, so there is nothing here to answer. */
  const rsvpLabel =
    event.rsvpAccess === "managed"
      ? "Invite only"
      : event.rsvpAccess === "request"
        ? "Approval needed"
        : "Open RSVP";

  const times = withZone(
    [fmtTime(draft.startTime), fmtTime(draft.endTime)]
      .filter(Boolean)
      .join(" – "),
    zoneAbbr(meta?.timezone),
  );

  const facts = [
    draft.capacity && `${draft.capacity} spots`,
    draft.plusOnes > 0 &&
      `Each guest can bring ${draft.plusOnes} ${
        draft.plusOnes === 1 ? "person" : "people"
      }`,
    draft.requireApproval && "The host approves each guest",
    event.dressCode && `Dress code: ${event.dressCode}`,
  ].filter(Boolean) as string[];

  const maxExtra = Math.max(
    0,
    (guest?.seatLimit ?? (event.maxAdditionalGuests ?? 0) + 1) - 1,
  );

  /*
   * The guest's own invitation address, token in `g` exactly as the API writes
   * it. Every card that offers the pass goes through here, so the pass and the
   * invitation it belongs to can never disagree about the token.
   */
  const invitationWithToken = (token: string) =>
    `${window.location.origin}/e/${slug}?g=${encodeURIComponent(token)}`;

  const submit = async (data: SubmitRsvpInput) => {
    setSending(true);
    setFormError("");

    // The facts the pass card prints, gathered once per submit. `partyOf` is what
    // the door counts: the guest plus everyone they said they were bringing.
    const facts = (
      guestId: string,
      guestName: string,
      partyOf: number,
      reference?: string,
    ): PassFacts => ({
      eventName: draft.title || "Your event",
      date: fmtDate(draft.date),
      time: times,
      venue: draft.venue,
      address: draft.address,
      guestName,
      guestId,
      reference,
      partyOf,
    });

    try {
      // Every read after this reply needs to name the event: the API's guest
      // cookie is named per event (`arvent_g_<slug>`), and without the slug the
      // pass read answers `401 INVALID_TOKEN` while the cookie sits right there.
      rememberGuestSlug(slug);

      if (guestToken) {
        const updated = await guestQuery.updateRsvp({
          name: data.name,
          phone: data.phone,
          rsvpStatus: data.rsvpStatus,
          additionalGuestCount: data.additionalGuestCount,
        });

        // A returning guest already holds a token; the pass is the receipt for
        // the change, so it opens for them too.
        setNewPass(invitationWithToken(guestToken));
        setPassFacts(
          facts(
            updated.id,
            updated.name,
            1 + updated.additionalGuestCount,
            updated.passReference,
          ),
        );
        setPassStatus(updated.rsvpStatus ?? toRsvpReply(data.rsvpStatus));
      } else {
        const response = await guestQuery.submitRsvp({ slug, data });

        /*
         * The 201 is `{ guest, guestTokenExpiresAt }`: in cookie mode there is no
         * token in the body and no manage link. The guest is the cookie this
         * response just set, so the pass link is read from the one endpoint that
         * answers it — `GET /public/guest/pass`, with the event named. When that
         * read is refused (an older deployment, or a cookie the browser dropped)
         * the confirmation still stands and the dialog opens with the card alone.
         */
        let link = "";

        const token =
          guestTokenFrom(response.manageUrl ?? "") || response.guestToken || "";

        if (token) {
          link = invitationWithToken(token);
        } else {
          try {
            const passToken = guestTokenFrom(
              (await getGuestPass(slug)).passUrl ?? "",
            );

            link = passToken
              ? `/pass/${encodeURIComponent(passToken)}?e=${encodeURIComponent(slug)}`
              : "";
          } catch {
            link = "";
          }
        }

        setNewPass(link);
        setPassFacts(
          facts(
            response.guest.id,
            response.guest.name,
            response.guest.seats ?? 1 + response.guest.additionalGuestCount,
            response.guest.passReference,
          ),
        );
        setPassStatus(response.guest.rsvpStatus ?? toRsvpReply(data.rsvpStatus));
      }

      // Saved. The sheet's job is done: the answer, the confirmation and the
      // pass are one surface now, so it closes and the pass opens over the
      // invitation instead of leaving the guest on a form that says nothing.
      setSheetOpen(false);
      setPassOpen(true);
    } catch (cause) {
      // The API's own sentence when it has one, otherwise something a guest can
      // act on. A status code or an endpoint name is never shown here.
      setFormError(
        describeError(
          cause,
          "We couldn’t save your RSVP. Check your connection and try again.",
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("?")[0]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // The reminder asks for an email or a number, then hands the event to the
  // guest's own calendar or WhatsApp. Same payload for both, built once.
  const reminder = {
    uid: slug,
    title: draft.title,
    date: draft.date,
    startTime: draft.startTime,
    endTime: draft.endTime,
    location: where,
    description: draft.description,
    url: typeof window === "undefined" ? "" : window.location.href.split("?")[0],
  };
  const remindWhen = [fmtDate(draft.date), times].filter(Boolean).join(" · ");

  const rsvp = {
    draft,
    rsvpAccess: event.rsvpAccess,
    guestToken,
    guestQuery,
    newPass,
    canRsvp,
    chosen,
    onSelect: (value: string) => {
      setStatus(value);
      setSheetOpen(true);
    },
  };

  return (
    <ThemeShell draft={draft}>
      <InvitationHeader />

      <InvitationSurface
        className="pt-4 lg:pt-6"
        draft={draft}
        rsvp={<RsvpPanel {...rsvp} />}
        intro={<InvitationDescription description={draft.description} />}
        host={<InvitationHost hostName={hostName} />}
        meta={
          <InvitationMeta
            draft={draft}
            typeLabel={typeLabel}
            rsvpLabel={rsvpLabel}
            copied={copied}
            onCopy={() => void copyLink()}
            onRemind={() => setRemindOpen(true)}
          />
        }
        tiles={
          <InvitationTiles
            isoDate={draft.date}
            date={fmtDate(draft.date) || "Date TBD"}
            times={times}
            venue={draft.venue}
            address={draft.address}
            mapsHref={mapsHref}
          />
        }
        about={
          <InvitationAbout facts={facts} />
        }
        extras={
          <>
            <InvitationMemories
              slug={slug}
              title={draft.title}
              enabled={!!event.memoriesEnabled}
              verificationRequired={memoriesNeedVerification}
              photos={photos}
              total={photoTotal}
              loading={memoriesQuery.isLoading}
            />
            <InvitationSimilar events={similar} />
          </>
        }
      />

      <RsvpMobileBar {...rsvp} />

      <ReminderDialog
        open={remindOpen}
        onClose={() => setRemindOpen(false)}
        event={reminder}
        when={remindWhen}
      />

      <RsvpSheet
        open={sheetOpen}
        status={chosen}
        rsvpAccess={event.rsvpAccess}
        draft={draft}
        name={guest?.name ?? (isAuthenticated ? displayName : "")}
        email={guest?.email ?? ""}
        phone={guest?.phone ?? ""}
        additionalGuests={guest?.additionalGuestCount ?? 0}
        maxAdditionalGuests={maxExtra}
        disabled={sending}
        error={formError}
        onSelect={(value) => {
          setStatus(value);
          setFormError("");
        }}
        onClose={() => setSheetOpen(false)}
        onSubmit={submit}
      />

      {/* The answer and the pass in one place: after a reply is saved this opens
          over the invitation, so the guest sees that it worked and holds the
          pass in the same breath.

          It opens on the *answer*, not on the link: an API that answers without
          a `manageUrl` or a `guestToken` used to leave `newPass` empty and the
          dialog shut, so a guest who had just RSVPed saw nothing at all. The
          card still prints the confirmation and the reference; only the "open
          full pass" button needs the link. */}
      <GuestPassDialog
        open={passOpen}
        link={newPass}
        status={passStatus}
        pass={passFacts}
        onClose={() => setPassOpen(false)}
      />
    </ThemeShell>
  );
}