"use client";

import { useState } from "react";
import Link from "next/link";

import Container from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";
import Button from "../ui/Button";

type Row = [
  slug: string,
  title: string,
  date: string,
  area: string,
  interested: number,
];

const cityEvents: Record<string, Row[]> = {
  Lagos: [
    ["owambe-nights", "Owambe Nights", "Sat, Oct 17 at 7pm", "Lekki", 1248],
    [
      "sunday-brunch",
      "Sunday Brunch",
      "Sun, Oct 11 at 12pm",
      "Victoria Island",
      640,
    ],
    [
      "rooftop-house-party",
      "Rooftop House Party",
      "Sat, Oct 10 at 9pm",
      "Yaba",
      985,
    ],
    [
      "graduation-dinner",
      "Graduation Dinner",
      "Fri, Oct 16 at 6pm",
      "Ikeja",
      382,
    ],
    [
      "naming-ceremony",
      "Naming Ceremony",
      "Sat, Oct 24 at 11am",
      "Surulere",
      520,
    ],
    ["bridal-shower", "Bridal Shower", "Sun, Oct 25 at 2pm", "Ikoyi", 421],
  ],
  Abuja: [
    ["abuja-owambe", "Owambe Weekend", "Sat, Oct 17 at 6pm", "Wuse 2", 860],
    [
      "abuja-dinner",
      "Rooftop Dinner Party",
      "Fri, Oct 16 at 8pm",
      "Maitama",
      410,
    ],
    [
      "abuja-wedding",
      "Traditional Wedding",
      "Sat, Oct 24 at 10am",
      "Gwarinpa",
      1120,
    ],
    [
      "abuja-birthday",
      "30th Birthday Party",
      "Sat, Oct 10 at 7pm",
      "Garki",
      350,
    ],
    ["abuja-brunch", "Garden Brunch", "Sun, Oct 18 at 11am", "Jabi", 295],
    [
      "abuja-housewarming",
      "Housewarming",
      "Sat, Oct 31 at 4pm",
      "Asokoro",
      180,
    ],
  ],
  "Port Harcourt": [
    ["ph-owambe", "Owambe Night", "Fri, Oct 23 at 7pm", "Trans Amadi", 700],
    ["ph-beach", "Beach Day Party", "Sat, Oct 17 at 2pm", "GRA", 530],
    [
      "ph-graduation",
      "Graduation Party",
      "Sat, Oct 24 at 5pm",
      "Rumuokoro",
      310,
    ],
    ["ph-dinner", "Seafood Dinner", "Fri, Oct 16 at 8pm", "Old GRA", 275],
    ["ph-naming", "Naming Ceremony", "Sat, Oct 10 at 11am", "Rumuola", 240],
    ["ph-bridal", "Bridal Shower", "Sun, Oct 18 at 2pm", "Woji", 220],
  ],
  Ibadan: [
    [
      "ib-engagement",
      "Yoruba Engagement",
      "Sat, Oct 17 at 10am",
      "Bodija",
      940,
    ],
    ["ib-owambe", "Owambe Saturday", "Sat, Oct 24 at 4pm", "Jericho", 610],
    ["ib-party", "House Party", "Sat, Oct 10 at 9pm", "Agodi", 420],
    [
      "ib-graduation",
      "Graduation Dinner",
      "Fri, Oct 16 at 6pm",
      "Ring Road",
      260,
    ],
    ["ib-baby", "Baby Shower", "Sat, Oct 31 at 2pm", "Oluyole", 205],
    ["ib-brunch", "Sunday Brunch", "Sun, Oct 11 at 12pm", "Akobo", 190],
  ],
};

const cities = Object.keys(cityEvents);

/**
 * Local poster art. The card images used to point at an external placeholder
 * service, which left the strip blank on slow/blocked connections; these ship
 * with the app so the section always renders.
 */
const POSTERS = [
  "/events/owambe.jpg",
  "/events/wedding.jpg",
  "/events/birthday.jpg",
  "/events/dinner.jpg",
  "/events/house-party.jpg",
  "/events/graduation.jpg",
  "/events/naming.jpg",
  "/events/baby-shower.jpg",
  "/events/anniversary.jpg",
  "/events/school-reunion.jpg",
] as const;

const POSTER_KEYWORDS: [RegExp, (typeof POSTERS)[number]][] = [
  [/owambe/, "/events/owambe.jpg"],
  [/wedding|bridal|engagement/, "/events/wedding.jpg"],
  [/birthday/, "/events/birthday.jpg"],
  [/brunch|dinner|seafood/, "/events/dinner.jpg"],
  [/party|housewarming|rooftop|beach/, "/events/house-party.jpg"],
  [/graduation/, "/events/graduation.jpg"],
  [/naming/, "/events/naming.jpg"],
  [/baby/, "/events/baby-shower.jpg"],
  [/anniversary|sundown/, "/events/anniversary.jpg"],
  [/reunion/, "/events/school-reunion.jpg"],
];

/** Stable poster for a slug: keyword match first, then a deterministic pick. */
export function posterFor(slug: string) {
  const match = POSTER_KEYWORDS.find(([pattern]) => pattern.test(slug));

  if (match) return match[1];

  let hash = 0;

  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) % POSTERS.length;
  }

  return POSTERS[hash];
}

function Star({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5z" />
    </svg>
  );
}

function Pin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export default function BrowseEvents() {
  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.1,
  });

  const [city, setCity] = useState(cities[0]);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const rows = cityEvents[city];
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");

  return (
    <section id="browse-events" ref={section} className="w-full py-16 sm:py-24">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.05rem)] font-bold leading-[1.02] tracking-[-0.035em]">
            Find events to attend in{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              {city}.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Public events from hosts on Arvent. Pick your city, tap one you
            like, and RSVP.
          </p>

          <div
            role="group"
            aria-label="Choose a city"
            className="mt-7 flex flex-wrap justify-center gap-2"
          >
            {cities.map((c) => {
              const active = c === city;

              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCity(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  <Pin />
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
          {rows.map(([slug, title, date, area, interested], index) => {
            const on = !!saved[slug];
            const count = interested + (on ? 1 : 0);

            return (
              <div
                key={slug}
                className={`group relative flex min-h-34 overflow-hidden rounded-panel border border-border bg-surface text-foreground transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(24,24,27,0.08)] motion-reduce:transition-none ${
                  seen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                }`}
                style={{
                  transitionDelay: seen ? `${index * 60}ms` : "0ms",
                }}
              >
                <div className="relative min-h-32 w-30 shrink-0 self-stretch overflow-hidden bg-muted sm:w-34">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterFor(slug)}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="line-clamp-2 font-display text-base font-bold leading-tight tracking-[-0.01em] sm:text-lg">
                      <Link
                        href={`/e/${slug}`}
                        aria-label={`View ${title}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {title}
                      </Link>
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {date} · {area}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {count.toLocaleString()} Interested
                    </span>

                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${
                        on ? "Remove interest in" : "Mark interested in"
                      } ${title}`}
                      onClick={() =>
                        setSaved((current) => ({
                          ...current,
                          [slug]: !current[slug],
                        }))
                      }
                      className={`relative z-10 flex size-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        on
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground/20 text-foreground hover:bg-muted"
                      }`}
                    >
                      <Star on={on} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            href={`/discover?city=${citySlug}`}
            variant="secondary"
            size="lg"
          >
            Browse all events in {city}
          </Button>
        </div>
      </Container>
    </section>
  );
}
