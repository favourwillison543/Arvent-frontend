
import type { CSSProperties } from "react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

import HeroBackdrop from "./HeroBackdrop";
import { HERO_TITLE } from "./type";

const eventTypes = [
  "Birthdays",
  "Weddings",
  "Owambe",
  "Dinners",
  "Meetups",
  "Conferences",
  "House parties",
  "Ceremonies",
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-36 sm:pt-44">
      <HeroBackdrop />

      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className={`mt-2 text-[2.5rem] leading-[1.08] sm:text-[3.5rem] lg:text-[4.5rem] ${HERO_TITLE} text-foreground`}
            aria-label="Plan your event, bring everyone together, and keep the memories."
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <span
                className="word-up block"
                style={{ animationDelay: "0.05s" }}
              >
                Plan your event,
              </span>
            </span>

            <span className="block overflow-hidden pb-[0.08em]">
              <span
                className="word-up block"
                style={{ animationDelay: "0.17s" }}
              >
                bring everyone together,
              </span>
            </span>

            <span className="block overflow-hidden pb-[0.08em]">
              <span
                className="word-up block"
                style={{ animationDelay: "0.29s" }}
              >
                and keep the{" "}
                <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
                  memories.
                </span>
              </span>
            </span>
          </h1>

          <p
            className="fade-up mx-auto mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg"
            style={{ "--d": "0.55s" } as CSSProperties}
          >
             Create your event, invite guests, manage RSVPs and updates, and collect
             everyone&apos;s photos in one shared album.
          </p>

          <div
            className="fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ "--d": "0.7s" } as CSSProperties}
          >
            <Button href="/create" size="lg">
              Create your event
            </Button>

            <Button href="/discover" variant="secondary" size="lg">
              Browse events
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </Button>
          </div>
        </div>
      </Container>

      <div
        className="mx-auto mt-20 max-w-4xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
        aria-hidden="true"
      >
        <div className="marquee flex w-max gap-12 font-display text-2xl font-bold text-foreground/25">
          {[...eventTypes, ...eventTypes].map((type, index) => (
            <span key={index}>{type}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
