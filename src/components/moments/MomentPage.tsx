"use client";

import { useParams } from "next/navigation";

import { useCopy } from "@/components/event-dashboard/ui";
import Button from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

import { calendarHref, kinds } from "./data";
import { useMoment } from "@/hooks/useMoments";
import MomentView from "./MomentView";

export default function MomentPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const { moment, loading, missing } = useMoment(id);
  const { done, copy } = useCopy();

  if (loading) {
    return <LoadingScreen />;
  }

  if (missing || !moment) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl font-bold">We couldn&apos;t find this Moment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been removed, or it was made on another device.
          </p>
          <Button href="/moments" className="mt-5">Make your own</Button>
        </div>
      </main>
    );
  }

  const title = moment.title || kinds[moment.kind].titlePlaceholder;
  const ics = calendarHref(moment);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
        return;
      } catch {}
    }
    copy(window.location.href, "link");
  };

  return (
    <MomentView moment={moment}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={share}>
          {done === "link" ? "Link copied" : "Share"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="!border-[var(--line)] !text-[var(--ink)]"
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(`${title} ${window.location.href}`)}`,
              "_blank",
              "noopener",
            )
          }
        >
          WhatsApp
        </Button>

        {ics && (
          <Button href={ics} download="moment.ics" variant="outline" size="sm" className="!border-[var(--line)] !text-[var(--ink)]">
            Add to calendar
          </Button>
        )}

        <Button href="/moments" variant="outline" size="sm" className="!border-[var(--line)] !text-[var(--ink)]">Make your own</Button>
      </div>
    </MomentView>
  );
}
