"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { useReconfirmation } from "@/hooks/useReconfirmation";
import { ReconfirmationHeader } from "./ReconfirmationHeader";
import { ReconfirmationStats } from "./ReconfirmationStats";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { describeError } from "@/lib/http/errorMessage";

/**
 * The reconfirmation panel, mounted as the dashboard's `reconfirm` modal.
 *
 * It reads `GET /events/{id}/attendance` and writes
 * `POST /events/{id}/reconfirmation/start`, whose answer is
 * `{ askedCount, round, startedAt, emailsQueued }` — so the confirmation the
 * host sees is the round the API actually opened, not a guess.
 */
export function ReconfirmationPage({
  eventName = "your event",
}: {
  eventName?: string;
}) {
  const { id } = useParams<{ id: string }>();
  const { attendance, isLoading, errorMessage, startReconfirmation, isStarting } =
    useReconfirmation(String(id));
  /**
   * One message surface for both outcomes, as the rest of the app does it: a
   * started round is a `role="status"` notice, a refusal is a `role="alert"`.
   */
  const [message, setMessage] = useState<{
    text: string;
    failed: boolean;
  } | null>(null);

  const start = async () => {
    setMessage(null);

    try {
      const result = await startReconfirmation();
      const asked = `${result.askedCount} guest${result.askedCount === 1 ? "" : "s"}`;
      const emails =
        result.emailsQueued > 0
          ? ` ${result.emailsQueued} email${result.emailsQueued === 1 ? "" : "s"} queued.`
          : "";

      setMessage({
        text:
          result.askedCount === 0
            ? "Nobody was left to ask this round."
            : `Round ${result.round} started: asked ${asked}.${emails}`,
        failed: false,
      });
    } catch (cause) {
      setMessage({
        text: describeError(
          cause,
          "Couldn’t start reconfirmation. Please try again.",
        ),
        failed: true,
      });
    }
  };

  if (isLoading) return <SkeletonRows count={3} className="py-2" />;

  if (errorMessage || !attendance)
    return (
      <p role="alert" className="text-sm text-destructive">
        {errorMessage ??
          "We couldn’t load reconfirmation. Please try again."}
      </p>
    );

  return (
    <div className="space-y-4">
      <ReconfirmationHeader
        eventName={eventName}
        going={attendance.confirmed.guests}
        round={attendance.reconfirmation.round}
        startedAt={attendance.reconfirmation.startedAt}
        onStart={() => void start()}
        busy={isStarting}
      />
      <ReconfirmationStats attendance={attendance} />
      {message && (
        <p
          role={message.failed ? "alert" : "status"}
          className={[
            "rounded-panel border border-border bg-surface p-4 text-sm",
            message.failed ? "text-destructive" : "text-muted-foreground",
          ].join(" ")}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
