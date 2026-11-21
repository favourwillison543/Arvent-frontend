"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { RsvpIcon } from "@/components/create-event/rsvpSymbols";
import { fonts } from "@/components/create-event/themes";
import type { EventDraft } from "@/components/create-event/draft";
import { EVENT_BODY, EVENT_TITLE } from "@/components/ui/Container";
import { LinkIcon } from "./InvitationIcons";

export function InvitationHeader() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    /* The same column as the hero below, so the actions and the title line up on
       the same x. The box is only as tall as the buttons plus a top rhythm — it
       used to be `h-14 ... pb-18`, which put the invitation's title 168px down
       the page while the same title sat 56px down on `/create`. */
    <header
      className={`${EVENT_BODY} relative z-40 flex items-center justify-end gap-2 pt-5 pb-2 sm:pt-6`}
    >
      {/* The sidebar carries these actions from `lg` up, so the header only
          speaks on phones. It still occupies its box on desktop, because the
          surface below is spaced against it. */}
      <div className="flex items-center gap-2 lg:hidden">
        {isLoading ? null : isAuthenticated ? (
          <Button href="/create" size="sm">
            Create event
          </Button>
        ) : (
          <>
            <Button href="/login" variant="outline" size="sm">
              Log in
            </Button>
            <Button href="/register" size="sm">
              Sign up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export function InvitationTitle({ draft }: { draft: EventDraft }) {
  const font = fonts.find((f) => f.id === draft.fontId) ?? fonts[0];

  return (
    <h1
      className={`break-words text-left ${EVENT_TITLE} ${font.className}`}
    >
      {draft.title}
    </h1>
  );
}

type MetaProps = {
  draft: EventDraft;
  typeLabel: string;
  /** "Open RSVP" / "Approval needed" / "Invite only" — the page knows the real rule. */
  rsvpLabel?: string;
  copied: boolean;
  onCopy: () => void;
  onRemind: () => void;
};

export function InvitationMeta({
  draft,
  typeLabel,
  rsvpLabel,
  copied,
  onCopy,
  onRemind,
}: MetaProps) {
  /*
   * Only facts the event actually carries. This row used to print the bare last
   * segment of the IANA zone ("Lagos") beside "Public" and the event type, which
   * read as three unrelated words; the zone now lives next to the times in the
   * date tile, and the RSVP rule — the thing a guest needs to know before
   * answering — took its place.
   */
  const chips = [
    typeLabel,
    draft.visibility === "public" ? "Public" : "Private",
    rsvpLabel || (draft.requireApproval ? "Approval needed" : "Open RSVP"),
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap justify-start gap-1.5">
        {chips.map((chip) => (
          <span key={chip} className="ev-chip">
            {chip}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onRemind}>
          <span className="inline-flex items-center gap-2">
            <RsvpIcon name="clock" size={16} />
            Remind me
          </span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCopy}
          aria-label={copied ? "Link copied" : "Copy invitation link"}
        >
          <span className="inline-flex items-center gap-2">
            {copied ? <RsvpIcon name="check" size={16} /> : <LinkIcon size={16} />}
            {copied ? "Copied" : "Copy link"}
          </span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Who is hosting. It sits above the poster on every surface, so the reader
 * knows whose event this is before the artwork.
 */
export function InvitationHost({ hostName }: { hostName: string }) {
  return (
    <div className="flex items-center justify-start gap-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold"
        style={{ background: "var(--ev-surface2)" }}
      >
        {hostName.trim().slice(0, 1).toUpperCase() || "H"}
      </span>
      <p className="min-w-0 truncate text-sm">
        <span className="ev-muted">Hosted by </span>
        <span className="font-semibold">{hostName}</span>
      </p>
    </div>
  );
}

/**
 * The description, under the poster. Long copy is clamped to four lines with a
 * Read more toggle, so a wall of text can't push the date and venue cards off
 * the screen.
 */
export function InvitationDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const text = description.trim();

  if (!text) return null;

  const isLong = text.length > 220;

  return (
    <div>
      <p
        className={`ev-muted whitespace-pre-line text-left text-sm leading-relaxed ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {text}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 text-xs font-semibold underline underline-offset-4"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/**
 * The house rules — capacity, plus-ones, approval, dress code.
 *
 * They used to be a bulleted list of six 13px lines in the same column as the
 * tiles, which read as a third card of leftovers. One wrapped line with a
 * middot between the facts says the same thing in the height of a caption.
 */
export function InvitationAbout({ facts }: { facts: string[] }) {
  if (!facts.length) return null;

  return (
    <ul className="ev-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {facts.map((fact, index) => (
        <li key={fact} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="ev-faint">
              ·
            </span>
          )}
          {fact}
        </li>
      ))}
    </ul>
  );
}