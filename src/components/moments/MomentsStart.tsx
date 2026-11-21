"use client";

import { ArrowRight } from "lucide-react";

import Link from "next/link";

import PageLayout from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";

import { kinds, type MomentKind } from "./data";
import { MiniMoment } from "./MomentArt";
import MomentsWall from "./MomentsWall";


const order: MomentKind[] = ["save-the-date", "announcement", "milestone", "thank-you"];

export default function MomentsStart() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* The fixed marketing navbar is ~68px tall (40px of content between its
          `pt-3` and `pb-4`), so this page's opening gap is measured from it
          rather than from the shared page rhythm: `pt-12` plus the hero's own
          `mt-8` puts the headline's cap height just under the bar. The column,
          the gutters and the measure come from `PageLayout`, which is the only
          thing applying padding here — `main` used to add its own `px-4` on top
          of `Container`'s. */}
      <main>
        <PageLayout width="page" top="none" className="pb-20 pt-12 sm:pt-16">
          <div className="mx-auto mt-8 max-w-2xl text-center sm:mt-10">
            <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]">
              Share something worth{" "}
              <span className="font-accent font-normal italic tracking-normal">remembering.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
              Something is happening in your life. Make a beautiful page for it
              and send it with one link. No RSVP, no app.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/moments/new">Create Moment</Button>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 min-[420px]:grid-cols-2 sm:gap-8">
            {order.map((k) => (
              <Link key={k} href={`/moments/new?kind=${k}`} className="group block min-w-0">
                <MiniMoment
                  kind={k}
                  className="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.4)]"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="font-display text-base font-bold">{kinds[k].label}</p>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" aria-hidden />
                </div>
                <p className="text-xs text-muted-foreground">{kinds[k].blurb}</p>
              </Link>
            ))}
          </div>

          {/* Your own Moments. `GET /moments` is the signed-in caller's list,
              newest first; a visitor is asked to sign in rather than shown an
              error that looks like an empty wall. The tiles are the same ones
              the dashboard uses, so a card looks the same wherever it is
              listed. */}
          <section className="mt-16 border-t border-border pt-10 sm:mt-20 sm:pt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.2rem)] font-bold leading-tight tracking-[-0.025em]">
                  Your Moments
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Every card you make while signed in is listed here, newest
                  first. Anyone holding a card&apos;s link can open it without an
                  account.
                </p>
              </div>

              <Button href="/moments/new" variant="outline" size="sm">
                New Moment <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="mt-6">
              <MomentsWall withFilters columns={4} />
            </div>
          </section>

        </PageLayout>
      </main>
    </div>
  );
}
