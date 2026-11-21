"use client";

import Container from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";

type EventItem = {
  title: string;
  image: string;
  position?: string;
  ratio: string;
};

const rows: EventItem[][] = [
  [
    {
      title: "Traditional Wedding",
      image: "/events/wedding.jpg",
      ratio: "3 / 4",
    },
    {
      title: "Owambe",
      image: "/events/owambe.jpg",
      ratio: "3 / 4",
    },
    {
      title: "Birthday",
      image: "/events/birthday.jpg",
      ratio: "3 / 4",
    },
    {
      title: "Graduation",
      image: "/events/graduation.jpg",
      ratio: "3 / 4",
    },
  ],
  [
    {
      title: "Baby Shower",
      image: "/events/baby-shower.jpg",
      ratio: "4 / 5",
    },
    {
      title: "Dinner Party",
      image: "/events/dinner.jpg",
      ratio: "3 / 4",
    },
    {
      title: "House Party",
      image: "/events/house-party.jpg",
      ratio: "1 / 1",
    },
  ],
  [
    {
      title: "School Reunion",
      image: "/events/school-reunion.jpg",
      ratio: "3 / 4",
    },
    {
      title: "Naming Ceremony",
      image: "/events/naming.jpg",
      ratio: "4 / 5",
    },
  ],
  [
    {
      title: "Anniversary",
      image: "/events/anniversary.jpg",
      ratio: "4 / 5",
    },
  ],
];

const confetti: [number, number, number, string, boolean][] = [
  [160, 100, 20, "#f0a58d", false],
  [200, 70, -35, "#c9b2e6", false],
  [250, 52, 50, "#e8c878", true],
  [330, 30, 15, "#9fd3f0", false],
  [370, 70, -20, "#f0a58d", true],
  [385, 160, 40, "#b7dc6a", false],
  [150, 190, -10, "#e8c878", false],
  [240, 215, 60, "#c9b2e6", true],
  [330, 200, -45, "#f0a58d", false],
  [120, 260, 25, "#b7dc6a", true],
  [190, 300, -30, "#9fd3f0", false],
  [250, 332, 55, "#e8c878", false],
  [330, 300, -15, "#c9b2e6", true],
  [365, 350, 35, "#f0a58d", false],
  [150, 355, -50, "#b7dc6a", false],
  [60, 232, 10, "#e8c878", true],
];

const sparkles: [number, number][] = [
  [180, 130],
  [365, 220],
  [110, 300],
  [300, 20],
];

function PartyDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-40 -right-62 z-0 h-[62%] w-[72%] skew-10 opacity-80 blur-[1px] [mask-image:radial-gradient(ellipse_at_72%_62%,black_15%,transparent_75%)]"
    >
      <svg
        viewBox="0 0 400 380"
        preserveAspectRatio="xMaxYMax meet"
        className="size-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {confetti.map(([x, y, rotation, color, circle], index) =>
          circle ? (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              opacity="0.55"
            />
          ) : (
            <rect
              key={index}
              x={x - 5}
              y={y - 2}
              width="10"
              height="4"
              rx="1"
              fill={color}
              opacity="0.55"
              transform={`rotate(${rotation} ${x} ${y})`}
            />
          ),
        )}

        {sparkles.map(([x, y], index) => (
          <path
            key={index}
            d="M0 -9 Q1.5 -1.5 9 0 Q1.5 1.5 0 9 Q-1.5 1.5 -9 0 Q-1.5 -1.5 0 -9z"
            fill="#e8c878"
            opacity="0.55"
            transform={`translate(${x} ${y})`}
          />
        ))}

        <g transform="rotate(-14 70 320)" opacity="0.55">
          <path d="M70 250 L40 340 L100 340 Z" fill="#c9b2e6" />

          <path
            d="M62 276 L78 276 M55 300 L85 300 M48 323 L92 323"
            stroke="#ffffff"
            strokeOpacity="0.6"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <circle cx="70" cy="247" r="8" fill="#f0a58d" />

          <rect x="38" y="338" width="64" height="6" rx="3" fill="#e8c878" />
        </g>
      </svg>
    </div>
  );
}

export default function EventTypes() {
  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.15,
  });

  let itemIndex = 0;

  return (
    <section
      id="event-types"
      ref={section}
      className="w-full overflow-hidden py-16 sm:py-24"
    >
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.05rem)] font-bold leading-[1.02] tracking-[-0.035em]">
            Made for every kind of{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              event.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Birthdays, weddings, owambe, graduations and everything worth
            bringing people together for.
          </p>
        </div>

        <div className="relative mx-auto flex max-w-[760px] flex-col gap-2 sm:gap-3">
          <PartyDecor />

          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="relative z-10 flex items-start justify-start gap-2 sm:gap-3"
            >
              {row.map((event) => {
                const index = itemIndex++;

                return (
                  <div
                    key={event.title}
                    className={`min-w-0 w-[calc((100%-1.5rem)/4)] transition-all duration-700 ease-out sm:w-[calc((100%-2.25rem)/4)] ${
                      seen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    }`}
                    style={{
                      transitionDelay: seen ? `${index * 70}ms` : "0ms",
                    }}
                  >
                    {/* A drawn phone with a poster on its screen: the frame's
                        6px radius and 3px border are a picture of a device, so
                        they stay outside the surface radius scale. */}
                    <div
                      className="group relative w-full overflow-hidden rounded-md border-[3px] border-foreground bg-muted shadow-[0_10px_24px_rgba(24,24,27,0.18)]"
                      style={{ aspectRatio: event.ratio }}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                          backgroundImage: `url("${event.image}")`,
                          backgroundPosition: event.position ?? "center",
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
                        <h3 className="font-display text-2xs font-bold leading-tight text-white sm:text-sm">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
