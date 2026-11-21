"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { EYEBROW, SECTION_TITLE } from "@/components/ui/type";
import { useGateAccess } from "@/hooks/useGateAccess";
import { describeError } from "@/lib/http/errorMessage";
import type { GateAccess } from "@/lib/types/gate";

/**
 * The secret inside a door link the API built (`/g/<secret>?eventId=…`).
 *
 * Only our own `/g` route can open a door: a link pointing at the API's host is
 * a 404 in the usher's browser, which is what "the generated link is broken"
 * looked like. So the secret is taken from the answer and the link is built here.
 */
function linkSecret(link: string): string {
  try {
    const path = new URL(link, window.location.origin).pathname;
    const start = path.indexOf("/g/");

    if (start === -1) return "";

    return decodeURIComponent(path.slice(start + 3).split("/")[0] ?? "");
  } catch {
    return "";
  }
}

export function GateAccessManager({
  eventId,
  compact = false,
}: {
  eventId: string;
  /** Used inside the door screen's own "Gate access" card, which already has a heading. */
  compact?: boolean;
}) {
  const [label, setLabel] = useState("Main Gate");
  const [freshLink, setFreshLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [pendingRevoke, setPendingRevoke] = useState<GateAccess | null>(null);
  const [revokeMessage, setRevokeMessage] = useState("");

  const {
    accesses,
    isLoading,
    error: accessError,
    createAccess,
    revokeAccess,
    isCreating,
    createError,
    isRevoking,
  } = useGateAccess(eventId);

  const create = async () => {
    try {
      const result = await createAccess(label);

      /*
       * The 201 has no schema, so the secret is read from every spelling it has
       * used — and, failing those, out of the URL the API built. A link with no
       * secret must never reach the clipboard: `/g/` is a 404.
       */
      const answer = result as GateAccess & {
        code?: string;
        gateToken?: string;
        token?: string;
        secret?: string;
        gateCode?: string;
        url?: string;
        link?: string;
      };

      const spelled =
        answer.code ??
        answer.gateToken ??
        answer.token ??
        answer.secret ??
        answer.gateCode ??
        "";

      const ready = answer.url ?? answer.link ?? "";
      const secret = spelled || (ready ? linkSecret(ready) : "");

      if (!secret) {
        setFreshLink("");
        setCopyError(
          "The gate code came back without a secret, so there is no link to share. Revoke it and try again.",
        );
        return;
      }

      // Always ours: our `/g` route, on this origin, with the event it opens.
      const url = new URL(
        `/g/${encodeURIComponent(secret)}`,
        window.location.origin,
      );

      if (!url.searchParams.get("eventId")) {
        url.searchParams.set("eventId", eventId);
      }

      setFreshLink(url.toString());
      setCopied(false);
      setCopyError("");
    } catch {
      // The hook exposes the mutation error for the message below.
    }
  };

  const active = accesses.filter((access) => !access.revokedAt);

  const copyLink = async () => {
    if (!freshLink) return;

    try {
      await navigator.clipboard.writeText(freshLink);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError(
        "Could not copy automatically. Select and copy the link above.",
      );
    }
  };

  const shareLink = async () => {
    if (!freshLink) return;

    setCopyError("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Arvent gate access",
          text: "Use this private link to check in guests.",
          url: freshLink,
        });
      } else {
        await copyLink();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setCopyError("Sharing isn't available here. Copy the link instead.");
    }
  };

  /*
   * The dialog stays open until the API answers, so a failure is read where the
   * question was asked instead of leaving the list looking untouched.
   */
  const confirmRevoke = async () => {
    if (!pendingRevoke) return;

    setRevokeMessage("");

    try {
      await revokeAccess(pendingRevoke.id);
      setPendingRevoke(null);
    } catch (cause) {
      setRevokeMessage(
        describeError(cause, "We couldn't revoke this gate link."),
      );
    }
  };

  const dismissRevoke = () => {
    if (isRevoking) return;

    setPendingRevoke(null);
    setRevokeMessage("");
  };

  return (
    <section className={compact ? undefined : "border-b border-border pb-6"}>
      {!compact && (
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-field bg-muted text-foreground">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M9 3v18M14 12h.01" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className={`${SECTION_TITLE} text-foreground`}>
              Gate access
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Create a private check-in link for your ushers. Anyone with an
              active link can access the gate list.
            </p>
          </div>
        </div>
      )}

      <form
        className={`${compact ? "" : "mt-5 "}flex flex-col gap-2 sm:flex-row`}
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
      >
        <Input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          aria-label="Gate name"
          placeholder="e.g. Main Gate"
          wrapperClassName="min-w-0 flex-1"
        />

        <Button type="submit" size="sm" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create gate link"}
        </Button>
      </form>

      {(createError || accessError) && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {describeError(
            createError ?? accessError,
            "We couldn't set up gate access. Try again.",
          )}
        </p>
      )}

      {freshLink && (
        <div className="mt-5 border-l-2 border-brand pl-4">
          <p className="text-sm font-medium text-foreground">
            Your new gate link is ready
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Copy or share this link now. The token is only shown when the link
            is created.
          </p>

          <Input
            readOnly
            value={freshLink}
            aria-label="New gate link"
            onFocus={(event) => event.currentTarget.select()}
            wrapperClassName="mt-3"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={shareLink}
            >
              Share link
            </Button>
          </div>

          {copyError && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {copyError}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <SkeletonRows count={2} className="mt-5" />
      ) : active.length > 0 ? (
        <div className="mt-5">
          <p className={`mb-2 ${EYEBROW}`}>Active gates</p>

          <ul className="divide-y divide-border">
            {active.map((access) => (
              <li
                key={access.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {access.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gate link active
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isRevoking}
                  onClick={() => {
                    setRevokeMessage("");
                    setPendingRevoke(access);
                  }}
                  className="shrink-0 text-xs text-destructive underline underline-offset-4 disabled:opacity-50"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          No active gate links yet.
        </p>
      )}

      {/* The same dialog the update list uses to delete: it names the gate, and
          a failed revoke comes back with the reason still on it. */}
      {pendingRevoke && (
        <Modal title="Revoke this gate link?" onClose={dismissRevoke}>
          <p className="text-sm leading-6 text-muted-foreground">
            “{pendingRevoke.label}” stops opening the door as soon as you revoke
            it. Anyone checking guests in with this link loses access, and the
            link cannot be switched back on.
          </p>
          {revokeMessage && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {revokeMessage}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="destructive"
              disabled={isRevoking}
              onClick={confirmRevoke}
            >
              {isRevoking ? "Revoking..." : "Revoke link"}
            </Button>
            <Button variant="outline" disabled={isRevoking} onClick={dismissRevoke}>
              Keep link
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}