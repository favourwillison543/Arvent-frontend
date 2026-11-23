"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Images, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import MemoriesInvitationPreview from "./MemoriesInvitationPreview";
import ThemeShell from "./ThemeShell";
import { toast } from "sonner";
import { defaultDraft } from "./draft";
import { fmtDate, fmtTime } from "./format";
import {
  InvitationMeta,
  InvitationAbout,
  InvitationDescription,
  InvitationHost,
} from "@/components/invitation/InvitationInfo";
import InvitationSurface from "@/components/invitation/InvitationSurface";
import InvitationTiles from "@/components/invitation/InvitationTiles";
import { RsvpActions, RsvpBar, RsvpPrompt } from "@/components/invitation/RsvpBlock";
import { RsvpSheet } from "@/components/invitation/RsvpPanel";
import ReminderDialog from "@/components/invitation/ReminderDialog";
import { useAuth } from "@/hooks/useAuth";
import { useCreateDraftEvent } from "@/hooks/useCreateDraftEvent";
import { describeError } from "@/lib/http/errorMessage";
import { useCreateDraft } from "./CreateDraftProvider";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function EventPreviewPage() {
  const router = useRouter();
  const { draft, hasDraft, isDraftHydrated, setDraft, setHasDraft } = useCreateDraft();
  const [link, setLink] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewChoice, setPreviewChoice] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { createAndPublish, publish, isCreating, isPublishing } =
    useCreateDraftEvent();

  useEffect(() => {
    if (!isDraftHydrated) return;
    if (!hasDraft || !draft.title) router.replace("/create");
  }, [draft.title, hasDraft, isDraftHydrated, router]);

  const handleCreate = useCallback(async () => {
    if (!draft) return;
    // The previous attempt's failure is history now — clear it before retrying.
    toast.dismiss("create-event-error");
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(
        `/register?returnTo=${encodeURIComponent("/create/preview?createNow=1")}`,
      );
      return;
    }
    try {
      if (createdId && createdSlug) {
        await publish(createdId);
        setLink(`${window.location.origin}/e/${createdSlug}`);
        return;
      }
      const created = await createAndPublish(draft);
      setCreatedId(created.id);
      setCreatedSlug(created.slug);
      setLink(`${window.location.origin}/e/${created.slug}`);
    } catch (cause) {
      /* A failed create is the one error on this screen that must not fade: the
         reader pressed "Create" and nothing happened. It goes to the app's single
         toast stack (`AppToaster`) with a stable id — pressing again replaces the
         message instead of stacking a second copy — and no timeout, because the
         reason has to stay on screen until the next attempt. This replaced a
         hand-positioned `role="alert"` that had to measure its own way around
         the RSVP panel already occupying the float slot. */
      toast.error(
        describeError(cause, "We couldn’t create this event. Please try again."),
        { id: "create-event-error", duration: Infinity },
      );
    }
  }, [
    authLoading,
    createdId,
    createdSlug,
    draft,
    isAuthenticated,
    publish,
    createAndPublish,
    router,
  ]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (
      !authLoading &&
      isDraftHydrated &&
      hasDraft &&
      isAuthenticated &&
      draft &&
      search.get("createNow") === "1" &&
      !link &&
      !isCreating &&
      !isPublishing
    ) {
      window.history.replaceState(null, "", window.location.pathname);
      const timer = window.setTimeout(() => void handleCreate(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [
    authLoading,
    isCreating,
    draft,
    isDraftHydrated,
    hasDraft,
    handleCreate,
    isAuthenticated,
    link,
    isPublishing,
  ]);

  if (!isDraftHydrated || !hasDraft) return <LoadingScreen />;
  if (!draft) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPreviewLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("?")[0]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  /* ---------- Created ---------- */
  if (link) {
    return (
      <ThemeShell draft={draft}>
        <main className="flex min-h-dvh items-center px-4 py-16">
          <div className="ev-panel mx-auto w-full max-w-md p-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
              Your event is ready{" "}
              <span className="font-accent font-normal italic">to share.</span>
            </h1>

            <p className="mt-4 rounded-panel border border-border bg-surface px-4 py-3 text-sm break-all backdrop-blur-sticky">
              {link}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Button href={`/events/${createdId}`}>
                Open dashboard
              </Button>

              <Button type="button" onClick={copy} variant="outline">
                {copied ? "Copied" : "Copy link"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraft(defaultDraft);
                  setHasDraft(false);
                  router.push("/create");
                }}
              >
                Create another
              </Button>
            </div>
          </div>
        </main>
      </ThemeShell>
    );
  }

  /* ---------- Preview ---------- */
  const times = [fmtTime(draft.startTime), fmtTime(draft.endTime)]
    .filter(Boolean)
    .join(" – ");
  const where = [draft.venue, draft.address].filter(Boolean).join(", ");
  const typeLabel =
    draft.eventType.charAt(0).toUpperCase() + draft.eventType.slice(1);
  const mapsHref = where
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`
    : "";

  // Preview guests get the same "Remind me" dialog the published invitation has.
  const reminder = {
    uid: "preview",
    title: draft.title,
    date: draft.date,
    startTime: draft.startTime,
    endTime: draft.endTime,
    location: where,
    description: draft.description,
    url:
      typeof window === "undefined" ? "" : window.location.href.split("?")[0],
  };
  const remindWhen = [fmtDate(draft.date), times].filter(Boolean).join(" · ");

  const facts = [
    draft.visibility === "public" ? "Public event" : "Private event",
    draft.capacity && `${draft.capacity} spots`,
    draft.plusOnes > 0 &&
      `Each guest can bring ${draft.plusOnes} ${draft.plusOnes === 1 ? "person" : "people"}`,
    draft.requireApproval && "You approve each guest",
    draft.askWhatsapp && "Guests share their WhatsApp number",
  ].filter(Boolean) as string[];

  /* The preview speaks the vocabulary the published event will have:
     `requireApproval` is sent as `rsvpAccess: "request"` by
     `toCreateEventInput`, so the block must say "Request to join" here too. */
  const rsvpAccess = draft.requireApproval ? "request" : "open";

  const chooseStatus = (value: string) => {
    setPreviewChoice(value);
    setSheetOpen(true);
  };

  return (
    <ThemeShell draft={draft}>
      {/*
        One bar, not four cells.

        The preview is chrome over someone else's invitation, so it reads as one
        glass pill: the status on the left, two quiet glyph actions, and the only
        brand in the row — Create. It replaced a four-cell grid where each cell
        painted its own white plate and two of the four glyphs (`back`, `image`)
        were not in the icon table at all — they rendered as an empty
        `<path d={undefined}>` and left two blank cells.
      */}
      <div
        className="fixed left-1/2 top-3 z-40 flex w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 items-center gap-1 rounded-full border border-[color:var(--line)] p-1 pl-3 shadow-panel backdrop-blur-xl sm:top-4"
        style={{ background: "var(--panel)", color: "var(--ink)" }}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Eye className="size-4 shrink-0 opacity-60" strokeWidth={1.8} aria-hidden />
          <span className="truncate text-2xs font-bold uppercase tracking-label opacity-70">
            Preview<span className="hidden sm:inline">ing</span>
          </span>
        </span>

        <Link
          href="/create"
          aria-label="Back to event editor"
          title="Back to editor"
          className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-[color:var(--ev-surface2)] sm:size-9"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
        </Link>

        <a
          href="#guest-memories"
          aria-label="Jump to guest memories preview"
          title="Memories"
          className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-[color:var(--ev-surface2)] sm:size-9"
        >
          <Images className="size-4" strokeWidth={2} aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={authLoading || isCreating || isPublishing}
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-brand px-3 text-2xs font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-95 disabled:opacity-60 sm:h-9 sm:px-4 sm:text-xs"
        >
          {authLoading ? (
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-3.5 animate-spin rounded-full border-2 border-brand-foreground/30 border-t-brand-foreground"
              />
              <span className="hidden sm:inline">Loading…</span>
            </span>
          ) : isCreating ? (
            "Creating…"
          ) : isPublishing ? (
            "Publishing…"
          ) : (
            <>
              <Plus className="size-4" strokeWidth={2.5} aria-hidden />
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create event</span>
            </>
          )}
        </button>
      </div>

      {/* The tab bar is under this screen too, so the surface's bottom padding
          and the RSVP bar measure themselves from the same height they do on
          the invitation. */}
      <div className="has-bottom-nav">
        <InvitationSurface
          /* The preview bar floats over the top of this screen, so the hero
             only needs the bar's height as clearance — the same rhythm the
             invitation's hero has under its own header. */
          className="pt-16 lg:pt-20"
          draft={draft}
          rsvp={
            <>
              <RsvpPrompt rsvpAccess={rsvpAccess} />

              <RsvpActions
                draft={draft}
                size="lg"
                chosen={previewChoice}
                onSelect={chooseStatus}
              />
            </>
          }
          intro={<InvitationDescription description={draft.description} />}
          host={<InvitationHost hostName={draft.host || "You"} />}
          meta={
            <InvitationMeta
              typeLabel={typeLabel}
              copied={copied}
              onCopy={() => void copyPreviewLink()}
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
          extras={<MemoriesInvitationPreview draft={draft} />}
        />

        {/* Phones keep the RSVP within thumb reach: the invitation's own bar,
            same height above the tab bar, same two answers. */}
        <RsvpBar>
          <RsvpActions draft={draft} chosen={previewChoice} onSelect={chooseStatus} />
        </RsvpBar>

        {/* The guest's own sheet, so the organizer can walk the RSVP — the
            contact rule included — before anything is published. It writes
            nothing: there is no event to write to yet. */}
        <RsvpSheet
          open={sheetOpen}
          status={previewChoice}
          rsvpAccess={rsvpAccess}
          draft={draft}
          name=""
          email=""
          phone=""
          additionalGuests={0}
          maxAdditionalGuests={draft.plusOnes}
          disabled={false}
          error=""
          onSelect={chooseStatus}
          onClose={() => setSheetOpen(false)}
          onSubmit={async () => {
            setSheetOpen(false);
            toast("Preview only — guests can RSVP once you create the event.");
          }}
        />

        <ReminderDialog
          open={remindOpen}
          onClose={() => setRemindOpen(false)}
          event={reminder}
          when={remindWhen}
        />
      </div>
    </ThemeShell>
  );
}
