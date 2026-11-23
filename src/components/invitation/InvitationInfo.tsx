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
    <header
      className={`${EVENT_BODY} relative z-40 flex items-center justify-end gap-2 pt-5 pb-2 sm:pt-6`}
    >
      {/* The sidebar carries these actions from `lg` up, so the header only
          speaks on phones. */}
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
    <h1 className={`break-words text-left ${EVENT_TITLE} ${font.className}`}>
      {draft.title}
    </h1>
  );
}

type MetaProps = {
  typeLabel: string;
  copied: boolean;
  onCopy: () => void;
  onRemind: () => void;
};

/* Event type as plain muted text (no chip), then the two actions.
   No "Public" or "Open RSVP" labels. */
export function InvitationMeta({
  typeLabel,
  copied,
  onCopy,
  onRemind,
}: MetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeLabel && <span className="ev-muted pr-1 text-sm">{typeLabel}</span>}

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
  );
}

/* Who is hosting: text only, no round avatar. */
export function InvitationHost({ hostName }: { hostName: string }) {
  return (
    <p className="min-w-0 truncate text-left text-sm">
      <span className="ev-muted">Hosted by </span>
      <span className="font-semibold">{hostName}</span>
    </p>
  );
}

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