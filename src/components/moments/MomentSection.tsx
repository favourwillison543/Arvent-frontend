"use client";

import { ArrowUpRight } from "lucide-react";

import Link from "next/link";

import { SECTION_HEADING } from "@/components/landing/type";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";

import { kinds, type MomentKind } from "./data";
import { MiniMoment } from "./MomentArt";

const order: MomentKind[] = [
  "save-the-date",
  "announcement",
  "milestone",
  "thank-you",
];

/**
 * The Moments section of the landing page.
 *
 * Four illustrated cards, one per kind, each opening the editor with that kind
 * preselected — they are drawings of the *shapes* a Moment takes, not other
 * people's cards (there is no public Moments list in the contract to fill a wall
 * with). They are also the only thing on the landing page that shows a visitor
 * what a Moment looks like, so they stay.
 *
 * `Create a Moment` opens the Moments start page (`/moments`), where the kind
 * cards, the editor and your own Moments live.
 */
export default function MomentsSection() {
  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.15,
  });

  return (
    <section id="moments" ref={section} className="py-10 sm:py-16">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className={`${SECTION_HEADING} text-poster-ink`}>
            Some news doesn&apos;t need an{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              RSVP.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Save the date, announce a baby, celebrate a milestone or say thank
            you. Make a beautiful page and share it with one link.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {order.map((k, i) => (
            <Link
              key={k}
              href={`/moments/new?kind=${k}`}
              aria-label={`Make a ${kinds[k].label} Moment`}
              className={`group block min-w-0 transition-all duration-700 ease-out motion-reduce:transition-none ${
                i % 2 === 1 ? "lg:translate-y-8" : ""
              } ${seen ? "opacity-100" : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"}`}
              style={{ transitionDelay: seen ? `${i * 90}ms` : "0ms" }}
            >
              <MiniMoment
                kind={k}
                className="border border-[#ece9e5] transition duration-300 group-hover:-translate-y-1"
              />
              <p className="mt-3 font-display text-sm font-bold text-poster-ink">
                {kinds[k].label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {kinds[k].blurb}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3 lg:mt-20">
          <Button href="/moments">Create a Moment</Button>

          <Link
            href="/m/demo"
            className="inline-flex items-center gap-2 rounded-full border-2 border-poster-ink px-6 py-3 font-display text-sm font-semibold text-poster-ink transition-transform hover:-translate-y-0.5"
          >
            See an example <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  );
}

