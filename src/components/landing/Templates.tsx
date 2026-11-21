"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import Container from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";

/* The template carousel is a picture of a poster on a phone: `20rem`, `15rem`
   and the `26rem` glow behind it are the mock's own scale — see the note in
   `AttendanceSection`. */

import InviteCard from "./InviteCard";

type Template = {
  id: string;
  title: string;
  image: string;
  base: string;
  bg: string;
  art?: {
    bg: string;
    fg: string;
    r: number;
  };
  featured?: boolean;
};

const templates: Template[] = [
  {
    id: "chika",
    title: "Chika's 30th",
    image: "",
    featured: true,
    base: "#fff0f7",
    bg: "radial-gradient(circle at 15% 20%, #dcf91c 0, transparent 40%), radial-gradient(circle at 85% 25%, #ff7ab8 0, transparent 45%), radial-gradient(circle at 50% 105%, #9bd8ff 0, transparent 50%)",
  },
  {
    id: "owambe",
    title: "Owambe Nights",
    image: "",
    base: "#2a1a05",
    bg: "radial-gradient(circle at 20% 20%, #f2b632 0, transparent 45%), radial-gradient(circle at 80% 85%, #c2410c 0, transparent 50%)",
    art: {
      bg: "#18181b",
      fg: "#f6d56a",
      r: 3,
    },
  },
  {
    id: "brunch",
    title: "Sunday Brunch",
    image: "",
    base: "#e6f4ff",
    bg: "radial-gradient(circle at 80% 20%, #ffe36e 0, transparent 45%), radial-gradient(circle at 15% 80%, #8ff0c4 0, transparent 50%), radial-gradient(circle at 60% 100%, #9bd8ff 0, transparent 50%)",
    art: {
      bg: "#ffffff",
      fg: "#18181b",
      r: -3,
    },
  },
  {
    id: "era",
    title: "End of an era",
    image: "",
    base: "#f3e8ff",
    bg: "radial-gradient(circle at 20% 25%, #b79bff 0, transparent 45%), radial-gradient(circle at 85% 70%, #ff7ab8 0, transparent 50%), radial-gradient(circle at 40% 100%, #7fd8ff 0, transparent 50%)",
    art: {
      bg: "#3b3b4f",
      fg: "#ffffff",
      r: -2,
    },
  },
  {
    id: "sundown",
    title: "Rooftop Sundown",
    image: "",
    base: "#fff1e6",
    bg: "radial-gradient(circle at 80% 20%, #ffd23f 0, transparent 45%), radial-gradient(circle at 20% 80%, #ff7ab8 0, transparent 50%), radial-gradient(circle at 70% 100%, #ff6b4a 0, transparent 50%)",
    art: {
      bg: "#ff6b4a",
      fg: "#ffffff",
      r: 2,
    },
  },
];

const sparkles = [
  [8, 18, 6, "#fff", 0],
  [22, 72, 4, "#ffd23f", 0.6],
  [88, 22, 5, "#fff", 1.1],
  [76, 80, 7, "#ff7ab8", 0.3],
  [50, 9, 4, "#fff", 1.6],
  [93, 58, 4, "#dcf91c", 0.9],
  [12, 48, 5, "#fff", 1.3],
] as const;

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
    </svg>
  );
}

export default function Templates() {
  const scroller = useRef<HTMLDivElement>(null);
  const { ref: section, inView: seen } = useInView<HTMLElement>({
    threshold: 0.15,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const element = scroller.current;

    if (!element) return;

    setCanPrev(element.scrollLeft > 8);
    setCanNext(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 8,
    );
  }, []);

  useEffect(() => {
    update();

    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (direction: 1 | -1) => {
    const element = scroller.current;

    if (!element) return;

    const card = element.firstElementChild as HTMLElement | null;
    const cardWidth = card?.offsetWidth ?? 480;

    element.scrollBy({
      left: direction * (cardWidth + 20),
      behavior: "smooth",
    });
  };

  const arrow =
    "absolute top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/60 text-white backdrop-blur-sm transition hover:bg-foreground/85 focus-visible:bg-foreground/85 disabled:pointer-events-none disabled:opacity-0";

  return (
    <section id="templates" ref={section} className="relative pb-24 pt-10">
      <Container className="mb-10">
        <div className="max-w-3xl">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.05rem)] font-bold leading-[1.02] tracking-[-0.035em]">
            Start with a template.{" "}
            <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
              Make it yours.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Pick a look, add your details and share one link. Guests RSVP in
            seconds.
          </p>
        </div>
      </Container>

      <div className="relative">
        <button
          type="button"
          aria-label="Previous templates"
          disabled={!canPrev}
          onClick={() => go(-1)}
          className={`${arrow} left-3 lg:left-6`}
        >
          <Chevron dir="left" />
        </button>

        <button
          type="button"
          aria-label="Next templates"
          disabled={!canNext}
          onClick={() => go(1)}
          className={`${arrow} right-3 lg:right-6`}
        >
          <Chevron dir="right" />
        </button>

        <div
          ref={scroller}
          onScroll={update}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[calc(5%_+_1rem)] pb-2 [scrollbar-width:none] sm:px-[calc(5%_+_1.5rem)] lg:px-[calc(5%_+_2rem)] [&::-webkit-scrollbar]:hidden"
        >
          {templates.map((template, index) => (
            <Link
              key={template.id}
              href={`/create?template=${template.id}`}
              aria-label={`Use the ${template.title} template`}
              className={`group relative block h-[26rem] w-[min(86vw,34rem)] shrink-0 snap-start overflow-hidden rounded-sheet transition duration-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${
                seen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: seen ? `${index * 90}ms` : "0ms",
              }}
            >
              <div
                className="drift absolute inset-0 transition-transform duration-700 group-hover:scale-[1.02]"
                style={{
                  backgroundColor: template.base,
                  backgroundImage: template.bg,
                }}
              />

              {sparkles.map(([left, top, size, color, delay], index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="absolute animate-pulse rounded-full"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: size,
                    height: size,
                    background: color,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}

              <div className="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-[1.04]">
                {template.featured ? (
                  <div className="w-[20rem] -rotate-3 rounded-sheet bg-surface p-4 shadow-[0_30px_60px_-24px_rgba(24,24,27,0.5)] ring-1 ring-black/5">
                    <InviteCard compact image={template.image} />
                  </div>
                ) : (
                  <div
                    className="relative grid size-[15rem] place-items-center overflow-hidden rounded-panel p-5 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
                    style={{
                      background: template.art?.bg,
                      color: template.art?.fg,
                      rotate: `${template.art?.r ?? 0}deg`,
                    }}
                  >
                    {template.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={template.image}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-3xl font-extrabold leading-none tracking-tight">
                        {template.title}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
