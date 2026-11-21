"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

import Container from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/* The seat chart is a drawing, so its geometry is in brackets: seat backs and
   cushions (h/w in rem), the glow discs behind the section (26rem), and the
   blurred washes (90–110px). None of it is layout, and none of it is on the 4px
   grid on purpose — a seat sized in steps of 4px stops looking like a seat.
   The type and the boxes around the text are on the scale; the furniture is not. */

/** Live "prefers-reduced-motion" flag — no effect, no storing derived state. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

type Guest = "arrived" | "late" | "quiet" | "no" | "pending";

const A: Guest = "arrived";
const L: Guest = "late";
const Q: Guest = "quiet";
const N: Guest = "no";
const P: Guest = "pending";

const guests: Guest[] = [
  A,
  A,
  A,
  A,
  A,
  A,
  A,
  A,
  A,
  A,
  P,
  L,
  N,
  Q,
  P,
  L,
  Q,
  Q,
  N,
  Q,
  L,
  Q,
  Q,
  A,
  N,
  L,
  N,
  N,
];

const stages = [
  {
    title: "Invited",
    body: "Every guest gets their own unique link, preventing uninvited plus-ones.",
    metricValue: "32",
    metricLabel: "Total invitations sent",
    phase: "Invited",
  },
  {
    title: "Responded",
    body: "Real-time tracking filters who confirmed, declined, or went quiet.",
    metricValue: "21 / 32",
    metricLabel: "Confirmed seats filled",
    phase: "Responded",
  },
  {
    title: "Showing up",
    body: "Door team checks guests in live. Watch real-time arrivals tick up.",
    metricValue: "18 / 21",
    metricLabel: "Checked in at the gate",
    phase: "Showed up",
  },
];

const STEP_MS = 2400;

const seatColors: Record<Guest, { top: string; bottom: string; edge: string }> =
  {
    arrived: {
      top: "#f3d98f",
      bottom: "#e6c070",
      edge: "#dcb25c",
    },
    late: {
      top: "#f5b8a2",
      bottom: "#ec9d84",
      edge: "#e08f74",
    },
    quiet: {
      top: "#d6c3ec",
      bottom: "#c3aadf",
      edge: "#b69bd6",
    },
    no: {
      top: "#e4e0e6",
      bottom: "#d6d2d9",
      edge: "#cdc8d0",
    },
    pending: {
      top: "#efe3d4",
      bottom: "#e4d4c1",
      edge: "#dccab5",
    },
  };

function CinemaSeat({ status, delay }: { status: Guest; delay: number }) {
  const c = seatColors[status];

  const surface = (extra?: CSSProperties): CSSProperties => ({
    background: `linear-gradient(180deg, ${c.top} 0%, ${c.bottom} 100%)`,
    borderColor: c.edge,
    transitionDelay: `${delay}ms`,
    ...extra,
  });

  return (
    <div className="relative mx-auto flex h-[3.4rem] w-full max-w-[2.6rem] items-end justify-center sm:h-[3.7rem]">
      <div
        className="absolute top-0 h-[1.9rem] w-[1.7rem] rounded-[8px] border shadow-[0_4px_8px_rgba(60,40,20,0.10),inset_0_1px_0_rgba(255,255,255,0.55)] transition-all duration-500 sm:h-[2.1rem] sm:w-[1.9rem]"
        style={surface()}
        aria-hidden="true"
      />

      <div
        className="relative z-10 mb-[0.55rem] h-[0.8rem] w-[2rem] rounded-[6px] border shadow-[0_3px_6px_rgba(60,40,20,0.12),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-500 sm:w-[2.2rem]"
        style={surface()}
        aria-hidden="true"
      />

      <div
        className="absolute bottom-0 left-[calc(50%-0.55rem)] h-[0.65rem] w-px rotate-[10deg] bg-[#b8ab9c]/80"
        aria-hidden="true"
      />

      <div
        className="absolute bottom-0 right-[calc(50%-0.55rem)] h-[0.65rem] w-px -rotate-[10deg] bg-[#b8ab9c]/80"
        aria-hidden="true"
      />
    </div>
  );
}

export default function Attendance() {
  const { ref: section, inView } = useInView<HTMLElement>({
    threshold: 0.2,
    once: false,
  });

  const [stage, setStage] = useState(0);
  const [manual, setManual] = useState(false);
  const reduce = usePrefersReducedMotion();

  const auto = inView && !manual && !reduce;

  useEffect(() => {
    if (!auto) return;

    const timer = setTimeout(() => {
      setStage((current) => (current + 1) % stages.length);
    }, STEP_MS);

    return () => clearTimeout(timer);
  }, [auto, stage]);

  const statusFor = (guest: Guest): Guest => {
    if (stage === 1) {
      return guest === "no" ? "no" : "arrived";
    }

    return guest;
  };

  return (
    <section
      id="attendance"
      ref={section}
      className="relative w-full overflow-hidden py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-28 h-96 w-96 rounded-full bg-[#f3a6ff]/15 blur-[90px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-[#e4fb3a]/20 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-[18%] h-80 w-96 rounded-full bg-[#ffd27a]/20 blur-[95px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-[26rem] w-[26rem] rounded-full bg-[#ff9fd8]/15 blur-[100px]"
      />

      <Container>
        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-6">
            <h2 className="max-w-md font-display text-[clamp(2.2rem,5vw,3.05rem)] font-bold leading-[1.02] tracking-[-0.035em]">
              An invitation is more than an{" "}
              <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
                RSVP.
              </span>
            </h2>

            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg">
              You sent the invite. Now see who responded, who changed their
              mind, and who actually walked through the gate.
            </p>

            {/* New stage picker: vertical stepper */}
            <ol className="mt-8 space-y-3">
              {stages.map((item, index) => {
                const active = index === stage;

                return (
                  <li key={item.title}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setManual(true);
                        setStage(index);
                      }}
                      className={`relative flex w-full items-start gap-4 overflow-hidden rounded-panel border p-4 text-left transition-colors duration-300 ${
                        active
                          ? "border-foreground bg-surface shadow-[0_10px_30px_rgba(24,24,27,0.08)]"
                          : "border-border bg-surface/70 hover:border-foreground/30"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold transition-colors duration-300 ${
                          active
                            ? "bg-[#e4fb3a] text-foreground"
                            : "bg-border text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-sm font-semibold text-foreground">
                          {item.title}
                        </span>

                        <span className="mt-1 block max-w-xs text-xs leading-relaxed text-muted-foreground">
                          {item.body}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span className="block font-display text-lg font-bold leading-none tracking-tight text-foreground">
                          {item.metricValue}
                        </span>

                        <span className="mt-1 block max-w-24 text-2xs text-muted-foreground">
                          {item.metricLabel}
                        </span>
                      </span>

                      {active && auto && (
                        <span
                          key={stage}
                          aria-hidden="true"
                          className="fill-bar absolute inset-x-0 bottom-0 h-0.5 bg-foreground"
                          style={{ "--dur": `${STEP_MS}ms` } as CSSProperties}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="min-w-0 lg:col-span-6 xl:col-span-5 xl:col-start-8">
            <div className="relative overflow-hidden rounded-panel bg-surface/25 backdrop-blur-sm">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-display text-sm font-semibold text-foreground">
                  Chika&apos;s 30th Birthday
                </span>

                <span className="text-xs text-muted-foreground">
                  Sat, Oct 10
                </span>
              </div>

              <div
                key={stage}
                className="grid grid-cols-7 gap-x-1 gap-y-2 px-5 pb-6 pt-6 sm:gap-x-2"
                aria-label="Guest attendance visualization"
              >
                {guests.map((guest, index) => (
                  <CinemaSeat
                    key={index}
                    status={statusFor(guest)}
                    delay={index * 10}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}