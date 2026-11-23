"use client";

import { ArrowRight } from "lucide-react";

import Link from "next/link";

import PageLayout from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";
import { HERO_TITLE } from "@/components/landing/type";
import { CARD_TITLE, SECTION_TITLE } from "@/components/ui/type";

import { kinds, type MomentKind } from "./data";
import { MiniMoment } from "./MomentArt";
import MomentsWall from "./MomentsWall";


const order: MomentKind[] = ["save-the-date", "announcement", "milestone", "thank-you"];

export default function MomentsStart() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* The landing hero's opening (`pt-36 sm:pt-44`): the fixed navbar is ~68px
          tall, so the headline's cap height lands ~76px under the bar, the same
          distance the landing hero gives it. `/discover` sits in the workspace
          frame instead — no bar above it — and pays 96/128 there. It used to be
          `pt-12` plus the heading's own `mt-8` — 80px in total, i.e. 12px under
          the bar, which read as a page that had been pushed up. The column, the
          gutters and the measure come from `PageLayout`, which is the only thing
          applying padding here — `main` used to add its own `px-4` on top of
          `Container`'s. */}
      <main>
        <PageLayout width="page" top="none" className="pb-20 pt-36 sm:pt-44">
          <div className="mx-auto max-w-2xl text-center">
            {/* The landing hero's type, not a page title: `/moments` is a
                marketing screen with one sentence on it, and `PAGE_TITLE`
                (24/28/32) made it read as a section header over the cards.
                Same clamp as `/`'s hero, so the two open at the same volume. */}
            <h1 className={HERO_TITLE}>
              Share something worth{" "}
              <span className="font-accent font-normal italic">remembering.</span>
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
                  <p className={CARD_TITLE}>{kinds[k].label}</p>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" aria-hidden />
                </div>
                <p className="text-xs text-muted-foreground">{kinds[k].blurb}</p>
              </Link>
            ))}
          </div>
        </PageLayout>
      </main>
    </div>
  );
}
