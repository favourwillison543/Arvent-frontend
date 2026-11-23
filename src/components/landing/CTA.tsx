"use client";

import type { CSSProperties } from "react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";

import { SECTION_HEADING } from "./type";

const invites = [
  { x: -90, y: -64, r: -10, band: "#e8c878" },
  { x: 0, y: -94, r: 0, band: "#c9b2e6" },
  { x: 90, y: -64, r: 10, band: "#f0a58d" },
];

const trees = [
  { left: "5%", size: "h-9 sm:h-12" },
  { left: "17%", size: "h-12 sm:h-16" },
  { left: "29%", size: "h-8 sm:h-10" },
  { left: "69%", size: "h-10 sm:h-14" },
  { left: "80%", size: "h-8 sm:h-11" },
];

function Tree({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 30 44"
      className={`w-auto ${className}`}
      aria-hidden="true"
    >
      <rect x="13" y="26" width="4" height="18" rx="2" fill="#b8ab9c" />
      <circle cx="15" cy="17" r="13" fill="#b7dc6a" />
      <circle cx="10" cy="13" r="5" fill="#cdeb8b" />
    </svg>
  );
}

export default function CTA() {
  const { ref: section, inView: go } = useInView<HTMLElement>({
    threshold: 0.35,
  });

  return (
    <section
      id="get-started"
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
        <div className="relative z-10 flex flex-col items-center text-center">
          <h2 className={`max-w-3xl ${SECTION_HEADING}`}>
            Your next event deserves more than a{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              group chat.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Create your event, send one link, and know who&apos;s actually
            coming.
          </p>

          <div className="mt-7">
            <Button href="/create" size="lg">
              Create your event
            </Button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className={`cta-stage relative mx-auto mt-8 h-[16.5rem] w-full max-w-2xl ${
            go ? "cta-go" : ""
          }`}
        >
          <div className="absolute inset-x-0 bottom-3 border-t-2 border-dashed border-foreground/15" />

          {trees.map((tree, index) => (
            <div
              key={index}
              className="absolute bottom-3 -translate-x-1/2"
              style={{ left: tree.left }}
            >
              <Tree className={tree.size} />
            </div>
          ))}

          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <div className="cta-car">
              <svg
                viewBox="0 0 170 74"
                className="h-auto w-[8.5rem] sm:w-40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 52 V40 q0-6 6-7 l22-4 l18-17 q3-3 7-3 h44 q5 0 8 3 l16 17 l20 3 q8 2 8 9 v11 z"
                  fill="#a855f7"
                />

                <path d="M56 31 l12-12 h18 v12 z" fill="#f3e8ff" />

                <path d="M92 19 h12 q3 0 5 2 l11 10 h-28 z" fill="#f3e8ff" />

                <rect
                  x="154"
                  y="38"
                  width="9"
                  height="6"
                  rx="3"
                  fill="#e8c878"
                />

                <rect x="7" y="38" width="6" height="6" rx="3" fill="#f0a58d" />

                {[44, 126].map((cx) => (
                  <g key={cx}>
                    <circle cx={cx} cy="54" r="13" fill="#18181b" />

                    <g className="cta-wheel">
                      <circle cx={cx} cy="54" r="6" fill="#e9e7df" />

                      <path
                        d={`M${cx} 49 v10 M${cx - 5} 54 h10`}
                        stroke="#18181b"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* A drawing of three printed invites, not UI: the card is 83px wide on
              a phone, so its type is deliberately scaled with the card (5.5–7px)
              and steps up with it at `sm`. The 13px type floor is a rule for text
              the reader is meant to read, which is why this block is the one
              place in the sweep that keeps its sizes. */}
          <div className="absolute bottom-[4.4rem] left-1/2 z-10 h-0 w-0">
            {invites.map((invite, index) => (
              <div
                key={index}
                className="cta-card absolute left-0 top-0 h-[6.8rem] w-[5.2rem] overflow-hidden rounded-lg bg-surface shadow-[0_10px_24px_rgba(24,24,27,0.18)] sm:h-[8.2rem] sm:w-[6.4rem]"
                style={
                  {
                    "--x": `${invite.x}px`,
                    "--y": `${invite.y}px`,
                    "--r": `${invite.r}deg`,
                    animationDelay: `${2.1 + index * 0.14}s`,
                  } as CSSProperties
                }
              >
                <div
                  className="flex h-7 items-center justify-center sm:h-9"
                  style={{ background: invite.band }}
                />

                <div className="flex flex-col items-center px-1.5 pt-2 text-center sm:pt-2.5">
                  <span className="text-[5.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-[6.5px]">
                    You&apos;re invited to
                  </span>

                  <span className="mt-1 font-display text-[11px] font-bold leading-tight text-foreground sm:text-[13px]">
                    Chika&apos;s birthday
                  </span>

                  <span className="mt-1 text-[6px] text-muted-foreground sm:text-[7px]">
                    Sat, Oct 10
                  </span>

                  <span className="mt-1.5 rounded-full bg-foreground px-2 py-0.5 text-[6px] font-semibold text-white sm:text-[7px]">
                    RSVP
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-3 right-0 z-20 flex flex-col items-end sm:right-3">
            <div className="cta-bubble relative mb-1.5 mr-1 whitespace-nowrap rounded-field bg-surface px-2.5 py-1.5 text-2xs font-semibold text-foreground shadow-[0_8px_20px_rgba(24,24,27,0.14)]">
              Thank you!
              <span className="absolute -bottom-1 right-5 size-2 rotate-45 bg-surface" />
            </div>

            <svg
              viewBox="0 0 44 88"
              className="cta-person h-[5.4rem] w-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="14" y="56" width="6" height="28" rx="3" fill="#18181b" />

              <rect x="24" y="56" width="6" height="28" rx="3" fill="#18181b" />

              <rect
                x="12"
                y="82"
                width="9"
                height="5"
                rx="2.5"
                fill="#a855f7"
              />

              <rect
                x="23"
                y="82"
                width="9"
                height="5"
                rx="2.5"
                fill="#a855f7"
              />

              <path
                className="cta-arm"
                d="M13 33 L4 18"
                stroke="#8a5a3c"
                strokeWidth="5"
                strokeLinecap="round"
              />

              <rect
                x="12"
                y="26"
                width="20"
                height="34"
                rx="9"
                fill="#ff9fd8"
              />

              <path
                d="M31 33 L34 53"
                stroke="#8a5a3c"
                strokeWidth="5"
                strokeLinecap="round"
              />

              <circle cx="22" cy="12" r="10.5" fill="#18181b" />

              <circle cx="22" cy="15" r="9" fill="#8a5a3c" />

              <circle cx="18.5" cy="15" r="1" fill="#18181b" />

              <circle cx="25.5" cy="15" r="1" fill="#18181b" />

              <path
                d="M19 19 q3 3 6 0"
                stroke="#18181b"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </Container>

      <style>{`
        .cta-car {
          transform: translateX(-90vw);
        }

        .cta-card {
          opacity: 0;
          transform:
            translate(calc(-50% + var(--x)), calc(-50% + var(--y)))
            rotate(var(--r));
        }

        .cta-wheel {
          transform-box: fill-box;
          transform-origin: center;
        }

        .cta-person {
          opacity: 0;
        }

        .cta-bubble {
          opacity: 0;
          transform-origin: bottom right;
        }

        .cta-arm {
          transform-origin: 13px 33px;
        }

        .cta-go .cta-car {
          animation: cta-drive 2s cubic-bezier(.2,.8,.2,1) both;
        }

        .cta-go .cta-wheel {
          animation: cta-spin 2s cubic-bezier(.2,.8,.2,1) both;
        }

        .cta-go .cta-card {
          animation:
            cta-pop .7s cubic-bezier(.34,1.56,.64,1) both,
            cta-float 3.5s ease-in-out 3.2s infinite;
        }

        .cta-go .cta-person {
          animation: cta-rise .6s ease-out 2.6s both;
        }

        .cta-go .cta-bubble {
          animation:
            cta-bubble .5s cubic-bezier(.34,1.56,.64,1) 3.2s both;
        }

        .cta-go .cta-arm {
          animation:
            cta-wave .55s ease-in-out 3.2s 8 alternate both;
        }

        @keyframes cta-drive {
          from {
            transform: translateX(-90vw);
          }

          to {
            transform: translateX(0);
          }
        }

        @keyframes cta-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(900deg);
          }
        }

        @keyframes cta-pop {
          from {
            opacity: 0;
            transform:
              translate(-50%, -20%)
              rotate(0deg)
              scale(.2);
          }

          to {
            opacity: 1;
            transform:
              translate(calc(-50% + var(--x)), calc(-50% + var(--y)))
              rotate(var(--r))
              scale(1);
          }
        }

        @keyframes cta-float {
          0%, 100% {
            translate: 0 0;
          }

          50% {
            translate: 0 -5px;
          }
        }

        @keyframes cta-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cta-bubble {
          from {
            opacity: 0;
            transform: scale(.4);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes cta-wave {
          from {
            transform: rotate(-12deg);
          }

          to {
            transform: rotate(14deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-car,
          .cta-go .cta-car {
            transform: none;
            animation: none;
          }

          .cta-go .cta-wheel,
          .cta-go .cta-arm {
            animation: none;
          }

          .cta-card,
          .cta-go .cta-card {
            opacity: 1;
            animation: none;
          }

          .cta-person,
          .cta-bubble,
          .cta-go .cta-person,
          .cta-go .cta-bubble {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
