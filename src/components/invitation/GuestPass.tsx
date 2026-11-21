"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Ticket } from "lucide-react";

import type { GuestRsvpStatus } from "@/lib/types/guest";

/**
 * The token inside a guest link.
 *
 * The RSVP answer hands back `manageUrl` — the guest's own invitation address —
 * and the pass is the same token at its own address. Reading it off that link
 * keeps the card from needing a second prop for a value it already holds. The
 * sites have not always agreed on where the token lives (`?g=`, `?token=`,
 * `/pass/<token>`), so all of them are read before giving up: a missing token
 * used to mean the "View my pass" button silently did not render.
 */
export function guestTokenFrom(link: string): string {
  if (!link) return "";

  let url: URL;

  try {
    const base =
      typeof window === "undefined" ? "http://localhost" : window.location.origin;
    url = new URL(link, base);
  } catch {
    return "";
  }

  const fromQuery =
    url.searchParams.get("g") ||
    url.searchParams.get("token") ||
    url.searchParams.get("guestToken");

  if (fromQuery) return fromQuery;

  /*
   * The emails the API sends carry the pass as a fragment — `/pass#token=agp_…`
   * — because a fragment never reaches a server, so the token stays out of logs
   * and referrers. Read it the same way as a query so an email that has already
   * been sent keeps working.
   */
  if (url.hash.length > 1) {
    const fromHash = new URLSearchParams(url.hash.slice(1));

    const token =
      fromHash.get("token") || fromHash.get("g") || fromHash.get("guestToken");

    if (token) return token;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const at = segments.findIndex((segment) => segment === "pass" || segment === "g");

  return at >= 0 ? (segments[at + 1] ?? "") : "";
}

/**
 * `/pass/<token>` for a guest link, with the event's slug when the link names
 * one. The slug matters: a guest who belongs to more than one event is resolved
 * by `X-Event-Slug`, so the pass has to know which invitation it belongs to.
 * Empty string when the link carries no token at all.
 */
export function passHref(link: string): string {
  const token = guestTokenFrom(link);
  if (!token) return "";

  let slug = "";

  try {
    const base =
      typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(link, base);
    const segments = url.pathname.split("/").filter(Boolean);

    // An invitation names its event in the path (`/e/<slug>?g=…`); a pass link
    // the app itself built carries it as `?e=`, and dropping it here would send
    // the pass back to a read with no event to name.
    slug =
      segments[0] === "e" && segments[1]
        ? segments[1]
        : url.searchParams.get("e") || "";
  } catch {
    slug = "";
  }

  return `/pass/${encodeURIComponent(token)}${
    slug ? `?e=${encodeURIComponent(slug)}` : ""
  }`;
}

const HEADLINE: Record<string, string> = {
  going: "You’re on the list",
  maybe: "You said maybe",
  not_going: "Your reply is saved",
  pending_approval: "Waiting for the host",
  waitlisted: "You’re on the waitlist",
};

/**
 * The sentence that answers "did it work?".
 *
 * The RSVP sheet and the pass modal both open right after a reply is saved, and
 * both have to say the same thing: the guest's answer, in the guest's words.
 */
export function passHeadline(status?: GuestRsvpStatus | null): string {
  return (status && HEADLINE[status]) || "Your pass is saved";
}

export function GuestPass({
  link,
  status = "going",
}: {
  /** The guest's manage link — the one the API returned, or their own URL. */
  link: string;
  /** The answer this pass stands for; the headline follows it. */
  status?: GuestRsvpStatus;
}) {
  const [copied, setCopied] = useState(false);
  const href = passHref(link);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="mt-4 rounded-panel border p-4"
      style={{
        borderColor: "var(--line)",
        background: "var(--ev-surface)",
        color: "var(--ink)",
      }}
    >
      <p className="flex items-center gap-2 font-semibold">
        <CircleCheck aria-hidden className="size-5" />
        {passHeadline(status)}
      </p>

      <p className="ev-muted mt-1 text-sm leading-relaxed">
        Your pass carries your name and a reference the door can check. Keep this
        link — it is also how you change your answer later.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* The pass first: it is what the guest came back for. */}
        {href && (
          <Link
            href={href}
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
            style={{ background: "var(--ink)", color: "var(--inv)" }}
          >
            <Ticket aria-hidden className="size-4" />
            View my pass
          </Link>
        )}

        <a
          href={link}
          className="inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          Open my invitation
        </a>

        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          {copied ? "Copied" : "Copy my link"}
        </button>
      </div>
    </div>
  );
}
